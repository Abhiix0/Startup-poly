# Deploy Checklist (database + web)

Nothing here is automated on purpose. A person runs each step and checks the result. CI never deploys and holds no secrets.

## Before the event week

- [ ] **Confirm the project.** `supabase projects list` and `supabase link` show the intended project ref. Compare it with the ref in the Vercel `VITE_SUPABASE_URL`. Do not trust a previous link.
- [ ] **Back up.** Dashboard, Database, Backups: take a fresh backup, or run `supabase db dump -f backup-$(date +%F).sql` against the linked project. Keep the file outside the repo.
- [ ] **Rehearse the migrations on a throwaway first.** Create a scratch Supabase project (or a branch), push the same migrations there, and run `npm run verify:prod` (read-only) against it.
- [ ] **Read the new migrations.** Every migration since the last deploy: look for `DROP`, `DELETE`, `ALTER ... TYPE`, `NOT NULL` additions and new constraints. Constraints are added `NOT VALID` then `VALIDATE`; a validate fails if existing rows break it.
- [ ] **Run the gate locally** on the exact commit to be deployed: `supabase db reset && supabase test db`, `npm run typecheck`, `npm test`, `npm run build`, `npm run check:bundle`, `npm run test:db-suites`, `npm run test:upgrade`.
- [ ] **Manual dashboard checks** (not scripted, not changed by this repo):
  - Authentication, Rate Limits: anonymous sign-ins per hour per IP. Locally it is 30. The join throttle does not depend on it, but it caps how many sessions one IP can mint.
  - Authentication, Providers: anonymous sign-ins enabled; email signups disabled (admins are created with `npm run admin:create`).
  - Database, Replication: `rooms`, `teams`, `team_businesses`, `activity_events` are in the `supabase_realtime` publication.

## Deploy

- [ ] Freeze window: no organisers editing during the push. Prefer the day before the event, not the morning of it.
- [ ] `supabase db push` against the **linked, confirmed** project. Read the list it prints before accepting.
- [ ] `npm run verify:prod` (read-only): all checks pass. It makes no mutating calls.
- [ ] Deploy the web build (Vercel). Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` may be set for the browser. `npm run check:bundle` passes on the build output.
- [ ] Smoke test with a throwaway match: create room, open lobby, join one phone, start, one edit, abort. Then clear it.

## Rollback

There are no down-migrations. If a migration misbehaves:

1. Stop edits (tell organisers).
2. Fix forward with a **new** numbered migration that restores the previous function body (copy it from the earlier migration file). Never edit an applied migration.
3. Restore from the backup only if data was damaged, and only after exporting the current state.

## Things that must never be re-run

- `0006_drop_legacy.sql` drops the legacy prototype tables. It is historical; it has a header saying so.
- Constraint additions (`0018`) fail on a second run. `supabase db push` runs each migration once, which is the intended use.

## Local checks that guard deploys (CI runs them too)

| Check | Catches |
|-------|---------|
| `npm run build:migrations` drift test (`src/test/scriptGuards.test.ts`) | `supabase/all_migrations.sql` out of sync with `supabase/migrations/` |
| `npm run test:db-suites` (`contract`) | RPC wrapper argument names, required parameters or `database.types.ts` drifting from the SQL |
| `npm run test:upgrade` | a migration that works on an empty DB but not on a live game |
| `npm run check:bundle` | a service-role key, secret key or database URL in the browser bundle |
| `src/test/deployGuards.test.ts` | extra `VITE_*` variables reaching the browser, missing `.gitignore` rules |
| `supabase/tests/0011_security_matrix_test.sql` | a new table, function or grant nobody classified |

Note: `npm run db:types` writes `supabase/.temp/database.generated.ts` (git-ignored) for reference only. `src/data/database.types.ts` is hand-maintained because the app imports its aliases; `rpcContract.test.ts` keeps its function signatures in line with the schema.
