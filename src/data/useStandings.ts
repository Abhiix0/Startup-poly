import { useState, useEffect, useCallback, useRef } from 'react';
import { rpcGetStandings, StandingsRow } from './rpc';

export interface UseStandingsResult {
  standings: StandingsRow[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStandings(roomId?: string, enabled = true): UseStandingsResult {
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchStandings = useCallback(async () => {
    if (!roomId || !enabled) return;
    try {
      if (isMountedRef.current) {
        setIsLoading(true);
        setError(null);
      }
      const res = await rpcGetStandings(roomId);
      if (isMountedRef.current) {
        setStandings(res.standings || []);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch standings.'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [roomId, enabled]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return {
    standings,
    isLoading,
    error,
    refetch: fetchStandings,
  };
}
