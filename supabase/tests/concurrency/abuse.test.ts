// Run on a freshly reset local DB (see lockorder.test.ts). Tests share one room and run in order.
import { describe, it, expect, beforeAll } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { harnessEnabled, newAdmin, newPlayer, createLobbyRoom, teamIds, serviceClient } from './harness';

const run = harnessEnabled ? describe : describe.skip;
const uuid = () => crypto.randomUUID();

type JoinOut = { ok: boolean; error?: string };

async function join(c: SupabaseClient, code: string, slot: number, pin: string): Promise<JoinOut> {
  const { data, error } = await c.rpc('join_team', { code, slot, pin });
  if (error) return { ok: false, error: error.message };
  if (data?.error) return { ok: false, error: data.error };
  return { ok: true };
}

run('join abuse resistance and request_id misuse (L4, L5, L6, N1)', () => {
  let admin: SupabaseClient, roomId: string, code: string;
  const pins = new Map<number, string>();
  const svc = serviceClient();

  beforeAll(async () => {
    admin = await newAdmin('abuse');
    roomId = await createLobbyRoom(admin);
    code = (await svc.from('rooms').select('code').eq('id', roomId).single()).data!.code;
    const rows = (await svc.from('team_secrets').select('join_pin, teams!inner(slot,room_id)').eq('teams.room_id', roomId)).data!;
    for (const r of rows as unknown as { join_pin: string; teams: { slot: number } }[]) pins.set(r.teams.slot, r.join_pin);
  });

  it('six legitimate phones joining at once all succeed', async () => {
    const players = await Promise.all([1, 2, 3, 4, 5, 6].map(() => newPlayer()));
    const res = await Promise.all(players.map((p, i) => join(p, code, i + 1, pins.get(i + 1)!)));
    expect(res.every((r) => r.ok)).toBe(true);
  });

  it('N1/L5: one session guessing wrong PINs is throttled after 5 recorded failures', async () => {
    const p = await newPlayer();
    const out: JoinOut[] = [];
    for (let i = 0; i < 8; i++) out.push(await join(p, code, 1, '0000'));
    expect(out.slice(0, 5).map((o) => o.error)).toEqual(Array(5).fill('BAD_CODE_OR_PIN'));
    expect(out.slice(5).every((o) => o.error === 'TOO_MANY_ATTEMPTS')).toBe(true);
  });

  it('L5: fresh sessions guessing one team are throttled before 20 total guesses, correct PIN included', async () => {
    let guesses = 0;
    let tripped = false;
    for (let i = 0; i < 10 && !tripped; i++) {
      const p = await newPlayer();
      for (let g = 0; g < 2 && !tripped; g++) {
        const r = await join(p, code, 2, '0000');
        guesses++;
        tripped = r.error === 'TOO_MANY_ATTEMPTS';
      }
    }
    expect(tripped).toBe(true);
    expect(guesses).toBeLessThanOrEqual(20);
    expect((await join(await newPlayer(), code, 2, pins.get(2)!)).error).toBe('TOO_MANY_ATTEMPTS');
  });

  it('L6: two phones racing for one slot - exactly one claim, the loser gets TEAM_ALREADY_CLAIMED', async () => {
    for (let round = 0; round < 5; round++) {
      const t = (await teamIds(admin, roomId))[2]; // slot 3
      expect((await admin.rpc('admin_release_team', { team_id: t.id })).error).toBeNull();
      const [p1, p2] = await Promise.all([newPlayer(), newPlayer()]);
      const res = await Promise.all([join(p1, code, 3, pins.get(3)!), join(p2, code, 3, pins.get(3)!)]);
      expect(res.filter((r) => r.ok)).toHaveLength(1);
      expect(res.find((r) => !r.ok)!.error).toBe('TEAM_ALREADY_CLAIMED');
      expect((await svc.from('team_claims').select('*', { count: 'exact', head: true }).eq('team_id', t.id)).count).toBe(1);
    }
  });

  it('L4: a request_id reused for a different team is REQUEST_ID_REUSED with no effect', async () => {
    expect((await admin.rpc('admin_start_game', { room_id: roomId, force: true })).error).toBeNull();
    const [, t2, t3] = await teamIds(admin, roomId);
    const rid = uuid();
    const call = (t: { id: string; version: number }, cash: number) =>
      admin.rpc('admin_set_team_values', { team_id: t.id, cash, cv: null, expected_version: t.version, request_id: rid, note: null });
    expect((await call(t2, 900)).error).toBeNull();
    expect((await call(t3, 800)).error?.message).toBe('REQUEST_ID_REUSED');
    expect((await teamIds(admin, roomId))[2].version).toBe(t3.version);
  });
});
