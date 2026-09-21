import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchServerOffset, getServerNow } from './clock';
import { formatMMSS } from './format';
import { rpcServerTime } from '../data/rpc';

export type ClockStatus = 'idle' | 'running' | 'expired' | 'paused';

export interface UseServerClockOptions {
  endsAt: string | null;
  serverNow?: string | null;
  status?: string;
  onExpire?: () => void;
  fetchTimeFn?: () => Promise<string>;
}

export interface UseServerClockResult {
  remainingMs: number;
  remainingSeconds: number;
  formatted: string;
  status: ClockStatus;
  isExpired: boolean;
  isRunning: boolean;
  isPaused: boolean;
  offsetMs: number;
  isSyncing: boolean;
  resync: () => Promise<void>;
}

export function useServerClock(
  optionsOrEndsAt: UseServerClockOptions | string | null,
  maybeFetchTimeFn?: () => Promise<string>
): UseServerClockResult {
  // Normalize options
  const options: UseServerClockOptions =
    typeof optionsOrEndsAt === 'object' && optionsOrEndsAt !== null
      ? optionsOrEndsAt
      : {
          endsAt: optionsOrEndsAt,
          fetchTimeFn: maybeFetchTimeFn || rpcServerTime,
        };

  const { endsAt, status: roomStatus, onExpire } = options;
  const fetchTimeFn = options.fetchTimeFn || rpcServerTime;

  const [offsetMs, setOffsetMs] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [, setTick] = useState<number>(() => Date.now());
  const fetchRef = useRef(fetchTimeFn);
  const hasExpiredRef = useRef(false);

  useEffect(() => {
    fetchRef.current = fetchTimeFn;
  }, [fetchTimeFn]);

  const sync = useCallback(async () => {
    if (!fetchRef.current) return;
    try {
      setIsSyncing(true);
      const res = await fetchServerOffset(fetchRef.current);
      setOffsetMs(res.offsetMs);
    } catch (err) {
      console.warn('Failed to sync server clock:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Sync on mount, online, and visibility change
  useEffect(() => {
    sync();

    const handleOnline = () => {
      sync();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        sync();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [sync]);

  // Derive tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Compute remaining time derived from Date.now() + offsetMs
  let remainingMs = 0;
  let status: ClockStatus = 'idle';
  let formatted = '50:00';
  const normalizedStatus = roomStatus?.toUpperCase();

  if (normalizedStatus === 'TIME_EXPIRED' || normalizedStatus === 'FINALIZED') {
    remainingMs = 0;
    status = 'expired';
    formatted = '00:00';
  } else if (normalizedStatus === 'LOBBY' || normalizedStatus === 'CREATED' || (!endsAt && !normalizedStatus)) {
    remainingMs = 50 * 60 * 1000;
    status = 'paused';
    formatted = '50:00';
  } else if (endsAt) {
    const endsAtMs = new Date(endsAt).getTime();
    const serverNow = getServerNow(offsetMs);
    const diff = endsAtMs - serverNow;

    if (diff <= 0) {
      remainingMs = 0;
      status = 'expired';
      formatted = '00:00';
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onExpire?.();
      }
    } else {
      remainingMs = diff;
      status = 'running';
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      formatted = formatMMSS(remainingSeconds);
      hasExpiredRef.current = false;
    }
  }

  const isExpired = status === 'expired';
  const isRunning = status === 'running';
  const isPaused = status === 'paused' || status === 'idle';
  const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));

  return {
    remainingMs,
    remainingSeconds,
    formatted,
    status,
    isExpired,
    isRunning,
    isPaused,
    offsetMs,
    isSyncing,
    resync: sync,
  };
}
