// Run on a freshly reset local DB (one open room allowed at a time):
//   supabase db reset && LOCAL_SUPABASE_URL=… LOCAL_ANON_KEY=… LOCAL_SERVICE_KEY=… LOCAL_JWT_SECRET=… npm run test:concurrency
import { describe, it, expect, beforeAll } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { harnessEnabled, newAdmin, createLobbyRoom, teamIds, serviceClient, isDeadlock } from './harness';

const run = harnessEnabled ? describe : describe.skip;
const ITERATIONS = 50;
const uuid = () => crypto.randomUUID();

type Res = { error: { code?: string; message?: string } | null };

// Canonical lock order (P2): rooms, then teams ascending id. Any 40P01 is a failure.
async function race(prepare: (i: number) => Promise<() => Promise<Res[]>>) {
  let deadlocks = 0;
  const errors = new Set<string>();
  for (let i = 0; i < ITERATIONS; i++) {
    for (const r of await (await prepare(i))()) {
      if (isDeadlock(r.error)) deadlocks++;
      else if (r.error?.message) errors.add(r.error.message);
    }
  }
  return { deadlocks, errors: [...errors] };
}

run('lock order: no deadlocks (L1, L7)', () => {
  let a: SupabaseClient, b: SupabaseClient, roomId: string;

  // abort (errors ignored when not ACTIVE) then start: every race begins from a fresh ACTIVE game.
  const freshGame = async () => {
    await b.rpc('admin_abort_game', { p_room_id: roomId, note: 'reset' });
    expect((await a.rpc('admin_start_game', { room_id: roomId, force: true })).error).toBeNull();
  };

  beforeAll(async () => {
    a = await newAdmin('lock-a');
    b = await newAdmin('lock-b');
    roomId = await createLobbyRoom(a);
  });

  it('add_business ∥ abort_game', async () => {
    const r = await race(async (i) => {
      await freshGame();
      const [t1] = await teamIds(a, roomId);
      return () => Promise.all([
        a.rpc('admin_add_business', { team_id: t1.id, business_key: 'edtech', apply_purchase: true, expected_version: t1.version, request_id: uuid() }),
        b.rpc('admin_abort_game', { p_room_id: roomId, note: `race ${i}` }),
      ]);
    });
    expect(r.deadlocks).toBe(0);
    // only serial-order outcomes are acceptable
    expect(r.errors.filter((m) => !['INVALID_TRANSITION', 'VERSION_CONFLICT', 'ROOM_NOT_EDITABLE'].includes(m))).toEqual([]);
  });

  it('add_business ∥ set_team_values', async () => {
    await freshGame();
    const r = await race(async () => {
      const [t1] = await teamIds(a, roomId);
      return () => Promise.all([
        a.rpc('admin_set_team_values', { team_id: t1.id, cash: 1000, cv: 0, expected_version: t1.version, request_id: uuid() }),
        b.rpc('admin_add_business', { team_id: t1.id, business_key: 'edtech', apply_purchase: false, expected_version: t1.version, request_id: uuid() }),
      ]);
    });
    expect(r.deadlocks).toBe(0);
  });

  it('release_team ∥ set_bankrupt', async () => {
    await freshGame();
    const r = await race(async () => {
      const [t1] = await teamIds(a, roomId);
      return () => Promise.all([
        a.rpc('admin_release_team', { team_id: t1.id }),
        b.rpc('admin_set_bankrupt', { team_id: t1.id, value: false, expected_version: t1.version, request_id: uuid() }),
      ]);
    });
    expect(r.deadlocks).toBe(0);
  });

  it('adjust across 2 teams ∥ abort_game', async () => {
    const r = await race(async (i) => {
      await freshGame();
      const [t1, t2] = await teamIds(a, roomId);
      const changes = [t1, t2].map((t) => ({ team_id: t.id, cash_delta: 10, cv_delta: 0, expected_version: t.version }));
      return () => Promise.all([
        a.rpc('admin_adjust', { changes, label: 'race', note: `n${i}`, request_id: uuid() }),
        b.rpc('admin_abort_game', { p_room_id: roomId, note: `race ${i}` }),
      ]);
    });
    expect(r.deadlocks).toBe(0);
  });

  // Runs last: finalizing closes the shared room, then each iteration creates the next one.
  it('set_business_level ∥ finalize', async () => {
    const svc = serviceClient();
    let deadlocks = 0;
    for (let i = 0; i < ITERATIONS; i++) {
      const id = i === 0 ? roomId : await createLobbyRoom(a);
      if (i === 0) await freshGame();
      else expect((await a.rpc('admin_start_game', { room_id: id, force: true })).error).toBeNull();
      const ts = await teamIds(a, id);
      await a.rpc('admin_add_business', { team_id: ts[0].id, business_key: 'saas', apply_purchase: true, expected_version: ts[0].version, request_id: uuid() });
      await svc.from('rooms').update({ ends_at: new Date(Date.now() - 1000).toISOString() }).eq('id', id);
      await a.rpc('expire_if_due', { p_room_id: id });
      const fresh = await teamIds(a, id);
      await a.rpc('admin_set_tiebreak', { room_id: id, ordered_team_ids: fresh.map((t) => t.id), note: 'order' });
      const res = await Promise.all([
        a.rpc('admin_set_business_level', { team_id: fresh[0].id, business_key: 'saas', new_level: 1, apply_upgrade: false, expected_version: fresh[0].version, request_id: uuid(), note: 'fix' }),
        b.rpc('admin_finalize', { p_room_id: id }),
      ]);
      deadlocks += res.filter((r: Res) => isDeadlock(r.error)).length;
      const closed = await b.rpc('admin_finalize', { p_room_id: id }); // closes the room if finalize lost the race
      expect(closed.error === null || closed.error.message === 'INVALID_TRANSITION').toBe(true);
    }
    expect(deadlocks).toBe(0);
  });
});
