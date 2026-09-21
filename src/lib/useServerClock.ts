import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchServerOffset, getServerNow, addClockSample, selectBestClockSample, ClockSample } from './clock';
import { formatMMSS } from './format';
import { rpcServerTime } from '../data/rpc';
import { logger } from './logger';

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

const FIVE_MINUTES_MS = 5 * 60 * 1000;

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
  const onExpireRef = useRef(onExpire);
  const hasExpiredRef = useRef(false);
  const isMountedRef = useRef(true);
  const samplesRef = useRef<ClockSample[]>([]);
  const expiryRetryTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetchRef.current = fetchTimeFn;
  }, [fetchTimeFn]);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const sync = useCallback(async () => {
    if (!fetchRef.current) return;
    try {
      if (isMountedRef.current) setIsSyncing(true);
      const res = await fetchServerOffset(fetchRef.current);
      if (!isMountedRef.current) return;

      // Add to rolling buffer (last 3 samples) and select lowest RTT
      samplesRef.current = addClockSample(samplesRef.current, res, 3);
      const best = selectBestClockSample(samplesRef.current);

      if (best) {
        logger.debug(
          'Clock',
          `Synced server offset: ${best.offsetMs}ms (RTT: ${best.rttMs}ms from ${samplesRef.current.length} samples)`
        );
        setOffsetMs(best.offsetMs);
      }
    } catch (err) {
      logger.warn('Clock', 'Failed to sync clock with server, retaining existing offset:', err);
    } finally {
      if (isMountedRef.current) setIsSyncing(false);
    }
  }, []);

  // Sync on mount, online, and visibility change
  useEffect(() => {
    isMountedRef.current = true;
    sync();

    const handleOnline = () => {
      logger.info('Clock', 'Window online: resyncing server clock offset');
      sync();
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        sync();
      }
    };

    window.addEventListener('online', handleOnline);
    document.addEventListener('visibilitychange', handleVisibility);

    // Periodic resync every 5 minutes to counteract client system clock drift
    const periodicInterval = setInterval(() => {
      if (document.visibilityState === 'visible' && isMountedRef.current) {
        sync();
      }
    }, FIVE_MINUTES_MS);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('online', handleOnline);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(periodicInterval);
      if (expiryRetryTimerRef.current) {
        clearInterval(expiryRetryTimerRef.current);
        expiryRetryTimerRef.current = null;
      }
    };
  }, [sync]);

  // Derive tick every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      if (isMountedRef.current) {
        setTick(Date.now());
      }
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
    // Clear any pending expiry retries
    if (expiryRetryTimerRef.current) {
      clearInterval(expiryRetryTimerRef.current);
      expiryRetryTimerRef.current = null;
    }
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
        logger.info('Clock', 'Game timer reached 00:00! Triggering expiry refetch...');
        onExpireRef.current?.();

        // If status is not yet TIME_EXPIRED, start retry polling every 1.5s until server confirms
        if (!expiryRetryTimerRef.current && normalizedStatus !== 'TIME_EXPIRED') {
          expiryRetryTimerRef.current = setInterval(() => {
            if (isMountedRef.current) {
              logger.debug('Clock', 'Retrying expiry refetch until status is TIME_EXPIRED...');
              onExpireRef.current?.();
            }
          }, 1500);
        }
      }
    } else {
      remainingMs = Math.max(0, diff);
      status = 'running';
      const remainingSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
      formatted = formatMMSS(remainingSeconds);
      hasExpiredRef.current = false;
      if (expiryRetryTimerRef.current) {
        clearInterval(expiryRetryTimerRef.current);
        expiryRetryTimerRef.current = null;
      }
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
