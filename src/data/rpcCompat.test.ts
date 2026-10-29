import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from './client';
import { rpcGetStandings, rpcGetAdminSnapshot, rpcAdminFinalize } from './rpc';

vi.mock('./client', () => ({ supabase: { rpc: vi.fn() } }));
const reply = (data: unknown) => vi.mocked(supabase.rpc as any).mockResolvedValue({ data, error: null });

// Shapes a database at migration 0027 returns (no debt / business_cost / upgrade_count).
const oldStanding = { team_id: 't1', slot: 1, name: 'A', rank: 1, is_bankrupt: false, cash: 100, cv: 5, business_count: 1 };
const oldTeam = { id: 't1', slot: 1, name: 'A', color: '#fff', cash: 100, cv: 5, version: 1, is_bankrupt: false, businesses: [] };
const snap = (teams: unknown[]) => ({ room: { id: 'r', status: 'TIME_EXPIRED' }, server_now: '', teams, events: [] });

describe('RPC payload boundary', () => {
  beforeEach(() => vi.clearAllMocks());

  it('old-shape standings raise the out-of-date error instead of reaching the UI', async () => {
    reply({ standings: [oldStanding] });
    await expect(rpcGetStandings('r')).rejects.toMatchObject({ code: 'SCHEMA_OUTDATED', message: 'Database is out of date. Apply the latest migrations.' });
  });

  it('old-shape admin snapshot raises the out-of-date error', async () => {
    reply(snap([oldTeam]));
    await expect(rpcGetAdminSnapshot('r')).rejects.toMatchObject({ code: 'SCHEMA_OUTDATED' });
  });

  it('null or missing numbers become 0, so nothing downstream sees undefined', async () => {
    reply(snap([{ ...oldTeam, debt: null, cash: null, version: undefined, businesses: [{ business_key: 'saas', name: 'S', level: null }] }]));
    const t = (await rpcGetAdminSnapshot('r')).teams[0];
    expect([t.cash, t.debt, t.version, t.board_position, t.businesses[0].level, t.businesses[0].cost]).toEqual([0, 0, 0, 0, 0, 0]);

    reply({ standings: [{ ...oldStanding, debt: null, business_cost: 7, upgrade_count: undefined, cash: null }] });
    const s = (await rpcGetStandings('r')).standings[0];
    expect([s.cash, s.debt, s.business_cost, s.upgrade_count]).toEqual([0, 0, 7, 0]);
  });

  it('a finalize that already committed is never reported as failed because of payload shape', async () => {
    reply({ room_id: 'r', winner_team_id: null, standings: [oldStanding] });
    const res = await rpcAdminFinalize('r');
    expect(res.standings[0].business_cost).toBe(0);
  });
});
