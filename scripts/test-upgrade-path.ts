/**
 * Upgrade-path test (LOCAL stack only): proves migrations 0016+ apply on a database that already holds a live
 * game created under 0015, not just on an empty one.
 *
 *   1. supabase db reset --version 0015      (schema as it was before the hardening migrations)
 *   2. seed a mid-game state with the 0015 functions (room ACTIVE, a claimed team, cash/CV edits, a business)
 *   3. supabase migration up                 (applies 0016 ... latest on top of that data)
 *   4. assert the data survived and the new code finishes the existing game (expire, tiebreak, finalize+snapshot)
 *
 * It resets the local database (that is its job). It talks only to the local Supabase Docker container and
 * refuses to run if that container is not the local one for this project.
 */
import { execSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';

/** CI sets SUPABASE_BIN=supabase (installed by setup-cli); locally npx works. */
const SB = process.env.SUPABASE_BIN ?? 'npx supabase';

const projectId = /^project_id\s*=\s*"([^"]+)"/m.exec(fs.readFileSync('supabase/config.toml', 'utf8'))?.[1];
if (!projectId) throw new Error('project_id not found in supabase/config.toml');
const container = `supabase_db_${projectId}`;

const sh = (cmd: string) => execSync(cmd, { stdio: 'inherit' });
const names = execSync('docker ps --format "{{.Names}}"').toString().split(/\r?\n/);
if (!names.includes(container)) {
  console.error(`Local container ${container} is not running. Start it with "npx supabase start".`);
  process.exit(2);
}

function psql(sql: string): string {
  const r = spawnSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-v', 'ON_ERROR_STOP=1', '-At', '-F', '|'], {
    input: sql,
    encoding: 'utf8',
  });
  if (r.status !== 0) {
    console.error(r.stderr || r.stdout);
    throw new Error('psql failed');
  }
  return r.stdout.trim();
}

const asAdmin = `
  SET app.env = 'test';
  SELECT set_config('request.jwt.claims', '{"sub":"a9000000-0000-0000-0000-000000000001","role":"authenticated"}', false);
  SET ROLE authenticated;
`;
const asPlayer = `
  SELECT set_config('request.jwt.claims', '{"sub":"b9000000-0000-0000-0000-000000000001","role":"authenticated"}', false);
  SET ROLE authenticated;
`;

console.log('== 1. reset to 0015');
sh(`${SB} db reset --version 0015`);

console.log('== 2. seed a live mid-game under 0015');
psql(`
  INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
    ('a9000000-0000-0000-0000-000000000001', 'upgrade-admin@test.local', now(), now()),
    ('b9000000-0000-0000-0000-000000000001', 'upgrade-player@test.local', now(), now());
  INSERT INTO public.admins (user_id) VALUES ('a9000000-0000-0000-0000-000000000001');
`);
psql(`${asAdmin}
  SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb);
`);
const room = psql(`SELECT id FROM public.rooms;`);
psql(`${asAdmin} SELECT public.admin_open_lobby('${room}');`);
const [code, pin] = psql(`SELECT r.code, ts.join_pin FROM public.rooms r JOIN public.teams t ON t.room_id = r.id AND t.slot = 1 JOIN public.team_secrets ts ON ts.team_id = t.id;`).split('|');
psql(`${asPlayer} SELECT public.join_team('${code}', 1, '${pin}');`);
psql(`${asAdmin}
  SELECT public.admin_start_game('${room}', true);
  SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot = 1), 1400, 250, 0, gen_random_uuid(), NULL);
  SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 1), 'saas', true, 1, gen_random_uuid(), NULL);
`);
const before = psql(`SELECT cash || ',' || cv || ',' || version FROM public.teams WHERE slot = 1;`);
console.log(`   seeded room ${room}; team 1 = ${before}`);

console.log('== 3. apply 0016+ on top of the live data');
sh(`${SB} migration up`);

console.log('== 4. verify');
const fail: string[] = [];
const check = (name: string, got: string, want: string) => {
  const ok = got === want;
  console.log(`   ${ok ? 'ok  ' : 'FAIL'} ${name}${ok ? '' : `  (got ${got}, want ${want})`}`);
  if (!ok) fail.push(name);
};

check('room still ACTIVE', psql(`SELECT status FROM public.rooms WHERE id = '${room}';`), 'ACTIVE');
check('team 1 cash/cv/version unchanged', psql(`SELECT cash || ',' || cv || ',' || version FROM public.teams WHERE slot = 1;`), before);
check('business kept', psql(`SELECT count(*) FROM public.team_businesses;`), '1');
check('claim kept', psql(`SELECT count(*) FROM public.team_claims;`), '1');
check('GAME_STARTED event kept', psql(`SELECT count(*) FROM public.activity_events WHERE type = 'GAME_STARTED';`), '1');
check('money cap constraints validated', psql(`SELECT count(*) FROM pg_constraint WHERE conname IN ('teams_cash_cap','teams_cv_cap') AND convalidated;`), '2');

// New code on the old game: a replayed edit, an expired deadline, tiebreak, finalize with snapshot.
const rid = psql(`SELECT gen_random_uuid();`);
const edit = `SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot = 1), 1500, NULL, (SELECT version FROM public.teams WHERE slot = 1), '${rid}', NULL);`;
psql(`${asAdmin} ${edit}`);
// Same request_id with stale args: must replay, not apply.
psql(`${asAdmin} SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot = 1), 9999, NULL, 0, '${rid}', NULL);`);
check('replayed request_id applied once', psql(`SELECT cash FROM public.teams WHERE slot = 1;`), '1500');

psql(`UPDATE public.rooms SET ends_at = now() - interval '1 minute' WHERE id = '${room}';`);
psql(`${asAdmin}
  SELECT public.expire_if_due('${room}');
  SELECT public.admin_set_tiebreak('${room}', ARRAY(SELECT id FROM public.teams WHERE slot > 1 ORDER BY slot), 'order');
  SELECT public.admin_finalize('${room}', gen_random_uuid());
`);
check('room FINALIZED with snapshot flag', psql(`SELECT status || ',' || businesses_snapshotted FROM public.rooms WHERE id = '${room}';`), 'FINALIZED,true');
check('final_results rows', psql(`SELECT count(*) FROM public.final_results;`), '5');
check('final_result_businesses snapshot', psql(`SELECT count(*) FROM public.final_result_businesses;`), '1');

if (fail.length > 0) {
  console.error(`\nUpgrade-path test FAILED: ${fail.join('; ')}`);
  process.exit(1);
}
console.log('\nUpgrade-path test passed.');
