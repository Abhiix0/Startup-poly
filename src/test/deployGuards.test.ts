import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { scanText } from '../../scripts/lib/scanBundle';

const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString('base64url');
const jwt = (role: string) => `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64({ iss: 'supabase', role })}.${'s'.repeat(20)}`;

describe('scanBundle', () => {
  it('accepts the anon key and supabase-js internals that merely mention secret keys', () => {
    const code = `const a="${jwt('anon')}"; const b=e=>e.startsWith("sb_secret_");`;
    expect(scanText('x.js', code)).toEqual([]);
  });
  it('flags a service-role JWT', () => {
    expect(scanText('x.js', `k="${jwt('service_role')}"`).map((f) => f.rule)).toEqual(['JWT with role "service_role"']);
  });
  it('flags a Supabase secret key value', () => {
    expect(scanText('x.js', 'k="sb_secret_FAKE_KEY_FOR_TESTING_ONLY_XXX"')).toHaveLength(1);
  });
  it('flags a service-role env name and a database URL with a password', () => {
    expect(scanText('x.js', 'process.env.SUPABASE_SERVICE_ROLE_KEY')).toHaveLength(1);
    expect(scanText('x.js', 'u="postgresql://postgres:hunter2@db.example.com:5432/postgres"')).toHaveLength(1);
  });
});

describe('browser env surface', () => {
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((n) => {
      const p = join(dir, n);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });

  it('src reads only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (plus Vite built-ins) from import.meta.env', () => {
    const allowed = new Set(['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'PROD', 'DEV', 'MODE', 'BASE_URL', 'SSR']);
    const used = new Set<string>();
    for (const f of walk(join(process.cwd(), 'src')).filter((p) => /\.(ts|tsx)$/.test(p) && !/\.test\./.test(p))) {
      for (const m of readFileSync(f, 'utf8').matchAll(/import\.meta\.env\.([A-Z_]+)/g)) used.add(m[1]);
    }
    expect([...used].filter((k) => !allowed.has(k))).toEqual([]);
  });

  it('.env.example documents only those two variables', () => {
    const keys = readFileSync(join(process.cwd(), '.env.example'), 'utf8')
      .split(/\r?\n/)
      .filter((l) => l.trim() && !l.startsWith('#'))
      .map((l) => l.split('=')[0]);
    expect(keys.sort()).toEqual(['VITE_SUPABASE_ANON_KEY', 'VITE_SUPABASE_URL']);
  });

  it('.gitignore keeps env files, Supabase temp files and build output out of git', () => {
    const ignore = readFileSync(join(process.cwd(), '.gitignore'), 'utf8');
    for (const pattern of ['.env', '.env.*', 'supabase/.temp', 'dist']) expect(ignore).toContain(pattern);
  });
});
