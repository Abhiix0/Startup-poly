import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { describe, expect, it } from 'vitest';
import { checkTarget } from '../../scripts/lib/assertLocal';
import { buildAllMigrations } from '../../scripts/lib/migrations';

const root = path.resolve(__dirname, '..', '..');
const norm = (s: string) => s.replace(/\r\n/g, '\n');

describe('assertLocal host guard', () => {
  it.each(['http://127.0.0.1:54321', 'http://localhost:54321'])('allows %s', (url) => {
    expect(checkTarget(url, [], {}).ok).toBe(true);
  });

  it('rejects a remote host with no override', () => {
    expect(checkTarget('https://abc.supabase.co', [], {}).ok).toBe(false);
  });

  it('rejects a remote host when only one of flag / env var is present', () => {
    expect(checkTarget('https://abc.supabase.co', ['--allow-remote'], {}).ok).toBe(false);
    expect(checkTarget('https://abc.supabase.co', [], { I_UNDERSTAND_THIS_IS_REMOTE: '1' }).ok).toBe(false);
  });

  it('allows a remote host only with flag AND env var', () => {
    expect(checkTarget('https://abc.supabase.co', ['--allow-remote'], { I_UNDERSTAND_THIS_IS_REMOTE: '1' }).ok).toBe(true);
  });

  it('rejects lookalike hosts and invalid URLs', () => {
    expect(checkTarget('http://127.0.0.1.evil.com', [], {}).ok).toBe(false);
    expect(checkTarget('not a url', [], {}).ok).toBe(false);
  });

  it('seed-rehearsal aborts against a fake remote URL before any network call', () => {
    const r = spawnSync(
      'npx',
      ['tsx', 'scripts/seed-rehearsal.ts', '--url=https://fake-remote.example.com', '--email=a@b.c', '--password=x'],
      { cwd: root, encoding: 'utf8', shell: true },
    );
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('SAFETY ABORT');
  });
});

describe('all_migrations.sql drift', () => {
  it('equals the concatenation of supabase/migrations/*.sql (run `npx tsx scripts/build-all-migrations.ts`)', () => {
    const expected = buildAllMigrations(path.join(root, 'supabase', 'migrations'));
    const actual = norm(fs.readFileSync(path.join(root, 'supabase', 'all_migrations.sql'), 'utf8'));
    expect(actual).toBe(expected);
  });
});
