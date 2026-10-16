import * as fs from 'fs';
import * as path from 'path';

/** Concatenates supabase/migrations/*.sql (filename order) into the all_migrations.sql layout. */
export function buildAllMigrations(migrationsDir: string): string {
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();
  return (
    files
      .map((f) => fs.readFileSync(path.join(migrationsDir, f), 'utf8').replace(/\r\n/g, '\n').replace(/\n+$/, ''))
      .join('\n\n\n') + '\n'
  );
}
