import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './client';
import { rpcGetAdminSnapshot, AdminRoomSnapshot } from './rpc';
import { ConnectionStatus } from '../ui/ConnectionPill';

export interface UseAdminRoomResult {
  snapshot: AdminRoomSnapshot | null;
  status: 'loading' | 'ready' | 'error';
  error: Error | null;
  refetch: () => Promise<void>;
  connection: ConnectionStatus;
  lastUpdated: string;
}

export function useAdminRoom(roomId: string | undefined): UseAdminRoomResult {
  const [snapshot, setSnapshot] = useState<AdminRoomSnapshot | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [error, setError] = useState<Error | null>(null);
  const [connection, setConnection] = useState<ConnectionStatus>('CONNECTING');
  const [lastUpdatedTime, setLastUpdatedTime] = useState<number>(Date.now());
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Core fetcher
  const fetchSnapshot = useCallback(async () => {
    if (!roomId) return;
    try {
      const data = await rpcGetAdminSnapshot(roomId);
      if (!isMountedRef.current) return;
      setSnapshot(data);
      setStatus('ready');
      setError(null);
      setLastUpdatedTime(Date.now());
      setLastUpdated('Just now');
    } catch (err: any) {
      if (!isMountedRef.current) return;
      console.warn('Failed to fetch admin snapshot:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setStatus((prev) => (prev === 'ready' ? 'ready' : 'error'));
    }
  }, [roomId]);

  // Debounced trigger for Realtime events (150ms)
  const triggerDebouncedRefetch = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        fetchSnapshot();
      }
    }, 150);
  }, [fetchSnapshot]);

  // Initial fetch and Realtime subscription
  useEffect(() => {
    if (!roomId) return;
    isMountedRef.current = true;
    setStatus('loading');

    // 1. Initial snapshot fetch
    fetchSnapshot();

    // 2. Realtime channel setup
    const channelName = `admin-room-${roomId}-${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        () => triggerDebouncedRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams', filter: `room_id=eq.${roomId}` },
        () => triggerDebouncedRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activity_events', filter: `room_id=eq.${roomId}` },
        () => triggerDebouncedRefetch()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_businesses' },
        () => triggerDebouncedRefetch()
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

    // 3. Browser online/offline listeners
    const handleOnline = () => {
      if (!isMountedRef.current) return;
      setConnection('LIVE');
      triggerDebouncedRefetch();
    };

    const handleOffline = () => {
      if (!isMountedRef.current) return;
      setConnection('OFFLINE');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 4. Cleanup on unmount or roomId change
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      supabase.removeChannel(channel);
    };
  }, [roomId, fetchSnapshot, triggerDebouncedRefetch]);

  // Update relative "last updated" age every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isMountedRef.current) return;
      const secondsAgo = Math.floor((Date.now() - lastUpdatedTime) / 1000);
      if (secondsAgo < 5) {
        setLastUpdated('Just now');
      } else if (secondsAgo < 60) {
        setLastUpdated(`${secondsAgo}s ago`);
      } else {
        const mins = Math.floor(secondsAgo / 60);
        setLastUpdated(`${mins}m ago`);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastUpdatedTime]);

  return {
    snapshot,
    status,
    error,
    refetch: fetchSnapshot,
    connection,
    lastUpdated,
  };
}
