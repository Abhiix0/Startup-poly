// Run on a freshly reset local DB (see lockorder.test.ts).
import { describe, it, expect, beforeAll } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { harnessEnabled, newAdmin, createLobbyRoom, teamIds, serviceClient } from './harness';

const run = harnessEnabled ? describe : describe.skip;
const uuid = () => crypto.randomUUID();
const KEYS = ['edtech', 'saas', 'ecommerce', 'fintech', 'healthtech'];

// Small seeded PRNG so a failing sequence can be replayed.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

run('money RPCs under concurrency and random sequences (L4, L8)', () => {
  let a: SupabaseClient, b: SupabaseClient, roomId: string;
  const svc = serviceClient();
  const eventCount = async (rid: string) =>
    (await svc.from('activity_events').select('*', { count: 'exact', head: true }).eq('request_id', rid)).count;

  beforeAll(async () => {
    a = await newAdmin('money-a');
    b = await newAdmin('money-b');
    roomId = await createLobbyRoom(a);
    expect((await a.rpc('admin_start_game', { room_id: roomId, force: true })).error).toBeNull();
  });

  it('same request_id sent twice at once: one effect, identical response, no spurious conflict', async () => {
    const [t1] = await teamIds(a, roomId);
    const rid = uuid();
    const args = { team_id: t1.id, cash: 777, expected_version: t1.version, request_id: rid, note: null };
    const [x, y] = await Promise.all([a.rpc('admin_set_team_values', args), a.rpc('admin_set_team_values', args)]);
    expect(x.error).toBeNull();
    expect(y.error).toBeNull();
    expect(y.data).toEqual(x.data);
    expect(await eventCount(rid)).toBe(1);
  });

  it('same request_id for add_business at once: second call replays instead of BUSINESS_OWNED', async () => {
    const [, t2] = await teamIds(a, roomId);
    const rid = uuid();
    const args = { team_id: t2.id, business_key: 'edtech', apply_purchase: true, expected_version: t2.version, request_id: rid };
    const [x, y] = await Promise.all([a.rpc('admin_add_business', args), a.rpc('admin_add_business', args)]);
    expect(x.error).toBeNull();
    expect(y.error).toBeNull();
    expect(await eventCount(rid)).toBe(1);
  });

  it('request_id reused for a different team is REQUEST_ID_REUSED and has no effect (L4)', async () => {
    const [, , t3, t4] = await teamIds(a, roomId);
    const rid = uuid();
    expect((await a.rpc('admin_set_team_values', { team_id: t3.id, cash: 900, expected_version: t3.version, request_id: rid, note: null })).error).toBeNull();
    const bad = await a.rpc('admin_set_team_values', { team_id: t4.id, cash: 800, expected_version: t4.version, request_id: rid, note: null });
    expect(bad.error?.message).toBe('REQUEST_ID_REUSED');
    expect((await teamIds(a, roomId))[3].version).toBe(t4.version);
  });

  it('200 random operations keep the money invariants', async () => {
    const rand = mulberry32(20260301);
    const pick = <T,>(xs: T[]) => xs[Math.floor(rand() * xs.length)];
    const rawErrors: string[] = [];

    for (let i = 0; i < 200; i++) {
      const ts = (await svc.from('teams').select('id,version,cash,slot,is_bankrupt').eq('room_id', roomId).order('slot')).data!;
      const t = pick(ts);
      const client = rand() < 0.5 ? a : b;
      const rid = uuid();
      const op = Math.floor(rand() * 6);
      let res: { error: { code?: string; message?: string } | null };
      if (op === 0) {
        res = await client.rpc('admin_set_team_values', { team_id: t.id, cash: Math.floor(rand() * 3000), expected_version: t.version, request_id: rid, note: null });
      } else if (op === 1) {
        const u = pick(ts.filter((x) => x.id !== t.id));
        res = await client.rpc('admin_adjust', { changes: [t, u].map((x) => ({ team_id: x.id, cash_delta: Math.floor(rand() * 400) - 200, expected_version: x.version })), label: 'rnd', note: 'n', request_id: rid });
      } else if (op === 2) {
        res = await client.rpc('admin_add_business', { team_id: t.id, business_key: pick(KEYS), apply_purchase: rand() < 0.7, expected_version: t.version, request_id: rid, note: 'n' });
      } else if (op === 3) {
        const own = (await svc.from('team_businesses').select('business_key,level').eq('team_id', t.id)).data!;
        if (!own.length) continue;
        const o = pick(own);
        res = await client.rpc('admin_set_business_level', { team_id: t.id, business_key: o.business_key, new_level: Math.min(2, o.level + 1), apply_upgrade: rand() < 0.7, expected_version: t.version, request_id: rid, note: 'n' });
      } else if (op === 4) {
        const own = (await svc.from('team_businesses').select('business_key').eq('team_id', t.id)).data!;
        if (!own.length) continue;
        res = await client.rpc('admin_remove_business', { team_id: t.id, business_key: pick(own).business_key, reason: pick(['FORCED_SALE', 'CORRECTION']), credit_resale: rand() < 0.5, expected_version: t.version, request_id: rid, note: 'n' });
      } else {
        res = await client.rpc('admin_set_bankrupt', { team_id: t.id, value: !t.is_bankrupt, expected_version: t.version, request_id: rid, note: 'n' });
      }
      // Business rules raise P0001 codes; anything else (22003, 23xxx, 42xxx…) is a raw Postgres error.
      if (res.error && (res.error as { code?: string }).code !== 'P0001') rawErrors.push(`${op}:${res.error.code}:${res.error.message}`);
    }
    expect(rawErrors).toEqual([]);

    const teams = (await svc.from('teams').select('id,cash').eq('room_id', roomId)).data!;
    const biz = (await svc.from('team_businesses').select('team_id,business_key').eq('room_id', roomId)).data!;
    const events = (await svc.from('activity_events').select('team_id,prev,new').eq('room_id', roomId).not('team_id', 'is', null)).data!;

    for (const t of teams) {
      expect(t.cash).toBeGreaterThanOrEqual(0);
      expect(biz.filter((x) => x.team_id === t.id).length).toBeLessThanOrEqual(2);
      // sum of audited deltas must reproduce the balance (start: cash 1000)
      let cash = 1000;
      for (const e of events.filter((x) => x.team_id === t.id)) {
        const p = (e.prev ?? {}) as Record<string, unknown>, n = (e.new ?? {}) as Record<string, unknown>;
        if (typeof p.cash === 'number' && typeof n.cash === 'number') cash += n.cash - p.cash;
      }
      expect(cash).toEqual(t.cash);
    }
    const keys = biz.map((x) => x.business_key);
    expect(new Set(keys).size).toBe(keys.length);
  }, 300_000);
});
