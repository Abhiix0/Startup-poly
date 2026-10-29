# Production migration reconciliation

Situation: production already has the schema of about migration 0027, but `supabase_migrations.schema_migrations`
stops at 0015 (names NULL). The deployed app expects migrations through 0032. Room `QWHS6Q` is `TIME_EXPIRED`
with real data and must be finalized with the new code.

Everything here is run by a human. Nothing in this repo runs against production.

Rule: `migration repair` only writes history rows. It never runs SQL. Use it for a migration only when the
diagnostic proves that migration's changes are really in the database.

## 1. Back up (before anything else)

Take a backup (dashboard Database > Backups, or):

```
supabase db dump --linked -f backup-before-reconcile.sql
supabase db dump --linked --data-only -f backup-before-reconcile-data.sql
```

Do not continue until the files exist and are not empty. Save room `QWHS6Q` separately too:

```sql
select * from rooms where code = 'QWHS6Q';
```

## 2. Prove what is applied

In the Supabase SQL editor, run the two statements of `scripts/sql/diagnose-remote-state.sql` one at a time
(the editor shows only the last result). It is read-only.

Expected for the situation described: `0016` to `0027` = `applied`, `0028` to `0031` = `not applied`.
`0032` = `applied` (the index was dropped by hand) is fine; it is still pushed in step 5, and
`DROP INDEX IF EXISTS` makes that a no-op.

**If any row says `PARTIAL`, STOP.** Do not run repair or push. Send the `failing_checks` column. A partial
migration is fixed with a new forward migration (`0033_...sql`) that finishes the missing objects with
`IF NOT EXISTS` / `CREATE OR REPLACE` / `DROP ... IF EXISTS`. Never edit an applied migration and never repair it as
applied. If a migration shows `not applied` but a later one shows `applied`, treat that as a partial state too.

Also check the catalog before 0030 (it needs exactly the 10 official business keys):

```sql
select key from business_catalog order by key;
```

Expected keys: ai_deeptech, cleantech, cybersecurity, devtools, ecommerce, edtech, fintech, healthtech, robotics, saas.
An extra key would make 0030's `SET NOT NULL` fail; the migration rolls back whole, but stop and tell me.

## 3. Compare with the CLI

```
supabase migration list --linked
```

Expected: local files `0001`..`0032`; remote rows `0001`..`0015` only. (Remote names are NULL; versions are what
the CLI matches.)

## 4. Mark 0016 to 0027 as applied

Only the versions step 2 proved applied (here `0016` to `0027`):

```
supabase migration repair --status applied 0016 0017 0018 0019 0020 0021 0022 0023 0024 0025 0026 0027 --linked
supabase migration list --linked
```

Expected: `0001`..`0027` on both sides; `0028`..`0032` local only.

Do not repair `0028` to `0031`. They are not applied and must run.

## 5. Dry run, then push

```
supabase db push --dry-run --linked
```

Expected output lists exactly these five files and nothing else:

```
0028_rulebook_economy_alignment.sql
0029_remove_company_value.sql
0030_server_authoritative_gameplay.sql
0031_debt_recovery.sql
0032_multi_admin_rooms.sql
```

If any other file is listed, stop. Then, while nobody is editing the room (0029 takes short exclusive locks on
`teams`, `business_catalog`, `final_results`, `final_result_businesses`):

```
supabase db push --linked
```

The CLI applies each file in its own transaction, so a failure leaves earlier files applied and the failing one
fully rolled back. Report the error and stop; do not re-run repair.

## 6. Verify

```sql
-- history: 0001..0032, names filled for 0016+
select version, name from supabase_migrations.schema_migrations order by version;

-- no cv columns left (expect 0 rows)
select table_name, column_name from information_schema.columns
where table_schema = 'public' and column_name ~* 'cv';

-- new objects
select column_name from information_schema.columns where table_schema='public' and table_name='teams' and column_name in ('debt','board_position');  -- 2 rows
select key, u1_cost, u2_cost, board_position from business_catalog order by board_position;                                                       -- edtech 100 / 150
select indexname from pg_indexes where indexname in ('idx_rooms_single_active','idx_rooms_unique_active_code');                                    -- only idx_rooms_unique_active_code

-- the stuck room is intact
select code, status from rooms where code = 'QWHS6Q';                                   -- TIME_EXPIRED
select t.slot, t.name, t.cash, t.debt, count(b.id) as businesses
from teams t join rooms r on r.id = t.room_id left join team_businesses b on b.team_id = t.id
where r.code = 'QWHS6Q' group by t.id order by t.slot;
```

Re-run STATEMENT 1 of the diagnostic: every row `applied`. Then open `/admin`: the TIME_EXPIRED room must render
without the `toLocaleString` error, and Finalize must work.

Note for the organizer: after 0029 the ranking is cash, then total purchase cost of businesses, then upgrades.
Company value no longer exists, so `QWHS6Q` will be ranked on the new rule, not on what the teams saw before.

## Safety review of 0028 to 0032 against a live database

Proven by `npm run test:upgrade-live` (0027 database with a FINALIZED room, a TIME_EXPIRED room, 5 teams, one with
3 businesses, cv set; upgraded to latest; finalize succeeds):

| Migration | Existing data | Result |
|---|---|---|
| 0028 | Team holding 3 businesses | Kept. The cap trigger only runs on INSERT; the team just cannot add a 4th. Catalog UPDATE only touches the 10 listed keys. |
| 0029 | Non-finalized rooms | Not rewritten. Only functions are replaced; the TIME_EXPIRED room stays TIME_EXPIRED and finalizes with the new function. |
| 0029 | `activity_events` with cv in `prev` / `new` | Kept as JSON. `CV_SET` / `TIEBREAK_SET` stay valid types. Nothing reads them. |
| 0029 | `final_results.cv`, `teams.cv`, catalog and snapshot cv columns | **Dropped on purpose (decision D8). The stored cv numbers are lost; back up first.** Dropping a column fires no row trigger, so the immutability triggers do not block it. Existing final_results rows keep every other column. |
| 0029 | `teams.tiebreak_order` | Column stays, values stay, nothing writes it. `admin_set_tiebreak` is dropped. |
| 0029 | Dropped signatures (`admin_set_tiebreak`, old `room_standings`, old `admin_set_team_values`) | An old frontend calling them gets an error. The deployed frontend is already the new one. |
| 0030 | `business_catalog` | `board_position` is added, filled for the 10 official keys, then `SET NOT NULL` and `UNIQUE`. **Fails (and rolls back whole) if the catalog has an extra or renamed key.** Checked in step 2. |
| 0031 | Existing teams | `debt integer NOT NULL DEFAULT 0`: every team gets 0, no rewrite problem, constraints hold for 0. |
| 0032 | Rooms | `DROP INDEX IF EXISTS`: safe if already dropped by hand. |

No statement was found that fails or loses data on a database that matches the repo's 0027 schema, other than the
intended removal of the cv values. The main residual risk is production drift from the repo (hand edits); the
diagnostic and the `PARTIAL` rule above are there to catch it.
