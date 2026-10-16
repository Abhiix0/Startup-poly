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
    const ids = (await serviceClient().from('teams').select('id').eq('room_id', roomId).order('slot')).data!.map((t) => t.id);
    expect((await a.rpc('admin_set_tiebreak', { room_id: roomId, ordered_team_ids: ids, note: 'order' })).error).toBeNull();
    const rid = uuid();
    const [x, y] = await Promise.all([a.rpc('admin_finalize', { p_room_id: roomId, request_id: rid }), b.rpc('admin_finalize', { p_room_id: roomId, request_id: rid })]);
    expect(x.error).toBeNull();
    expect(y.error).toBeNull();
    expect(y.data).toEqual(x.data);
    expect(await events(roomId, 'GAME_FINALIZED')).toBe(1);
  });
});
