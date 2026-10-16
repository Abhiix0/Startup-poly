/**
 * Local-only harness for race reproducers. Reads LOCAL_SUPABASE_URL / LOCAL_ANON_KEY /
 * LOCAL_SERVICE_KEY (from `supabase status -o env`) and refuses any non-local host.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';
import { checkTarget } from '../../../scripts/lib/assertLocal';

const { LOCAL_SUPABASE_URL: url, LOCAL_ANON_KEY: anon, LOCAL_SERVICE_KEY: service, LOCAL_JWT_SECRET: jwtSecret } = process.env;

export const harnessEnabled = Boolean(url && anon && service && jwtSecret && checkTarget(url, [], {}).ok);

const opts = { auth: { persistSession: false, autoRefreshToken: false } };

// Local GoTrue has the email provider off (config.toml [auth.email] enable_signup=false), so
// sessions are minted by signing a JWT with the local JWT secret. Local secret only.
const tokens = new WeakMap<SupabaseClient, string>();
export const tokenOf = (c: SupabaseClient) => tokens.get(c)!;

function clientFor(uid: string): SupabaseClient {
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const body = `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ sub: uid, role: 'authenticated', aud: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}`;
  const token = `${body}.${createHmac('sha256', process.env.LOCAL_JWT_SECRET!).update(body).digest('base64url')}`;
  const client = createClient(url!, anon!, { ...opts, global: { headers: { Authorization: `Bearer ${token}` } } });
  tokens.set(client, token);
  return client;
}

async function newUser(label: string): Promise<string> {
  const { data, error } = await serviceClient().auth.admin.createUser({ email: `${label}-${crypto.randomUUID()}@test.local`, email_confirm: true });
  if (error) throw error;
  return data.user.id;
}

export async function newAdmin(label: string): Promise<SupabaseClient> {
  const uid = await newUser(label);
  const ins = await serviceClient().from('admins').insert({ user_id: uid });
  if (ins.error) throw ins.error;
  return clientFor(uid);
}

/** A signed-in non-admin player (authenticated role). */
export async function newPlayer(): Promise<SupabaseClient> {
  return clientFor(await newUser('player'));
}

/** The true `anon` role: no session at all. */
export function anonClient(): SupabaseClient {
  return createClient(url!, anon!, opts);
}

export function serviceClient(): SupabaseClient {
  return createClient(url!, service!, opts);
}

const TEAMS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'].map((name, i) => ({
  name,
  color: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'][i],
}));

/** Create one room in LOBBY. Finalizes nothing; the caller must leave the DB with no open room. */
export async function createLobbyRoom(admin: SupabaseClient, teamCount = 6) {
  const created = await admin.rpc('admin_create_room', { team_count: teamCount, teams: TEAMS.slice(0, teamCount) });
  if (created.error) throw created.error;
  const room = created.data.room ?? created.data;
  const lobby = await admin.rpc('admin_open_lobby', { room_id: room.id });
  if (lobby.error) throw lobby.error;
  return room.id as string;
}

export async function teamIds(admin: SupabaseClient, roomId: string) {
  const { data, error } = await admin.from('teams').select('id,version,slot').eq('room_id', roomId).order('slot');
  if (error) throw error;
  return data as { id: string; version: number; slot: number }[];
}

export const localUrl = () => url!;

export const isDeadlock = (e: { code?: string } | null) => e?.code === '40P01';
