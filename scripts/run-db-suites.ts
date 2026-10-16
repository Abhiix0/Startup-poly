/**
 * Runs every database-backed vitest suite against the LOCAL Supabase stack, each on a freshly reset database
 * (the suites share the single-open-room rule, so they cannot share state). Local only: it resets the DB.
 *
 *   supabase start && npm run test:db-suites
 */
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import { checkTarget } from './lib/assertLocal';

/** CI sets SUPABASE_BIN=supabase (installed by setup-cli); locally npx works. */
const SB = process.env.SUPABASE_BIN ?? 'npx supabase';

const projectId = /^project_id\s*=\s*"([^"]+)"/m.exec(fs.readFileSync('supabase/config.toml', 'utf8'))?.[1];
if (!projectId) throw new Error('project_id not found in supabase/config.toml');

const status = Object.fromEntries(
  execSync(`${SB} status -o env`, { encoding: 'utf8' })
    .split(/\r?\n/)
    .map((l) => /^([A-Z_]+)="?(.*?)"?$/.exec(l))
    .filter((m): m is RegExpExecArray => Boolean(m))
    .map((m) => [m[1], m[2]]),
);

const guard = checkTarget(status.API_URL ?? '', [], {});
if (!guard.ok) {
  console.error(`SAFETY ABORT: ${guard.reason}`);
  process.exit(1);
}

const env = {
  ...process.env,
  LOCAL_SUPABASE_URL: status.API_URL,
  LOCAL_ANON_KEY: status.ANON_KEY,
  LOCAL_SERVICE_KEY: status.SERVICE_ROLE_KEY,
  LOCAL_JWT_SECRET: status.JWT_SECRET,
};

function waitForRealtime() {
  // Realtime restarts with every db reset and delivers nothing until healthy.
  const container = `supabase_realtime_${projectId}`;
  for (let i = 0; i < 40; i++) {
    const health = execSync(`docker inspect -f "{{.State.Health.Status}}" ${container}`, { encoding: 'utf8' }).trim();
    if (health === 'healthy') break;
    execSync('node -e "setTimeout(()=>{},3000)"');
  }
  execSync('node -e "setTimeout(()=>{},5000)"');
}

const suites = ['lockorder', 'lifecycle', 'money', 'abuse', 'finalize', 'security', 'contract'];
const failed: string[] = [];

for (const suite of suites) {
  console.log(`\n=== ${suite}: reset database, then run`);
  execSync(`${SB} db reset`, { stdio: 'inherit' });
  waitForRealtime();
  try {
    execSync(`npx vitest run --config supabase/tests/concurrency/vitest.config.ts ${suite}`, { stdio: 'inherit', env });
  } catch {
    failed.push(suite);
  }
}

if (failed.length > 0) {
  console.error(`\nFAILED suites: ${failed.join(', ')}`);
  process.exit(1);
}
console.log('\nAll database suites passed.');
