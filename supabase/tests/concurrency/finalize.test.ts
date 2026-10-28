// Run on a freshly reset local DB (see lockorder.test.ts).
import { describe, it, expect } from 'vitest';
import { harnessEnabled, newAdmin, createLobbyRoom, teamIds, serviceClient } from './harness';

const run = harnessEnabled ? describe : describe.skip;
const uuid = () => crypto.randomUUID();

run('finalize vs a concurrent correction (P7)', () => {
  it('final_results always equals the final team rows, whichever side wins the race', async () => {
    const svc = serviceClient();
    const a = await newAdmin('fin-a'), b = await newAdmin('fin-b');
    let finalizedFirst = 0, correctionFirst = 0;

    for (let i = 0; i < 25; i++) {
      const roomId = await createLobbyRoom(a);
      expect((await a.rpc('admin_start_game', { room_id: roomId, force: true })).error).toBeNull();
      await svc.from('rooms').update({ ends_at: new Date(Date.now() - 1000).toISOString() }).eq('id', roomId);
      await a.rpc('expire_if_due', { p_room_id: roomId });
      const ts = await teamIds(a, roomId);

      const [fin, fix] = await Promise.all([
        a.rpc('admin_finalize', { p_room_id: roomId }),
        b.rpc('admin_set_team_values', { team_id: ts[0].id, cash: 777, expected_version: ts[0].version, request_id: uuid(), note: 'correction' }),
      ]);
      expect(fin.error?.message ?? null).toBeNull();
      if (fix.error) {
        expect(fix.error.message).toBe('ROOM_NOT_EDITABLE');
        finalizedFirst++;
      } else {
        correctionFirst++;
      }

      const teams = (await svc.from('teams').select('id,cash').eq('room_id', roomId)).data!;
      const results = (await svc.from('final_results').select('team_id,cash').eq('room_id', roomId)).data!;
      expect(results).toHaveLength(teams.length);
      for (const t of teams) {
        expect(results.find((r) => r.team_id === t.id), `team ${t.id}`).toMatchObject({ cash: t.cash });
      }
    }
    // Both orders should occur for the race to mean anything; report rather than fail on a lucky streak.
    console.log(`finalize first: ${finalizedFirst}, correction first: ${correctionFirst}`);
  }, 180_000);
});
