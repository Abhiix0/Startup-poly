import { useState, useEffect, useCallback, useRef } from 'react';
import { rpcGetStandings, StandingsRow } from './rpc';

export interface UseStandingsResult {
  standings: StandingsRow[];
  hasUnresolvedTie: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useStandings(roomId?: string, enabled = true): UseStandingsResult {
  const [standings, setStandings] = useState<StandingsRow[]>([]);
  const [hasUnresolvedTie, setHasUnresolvedTie] = useState<boolean>(false);
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
        setHasUnresolvedTie(Boolean(res.has_unresolved_tie));
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
    hasUnresolvedTie,
    isLoading,
    error,
    refetch: fetchStandings,
  };
}
