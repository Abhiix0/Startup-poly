import * as fs from 'fs';
import * as path from 'path';

export interface Finding {
  file: string;
  rule: string;
  sample: string;
}

const JWT = /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g;

function jwtRole(jwt: string): string | null {
  try {
    return JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8')).role ?? null;
  } catch {
    return null;
  }
}

/**
 * Looks for secret VALUES in built browser code. Bare words are not flagged: supabase-js itself contains
 * `startsWith("sb_secret_")` to refuse such keys in the browser, so a word match would always fire.
 */
export function scanText(file: string, text: string): Finding[] {
  const findings: Finding[] = [];
  const add = (rule: string, sample: string) => findings.push({ file, rule, sample: sample.slice(0, 12) + '…' });

  for (const m of text.matchAll(/sb_secret_[A-Za-z0-9_-]{16,}/g)) add('Supabase secret key value', m[0]);
  for (const m of text.matchAll(/SUPABASE_SERVICE_ROLE_KEY|SERVICE_ROLE_KEY/g)) add('service-role env name', m[0]);
  for (const m of text.matchAll(/postgres(?:ql)?:\/\/[^\s"'`:@]+:[^\s"'`@]+@/g)) add('database URL with password', m[0]);
  for (const m of text.matchAll(JWT)) {
    const role = jwtRole(m[0]);
    if (role && role !== 'anon') add(`JWT with role "${role}"`, m[0]);
  }
  return findings;
}

export function scanDir(dir: string): Finding[] {
  const out: Finding[] = [];
  const walk = (d: string) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (/\.(js|mjs|css|html|map|json|txt)$/.test(entry.name)) out.push(...scanText(full, fs.readFileSync(full, 'utf8')));
    }
  };
  walk(dir);
  return out;
}
