import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useMyTeam } from './useMyTeam';
import * as rpcModule from './rpc';
import { supabase } from './client';

vi.mock('./rpc', () => ({
  rpcGetMyState: vi.fn(),
}));

describe('useMyTeam', () => {
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

  const mockState = {
    room: { status: 'ACTIVE', started_at: null, ends_at: null, server_now: new Date().toISOString() },
    team: { slot: 1, name: 'Alpha Rockets', color: '#E52521', cash: 1000, cv: 500, is_bankrupt: false },
    businesses: [],
    leaderboard: null,
  };

  it('fetches initial state and marks status ready', async () => {
    vi.mocked(rpcModule.rpcGetMyState).mockResolvedValue(mockState as any);

    const { result } = renderHook(() => useMyTeam());

    expect(result.current.status).toBe('loading');

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.status).toBe('ready');
    expect(result.current.state?.team.name).toBe('Alpha Rockets');
    expect(result.current.connection).toBe('LIVE');
    expect(supabase.channel).toHaveBeenCalledWith(expect.stringContaining('my-team-'));
  });

  it('cleans up channel and event listeners on unmount', async () => {
    vi.mocked(rpcModule.rpcGetMyState).mockResolvedValue(mockState as any);

    const { unmount } = renderHook(() => useMyTeam());

    await act(async () => {
      await Promise.resolve();
    });

    unmount();

    expect(supabase.removeChannel).toHaveBeenCalledWith(mockChannel);
  });

  it('detects wasClaimReleased when state transitions from object to null', async () => {
    vi.mocked(rpcModule.rpcGetMyState).mockResolvedValueOnce(mockState as any);

    const { result } = renderHook(() => useMyTeam());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state).not.toBeNull();
    expect(result.current.wasClaimReleased).toBe(false);

    // Organizer releases team -> next fetch returns null
    vi.mocked(rpcModule.rpcGetMyState).mockResolvedValueOnce(null);

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.state).toBeNull();
    expect(result.current.wasClaimReleased).toBe(true);
  });
});
