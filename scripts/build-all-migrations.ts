/**
 * Regenerates supabase/all_migrations.sql from supabase/migrations/*.sql.
 * Run from the repo root. Never hand-edit the output. Local file operation only; touches no database.
 */
import * as fs from 'fs';
import * as path from 'path';
import { buildAllMigrations } from './lib/migrations';

const root = path.resolve(process.cwd(), 'supabase');
fs.writeFileSync(path.join(root, 'all_migrations.sql'), buildAllMigrations(path.join(root, 'migrations')));
console.log('Wrote supabase/all_migrations.sql');
