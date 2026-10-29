/**
 * Upgrade-path test #2 (LOCAL stack only): a production-shaped game at migration 0027 upgraded to the latest
 * migration, then finished with the new code. Mirrors the production incident (schema at ~0027, game stuck in
 * TIME_EXPIRED). Unlike test-upgrade-path.ts (0015 -> latest) this one holds:
 *   - an already FINALIZED room (final_results rows that still carry cv),
 *   - a TIME_EXPIRED room: 5 teams, cash and cv set (CV_SET events), one team with 3 businesses.
 * After `migration up` it asserts the data survived, the admin snapshot / standings have the new shape and
 * admin_finalize succeeds on the TIME_EXPIRED room. Resets the local database; refuses to run without the local container.
 */
import { execSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';

const SB = process.env.SUPABASE_BIN ?? 'npx supabase';
const projectId = /^project_id\s*=\s*"([^"]+)"/m.exec(fs.readFileSync('supabase/config.toml', 'utf8'))?.[1];
if (!projectId) throw new Error('project_id not found in supabase/config.toml');
const container = `supabase_db_${projectId}`;

const sh = (cmd: string) => execSync(cmd, { stdio: 'inherit' });
if (!execSync('docker ps --format "{{.Names}}"').toString().split(/\r?\n/).includes(container)) {
  console.error(`Local container ${container} is not running. Start it with "npx supabase start".`);
  process.exit(2);
}

function psql(sql: string): string {
  const r = spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At', '-F', '|'], { input: sql, encoding: 'utf8' });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error('psql failed');
  }
  return r.stdout.trim();
}
const last = (s: string) => s.split('\n').pop()!.trim();

const ADMIN = 'a9000000-0000-0000-0000-000000000002';
const asAdmin = `SET app.env = 'test'; SELECT set_config('request.jwt.claims', '{"sub":"${ADMIN}","role":"authenticated"}', false); SET ROLE authenticated;`;
const teamsJson = `'[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb`;

/** Creates a room, opens the lobby, force-starts it, sets cash/cv and buys businesses; returns the room id. */
function liveRoom(): string {
  psql(`${asAdmin} SELECT public.admin_create_room(5, ${teamsJson});`);
  const room = psql(`SELECT id FROM public.rooms WHERE status = 'CREATED';`);
  const t = (slot: number) => `(SELECT id FROM public.teams WHERE slot = ${slot} AND room_id = '${room}')`;
  psql(`${asAdmin} SELECT public.admin_open_lobby('${room}'); SELECT public.admin_start_game('${room}', true);`);
  for (let slot = 1; slot <= 5; slot++) {
    // 0027 signature: (team, cash, cv, expected_version, request_id, note)
    psql(`${asAdmin} SELECT public.admin_set_team_values(${t(slot)}, ${5000 + slot * 100}, ${300 * slot}, 0, gen_random_uuid(), NULL);`);
  }
  const buy = (slot: number, key: string) =>
    psql(`${asAdmin} SELECT public.admin_add_business(${t(slot)}, '${key}', true, (SELECT version FROM public.teams WHERE id = ${t(slot)}), gen_random_uuid(), NULL);`);
  ['saas', 'fintech', 'ecommerce'].forEach((k) => buy(1, k)); // one team holds 3 businesses
  buy(2, 'devtools');
  buy(3, 'edtech');
  return room;
}
const expire = (room: string) =>
  psql(`UPDATE public.rooms SET ends_at = now() - interval '1 minute' WHERE id = '${room}'; ${asAdmin} SELECT public.expire_if_due('${room}');`);

console.log('== 1. reset to 0027');
sh(`${SB} db reset --version 0027`);

console.log('== 2. seed: one FINALIZED room, one TIME_EXPIRED room with real data');
psql(`INSERT INTO auth.users (id, email, created_at, updated_at) VALUES ('${ADMIN}', 'upgrade-live@test.local', now(), now()); INSERT INTO public.admins (user_id) VALUES ('${ADMIN}');`);
const done = liveRoom();
expire(done);
psql(`${asAdmin} SELECT public.admin_finalize('${done}', gen_random_uuid());`);
const room = liveRoom();
expire(room);
const snapshotOf = (r: string) =>
  psql(`SELECT string_agg(slot || ':' || cash || ':' || (SELECT count(*) FROM public.team_businesses b WHERE b.team_id = t.id), ',' ORDER BY slot) FROM public.teams t WHERE room_id = '${r}';`);
const before = snapshotOf(room);
const cvEvents = psql(`SELECT count(*) FROM public.activity_events WHERE type = 'CV_SET';`);
console.log(`   finalized ${done}; expired ${room}; slot:cash:businesses = ${before}`);

console.log('== 3. diagnose-remote-state.sql at 0027 (expect 0016-0027 applied, 0028-0031 not applied)');
const diag = psql(fs.readFileSync('scripts/sql/diagnose-remote-state.sql', 'utf8').split('-- ===== STATEMENT 2')[0]);
console.log(diag.split('\n').map((l) => `   ${l}`).join('\n'));

console.log('== 4. apply 0028+ on top of the live data');
sh(`${SB} migration up`);

console.log('== 5. verify');
const fail: string[] = [];
const check = (name: string, got: string, want: string) => {
  const ok = got === want;
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `  (got ${got}, want ${want})`}`);
  if (!ok) fail.push(name);
};
const snap = (r: string) => last(psql(`${asAdmin} SELECT public.get_admin_snapshot('${r}')::text;`));

const diagLines = `\n${diag}`;
const wrong = [
  ...['0016', '0017', '0018', '0019', '0020', '0021', '0022', '0023', '0024', '0025', '0026', '0027'].filter((m) => !diagLines.includes(`\n${m}|applied|`)),
  ...['0028', '0029', '0030', '0031'].filter((m) => !diagLines.includes(`\n${m}|not applied|`)),
];
check('diagnostic at 0027: 0016-0027 applied, 0028-0031 not applied', wrong.join(',') || 'ok', 'ok');

check('TIME_EXPIRED room kept', psql(`SELECT status FROM public.rooms WHERE id = '${room}';`), 'TIME_EXPIRED');
check('teams cash and business counts unchanged', snapshotOf(room), before);
check('team 1 still holds 3 businesses', psql(`SELECT count(*) FROM public.team_businesses b JOIN public.teams t ON t.id = b.team_id WHERE t.slot = 1 AND t.room_id = '${room}';`), '3');
check('CV_SET events kept (history intact)', psql(`SELECT count(*) FROM public.activity_events WHERE type = 'CV_SET';`), cvEvents);
check('old events still carry their cv keys', psql(`SELECT count(*) > 0 FROM public.activity_events WHERE type = 'CV_SET' AND (prev::text LIKE '%"cv"%' OR new::text LIKE '%"cv"%');`), 't');
check('already-final results kept without cv', psql(`SELECT count(*) || ',' || count(*) FILTER (WHERE room_id = '${done}') FROM public.final_results;`), '5,5');
check('no cv columns left', psql(`SELECT count(*) FROM information_schema.columns WHERE table_schema = 'public' AND column_name ~* 'cv';`), '0');
check('every team starts with debt 0', psql(`SELECT count(*) FROM public.teams WHERE debt <> 0;`), '0');

check(
  'admin snapshot has no cv, has debt and board_position',
  psql(`SELECT (t ? 'cv') || ',' || (t ? 'debt') || ',' || (t ? 'board_position') FROM (SELECT jsonb_array_elements('${snap(room)}'::jsonb->'teams') t) x LIMIT 1;`),
  'false,true,true',
);
check('admin snapshot lists 5 teams', psql(`SELECT jsonb_array_length('${snap(room)}'::jsonb->'teams');`), '5');
const st = last(psql(`${asAdmin} SELECT public.get_standings('${room}')::text;`));
check('standings new shape (debt, rank, no cv)', psql(`SELECT (s ? 'cv') || ',' || (s ? 'debt') || ',' || (s ? 'rank') FROM (SELECT jsonb_array_elements('${st}'::jsonb->'standings') s) x LIMIT 1;`), 'false,true,true');
check('standings: 5 teams', psql(`SELECT jsonb_array_length('${st}'::jsonb->'standings');`), '5');

psql(`${asAdmin} SELECT public.admin_finalize('${room}', gen_random_uuid());`);
check('TIME_EXPIRED room finalizes', psql(`SELECT status || ',' || businesses_snapshotted FROM public.rooms WHERE id = '${room}';`), 'FINALIZED,true');
check('final_results for the room', psql(`SELECT count(*) FROM public.final_results WHERE room_id = '${room}';`), '5');
check('final_result_businesses for the room', psql(`SELECT count(*) FROM public.final_result_businesses WHERE room_id = '${room}';`), '5');
check('winner recorded', psql(`SELECT winner_team_id IS NOT NULL FROM public.rooms WHERE id = '${room}';`), 't');

if (fail.length > 0) {
  console.error(`\nLive-game upgrade test FAILED: ${fail.join('; ')}`);
  process.exit(1);
}
console.log('\nLive-game upgrade test passed.');
