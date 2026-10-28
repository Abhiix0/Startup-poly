// Drift guard: every RPC wrapper in src/data/rpc.ts and every function in src/data/database.types.ts must match
// the live schema (parameter names, required parameters). This is the class of bug that once shipped
// admin_abort_game with `room_id` while SQL wanted `p_room_id`.
// Run on a freshly reset local DB: npm run test:contract (env as in lockorder.test.ts).
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { harnessEnabled, localUrl } from '../concurrency/harness';

const calls: Array<{ fn: string; args: Record<string, unknown> | undefined }> = [];

vi.mock('../../../src/data/client', () => ({
  supabase: {
    rpc: vi.fn(async (fn: string, args?: Record<string, unknown>) => {
      calls.push({ fn, args: args ? JSON.parse(JSON.stringify(args)) : undefined });
      return { data: {}, error: null };
    }),
  },
}));

import * as rpc from '../../../src/data/rpc';

const run = harnessEnabled ? describe : describe.skip;

// Every wrapper, called once with every argument it can send and once with only what it must send.
const WRAPPERS: Array<[string, () => Promise<unknown>]> = [
  ['server_time', () => rpc.rpcServerTime()],
  ['get_lobby', () => rpc.rpcGetLobby('ABC123')],
  ['join_team', () => rpc.rpcJoinTeam('ABC123', 1, '1234')],
  ['leave_team', () => rpc.rpcLeaveTeam()],
  ['get_my_state', () => rpc.rpcGetMyState()],
  ['admin_create_room', () => rpc.rpcAdminCreateRoom(5, [])],
  ['admin_update_team_config', () => rpc.rpcAdminUpdateTeamConfig('t', 'n', '#000000')],
  ['admin_open_lobby', () => rpc.rpcAdminOpenLobby('r')],
  ['admin_release_team', () => rpc.rpcAdminReleaseTeam('t')],
  ['admin_start_game', () => rpc.rpcAdminStartGame('r')],
  ['admin_start_game', () => rpc.rpcAdminStartGame('r', true)],
  ['admin_abort_game', () => rpc.rpcAdminAbortGame('r', 'note')],
  ['admin_extend_game', () => rpc.rpcAdminExtendGame('r')],
  ['admin_extend_game', () => rpc.rpcAdminExtendGame('r', 600)],
  ['admin_cancel_room', () => rpc.rpcAdminCancelRoom('r')],
  ['admin_cancel_room', () => rpc.rpcAdminCancelRoom('r', 'note')],
  ['admin_move_team', () => rpc.rpcAdminMoveTeam({ team_id: 't', steps: 1, expected_version: 0 })],
  ['admin_set_team_values', () => rpc.rpcAdminSetTeamValues({ team_id: 't', expected_version: 0 })],
  ['admin_set_team_values', () => rpc.rpcAdminSetTeamValues({ team_id: 't', cash: 1, cv: 2, expected_version: 0, request_id: 'x', note: 'n' })],
  ['admin_adjust', () => rpc.rpcAdminAdjust({ changes: [], label: 'l' })],
  ['admin_adjust', () => rpc.rpcAdminAdjust({ changes: [], label: 'l', note: 'n', request_id: 'x' })],
  ['admin_add_business', () => rpc.rpcAdminAddBusiness({ team_id: 't', business_key: 'saas', expected_version: 0 })],
  ['admin_add_business', () => rpc.rpcAdminAddBusiness({ team_id: 't', business_key: 'saas', apply_purchase: true, expected_version: 0, request_id: 'x', note: 'n' })],
  ['admin_set_business_level', () => rpc.rpcAdminSetBusinessLevel({ team_id: 't', business_key: 'saas', new_level: 1, expected_version: 0 })],
  ['admin_set_business_level', () => rpc.rpcAdminSetBusinessLevel({ team_id: 't', business_key: 'saas', new_level: 1, apply_upgrade: true, expected_version: 0, request_id: 'x', note: 'n' })],
  ['admin_remove_business', () => rpc.rpcAdminRemoveBusiness({ team_id: 't', business_key: 'saas', reason: 'CORRECTION', expected_version: 0 })],
  ['admin_remove_business', () => rpc.rpcAdminRemoveBusiness({ team_id: 't', business_key: 'saas', reason: 'FORCED_SALE', credit_resale: true, expected_version: 0, request_id: 'x', note: 'n' })],
  ['admin_set_bankrupt', () => rpc.rpcAdminSetBankrupt({ team_id: 't', value: true, expected_version: 0 })],
  ['admin_set_bankrupt', () => rpc.rpcAdminSetBankrupt({ team_id: 't', value: true, expected_version: 0, request_id: 'x', note: 'n' })],
  ['admin_set_tiebreak', () => rpc.rpcAdminSetTiebreak('r', ['a', 'b'])],
  ['admin_set_tiebreak', () => rpc.rpcAdminSetTiebreak('r', ['a', 'b'], 'n')],
  ['get_admin_snapshot', () => rpc.rpcGetAdminSnapshot('r')],
  ['get_standings', () => rpc.rpcGetStandings('r')],
  ['admin_finalize', () => rpc.rpcAdminFinalize('r')],
  ['list_history', () => rpc.rpcListHistory()],
  ['get_history_detail', () => rpc.rpcGetHistoryDetail('r')],
];

// Exposed by PostgREST but never called by the app through a wrapper (is_admin is called directly in client.ts).
const NOT_APP_CALLED = new Set([
  'is_admin', 'expire_if_due', 'room_standings', 'get_team_snapshot', 'app_now', 'raise_error',
  'lifecycle_replay_check', 'money_replay_check', 'max_money',
]);

type Param = { name: string; required: boolean };

run('RPC contract drift', () => {
  const schema = new Map<string, Param[]>();

  beforeAll(async () => {
    const key = process.env.LOCAL_SERVICE_KEY!;
    const res = await fetch(`${localUrl()}/rest/v1/`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
    const spec = (await res.json()) as { paths: Record<string, { post?: { parameters?: Array<{ in: string; schema?: { properties?: Record<string, unknown>; required?: string[] } }> } }> };
    for (const [path, def] of Object.entries(spec.paths)) {
      if (!path.startsWith('/rpc/')) continue;
      const body = def.post?.parameters?.find((p) => p.in === 'body')?.schema;
      const required = new Set(body?.required ?? []);
      schema.set(path.slice(5), Object.keys(body?.properties ?? {}).map((name) => ({ name, required: required.has(name) })));
    }
    expect(schema.size).toBeGreaterThan(20);
  });

  it('every wrapper sends only real parameter names and every required parameter', async () => {
    for (const [fn, invoke] of WRAPPERS) {
      calls.length = 0;
      await invoke();
      const call = calls.find((c) => c.fn === fn);
      expect(call, `wrapper for ${fn} must call ${fn}`).toBeTruthy();
      const params = schema.get(fn);
      expect(params, `${fn} must exist in the schema`).toBeTruthy();
      const sent = Object.keys(call!.args ?? {});
      const known = params!.map((p) => p.name);
      expect(sent.filter((k) => !known.includes(k)), `${fn}: argument names not in SQL`).toEqual([]);
      expect(params!.filter((p) => p.required && !sent.includes(p.name)).map((p) => p.name), `${fn}: required params missing`).toEqual([]);
    }
  });

  it('every RPC the schema exposes has a wrapper or is a known internal', () => {
    const covered = new Set(WRAPPERS.map(([fn]) => fn));
    const orphans = [...schema.keys()].filter((fn) => !covered.has(fn) && !NOT_APP_CALLED.has(fn));
    expect(orphans, 'new RPC without a wrapper contract entry').toEqual([]);
  });

  it('database.types.ts lists the same parameter names as the schema for every wrapped function', () => {
    const src = readFileSync(join(process.cwd(), 'src', 'data', 'database.types.ts'), 'utf8');
    const fnsStart = src.indexOf('Functions: {');
    expect(fnsStart).toBeGreaterThan(0);
    const body = src.slice(fnsStart);
    const wrapped = new Set(WRAPPERS.map(([fn]) => fn));
    for (const fn of wrapped) {
      const m = new RegExp(`\\b${fn}: \\{\\s*Args: (\\{[^}]*\\}|Record<PropertyKey, never>|never)`).exec(body);
      expect(m, `${fn} missing from database.types.ts`).toBeTruthy();
      const typed = [...m![1].matchAll(/(\w+)\??:/g)].map((x) => x[1]).sort();
      const real = schema.get(fn)!.map((p) => p.name).sort();
      expect(typed, `${fn}: database.types.ts Args vs SQL parameters`).toEqual(real);
    }
  });
});
