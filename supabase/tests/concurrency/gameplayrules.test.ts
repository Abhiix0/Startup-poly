// Run on a freshly reset local DB (see lockorder.test.ts). Rules enforced by the database under concurrency:
// the 2-business cap, one level per upgrade, debt-first START, and idempotent money moves.
import { describe, it, expect, beforeAll } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { harnessEnabled, newAdmin, createLobbyRoom, teamIds, serviceClient, placeOn } from './harness';

const run = harnessEnabled ? describe : describe.skip;
const uuid = () => crypto.randomUUID();

run('gameplay rules under concurrency', () => {
  let a: SupabaseClient, b: SupabaseClient, roomId: string;
  const svc = serviceClient();
  const team = async (id: string) => (await svc.from('teams').select('id,version,cash,debt,board_position').eq('id', id).single()).data!;
  const owned = async (id: string) => (await svc.from('team_businesses').select('business_key,level').eq('team_id', id)).data!;

  beforeAll(async () => {
    a = await newAdmin('rules-a');
    b = await newAdmin('rules-b');
    roomId = await createLobbyRoom(a);
    expect((await a.rpc('admin_start_game', { room_id: roomId, force: true })).error).toBeNull();
  });

  it('three free business entries fired at one version: exactly one lands and the cap of 2 holds', async () => {
    const [t1] = await teamIds(a, roomId);
    const calls = ['edtech', 'saas', 'fintech'].map((key, i) =>
      (i % 2 ? b : a).rpc('admin_add_business', {
        team_id: t1.id, business_key: key, apply_purchase: false, expected_version: t1.version, request_id: uuid(), note: 'manual entry',
      }),
    );
    const res = await Promise.all(calls);
    expect(res.filter((r) => !r.error)).toHaveLength(1);
    for (const r of res.filter((x) => x.error)) expect(['VERSION_CONFLICT', 'BUSINESS_CAP']).toContain(r.error!.message);
    expect((await owned(t1.id)).length).toBeLessThanOrEqual(2);
  });

  it('a third business is refused through the RPC once two are owned', async () => {
    const [t1] = await teamIds(a, roomId);
    const cur = await team(t1.id);
    // make sure the team owns two: add a second free entry if the race above left one
    if ((await owned(t1.id)).length < 2) {
      const have = (await owned(t1.id)).map((x) => x.business_key);
      const key = ['ai_deeptech', 'healthtech'].find((k) => !have.includes(k))!;
      expect((await a.rpc('admin_add_business', { team_id: t1.id, business_key: key, apply_purchase: false, expected_version: cur.version, request_id: uuid(), note: 'second entry' })).error).toBeNull();
    }
    const cur2 = await team(t1.id);
    const third = await a.rpc('admin_add_business', { team_id: t1.id, business_key: 'robotics', apply_purchase: false, expected_version: cur2.version, request_id: uuid(), note: 'third entry' });
    expect(third.error?.message).toBe('BUSINESS_CAP');
  });

  it('two upgrade requests at one version: one wins, the level never skips and cash is charged once', async () => {
    const [, t2] = await teamIds(a, roomId);
    await placeOn(t2.id, 'ecommerce');
    await svc.from('teams').update({ cash: 1000 }).eq('id', t2.id);
    const buy = await a.rpc('admin_add_business', { team_id: t2.id, business_key: 'ecommerce', apply_purchase: true, expected_version: (await team(t2.id)).version, request_id: uuid() });
    expect(buy.error).toBeNull();
    const cur = await team(t2.id);
    const up = (c: SupabaseClient) => c.rpc('admin_set_business_level', { team_id: t2.id, business_key: 'ecommerce', new_level: 1, apply_upgrade: true, expected_version: cur.version, request_id: uuid(), note: null });
    const res = await Promise.all([up(a), up(b)]);
    expect(res.filter((r) => !r.error)).toHaveLength(1);
    expect(res.find((r) => r.error)!.error!.message).toBe('VERSION_CONFLICT');
    expect((await owned(t2.id))[0].level).toBe(1);
    expect((await team(t2.id)).cash).toBe(cur.cash - 150); // E-Commerce (cost 300) upgrade 1 costs 150

    // Sequential upgrades stop at level 2 and never go negative.
    const second = await a.rpc('admin_set_business_level', { team_id: t2.id, business_key: 'ecommerce', new_level: 2, apply_upgrade: true, expected_version: (await team(t2.id)).version, request_id: uuid(), note: null });
    expect(second.error).toBeNull();
    const third = await a.rpc('admin_set_business_level', { team_id: t2.id, business_key: 'ecommerce', new_level: 2, apply_upgrade: true, expected_version: (await team(t2.id)).version, request_id: uuid(), note: null });
    expect(third.error).not.toBeNull();
    const end = await team(t2.id);
    expect(end.cash).toBe(cur.cash - 150 - 200);
    expect((await owned(t2.id))[0].level).toBe(2);
  });

  it('a payment the team cannot cover is refused while it owns a business, and never drives cash below zero', async () => {
    const [, t2] = await teamIds(a, roomId);
    await svc.from('teams').update({ cash: 50 }).eq('id', t2.id);
    const cur = await team(t2.id);
    const res = await Promise.all([a, b].map((c) => c.rpc('admin_adjust', { changes: [{ team_id: t2.id, cash_delta: -300, expected_version: cur.version }], label: 'CRISIS', note: 'n', request_id: uuid() })));
    for (const r of res) expect(r.error).not.toBeNull();
    const after = await team(t2.id);
    expect(after.cash).toBe(50);
    expect(after.debt).toBe(0);
    await svc.from('teams').update({ cash: cur.cash }).eq('id', t2.id);
  });

  it('a team with nothing left to sell goes into debt once, even when the payment is sent twice at once', async () => {
    const [, , t3] = await teamIds(a, roomId);
    await svc.from('teams').update({ cash: 100, debt: 0 }).eq('id', t3.id);
    const cur = await team(t3.id);
    const rid = uuid();
    const args = { changes: [{ team_id: t3.id, cash_delta: -300, expected_version: cur.version }], label: 'CRISIS', note: 'n', request_id: rid };
    const [x, y] = await Promise.all([a.rpc('admin_adjust', args), a.rpc('admin_adjust', args)]);
    expect(x.error).toBeNull();
    expect(y.error).toBeNull();
    const after = await team(t3.id);
    expect({ cash: after.cash, debt: after.debt }).toEqual({ cash: 0, debt: 200 });
  });

  it('teams may share a board space', async () => {
    const [, , , t4, t5] = await teamIds(a, roomId);
    await svc.from('teams').update({ board_position: 0 }).in('id', [t4.id, t5.id]);
    const r4 = await a.rpc('admin_move_team', { team_id: t4.id, steps: 3, expected_version: (await team(t4.id)).version, request_id: uuid() });
    const r5 = await b.rpc('admin_move_team', { team_id: t5.id, steps: 3, expected_version: (await team(t5.id)).version, request_id: uuid() });
    expect(r4.error).toBeNull();
    expect(r5.error).toBeNull();
    expect((await team(t4.id)).board_position).toBe(3);
    expect((await team(t5.id)).board_position).toBe(3);
  });
});
