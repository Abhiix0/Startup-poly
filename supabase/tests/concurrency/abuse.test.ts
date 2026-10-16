import { describe, it, expect } from 'vitest';
import { harnessEnabled, newAdmin, newPlayer, createLobbyRoom, teamIds, serviceClient } from './harness';

const run = harnessEnabled ? describe : describe.skip;

// N1/L5: the failed-attempt INSERT is rolled back by the RAISE that follows it, so the throttle never trips.
// un-skip when fixed in P5
run.skip('N1/L5 join_team PIN throttle', () => {
  it('one session guessing wrong PINs is throttled before 10 guesses', async () => {
    const admin = await newAdmin('abuse');
    const roomId = await createLobbyRoom(admin);
    const { data } = await serviceClient().from('rooms').select('code').eq('id', roomId).single();
    const player = await newPlayer();
    const results: (string | undefined)[] = [];
    for (let i = 0; i < 10; i++) results.push((await player.rpc('join_team', { code: data!.code, slot: 1, pin: '0000' })).error?.message);
    expect(results).toContain('TOO_MANY_ATTEMPTS');
  });
});

// L4: a request_id reused for a different team is silently treated as a replay.
// un-skip when fixed in P4
run.skip('L4 request_id reuse across teams', () => {
  it('raises REQUEST_ID_REUSED and leaves the second team untouched', async () => {
    const admin = await newAdmin('reuse');
    const roomId = await createLobbyRoom(admin);
    await admin.rpc('admin_start_game', { room_id: roomId, force: true });
    const [, t2, t3] = await teamIds(admin, roomId);
    const rid = crypto.randomUUID();
    const base = { cv: 0, request_id: rid };
    expect((await admin.rpc('admin_set_team_values', { ...base, team_id: t2.id, cash: 900, expected_version: t2.version })).error).toBeNull();
    const second = await admin.rpc('admin_set_team_values', { ...base, team_id: t3.id, cash: 800, expected_version: t3.version });
    expect(second.error?.message).toBe('REQUEST_ID_REUSED');
  });
});
