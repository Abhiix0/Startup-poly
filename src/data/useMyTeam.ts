import { useState, useEffect, useCallback, useRef } from 'react';
import { rpcGetMyState, TeamStateResponse } from './rpc';
import { ConnectionStatus } from '../ui/ConnectionPill';
import { createRealtimeSubscription } from './realtime';
import { logger } from '../lib/logger';
import { AppError } from '../lib/errors';

export type FlashDirection = 'up' | 'down' | null;

export interface UseMyTeamResult {
  state: TeamStateResponse | null;
  status: 'loading' | 'ready' | 'error';
  error: Error | null;
  refetch: () => Promise<void>;
  connection: ConnectionStatus;
  lastUpdatedAt: string;
  isStale: boolean;
  staleAgeSeconds: number;
  cashFlash: FlashDirection;
  cvFlash: FlashDirection;
  wasClaimReleased: boolean;
  isSessionLost: boolean;
}

export function useMyTeam(): UseMyTeamResult {
  const [state, setState] = useState<TeamStateResponse | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>('CONNECTING');
  const [lastSuccessTime, setLastSuccessTime] = useState<number>(Date.now());
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string>('Just now');
  const [isStale, setIsStale] = useState<boolean>(false);
  const [staleAgeSeconds, setStaleAgeSeconds] = useState<number>(0);
  const [isSessionLost, setIsSessionLost] = useState<boolean>(false);

  // Flash animations
  const [cashFlash, setCashFlash] = useState<FlashDirection>(null);
  const [cvFlash, setCvFlash] = useState<FlashDirection>(null);

  // Claim revocation flag
  const [wasClaimReleased, setWasClaimReleased] = useState<boolean>(false);

  const prevCashRef = useRef<number | null>(null);
  const prevCvRef = useRef<number | null>(null);
  const hadStateRef = useRef<boolean>(false);
  const isMountedRef = useRef<boolean>(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cashFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cvFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRequestIdRef = useRef<number>(0);

  // Monotonic request counter to ignore out-of-order responses
  const fetchMyState = useCallback(async () => {
    const requestId = ++latestRequestIdRef.current;

    try {
      const data = await rpcGetMyState();
      if (!isMountedRef.current) return;

      if (requestId < latestRequestIdRef.current) {
        logger.debug('useMyTeam', `Ignoring older response #${requestId} (current #${latestRequestIdRef.current})`);
        return;
      }

      if (!data) {
        // If we previously had state and now receive null, admin released our claim!
        if (hadStateRef.current) {
          logger.warn('useMyTeam', 'Team claim was released by event admin.');
          setWasClaimReleased(true);
        }
        setState(null);
        setStatus('ready');
        return;
      }

      hadStateRef.current = true;
      setWasClaimReleased(false);
      setIsSessionLost(false);

      // Compare previous cash and CV for flash animation
      if (prevCashRef.current !== null) {
        if (data.team.cash > prevCashRef.current) {
          setCashFlash('up');
          if (cashFlashTimerRef.current) clearTimeout(cashFlashTimerRef.current);
          cashFlashTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setCashFlash(null);
          }, 600);
        } else if (data.team.cash < prevCashRef.current) {
          setCashFlash('down');
          if (cashFlashTimerRef.current) clearTimeout(cashFlashTimerRef.current);
          cashFlashTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setCashFlash(null);
          }, 600);
        }
      }
      prevCashRef.current = data.team.cash;

      if (prevCvRef.current !== null) {
        if (data.team.cv > prevCvRef.current) {
          setCvFlash('up');
          if (cvFlashTimerRef.current) clearTimeout(cvFlashTimerRef.current);
          cvFlashTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setCvFlash(null);
          }, 600);
        } else if (data.team.cv < prevCvRef.current) {
          setCvFlash('down');
          if (cvFlashTimerRef.current) clearTimeout(cvFlashTimerRef.current);
          cvFlashTimerRef.current = setTimeout(() => {
            if (isMountedRef.current) setCvFlash(null);
          }, 600);
        }
      }
      prevCvRef.current = data.team.cv;

      setState(data);
      setStatus('ready');
      setError(null);
      setLastSuccessTime(Date.now());
      setIsStale(false);
      setLastUpdatedAt('Just now');
    } catch (err: any) {
      if (!isMountedRef.current) return;
      if (requestId < latestRequestIdRef.current) return;

      logger.warn('useMyTeam', 'Failed to fetch team state:', err);
      if (err instanceof AppError && err.code === 'NOT_AUTHENTICATED') {
        setIsSessionLost(true);
      }
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsStale(true);
      // Retain last good state on failure; NEVER blank existing values
      setStatus((prev) => (prev === 'ready' ? 'ready' : 'error'));
    }
  }, []);

  // Burst coalescing: 150ms debounce with 1000ms maxWait
  const triggerDebouncedRefetch = useCallback(() => {
    if (!maxWaitTimerRef.current) {
      maxWaitTimerRef.current = setTimeout(() => {
        maxWaitTimerRef.current = null;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        if (isMountedRef.current) {
          fetchMyState();
        }
      }, 1000);
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      if (maxWaitTimerRef.current) {
        clearTimeout(maxWaitTimerRef.current);
        maxWaitTimerRef.current = null;
      }
      if (isMountedRef.current) {
        fetchMyState();
      }
    }, 150);
  }, [fetchMyState]);

  useEffect(() => {
    isMountedRef.current = true;
    setStatus('loading');

    // 1. Initial fetch
    fetchMyState();

    // 2. StrictMode-safe Realtime subscription (RLS filters events to claimed team)
    const sub = createRealtimeSubscription({
      prefix: 'my-team',
      tables: [
        { table: 'teams' },
        { table: 'team_businesses' },
        { table: 'rooms' },
      ],
      onChange: triggerDebouncedRefetch,
      onStatusChange: (newStatus) => {
        if (isMountedRef.current) {
          setConnection(newStatus);
        }
      },
      onReconnect: () => {
        if (isMountedRef.current) {
          fetchMyState();
        }
      },
    });

    // 3. Polling every 15s while tab is visible
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isMountedRef.current) {
        fetchMyState();
      }
    }, 15000);

    // 4. Immediate refetch on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        fetchMyState();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (maxWaitTimerRef.current) clearTimeout(maxWaitTimerRef.current);
      if (cashFlashTimerRef.current) clearTimeout(cashFlashTimerRef.current);
      if (cvFlashTimerRef.current) clearTimeout(cvFlashTimerRef.current);
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sub.unsubscribe();
    };
  }, [fetchMyState, triggerDebouncedRefetch]);

  // Monitor staleness (>20 seconds for team phone)
  useEffect(() => {
    const staleInterval = setInterval(() => {
      if (!isMountedRef.current) return;
      const elapsedMs = Date.now() - lastSuccessTime;
      const seconds = Math.floor(elapsedMs / 1000);
      setStaleAgeSeconds(seconds);

      if (seconds > 20) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }

      if (seconds < 5) {
        setLastUpdatedAt('Just now');
      } else if (seconds < 60) {
        setLastUpdatedAt(`${seconds}s ago`);
      } else {
        const mins = Math.floor(seconds / 60);
        setLastUpdatedAt(`${mins}m ago`);
      }
    }, 1000);

    return () => clearInterval(staleInterval);
  }, [lastSuccessTime]);

  return {
    state,
    status,
    error,
    refetch: fetchMyState,
    connection,
    lastUpdatedAt,
    isStale,
    staleAgeSeconds,
    cashFlash,
    cvFlash,
    wasClaimReleased,
    isSessionLost,
  };
}
