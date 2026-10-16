/**
 * Fails (exit 1) when the built browser bundle in dist/ contains a secret value: a Supabase secret key,
 * a service-role JWT, or a database URL with a password. Run after `npm run build`.
 * Read-only: it only reads dist/.
 */
import * as fs from 'fs';
import * as path from 'path';
import { scanDir } from './lib/scanBundle';

const dist = path.resolve(process.argv[2] ?? 'dist');
if (!fs.existsSync(dist)) {
  console.error(`No bundle at ${dist}. Run "npm run build" first.`);
  process.exit(2);
}

const findings = scanDir(dist);
if (findings.length > 0) {
  for (const f of findings) console.error(`LEAK  ${path.relative(process.cwd(), f.file)}  ${f.rule}  (${f.sample})`);
  process.exit(1);
}
console.log(`Bundle scan clean: ${dist}`);
