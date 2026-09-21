import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './client';
import { rpcGetMyState, TeamStateResponse } from './rpc';
import { ConnectionStatus } from '../ui/ConnectionPill';

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
  const cashFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cvFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchMyState = useCallback(async () => {
    try {
      const data = await rpcGetMyState();
      if (!isMountedRef.current) return;

      if (!data) {
        // If we previously had state and now receive null, admin released our claim!
        if (hadStateRef.current) {
          setWasClaimReleased(true);
        }
        setState(null);
        setStatus('ready');
        return;
      }

      hadStateRef.current = true;
      setWasClaimReleased(false);

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
      console.warn('Failed to fetch team state:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus((prev) => (prev === 'ready' ? 'ready' : 'error'));
    }
  }, []);

  // Debounced refetch for realtime events (150ms)
  const triggerDebouncedRefetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
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

    // 2. Realtime channel setup (RLS restricts broadcasts to team's accessible rows)
    const channelName = `my-team-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () =>
        triggerDebouncedRefetch()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_businesses' }, () =>
        triggerDebouncedRefetch()
      )
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms' }, () =>
        triggerDebouncedRefetch()
      )
      .subscribe((subStatus) => {
        if (!isMountedRef.current) return;
        if (subStatus === 'SUBSCRIBED') {
          setConnection(navigator.onLine ? 'LIVE' : 'OFFLINE');
        } else if (subStatus === 'TIMED_OUT' || subStatus === 'CHANNEL_ERROR') {
          setConnection('RECONNECTING');
        } else if (subStatus === 'CLOSED') {
          setConnection(navigator.onLine ? 'RECONNECTING' : 'OFFLINE');
        }
      });

    // 3. Polling every 15s while tab is visible
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        fetchMyState();
      }
    }, 15000);

    // 4. Refetch immediately on visibility change or network online
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        fetchMyState();
      }
    };

    const handleOnline = () => {
      if (!isMountedRef.current) return;
      setConnection('LIVE');
      fetchMyState();
    };

    const handleOffline = () => {
      if (!isMountedRef.current) return;
      setConnection('OFFLINE');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (cashFlashTimerRef.current) clearTimeout(cashFlashTimerRef.current);
      if (cvFlashTimerRef.current) clearTimeout(cvFlashTimerRef.current);
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      supabase.removeChannel(channel);
    };
  }, [fetchMyState, triggerDebouncedRefetch]);

  // Monitor staleness (>20 seconds)
  useEffect(() => {
    const staleInterval = setInterval(() => {
      if (!isMountedRef.current) return;
      const elapsedMs = Date.now() - lastSuccessTime;
      const seconds = Math.floor(elapsedMs / 1000);
      setStaleAgeSeconds(seconds);

      if (seconds > 20) {
        setIsStale(true);
        setConnection('RECONNECTING');
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
  };
}
