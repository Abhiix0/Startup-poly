# STARTUPOLY — Backend Hardening Plan for Claude Code

Built from the repo zip (migrations 0001–0015, `src/data/rpc.ts`, scripts, pgTAP tests) and your audit prompt.
Every lead below was **read from source, not executed**. Phase 1 turns each into a confirmed finding or drops it.

## How to run this

- One branch: `backend-hardening`. One phase per Claude Code session. Do not start a phase until the previous gate is green.
- Gate after every phase: `supabase db reset && supabase test db && npm run typecheck && npm test && npm run build`.
- Never edit an applied migration. Every DB change = new numbered migration (`0016_…`), mirrored into `supabase/all_migrations.sql`.
- Paste the **STANDING RULES** block at the top of every session (or put it in `CLAUDE.md`).

```text
STANDING RULES (apply to every phase)
- Local Supabase only (`supabase start`, http://127.0.0.1:54321). Never touch the deployed project. Never read, print or log .env values, keys, PINs.
- Before any script that mutates data, print the target host and abort if it is not localhost/127.0.0.1.
- No deploys, no `supabase db push`, no production migrations.
- No edits to already-applied migrations. Additive migrations only.
- No placeholder stubs, no TODOs: finish every change you start, with tests.
- Smallest correct change. No architecture rewrites, no new infra (no queues, no extra services) unless the phase says so.
- Keep the error-code contract (raise_error codes like NOT_ADMIN, VERSION_CONFLICT, ROOM_NOT_EDITABLE…) stable. Add codes, never rename.
- Do not claim something is verified unless a test you ran proves it. Report exact commands and exit codes.
- At the end of the phase: list files changed, tests added (with the invariant each protects), and anything you could not verify.
```

## Leads found in the zip (to verify in Phase 1)

| ID | Lead | Where | Confidence |
|----|------|-------|-----------|
| L1 | **Lock-order inversion → deadlock.** `admin_add_business` / `set_business_level` / `remove_business` / `set_bankrupt` lock the **team row first, then the room row**. `admin_set_team_values`, `admin_adjust`, `admin_abort_game`, `admin_finalize`, `expire_if_due` lock the **room first, then teams**. Concurrent opposite orders deadlock; Postgres kills one with `40P01`. | 0008 L339–445, L681–688; 0013 | Strongly suspected (needs concurrent test) |
| L2 | **Abort never calls `expire_if_due`.** An ACTIVE room whose deadline has passed can be aborted, wiping a game that is already over. Abort also rejects `TIME_EXPIRED`, so an expired game can only be finalized, never reset. | 0013 L30–37 | Confirmed by reading |
| L3 | **Lifecycle RPCs are not idempotent.** `admin_start_game`, `admin_abort_game`, `admin_finalize`, `admin_open_lobby` take no `request_id`. A retry after a lost response returns `INVALID_TRANSITION` for an operation that actually committed ("outcome unknown" looks like "failed"). | 0008 L210, L315; 0010; 0013 | Confirmed by reading |
| L4 | **Idempotency check is outside the lock and unscoped.** The `request_id` EXISTS check runs before any row lock, so a retry arriving while the original is in flight gets `VERSION_CONFLICT` or `BUSINESS_OWNED` instead of the replay. The check also isn't scoped to function/team/actor: a reused `request_id` for a different team returns that team's snapshot silently. `admin_adjust` replay returns a different shape than first call. | 0008 L408, L520, L671 | Confirmed by reading |
| L5 | **PIN throttle is per anonymous user, bypassable.** `join_team` counts failures per `auth.uid()`. Anonymous sign-in mints unlimited uids, so a 4-digit PIN (10,000 values) can be brute-forced with fresh sessions. `join_attempts` has no cleanup. PINs stored plaintext (admin-readable by design). | 0014 L38–46 | Confirmed by reading; exploitability depends on Supabase Auth rate limits (Unverified) |
| L6 | **Claim race surfaces a raw unique violation.** Two phones joining simultaneously: both pass the `EXISTS` check, second hits the unique index and returns SQLSTATE 23505, not `TEAM_ALREADY_CLAIMED`. Exclusivity holds; error classification doesn't. | 0014 L96–118 | Strongly suspected |
| L7 | **`admin_release_team` lock shape.** `SELECT … FROM teams JOIN rooms … FOR UPDATE` locks both rows in unspecified order, then calls `expire_if_due`. Another entry in the L1 family. | 0008 L261 | Strongly suspected |
| L8 | **Integer bounds.** `cash`/`cv`/`cost` are `int`; no upper cap in `admin_set_team_values` / `admin_adjust`. `cash + delta` can overflow to a raw "integer out of range" error. `admin_adjust` silently clamps CV below 0 but not cash (cash raises). | 0008 L440–480, L560–600 | Confirmed by reading |
| L9 | **`app_now()` test hook in production schema.** Honors `app.test_now` when `app.env = 'test'`. Not reachable via PostgREST as far as I can tell, but it is a time-travel switch living in a SECURITY DEFINER function. | 0001 L36–52 | Unverified |
| L10 | **`expire_if_due` granted to `anon`** and takes `FOR UPDATE` on any room id. Any anonymous caller can take room locks and probe room UUIDs. Idempotent, but unnecessary exposure. | 0007 L75–76 | Confirmed by reading |
| L11 | **Ranking rule not verified against rulebook.** `room_standings` ranks: not-bankrupt, CV desc, cash desc, business count desc, tiebreak order, slot. The rulebook wasn't in this zip; I can't confirm this matches. | 0010 L5–88 | Unverified |
| L12 | **`seed-rehearsal.ts` has no localhost guard** and calls `admin_create_room`/`admin_start_game` using whatever URL is in env. `create-admin.ts` has a guard; `seed-rehearsal.ts` does not. | scripts/seed-rehearsal.ts | Strongly suspected |
| L13 | **No CI.** No `.github/workflows`. pgTAP and vitest only run if someone remembers. | repo root | Confirmed |
| L14 | **`all_migrations.sql` drift.** Contains the 0014 header twice; maintained by hand beside `migrations/`. | supabase/all_migrations.sql L2800 | Confirmed |
| L15 | **Lazy expiry only.** Room flips to `TIME_EXPIRED` only when some RPC calls `expire_if_due`. Safe as long as clients derive state from `ends_at` + server clock and a poll triggers expiry; needs a test with zero connected clients. | 0007; get_my_state/get_admin_snapshot | Unverified |
| L16 | **`final_results` stores only totals.** Business ownership/levels at finish live in `team_businesses` (immutable post-FINALIZED via trigger) but the snapshot itself doesn't capture them. Fine unless catalog or rows change; check `get_history_detail`. | 0001, 0010 | Unverified |

Already good (don't "fix"): RLS on all tables with SELECT-only grants, no client INSERT/UPDATE/DELETE, every SECURITY DEFINER function pins `search_path`, finalized-room immutability triggers, forward-only status trigger, append-only `activity_events`/`final_results`, single non-finalized room index, `expected_version` optimistic locking, client retry restricted to reads or calls carrying `request_id`.

## Phase map

```text
P0  Baseline + safety rails + CI                 (no behavior change)
P1  Evidence pass: audit + failing reproducers   (no fixes)
P2  Lock order + deadlock fix                    (L1, L7)
P3  Lifecycle correctness + idempotent lifecycle (L2, L3, L15)
P4  Money-RPC idempotency + numeric bounds       (L4, L8)
P5  Join/PIN abuse resistance                    (L5, L6)
P6  Security surface lock-down + security tests  (L9, L10, matrix)
P7  Finalization, ranking, history integrity     (L11, L16)
P8  Frontend recovery: unknown outcomes, realtime(client side of L3/L4)
P9  Migration + deploy hygiene                   (L12, L14)
P10 Dead code, docs, final regression
```

Dependencies: P1 first. P2 before P3/P4 (both touch the same function bodies). P3 and P4 before P8 (client needs the new error codes and replay semantics). P6 can run any time after P1. P10 last.

---

## PHASE 0 — Baseline, safety rails, CI

```text
[paste STANDING RULES]

OBJECTIVE
Establish a trustworthy green baseline and guardrails before any fix. No behavior change.

STEPS
1. Run, in order, and record exact exit codes: `supabase start`, `supabase db reset`, `supabase test db`, `npm ci`, `npm run typecheck`, `npm test`, `npm run build`. If any fails, report it and fix ONLY test-environment problems; do not fix product bugs yet.
2. Add a shared host guard `scripts/lib/assertLocal.ts` that parses the target URL (VITE_SUPABASE_URL / SUPABASE_URL / --url) and exits non-zero unless hostname is localhost or 127.0.0.1, with an explicit `--allow-remote` override that also requires an env var `I_UNDERSTAND_THIS_IS_REMOTE=1`. Use it in scripts/seed-rehearsal.ts, scripts/loadtest.ts, and replace the ad hoc check in create-admin.ts/revoke-admin.ts. scripts/verify-prod.ts is read-only by design: confirm it makes no mutating RPC calls and say so in a header comment.
3. Add `.github/workflows/ci.yml`: on push/PR run `supabase start`, `supabase db reset`, `supabase test db`, typecheck, test, build. Use the Supabase CLI setup action. No deploy step. No secrets.
4. Add a vitest or script check that fails if `supabase/all_migrations.sql` differs from the concatenation of `supabase/migrations/*.sql` (generate all_migrations.sql from the folder via `scripts/build-all-migrations.ts`; fix the duplicate 0014 header by regenerating, not hand-editing).

DONE WHEN
Baseline results are listed with exit codes; scripts refuse non-local targets (test it by pointing at a fake remote URL and showing the abort); CI file exists; all_migrations.sql regenerates reproducibly.

MUST NOT CHANGE
Any SQL function, RLS policy, or frontend behavior.
```

---

## PHASE 1 — Evidence pass (audit only, plus failing reproducers)

```text
[paste STANDING RULES]

OBJECTIVE
Run the attached STARTUPOLY backend forensic audit (Phases 0–15 of that prompt) in audit-only mode against the LOCAL stack, and convert each lead below into Confirmed / Refuted / Unverified with evidence. Output: docs/BACKEND_AUDIT.md. No fixes in this phase.

LEADS TO VERIFY (file/line given; confirm or refute each, do not assume)
L1  Lock-order inversion: admin_add_business, admin_set_business_level, admin_remove_business, admin_set_bankrupt lock team THEN room. admin_set_team_values, admin_adjust, admin_abort_game, admin_finalize, expire_if_due lock room THEN teams. Also admin_release_team (JOIN … FOR UPDATE). Draw the exact lock-acquisition order per function in a table.
L2  admin_abort_game does not call expire_if_due and rejects TIME_EXPIRED.
L3  Lifecycle RPCs (open_lobby, start, abort, finalize) have no request_id; retry-after-commit returns INVALID_TRANSITION.
L4  request_id idempotency check precedes locks and is unscoped (function/team/actor); admin_adjust replay returns a different JSON shape.
L5  join_team throttle is per auth.uid(); anonymous sessions are free to mint. Check supabase/config.toml auth rate limits and what they actually cap.
L6  Concurrent join_team on the same slot: which SQLSTATE does the loser get?
L8  Overflow behavior of cash/cv/cost at int bounds in set_team_values, adjust, add_business, set_business_level.
L9  Can any PostgREST caller set app.env / app.test_now? Prove or refute with a real anon and authenticated request against local.
L10 expire_if_due executable by anon; what can an anon learn or block with it?
L11 Compare room_standings ordering with docs/RUNBOOK.md and README rules. If the rulebook is not in the repo, mark Unverified and list the exact question for the owner.
L15 With zero clients connected past ends_at, what state do the next get_my_state/get_admin_snapshot/anon get_lobby calls observe?
L16 Does get_history_detail depend on business_catalog rows that could change?

REQUIRED OUTPUT
- Findings register (ID, severity, confidence, file:line, scenario, expected vs actual, minimal fix, regression test).
- Lifecycle matrix using the REAL enum: CREATED, LOBBY, ACTIVE, TIME_EXPIRED, FINALIZED (note: there is no ABORTED status; abort = ACTIVE→LOBBY with team reset). Include the transition trigger's allowed set.
- Security matrix: every table/view/RPC, grants, RLS policy, SECURITY DEFINER + search_path, verification status (proven by source vs proven by test).
- Test results table (Passed/Failed/Blocked/Not run).

REPRODUCERS
For every Confirmed finding that can be reproduced locally, write the reproducer as a test that currently FAILS and mark it skipped with a comment `// un-skip when fixed in Pxx`:
- pgTAP for single-session logic.
- A Node/vitest concurrency harness `supabase/tests/concurrency/*.test.ts` using two real authenticated admin clients against local Supabase for races (L1, L4, L6). Do not use sleeps as the synchronization mechanism where pg_advisory locks or barrier queries can be used.

MUST NOT CHANGE
Any migration, function, policy or application code. Only docs/BACKEND_AUDIT.md and new test files.
```

---

## PHASE 2 — Lock ordering and deadlock fix (L1, L7)

```text
[paste STANDING RULES]

OBJECTIVE
Make every mutating RPC acquire locks in ONE global order so concurrent operations cannot deadlock, without changing any function's inputs, outputs, error codes or business rules.

CANONICAL ORDER
1) rooms row (FOR UPDATE)  2) teams rows of that room, ascending id  3) team_businesses/activity inserts (no explicit locks).
Rationale: the room row is the single serialization point for lifecycle (start/abort/finalize/expire), so taking it first makes lifecycle-vs-money races serialize cleanly instead of deadlocking.

CHANGES
1. New migration 0016_lock_order.sql using CREATE OR REPLACE for: admin_add_business, admin_set_business_level, admin_remove_business, admin_set_bankrupt, admin_release_team, and re-verify admin_set_team_values, admin_adjust, admin_abort_game, admin_finalize, expire_if_due.
2. In each team-scoped function: first resolve room_id from the team WITHOUT locking (plain SELECT), call expire_if_due(room_id) (which locks the room), then `SELECT … FROM rooms WHERE id = v_room_id FOR UPDATE`, THEN lock the target team row. Re-read team columns AFTER the team lock (never use values read before it). Re-validate that the team still belongs to that room after locking.
3. admin_release_team: replace the JOIN … FOR UPDATE with two separate statements in canonical order.
4. Add a header comment block to the migration documenting the canonical order, and add the same short comment to docs/OPERATIONS.md.
5. Do not add retry loops. Do not change isolation level.

TESTS
- Un-skip and make pass the L1/L7 concurrency reproducers from Phase 1: run 50 iterations each of (add_business ∥ set_team_values), (add_business ∥ abort), (set_business_level ∥ finalize), (release_team ∥ add_business), (adjust across 2 teams ∥ add_business on one of them). Assert: zero 40P01 deadlock errors, and final DB state equals one of the valid serial orders.
- pgTAP: behavior of every touched function is unchanged for the happy path and for each existing error code.

DONE WHEN
Gate green, concurrency suite shows 0 deadlocks over the iterations, and the migration is mirrored in all_migrations.sql.

MUST NOT CHANGE
Business rules, error codes, return shapes, RLS, grants.
```

---

## PHASE 3 — Lifecycle correctness and idempotent lifecycle RPCs (L2, L3, L15)

```text
[paste STANDING RULES]

OBJECTIVE
Make start / open-lobby / abort / finalize safe under retries, double-clicks, stale tabs and deadline races. Keep the existing status enum and the abort-resets-to-LOBBY semantics.

CHANGES (new migration 0017_lifecycle_hardening.sql)
1. admin_abort_game:
   - Call expire_if_due first. If the room is (or just became) TIME_EXPIRED, raise a NEW code ROOM_ALREADY_EXPIRED (do not silently wipe a finished game). Document that an expired game is finished with admin_finalize, not aborted.
   - Keep: NOTE_REQUIRED, ACTIVE-only, reset to LOBBY, team reset, audit events. Keep the parameter name p_room_id (rpc.ts already sends it).
2. Lifecycle idempotency without a new table: add an optional `request_id uuid DEFAULT NULL` parameter to admin_open_lobby, admin_start_game, admin_abort_game, admin_finalize (new overloads via DROP FUNCTION IF EXISTS of the old signature + CREATE with the new one; update GRANTs). Store request_id on the corresponding activity_events row (the column is already UNIQUE). Replay rule, evaluated AFTER taking the room lock: if an activity_events row with this request_id exists for THIS room and the matching event type, return the current room JSON (same shape as first call) instead of raising INVALID_TRANSITION. If the request_id exists for a different room or type, raise a NEW code REQUEST_ID_REUSED.
3. admin_start_game: assert inside the lock that started_at IS NULL and ends_at IS NULL (defense in depth), and that the room has exactly team_count teams and that every team is cash=1000, cv=0, not bankrupt with zero businesses (else raise INVALID_INITIAL_STATE). `force` continues to bypass only the unclaimed-teams check. Replace the hard-coded '50:00' note with a value derived from duration_seconds.
4. expire_if_due: REVOKE EXECUTE FROM anon (see Phase 6 for the rest of the surface; keep authenticated). Make sure get_lobby / get_my_state keep working for anon by calling expiry through a SECURITY DEFINER path they already own — verify with a test before revoking.
5. Zero-client expiry (L15): prove with a test that after ends_at, the first call from any of get_my_state / get_admin_snapshot / admin_* returns TIME_EXPIRED and writes exactly ONE TIME_EXPIRED event even under 20 concurrent callers. If this fails, fix expire_if_due; do not add cron/pg_cron.

TESTS
- Start twice (sequential, concurrent, with the same request_id, with different request_ids): exactly one ACTIVE transition, one started_at, one GAME_STARTED event.
- Abort ∥ start, abort ∥ finalize, abort after deadline (L2), finalize twice, finalize with same request_id replay.
- Retry-after-commit with the same request_id returns success with identical payload.
- An aborted-then-restarted room gets a NEW started_at/ends_at and old financial history remains in activity_events.

DONE WHEN
Gate green; each invariant above has a named test; Phase 1 reproducers for L2/L3 are un-skipped and pass.

MUST NOT CHANGE
Status enum, transition trigger, abort's reset-to-LOBBY semantics, existing error codes, final_results immutability.
```

---

## PHASE 4 — Money-RPC idempotency and numeric bounds (L4, L8)

```text
[paste STANDING RULES]

OBJECTIVE
Make request_id replay correct under concurrency and misuse, and make numeric edge cases fail with clean business errors instead of raw Postgres errors.

CHANGES (new migration 0018_money_rpc_hardening.sql)
1. Move the request_id replay check to AFTER the room+team locks in: admin_set_team_values, admin_adjust, admin_add_business, admin_set_business_level, admin_remove_business, admin_set_bankrupt. Replay requires the matching row to have the same team_id (or room_id for adjust/tiebreak), the same event-type family, and the same actor_id; otherwise raise REQUEST_ID_REUSED. A matching replay returns the SAME shape as the original call (admin_adjust: return the array of snapshots for the group_id, not {status:'idempotent_duplicate'}).
2. Concurrent duplicate (same request_id, original in flight): the second caller blocks on the lock, then replays. Verify with a test; do not add advisory locks unless the test proves the lock order alone is insufficient.
3. Bounds: add a single constant helper function (e.g. public.max_money() = 1000000000, adjust to rule needs after checking docs) and validate in set_team_values, adjust, add_business, set_business_level before arithmetic; raise INVALID_VALUE with the offending field. Guard `cash + delta` and `cv + delta` against overflow explicitly. Add CHECK constraints (NOT VALID then VALIDATE) on teams.cash/cv upper bound only if the validate passes on a fresh DB and on seeded data.
4. admin_adjust: validate `changes` shape up front (array, 1..6 items, no duplicate team_id, all teams in the SAME room, integers only). Today a bad shape surfaces as raw cast errors.
5. Document in the migration which operations are intentionally correctable after TIME_EXPIRED (note required, is_correction=true) and add a test that after FINALIZED every money RPC raises ROOM_NOT_EDITABLE and no row changes.

TESTS (invariants)
- Same request_id, same payload → one effect, identical response (sequential and concurrent).
- Same request_id, different team/actor/type → REQUEST_ID_REUSED, no effect.
- cash/cv at int max and at the cap, negative cash, NaN-like inputs via JSON → clean INVALID_VALUE.
- Every operation: activity_events row count and teams.version delta match exactly (no financial change without an audit row and vice versa). Write one generic invariant test that replays a randomized sequence of 200 ops and checks: cash≥0, cv≥0, business cap ≤3, no business owned twice, sum of event deltas == current balances.

MUST NOT CHANGE
Rules for costs, resale, upgrades, CV math. If a rule is unclear, stop and list the question instead of guessing.
```

---

## PHASE 5 — Join and PIN abuse resistance (L5, L6)

```text
[paste STANDING RULES]

OBJECTIVE
Stop PIN brute-forcing via fresh anonymous sessions, return the right error on concurrent claims, and bound join_attempts growth. Keep the room-code + slot + 4-digit PIN UX the organizers use on the day.

CHANGES (new migration 0019_join_hardening.sql)
1. Throttle on the TARGET, not just the caller: in join_team count failed attempts per (team_id) in the last 60 s and per (room code) in the last 60 s in addition to per user. Suggested starting limits: 5 failures/user/min (keep), 10 failures/team/min, 30 failures/room/min. After the team limit trips, return TOO_MANY_ATTEMPTS with retry_after_seconds regardless of which PIN is sent (so the lockout itself isn't an oracle). Choose limits so that six legitimate phones typing PINs at the start cannot lock each other out; justify the numbers in a comment.
2. Log failed attempts for unknown room codes against a hashed code bucket so enumeration of codes is also throttled.
3. Concurrent same-slot claims: catch unique_violation on team_claims and raise TEAM_ALREADY_CLAIMED. Lock the team row (after the room, per Phase 2 order) before the claim check.
4. Reject joins to a room that is TIME_EXPIRED unless the caller already holds a claim (reconnect case) — confirm this matches current UX in LobbyWaitView/TeamJoinPage before changing; if it doesn't, keep behavior and note it.
5. join_attempts retention: delete rows older than 1 hour opportunistically inside join_team (bounded `DELETE … WHERE id IN (SELECT … LIMIT 100)`); add an index on (team_id, attempted_at) and (user_id, attempted_at) if absent.
6. Do NOT hash PINs in this phase (admin must read them to hand them out). State that explicitly in docs/OPERATIONS.md along with the residual risk and the Supabase Auth anonymous-sign-in rate limit setting to check in the dashboard (list it as a manual checklist item; don't change the remote project).
7. Frontend: map TOO_MANY_ATTEMPTS (use retry_after_seconds) and TEAM_ALREADY_CLAIMED to clear messages in src/lib/errors.ts and TeamJoinPage; confirm room code/PIN never appear in URLs, console logs, logger output or error toasts (grep and fix).

TESTS
- 10 fresh anon users each guessing wrong PINs for one team → throttle trips before 20 total guesses.
- Six legitimate teams joining within 10 s with correct PINs → all succeed.
- Two phones, one slot, concurrent → exactly one claim, loser gets TEAM_ALREADY_CLAIMED.
- Released team: old session cannot read team state (RLS) and cannot rejoin without the PIN.

MUST NOT CHANGE
Claim exclusivity semantics from 0014, admin_release_team behavior, get_lobby response.
```

---

## PHASE 6 — Security surface lock-down and security test suite (L9, L10)

```text
[paste STANDING RULES]

OBJECTIVE
Make the security model provable by tests, and remove avoidable exposure.

CHANGES
1. L9: remove the test-clock hook from production behavior. Preferred: new migration redefining app_now() to `SELECT clock_timestamp()` only, and make the existing pgTAP time-travel tests use a separate test-only helper schema (`test_support`) created inside the test files, not in migrations. If that breaks too many tests, instead keep the hook but gate it on a database-level setting that can only be set by superuser (`ALTER DATABASE … SET app.env`), and prove with a test that anon/authenticated/PostgREST cannot set it. Pick one, explain why.
2. L10: after Phase 3, confirm anon has EXECUTE only on what it needs: server_time, is_admin (consider whether anon needs it), get_lobby, join_team, get_my_state. Revoke everything else from anon.
3. For every SECURITY DEFINER function: assert search_path is pinned and that every table reference is schema-qualified or resolves under that path. Add the check as a pgTAP query over pg_proc (proconfig) so a future function missing search_path fails the suite.
4. Realtime: confirm via test that a claimed anon user receives realtime only for their own team row and never other teams, activity_events, or team_secrets (RLS applies to realtime; prove it with a real subscription against local). If any table leaks, fix with policy or publication change.
5. Add `supabase/tests/0007_security_matrix_test.sql` and a Node client test (`supabase/tests/security/*.test.ts`) that call Supabase directly (bypassing the app) as: anon without claim, team A, team B, non-admin authenticated user, admin. For each of the 12 threat-model cases in the audit prompt Phase 5, assert the exact outcome.

TESTS
Each matrix cell is one named assertion: role × (every table SELECT/INSERT/UPDATE/DELETE) and role × (every RPC EXECUTE). Include: team A cannot read team B cash/CV/businesses/PIN; no role can INSERT/UPDATE/DELETE any table directly; non-admin authenticated gets NOT_ADMIN from every admin_* RPC; get_my_state returns only own team (0015 invariant).

MUST NOT CHANGE
Admin and team flows that currently work (verify with the existing e2e/unit suites).
```

---

## PHASE 7 — Finalization, ranking and history integrity (L11, L16)

```text
[paste STANDING RULES]

OBJECTIVE
Make the official result provably correct, complete and immutable.

FIRST
Open the official rulebook/RUNBOOK in docs/ and the README. Extract the ranking and tiebreak rules verbatim into docs/SCORING_RULES.md with source references. If the rulebook is not in the repo, STOP this phase and ask the owner these exact questions: (a) primary rank key, (b) tie order after CV, (c) how bankrupt teams rank and whether a bankrupt team can win, (d) manual tiebreak semantics when still tied. Do not invent rules.

CHANGES (new migration 0020_final_snapshot.sql, only if the audit confirms a gap)
1. Compare room_standings ordering to docs/SCORING_RULES.md. If they differ, fix room_standings with a test per rule.
2. Add a `final_business_snapshot jsonb` (or a small `final_result_businesses` append-only table with the same immutability trigger) capturing per team: business_key, name, level, cost/cv values AS THEY WERE at finalization, so history never depends on later business_catalog edits. Populate inside admin_finalize in the same transaction. Backfill nothing for old rooms; get_history_detail must handle both.
3. admin_finalize: recompute standings once into a temp CTE/variable and use that single result for the insert, the winner, and the return value (today it calls room_standings three times). Lock teams in canonical order before snapshotting so no correction can land between rank computation and insert.
4. Prove after FINALIZED: rooms, teams, team_businesses, final_results, activity_events are immutable through every path, including admin_abort_game, admin_release_team, admin_set_tiebreak, and admin_create_room for the next match.
5. Confirm the next match's room creation/reuse doesn't touch history: create → play → finalize → create again → old room's standings, final_results and activity log are byte-identical.

TESTS
Ranking table-driven test (including all-bankrupt, three-way tie, partial tiebreak order, duplicate tiebreak orders); finalize twice; finalize concurrent with a correction; snapshot unchanged after catalog edit (done as superuser in the test); history detail identical before/after next room creation.

MUST NOT CHANGE
final_results columns that the frontend already reads, winner_team_id semantics.
```

---

## PHASE 8 — Frontend recovery, unknown outcomes, realtime (client side)

```text
[paste STANDING RULES]

OBJECTIVE
Make the UI honest about what happened and self-healing after missed events. Depends on Phases 3 and 4 (replay semantics, new error codes).

FIRST
Map, from source, every mutation call site (AdminConsoleView, dialogs, useAdminRoom, useMyTeam, realtime.ts) to: how request_id is generated, whether it is reused on retry/double-click, what the user sees on each error.

CHANGES
1. Classify RPC outcomes in src/lib/errors.ts into: DEFINITELY_FAILED (business error, nothing committed), COMMITTED (success or replay), OUTCOME_UNKNOWN (network/timeout), CONFLICT (VERSION_CONFLICT, BUSINESS_OWNED), SESSION_EXPIRED, NOT_ADMIN, ROOM_NOT_ACTIVE (ROOM_NOT_EDITABLE, ROOM_ALREADY_EXPIRED, INVALID_TRANSITION). Export a single `classifyRpcError()` and unit-test it with every raise_error code in the migrations (add a test that greps the migrations for raise_error codes and fails if one is unclassified).
2. Every admin mutation generates ONE request_id per user intent (dialog open → confirm), reused across double-clicks and automatic/manual retries; a new intent gets a new id. Disable the confirm button while in flight.
3. On OUTCOME_UNKNOWN: do not show success or plain failure. Refetch the snapshot, then show "Checking…" → resolved state; for lifecycle calls, retry with the SAME request_id automatically once.
4. Lifecycle buttons (Start/Abort/Finalize): send request_id (Phase 3) and treat INVALID_TRANSITION after a refetch that shows the target state as success, not error.
5. Realtime: on reconnect, visibility-change to visible, and every 15–30 s while the tab is visible, reconcile by refetching authoritative snapshots (get_admin_snapshot / get_my_state). Ensure subscriptions are cleaned up on unmount and room switch, and events carrying a stale room_id/version are ignored. Verify no optimistic UI shows a financial result before the RPC resolves.
6. Server clock: confirm countdown derives from server_time offset and `ends_at`, never Date.now() alone, and the UI flips to game-over based on the server-confirmed status on next reconcile, not just a local timer.

TESTS
Unit: classifier table; request_id stability across retries; unknown-outcome flow with a mocked rpc that commits then drops the response. Playwright (existing tests/e2e/live-reliability.spec.ts): throttle network mid-mutation, reconnect, assert exactly one effect and correct final UI.

MUST NOT CHANGE
Visual design, copy outside error messages, any SQL.
```

---

## PHASE 9 — Migration and deployment hygiene (L12, L14)

```text
[paste STANDING RULES]

OBJECTIVE
Make it hard to ship a bad migration or hit the wrong project, and make the schema, types and wrappers provably in sync.

CHANGES
1. Drift guards (run in CI):
   - Regenerate src/data/database.types.ts from the local DB and fail if it differs from the committed file.
   - A test that parses every `rpc*` wrapper in src/data/rpc.ts and asserts its argument keys exactly match the named parameters of the matching function in `pg_proc` (this catches the 0013 `p_room_id` class of bug permanently). Include all RPCs, not only admin_*.
2. Migration safety: add a test that applies migrations on a fresh DB and ALSO on a DB seeded with a mid-game state at 0015, then applies 0016+, to prove they work on existing data (not just fresh). Flag any non-idempotent or destructive statements; 0006 (DROP legacy tables) stays untouched and gets a header note that it is historical and must not be re-run on production.
3. Deployment: add docs/DEPLOY_CHECKLIST.md: confirm project ref, backup/export before `db push`, run migrations on a throwaway branch/project first, run scripts/verify-prod.ts (read-only), rollback plan (additive corrective migrations, no down-migrations), freeze window before the event. Do not automate prod deploys.
4. Confirm vercel.json and env handling: only VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY reach the browser; grep the built dist/ for service_role and secret-like strings; add that grep as a CI step.
5. Confirm .gitignore covers .env*, supabase/.temp, and build output; list anything committed that shouldn't be (don't delete, report).

DONE WHEN
CI fails on: wrapper/param drift, types drift, all_migrations drift, service-role key in bundle.

MUST NOT CHANGE
Applied migrations, deployed configuration.
```

---

## PHASE 10 — Dead code, docs, final regression

```text
[paste STANDING RULES]

OBJECTIVE
Remove only what is provably dead, make docs match reality, and run the full regression.

STEPS
1. Build a candidate list (unused exports, unreferenced components/hooks, stale tests, unused deps, obsolete docs such as the earlier audit summaries). For each, search the whole repo including tests, scripts, vite/playwright config, vercel.json, CI, docs and dynamic imports. Classify: confirmed dead / probably unused / intentionally retained / historical (migrations, never delete) / looks unused but active. Write docs/CLEANUP_LOG.md with evidence per item.
2. Delete ONLY "confirmed dead" items, one commit per group, gate green after each. Leave everything else listed.
3. src/lib/deadCodeRegression.test.ts exists: keep it passing and extend it for anything removed.
4. Update docs/OPERATIONS.md and docs/RUNBOOK.md to the final behavior: lifecycle states, abort semantics (resets to LOBBY, expired games are finalized not aborted), idempotency/request_id rules, canonical lock order, error code table with client classification, PIN/throttle limits, event-day checklist.
5. Final regression: full gate, the concurrency suite, security matrix, scripts/loadtest.ts --quick against LOCAL only (record real numbers; do not estimate), and a manual run-through: create room → lobby → 6 phones join → start → purchases/upgrades/rent/steal/bankruptcy → deadline → finalize → create next room → history intact.

DELIVERABLE
Final report: what changed per phase, every test with the invariant it protects, measured load-test numbers, residual risks, and the production safety checklist.
```

---

## Open questions I couldn't answer from the zip

1. Rulebook wasn't in this upload: confirm ranking/tiebreak order before Phase 7.
2. Intended behavior when a room is TIME_EXPIRED and a team phone is not yet claimed: allow join or not (Phase 5 item 4).
3. Is abort meant to be allowed after the deadline? I assumed no (finalize instead). Say if you want the opposite before Phase 3.
