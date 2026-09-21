import { useState, useEffect, useCallback, useRef } from 'react';
import { rpcGetAdminSnapshot, AdminRoomSnapshot } from './rpc';
import { ConnectionStatus } from '../ui/ConnectionPill';
import { createRealtimeSubscription } from './realtime';
import { logger } from '../lib/logger';

export interface UseAdminRoomResult {
  snapshot: AdminRoomSnapshot | null;
  status: 'loading' | 'ready' | 'error';
  error: Error | null;
  refetch: () => Promise<void>;
  connection: ConnectionStatus;
  lastUpdated: string;
  isStale: boolean;
  staleAgeSeconds: number;
}

export function useAdminRoom(roomId: string | undefined): UseAdminRoomResult {
  const [snapshot, setSnapshot] = useState<AdminRoomSnapshot | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>('CONNECTING');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<number>(Date.now());
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');
  const [isStale, setIsStale] = useState<boolean>(false);
  const [staleAgeSeconds, setStaleAgeSeconds] = useState<number>(0);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);
  const latestRequestIdRef = useRef<number>(0);

  // Core fetcher with monotonic request counter to discard out-of-order responses
  const fetchSnapshot = useCallback(async () => {
    if (!roomId) return;
    const requestId = ++latestRequestIdRef.current;

    try {
      const data = await rpcGetAdminSnapshot(roomId);
      if (!isMountedRef.current) return;

      // Ignore if a newer request was already dispatched
      if (requestId < latestRequestIdRef.current) {
        logger.debug('useAdminRoom', `Ignoring older response #${requestId} (current #${latestRequestIdRef.current})`);
        return;
      }

      setSnapshot(data);
      setStatus('ready');
      setError(null);
      setIsStale(false);
      setLastUpdatedTime(Date.now());
      setLastUpdated('Just now');
    } catch (err: any) {
      if (!isMountedRef.current) return;
      if (requestId < latestRequestIdRef.current) return;

      logger.warn('useAdminRoom', 'Failed to fetch admin snapshot:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsStale(true);
      // Retain last good snapshot data: NEVER blank existing values
      setStatus((prev) => (prev === 'ready' ? 'ready' : 'error'));
    }
  }, [roomId]);

  // Burst coalescing: 150ms debounce with 1000ms maxWait guarantee
  const triggerDebouncedRefetch = useCallback(() => {
    // Set 1s maximum wait timer if not already running
    if (!maxWaitTimerRef.current) {
      maxWaitTimerRef.current = setTimeout(() => {
        maxWaitTimerRef.current = null;
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = null;
        }
        if (isMountedRef.current) {
          fetchSnapshot();
        }
      }, 1000);
    }

    // Debounce for 150ms
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
        fetchSnapshot();
      }
    }, 150);
  }, [fetchSnapshot]);

  // Realtime subscription, fallback polling, and visibility listeners
  useEffect(() => {
    if (!roomId) return;
    isMountedRef.current = true;
    setStatus('loading');

    // 1. Initial snapshot fetch
    fetchSnapshot();

    // 2. StrictMode-safe Realtime subscription
    const sub = createRealtimeSubscription({
      prefix: 'admin-room',
      roomId,
      tables: [
        { table: 'rooms', filter: `id=eq.${roomId}` },
        { table: 'teams', filter: `room_id=eq.${roomId}` },
        { table: 'activity_events', filter: `room_id=eq.${roomId}` },
        { table: 'team_businesses', filter: `room_id=eq.${roomId}` },
      ],
      onChange: triggerDebouncedRefetch,
      onStatusChange: (newStatus) => {
        if (isMountedRef.current) {
          setConnection(newStatus);
        }
      },
      onReconnect: () => {
        if (isMountedRef.current) {
          fetchSnapshot();
        }
      },
    });

    // 3. Fallback polling: every 10s while tab is visible, pause when hidden
    const pollInterval = setInterval(() => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible' && isMountedRef.current) {
        fetchSnapshot();
      }
    }, 10000);

    // 4. Immediate refetch on tab visibility change to visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        fetchSnapshot();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 5. Cleanup on unmount or roomId change
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (maxWaitTimerRef.current) clearTimeout(maxWaitTimerRef.current);
      clearInterval(pollInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      sub.unsubscribe();
    };
  }, [roomId, fetchSnapshot, triggerDebouncedRefetch]);

  // Monitor staleness (>30s for admin) and update relative age string every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      const elapsedSeconds = Math.floor((Date.now() - lastUpdatedTime) / 1000);
      setStaleAgeSeconds(elapsedSeconds);

      if (elapsedSeconds > 30) {
        setIsStale(true);
      } else {
        setIsStale(false);
      }

      if (elapsedSeconds < 5) {
        setLastUpdated('Just now');
      } else if (elapsedSeconds < 60) {
        setLastUpdated(`${elapsedSeconds}s ago`);
      } else {
        const mins = Math.floor(elapsedSeconds / 60);
        setLastUpdated(`${mins}m ago`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdatedTime]);

  return {
    snapshot,
    status,
    error,
    refetch: fetchSnapshot,
    connection,
    lastUpdated,
    isStale,
    staleAgeSeconds,
  };
}
