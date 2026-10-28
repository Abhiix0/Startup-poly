// Calls Supabase over HTTP (PostgREST + Realtime), bypassing the app, as each role.
// Run on a freshly reset local DB: npm run test:security (env as in lockorder.test.ts).
//
// Threat cases (each is one or more named assertions below):
//  T1 anon reads private tables          T2 anon calls admin/internal RPCs
//  T3 player A reads team B              T4 player A reads PINs or the activity log
//  T5 player A reads the live leaderboard T6 any client writes any table directly
//  T7 non-admin calls admin RPCs         T8 forged admin metadata in the JWT
//  T9 anon moves the server clock        T10 player receives rivals over realtime
//  T11 player A reads B's businesses     T12 released/unclaimed session reads team state
import { describe, it, expect, beforeAll } from 'vitest';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';
import { harnessEnabled, newAdmin, newPlayer, anonClient, createLobbyRoom, teamIds, serviceClient, tokenOf, localUrl, placeOn } from '../concurrency/harness';

const run = harnessEnabled ? describe : describe.skip;
const uuid = () => crypto.randomUUID();
// Exact named parameters: PostgREST resolves an RPC by name + argument names (a mismatch is PGRST202, not a security result).
const ADMIN_RPC_PARAMS: Record<string, string[]> = {
  admin_abort_game: ['p_room_id', 'note', 'request_id'],
  admin_cancel_room: ['p_room_id', 'note', 'request_id'],
  admin_charge_rent: ['payer_team_id', 'business_key', 'payer_expected_version', 'owner_expected_version', 'request_id', 'note'],
  admin_add_business: ['team_id', 'business_key', 'apply_purchase', 'expected_version', 'request_id', 'note'],
  admin_adjust: ['changes', 'label', 'note', 'request_id'],
  admin_create_room: ['team_count', 'teams'],
  admin_extend_game: ['p_room_id', 'p_additional_seconds', 'request_id'],
  admin_finalize: ['p_room_id', 'request_id'],
  admin_open_lobby: ['room_id', 'request_id'],
  admin_release_team: ['team_id'],
  admin_remove_business: ['team_id', 'business_key', 'reason', 'credit_resale', 'expected_version', 'request_id', 'note'],
  admin_set_bankrupt: ['team_id', 'value', 'expected_version', 'request_id', 'note'],
  admin_set_business_level: ['team_id', 'business_key', 'new_level', 'apply_upgrade', 'expected_version', 'request_id', 'note'],
  admin_set_team_values: ['team_id', 'cash', 'expected_version', 'request_id', 'note'],
  admin_start_game: ['room_id', 'force', 'request_id'],
  admin_update_team_config: ['team_id', 'name', 'color'],
  get_admin_snapshot: ['room_id'],
  get_history_detail: ['room_id'],
  get_standings: ['p_room_id'],
  list_history: [],
};
const INTERNAL_RPC_PARAMS: Record<string, string[]> = {
  room_standings: ['p_room_id'], get_team_snapshot: ['p_team_id'], expire_if_due: ['p_room_id'], app_now: [], raise_error: ['err_code'],
};
const nulls = (names: string[]) => Object.fromEntries(names.map((n) => [n, null]));
const WRITE_COL: Record<string, string> = {
  teams: 'id', rooms: 'id', team_businesses: 'id', team_claims: 'team_id', activity_events: 'room_id', final_results: 'room_id', admins: 'user_id',
};
const DENIED = '42501';

run('security matrix over HTTP', () => {
  let admin: SupabaseClient, playerA: SupabaseClient, playerB: SupabaseClient, outsider: SupabaseClient, anon: SupabaseClient;
  let roomId: string, code: string, teamA: string, teamB: string;
  const svc = serviceClient();

  beforeAll(async () => {
    admin = await newAdmin('sec');
    [playerA, playerB, outsider] = await Promise.all([newPlayer(), newPlayer(), newPlayer()]);
    anon = anonClient();
    roomId = await createLobbyRoom(admin);
    code = (await svc.from('rooms').select('code').eq('id', roomId).single()).data!.code;
    const ts = await teamIds(admin, roomId);
    [teamA, teamB] = [ts[0].id, ts[1].id];
    const pin = async (id: string) => (await svc.from('team_secrets').select('join_pin').eq('team_id', id).single()).data!.join_pin;
    expect((await playerA.rpc('join_team', { code, slot: 1, pin: await pin(teamA) })).data.team_id).toBe(teamA);
    expect((await playerB.rpc('join_team', { code, slot: 2, pin: await pin(teamB) })).data.team_id).toBe(teamB);
    expect((await admin.rpc('admin_start_game', { room_id: roomId, force: true })).error).toBeNull();
    expect((await admin.rpc('admin_set_team_values', { team_id: teamB, cash: 5000, expected_version: 0, request_id: uuid(), note: null })).error).toBeNull();
    await placeOn(teamB, 'saas');
    expect((await admin.rpc('admin_add_business', { team_id: teamB, business_key: 'saas', apply_purchase: true, expected_version: 1, request_id: uuid() })).error).toBeNull();
  });

  it('T1 anon cannot read private tables', async () => {
    for (const t of ['team_secrets', 'activity_events', 'admins', 'join_attempts']) {
      expect((await anon.from(t).select('*')).error?.code, t).toBe(DENIED);
    }
    for (const t of ['teams', 'rooms', 'team_businesses', 'team_claims', 'final_results']) {
      expect((await anon.from(t).select('*')).data, t).toEqual([]);
    }
    expect((await anon.rpc('get_lobby', { code })).error).toBeNull();
  });

  it('T2 anon cannot call admin or internal RPCs', async () => {
    for (const [fn, params] of Object.entries({ ...ADMIN_RPC_PARAMS, ...INTERNAL_RPC_PARAMS })) {
      expect((await anon.rpc(fn, nulls(params))).error?.code, fn).toBe(DENIED);
    }
  });

  it('T3/T11 player A sees only its own team and businesses', async () => {
    expect((await playerA.from('teams').select('id')).data).toEqual([{ id: teamA }]);
    expect((await playerA.from('teams').select('id').eq('id', teamB)).data).toEqual([]);
    expect((await playerA.from('team_businesses').select('team_id')).data).toEqual([]);
    expect((await playerB.from('team_businesses').select('team_id')).data!.length).toBe(1);
    const state = await playerA.rpc('get_my_state');
    expect(state.data.team.cash).toBe(1000);
    expect(JSON.stringify(state.data)).not.toContain(teamB);
  });

  it('T4 player cannot read PINs or the activity log', async () => {
    expect((await playerA.from('team_secrets').select('*')).data).toEqual([]);
    expect((await playerA.from('activity_events').select('*')).data).toEqual([]);
  });

  it('T5 player cannot read the live leaderboard or another team snapshot', async () => {
    expect((await playerA.rpc('room_standings', { p_room_id: roomId })).error?.code).toBe(DENIED);
    expect((await playerA.rpc('get_team_snapshot', { p_team_id: teamB })).error?.code).toBe(DENIED);
    expect((await playerA.rpc('get_standings', { p_room_id: roomId })).error?.message).toBe('NOT_ADMIN');
  });

  it('T6 no role can write any table directly', async () => {
    for (const [name, c] of [['anon', anon], ['player', playerA], ['admin', admin]] as const) {
      for (const [t, col] of Object.entries(WRITE_COL)) {
        expect((await c.from(t).insert({ [col]: uuid() } as never)).error?.code, `${name} insert ${t}`).toBe(DENIED);
        expect((await c.from(t).update({ [col]: uuid() } as never).eq(col, uuid())).error?.code, `${name} update ${t}`).toBe(DENIED);
        expect((await c.from(t).delete().eq(col, uuid())).error?.code, `${name} delete ${t}`).toBe(DENIED);
      }
    }
  });

  it('T7 a non-admin authenticated user gets NOT_ADMIN from every admin RPC', async () => {
    for (const [fn, params] of Object.entries(ADMIN_RPC_PARAMS)) {
      expect((await outsider.rpc(fn, nulls(params))).error?.message, fn).toBe('NOT_ADMIN');
    }
  });

  it('T8 forged admin metadata in the JWT does not make a user admin', async () => {
    const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
    const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: uuid(), role: 'authenticated', aud: 'authenticated', user_metadata: { role: 'admin' }, app_metadata: { role: 'admin' }, exp: Math.floor(Date.now() / 1000) + 600 })}`;
    const token = `${body}.${createHmac('sha256', process.env.LOCAL_JWT_SECRET!).update(body).digest('base64url')}`;
    const forged = createClient(localUrl(), process.env.LOCAL_ANON_KEY!, { auth: { persistSession: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
    expect((await forged.rpc('is_admin')).data).toBe(false);
    expect((await forged.rpc('list_history')).error?.message).toBe('NOT_ADMIN');
  });

  it('T9 request headers cannot move the server clock', async () => {
    const res = await fetch(`${localUrl()}/rest/v1/rpc/server_time`, {
      method: 'POST',
      headers: { apikey: process.env.LOCAL_ANON_KEY!, 'Content-Type': 'application/json', 'app.test_now': '2001-01-01T00:00:00Z', 'app.env': 'test' },
      body: '{}',
    });
    const t = new Date(JSON.parse(await res.text())).getTime();
    expect(Math.abs(t - Date.now())).toBeLessThan(60_000);
  });

  it('T12 an unclaimed session gets no team state', async () => {
    expect((await outsider.rpc('get_my_state')).data).toBeNull();
    expect((await outsider.from('teams').select('id')).data).toEqual([]);
  });

  it('T10 realtime: a player receives only its own team, never rivals, PINs or the activity log', async () => {
    // Real GoTrue anonymous session (what the app uses): a minted JWT is not forwarded to Realtime by supabase-js.
    const rt = createClient(localUrl(), process.env.LOCAL_ANON_KEY!, { auth: { persistSession: false } });
    expect((await rt.auth.signInAnonymously()).error).toBeNull();
    const [, , t3] = await teamIds(admin, roomId);
    const pin3 = (await svc.from('team_secrets').select('join_pin').eq('team_id', t3.id).single()).data!.join_pin;
    expect((await rt.rpc('join_team', { code, slot: 3, pin: pin3 })).data.team_id).toBe(t3.id);

    const received: { table: string; row: Record<string, unknown> }[] = [];
    const ch = rt.channel(`sec-${uuid()}`).on('postgres_changes', { event: '*', schema: 'public' }, (p) => {
      received.push({ table: p.table, row: (p.new ?? p.old) as Record<string, unknown> });
    });
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('realtime subscribe timed out')), 15_000);
      ch.subscribe((status) => {
        if (status === 'SUBSCRIBED') { clearTimeout(timer); resolve(); }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { clearTimeout(timer); reject(new Error(`realtime ${status}`)); }
      });
    });

    // Realtime can lag right after `supabase db reset`: nudge team 3 until its own event arrives (proves the subscription works).
    for (let i = 0; i < 10 && !received.some((e) => e.table === 'teams' && e.row.id === t3.id); i++) {
      const [, , cur] = await teamIds(admin, roomId);
      await admin.rpc('admin_set_team_values', { team_id: cur.id, cash: 1100 + i, expected_version: cur.version, request_id: uuid(), note: null });
      await new Promise((r) => setTimeout(r, 1500));
    }
    const [ta, tb] = await teamIds(admin, roomId);
    await admin.rpc('admin_set_team_values', { team_id: tb.id, cash: 4000, expected_version: tb.version, request_id: uuid(), note: null });
    await admin.rpc('admin_set_team_values', { team_id: ta.id, cash: 3000, expected_version: ta.version, request_id: uuid(), note: null });
    await admin.rpc('admin_add_business', { team_id: tb.id, business_key: 'fintech', apply_purchase: false, expected_version: tb.version + 1, request_id: uuid(), note: 'rival' });
    await new Promise((r) => setTimeout(r, 3000));
    await rt.removeChannel(ch);

    expect(received.some((e) => e.table === 'teams' && e.row.id === t3.id), 'own team update must arrive (proves the subscription works)').toBe(true);
    expect(received.filter((e) => e.table === 'teams' && e.row.id !== t3.id)).toEqual([]);
    expect(received.filter((e) => e.table === 'team_businesses')).toEqual([]);
    expect(received.filter((e) => e.table === 'activity_events' || e.table === 'team_secrets')).toEqual([]);
  }, 90_000);
});
