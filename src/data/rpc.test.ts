import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from './client';
import {
  rpcAdminAbortGame,
  rpcGetStandings,
  rpcAdminFinalize,
  rpcAdminStartGame,
  rpcAdminOpenLobby,
  rpcAdminCreateRoom,
  rpcJoinTeam,
} from './rpc';

vi.mock('./client', () => ({
  supabase: {
    rpc: vi.fn(),
  },
}));

describe('rpc.ts - RPC Client Wrapper Contract Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rpcAdminAbortGame passes p_room_id and note matching PostgREST SQL signature', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { status: 'LOBBY' }, error: null });

    const result = await rpcAdminAbortGame('room-123', 'Accidental game start by organizer');

    expect(supabase.rpc).toHaveBeenCalledWith('admin_abort_game', {
      p_room_id: 'room-123',
      note: 'Accidental game start by organizer',
    });
    expect(result).toEqual({ status: 'LOBBY' });
  });

  it('rpcGetStandings passes p_room_id to match SQL signature', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({
      data: { standings: [], has_unresolved_tie: false },
      error: null,
    });

    await rpcGetStandings('room-abc');

    expect(supabase.rpc).toHaveBeenCalledWith('get_standings', {
      p_room_id: 'room-abc',
    });
  });

  it('rpcAdminFinalize passes p_room_id to match SQL signature', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({
      data: { room_id: 'room-abc', winner_team_id: 'team-1', standings: [] },
      error: null,
    });

    await rpcAdminFinalize('room-abc');

    expect(supabase.rpc).toHaveBeenCalledWith('admin_finalize', {
      p_room_id: 'room-abc',
    });
  });

  it('rpcAdminStartGame passes room_id and force', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { status: 'ACTIVE' }, error: null });

    await rpcAdminStartGame('room-123', true);

    expect(supabase.rpc).toHaveBeenCalledWith('admin_start_game', {
      room_id: 'room-123',
      force: true,
    });
  });

  it('rpcAdminOpenLobby passes room_id', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { status: 'LOBBY' }, error: null });

    await rpcAdminOpenLobby('room-123');

    expect(supabase.rpc).toHaveBeenCalledWith('admin_open_lobby', {
      room_id: 'room-123',
    });
  });

  it('rpcAdminCreateRoom passes team_count and teams', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { id: 'room-1' }, error: null });

    const teams = [{ name: 'Alpha', color: '#FF0000' }];
    await rpcAdminCreateRoom(1, teams as any);

    expect(supabase.rpc).toHaveBeenCalledWith('admin_create_room', {
      team_count: 1,
      teams,
    });
  });

  it('rpcJoinTeam passes code, slot, and pin', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({
      data: { team_id: 't-1', room_id: 'r-1' },
      error: null,
    });

    await rpcJoinTeam('ROOM01', 2, '1234');

    expect(supabase.rpc).toHaveBeenCalledWith('join_team', {
      code: 'ROOM01',
      slot: 2,
      pin: '1234',
    });
  });
});
