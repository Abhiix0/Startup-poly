import { useState, useEffect, useCallback } from 'react';
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

  const fetchStandings = useCallback(async () => {
    if (!roomId || !enabled) return;
    try {
      setIsLoading(true);
      setError(null);
      const res = await rpcGetStandings(roomId);
      setStandings(res.standings || []);
      setHasUnresolvedTie(Boolean(res.has_unresolved_tie));
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch standings.'));
    } finally {
      setIsLoading(false);
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
