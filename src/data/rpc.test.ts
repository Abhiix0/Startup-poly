import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from './client';
import {
  rpcAdminSetTeamValues,
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
      request_id: expect.any(String),
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
      request_id: expect.any(String),
    });
  });

  it('rpcAdminStartGame passes room_id and force', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { status: 'ACTIVE' }, error: null });

    await rpcAdminStartGame('room-123', true);

    expect(supabase.rpc).toHaveBeenCalledWith('admin_start_game', {
      room_id: 'room-123',
      force: true,
      request_id: expect.any(String),
    });
  });

  it('rpcAdminOpenLobby passes room_id', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { status: 'LOBBY' }, error: null });

    await rpcAdminOpenLobby('room-123');

    expect(supabase.rpc).toHaveBeenCalledWith('admin_open_lobby', {
      room_id: 'room-123',
      request_id: expect.any(String),
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

  it('rpcJoinTeam turns a returned {error} payload into the matching AppError', async () => {
    vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { error: 'TEAM_ALREADY_CLAIMED' }, error: null });

    await expect(rpcJoinTeam('ROOM01', 2, '1234')).rejects.toMatchObject({ code: 'TEAM_ALREADY_CLAIMED' });
  });

  describe('request_id per user intent', () => {
    const NET = { message: 'Failed to fetch' };
    const params = { team_id: 't-1', cash: 900, expected_version: 3 };
    const idsOf = (name: string) =>
      vi.mocked(supabase.rpc as any).mock.calls.filter((c: any[]) => c[0] === name).map((c: any[]) => c[1].request_id);

    it('a response lost after the server committed is retried with the SAME request_id and resolves', async () => {
      vi.mocked(supabase.rpc as any)
        .mockResolvedValueOnce({ data: null, error: NET }) // server committed, response dropped
        .mockResolvedValueOnce({ data: { team: { cash: 900 } }, error: null }); // replay of the committed result

      await expect(rpcAdminSetTeamValues(params)).resolves.toEqual({ team: { cash: 900 } });

      const ids = idsOf('admin_set_team_values');
      expect(ids).toHaveLength(2);
      expect(ids[0]).toBe(ids[1]);
    });

    it('an unknown outcome surfaces as OUTCOME_UNKNOWN and a later retry of the same action reuses the id', async () => {
      vi.mocked(supabase.rpc as any).mockResolvedValue({ data: null, error: NET });
      await expect(rpcAdminSetTeamValues({ ...params, cash: 901 })).rejects.toMatchObject({ code: 'OUTCOME_UNKNOWN' });
      const firstTries = idsOf('admin_set_team_values');

      vi.mocked(supabase.rpc as any).mockClear();
      vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { ok: true }, error: null });
      await rpcAdminSetTeamValues({ ...params, cash: 901 });

      expect(idsOf('admin_set_team_values')).toEqual([firstTries[0]]);
    });

    it('double-submits of the same action share one request_id', async () => {
      vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { ok: true }, error: null });
      await Promise.all([rpcAdminSetTeamValues({ ...params, cash: 902 }), rpcAdminSetTeamValues({ ...params, cash: 902 })]);
      const ids = idsOf('admin_set_team_values');
      expect(ids).toHaveLength(2);
      expect(ids[0]).toBe(ids[1]);
    });

    it('after a success the next identical action is a new intent with a new request_id', async () => {
      vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { ok: true }, error: null });
      await rpcAdminSetTeamValues({ ...params, cash: 903 });
      await rpcAdminSetTeamValues({ ...params, cash: 903 });
      const ids = idsOf('admin_set_team_values');
      expect(ids[0]).not.toBe(ids[1]);
    });

    it('a definite failure does not keep the id either', async () => {
      vi.mocked(supabase.rpc as any).mockResolvedValue({ data: null, error: { message: 'INSUFFICIENT_CASH', details: '{}' } });
      await expect(rpcAdminSetTeamValues({ ...params, cash: 904 })).rejects.toMatchObject({ code: 'INSUFFICIENT_CASH' });
      await expect(rpcAdminSetTeamValues({ ...params, cash: 904 })).rejects.toMatchObject({ code: 'INSUFFICIENT_CASH' });
      const ids = idsOf('admin_set_team_values');
      expect(ids[0]).not.toBe(ids[1]);
    });

    it('a caller-supplied request_id (quick-action dialogs) is passed through untouched', async () => {
      vi.mocked(supabase.rpc as any).mockResolvedValue({ data: { ok: true }, error: null });
      await rpcAdminSetTeamValues({ ...params, cash: 905, request_id: 'fixed-id' });
      expect(idsOf('admin_set_team_values')).toEqual(['fixed-id']);
    });
  });
});
