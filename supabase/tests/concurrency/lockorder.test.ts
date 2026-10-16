// Run: LOCAL_SUPABASE_URL=… LOCAL_ANON_KEY=… LOCAL_SERVICE_KEY=… npx vitest run --root . supabase/tests/concurrency
import { describe, it, expect } from 'vitest';
import { harnessEnabled, newAdmin, createLobbyRoom, teamIds, isDeadlock } from './harness';

const run = harnessEnabled ? describe : describe.skip;

// L1: add_business locks team THEN room; abort_game locks room THEN teams.
// un-skip when fixed in P2
run.skip('L1 lock-order inversion (add_business ∥ abort_game)', () => {
  it('never raises 40P01 across 50 iterations', async () => {
    const a = await newAdmin('lock-a');
    const b = await newAdmin('lock-b');
    const roomId = await createLobbyRoom(a);
    let deadlocks = 0;
    for (let i = 0; i < 50; i++) {
      const start = await a.rpc('admin_start_game', { room_id: roomId, force: true });
      expect(start.error).toBeNull();
      const [t1] = await teamIds(a, roomId);
      const [add, abort] = await Promise.all([
        a.rpc('admin_add_business', { team_id: t1.id, business_key: 'edtech', apply_purchase: true, expected_version: t1.version, request_id: crypto.randomUUID() }),
        b.rpc('admin_abort_game', { p_room_id: roomId, note: `race ${i}` }),
      ]);
      if (isDeadlock(add.error) || isDeadlock(abort.error)) deadlocks++;
      await b.rpc('admin_abort_game', { p_room_id: roomId, note: 'cleanup' }); // no-op if already LOBBY
    }
    expect(deadlocks).toBe(0);
  }, 120_000);
});
