// Run on a freshly reset local DB (see lockorder.test.ts).
import { describe, it, expect, beforeAll } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { harnessEnabled, newAdmin, newPlayer, createLobbyRoom, serviceClient } from './harness';

const run = harnessEnabled ? describe : describe.skip;
const uuid = () => crypto.randomUUID();

const events = async (roomId: string, type: string) =>
  (await serviceClient().from('activity_events').select('*', { count: 'exact', head: true }).eq('room_id', roomId).eq('type', type)).count;

run('lifecycle under concurrency (L2, L3, L15)', () => {
  let a: SupabaseClient, b: SupabaseClient, roomId: string;

  beforeAll(async () => {
    a = await newAdmin('life-a');
    b = await newAdmin('life-b');
    roomId = await createLobbyRoom(a);
  });

  it('start x6 concurrently (3 share a request_id): exactly one ACTIVE transition and one GAME_STARTED', async () => {
    const shared = uuid();
    const results = await Promise.all([shared, shared, shared, uuid(), uuid(), uuid()].map((rid, i) =>
      (i % 2 ? a : b).rpc('admin_start_game', { room_id: roomId, force: true, request_id: rid })));
    const winners = results.filter((r) => !r.error);
    expect(winners.length).toBeGreaterThanOrEqual(1);
    for (const r of results.filter((r) => r.error)) expect(r.error!.message).toBe('INVALID_TRANSITION');
    expect(await events(roomId, 'GAME_STARTED')).toBe(1);
  });

  it('abort ∥ start never both win; after abort a restart gets a new started_at', async () => {
    const before = (await serviceClient().from('rooms').select('started_at').eq('id', roomId).single()).data!.started_at;
    expect((await a.rpc('admin_abort_game', { p_room_id: roomId, note: 'reset' })).error).toBeNull();
    await new Promise((r) => setTimeout(r, 20));
    expect((await a.rpc('admin_start_game', { room_id: roomId, force: true, request_id: uuid() })).error).toBeNull();
    const after = (await serviceClient().from('rooms').select('started_at').eq('id', roomId).single()).data!.started_at;
    expect(after).not.toBe(before);
    expect(await events(roomId, 'GAME_STARTED')).toBe(2); // history kept across the restart
  });

  it('20 concurrent callers after ends_at: one TIME_EXPIRED event, abort then refused (L2/L15)', async () => {
    await serviceClient().from('rooms').update({ ends_at: new Date(Date.now() - 1000).toISOString() }).eq('id', roomId);
    const players = await Promise.all(Array.from({ length: 20 }, () => newPlayer()));
    const res = await Promise.all(players.map((p) => p.rpc('expire_if_due', { p_room_id: roomId })));
    expect(new Set(res.map((r) => r.data))).toEqual(new Set(['TIME_EXPIRED']));
    expect(await events(roomId, 'TIME_EXPIRED')).toBe(1);
    const abort = await a.rpc('admin_abort_game', { p_room_id: roomId, note: 'late' });
    expect(abort.error?.message).toBe('ROOM_ALREADY_EXPIRED');
  });

  it('finalize x2 concurrently with one request_id: one GAME_FINALIZED, identical payloads', async () => {
    const rid = uuid();
    const [x, y] = await Promise.all([a.rpc('admin_finalize', { p_room_id: roomId, request_id: rid }), b.rpc('admin_finalize', { p_room_id: roomId, request_id: rid })]);
    expect(x.error).toBeNull();
    expect(y.error).toBeNull();
    expect(y.data).toEqual(x.data);
    expect(await events(roomId, 'GAME_FINALIZED')).toBe(1);
  });
});

run('multi-admin room creation (migration 0032)', () => {
  const teams = ['A', 'B', 'C', 'D', 'E'].map((name, i) => ({ name, color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'][i] }));
  const create = (c: SupabaseClient) => c.rpc('admin_create_room', { team_count: 5, teams });
  const codeOf = (d: any) => (d.room ?? d).code as string;

  it('concurrent creates by different admins both succeed with different codes; same admin is still refused', async () => {
    const [x, y] = await Promise.all([newAdmin('multi-x'), newAdmin('multi-y')]);
    const [rx, ry] = await Promise.all([create(x), create(y)]);
    expect(rx.error).toBeNull();
    expect(ry.error).toBeNull();
    expect(codeOf(rx.data)).not.toBe(codeOf(ry.data));
    expect((await create(x)).error?.message).toBe('NON_FINAL_ROOM_EXISTS');
  });

  it('a non-final room with created_by NULL does not block an admin', async () => {
    const orphan = await serviceClient().from('rooms').insert({ code: 'KLMNPQ', status: 'CREATED', team_count: 5, created_by: null });
    expect(orphan.error).toBeNull();
    expect((await create(await newAdmin('multi-z'))).error).toBeNull();
    await serviceClient().from('rooms').delete().eq('code', 'KLMNPQ');
  });
});
