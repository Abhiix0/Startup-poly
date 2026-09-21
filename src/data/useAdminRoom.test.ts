import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAdminRoom } from './useAdminRoom';
import * as rpcModule from './rpc';
import { supabase } from './client';

vi.mock('./rpc', () => ({
  rpcGetAdminSnapshot: vi.fn(),
}));

describe('useAdminRoom', () => {
  let mockChannel: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockChannel = {
      on: vi.fn().mockImplementation(() => mockChannel),
      subscribe: vi.fn().mockImplementation((cb) => {
        if (cb) cb('SUBSCRIBED');
        return mockChannel;
      }),
      unsubscribe: vi.fn().mockResolvedValue('ok'),
    };

    vi.spyOn(supabase, 'channel').mockImplementation(() => mockChannel);
    vi.spyOn(supabase, 'removeChannel').mockReturnValue(Promise.resolve('ok') as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches snapshot and sets status to ready', async () => {
    const mockSnapshot = {
      room: { id: 'room-1', code: 'TEST12', status: 'LOBBY', team_count: 5 },
      server_now: new Date().toISOString(),
      teams: [],
      events: [],
    };

    vi.mocked(rpcModule.rpcGetAdminSnapshot).mockResolvedValue(mockSnapshot as any);

    const { result } = renderHook(() => useAdminRoom('room-1'));

    expect(result.current.status).toBe('loading');

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.snapshot?.room.code).toBe('TEST12');
    expect(result.current.connection).toBe('LIVE');
    expect(supabase.channel).toHaveBeenCalledWith(expect.stringContaining('admin-room-room-1'));
  });

  it('cleans up realtime channel on unmount', async () => {
    vi.mocked(rpcModule.rpcGetAdminSnapshot).mockResolvedValue({
      room: { id: 'room-1', code: 'TEST12', status: 'LOBBY' },
      server_now: new Date().toISOString(),
      teams: [],
      events: [],
    } as any);

    const { unmount } = renderHook(() => useAdminRoom('room-1'));

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledTimes(1);
    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('ignores older out-of-order response when a newer request finishes first', async () => {
    let resolveFirst: (val: any) => void = () => {};
    let resolveSecond: (val: any) => void = () => {};

    const firstPromise = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    const secondPromise = new Promise((resolve) => {
      resolveSecond = resolve;
    });

    vi.mocked(rpcModule.rpcGetAdminSnapshot)
      .mockReturnValueOnce(firstPromise as any)
      .mockReturnValueOnce(secondPromise as any);

    const { result } = renderHook(() => useAdminRoom('room-1'));

    // Trigger second fetch while first is in-flight
    act(() => {
      result.current.refetch();
    });

    // Second (newer) request resolves with new data
    await act(async () => {
      resolveSecond({
        room: { id: 'room-1', code: 'NEWEST', status: 'ACTIVE' },
        server_now: new Date().toISOString(),
        teams: [],
        events: [],
      });
    });

    expect(result.current.snapshot?.room.code).toBe('NEWEST');

    // First (older, slower) request resolves later with stale data
    await act(async () => {
      resolveFirst({
        room: { id: 'room-1', code: 'OLDER_STALE', status: 'LOBBY' },
        server_now: new Date().toISOString(),
        teams: [],
        events: [],
      });
    });

    // Older response must NOT overwrite newer response!
    expect(result.current.snapshot?.room.code).toBe('NEWEST');
  });

  it('preserves existing snapshot data on refetch error and sets isStale', async () => {
    vi.mocked(rpcModule.rpcGetAdminSnapshot).mockResolvedValueOnce({
      room: { id: 'room-1', code: 'INITIAL', status: 'ACTIVE' },
      server_now: new Date().toISOString(),
      teams: [],
      events: [],
    } as any);

    const { result } = renderHook(() => useAdminRoom('room-1'));

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.snapshot?.room.code).toBe('INITIAL');
    expect(result.current.isStale).toBe(false);

    // Refetch fails with network error
    vi.mocked(rpcModule.rpcGetAdminSnapshot).mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      await result.current.refetch();
    });

    // Previous snapshot is preserved, NEVER blanked!
    expect(result.current.snapshot?.room.code).toBe('INITIAL');
    expect(result.current.isStale).toBe(true);
    expect(result.current.error).toBeDefined();
  });
});
