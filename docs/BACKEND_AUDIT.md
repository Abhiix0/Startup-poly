# STARTUPOLY Backend Audit (Phase 1, audit-only)

> **Historical document.** This describes the system as it was before Company Value (CV) was removed and before the rulebook alignment (business cap 2, new upgrade costs, Debt Recovery, server-side START/purchase/rent rules). It is kept as history and is not updated. Current rules: `docs/SCORING_RULES.md`, the Player Handbook in `src/routes/public/RulesPage.tsx`, and the migrations from `0028` on.

Method: source read of migrations 0001–0015 plus experiments against the LOCAL Supabase stack
(`supabase start`, 127.0.0.1). Experiments minted local JWTs with the local JWT secret
(local GoTrue has the email provider off). Nothing here touched a deployed project.
"Confirmed by test" = I ran it and observed the output quoted. Reproducers are in
`supabase/tests/0007_audit_reproducers_test.sql` and `supabase/tests/concurrency/*.test.ts` (skipped until fixed).

## Baseline
| Check | Result |
|-------|--------|
| `supabase db reset` | exit 0 |
| `supabase test db` | PASS, 7 files, 132 tests (4 are skipped reproducers) |
| `npm run test:concurrency` | reproducers skipped by design (L1 was run un-skipped once, see below) |

## Findings register
| ID | Sev | Verdict | Evidence | Fix phase | Regression test |
|----|-----|---------|----------|-----------|-----------------|
| L1 | High | **Confirmed by test** | 50 x (`admin_add_business` ∥ `admin_abort_game`) gave **4 x `40P01` deadlock**. add_business locks team (0008:679) then room via `expire_if_due` (0007:40); abort locks room (0013:33) then teams (0013:48). | P2 | `concurrency/lockorder.test.ts` |
| L2 | High | **Confirmed by test** | ACTIVE room with `ends_at` in the past: `admin_abort_game` succeeded, room went to LOBBY, finished game wiped. | P3 | `0007_audit_reproducers` (skipped) |
| L3 | Med | **Confirmed by test** | Second `admin_start_game` gave `INVALID_TRANSITION {from:ACTIVE,to:ACTIVE}`; lifecycle RPCs take no `request_id`. | P3 | P3 suite |
| L4 | High | **Confirmed by test** | Same `request_id` for team 2 then team 3: second call returned success with no effect (team 3 cash stayed 1000). The check runs before locks (0008:416/528/673…). `admin_adjust` replay returns `{status:'idempotent_duplicate'}` (0008:529), a different shape. | P4 | `concurrency/abuse.test.ts` |
| L5 | Med | **Confirmed**, exploitability depends on Auth limits | 40 distinct sessions x 3 wrong PINs = 120 guesses, 0 throttled. Local `anonymous_users = 30/h/IP` (config.toml:202) is the only brake, and it is per IP. The production dashboard value is **Unverified**. | P5 | `abuse.test.ts` |
| **N1** | **Critical** | **New, confirmed by test** | `join_team` INSERTs the failed attempt and then `RAISE`s (0014:62–94). The exception rolls the INSERT back. 12 wrong PINs from ONE session gave 12 x `BAD_CODE_OR_PIN` and `join_attempts` rows = 0. **The per-user throttle never fires.** pgTAP misses it because its assertions share one transaction. | P5 (needs a failure path that does not raise) | `abuse.test.ts` |
| L6 | Low | **Unverified** | One real 2-phone race: winner ok, loser `TEAM_ALREADY_CLAIMED` (correct code). The 23505 branch (0014:96–118) was not reproduced. Exclusivity held. | P5 | looped race |
| L7 | Med | Confirmed by reading | `admin_release_team` does `teams JOIN rooms … FOR UPDATE` (order undefined), then `expire_if_due`. Not raced in isolation. | P2 | P2 suite |
| L8 | Med | **Confirmed by test** | `cash=2147483647` accepted; `admin_adjust +1` gave raw `22003 integer out of range`; `cash=3e9` gave raw `22003`. `admin_adjust` with `changes:'nope'` gave a misleading `ROOM_NOT_FOUND`. | P4 | `0007_audit_reproducers` (skipped) |
| L9 | — | **Refuted via PostgREST** | A real anon request with headers `app.test_now` / `app.env` to `/rest/v1/rpc/server_time` returned the real clock. The hook is still reachable by any SQL session allowed to `SET`; production risk is low. | P6 (optional) | P6 |
| L10 | Med | **Confirmed by test** | anon `expire_if_due(random uuid)` gave `ROOM_NOT_FOUND`; for a real room it executes and takes a row lock (existence oracle plus lock probe). | P3/P6 | `0007_audit_reproducers` (skipped) |
| **N2** | Med | **New, confirmed** | anon holds EXECUTE on **all** `admin_*` RPCs, `room_standings`, `raise_error`, `app_now` (Supabase default function privileges; migrations only `REVOKE … FROM PUBLIC`). `admin_open_lobby` as anon gave `NOT_ADMIN`, so they are guarded, but the surface is wider than needed. | P6 | security matrix |
| L11 | Low | **Matches runbook; gap Unverified** | `room_standings` order (not-bankrupt, CV, cash, business count, tiebreak, slot) matches RUNBOOK Step 9 (CV, cash, business count, pitch). The runbook does not say how bankrupt teams rank or whether one can win. See owner question 1. | P7 | P7 suite |
| L12 | Med | Fixed in P0 | `scripts/lib/assertLocal.ts` guards seed-rehearsal, loadtest, create/revoke-admin. | done | assertLocal tests |
| L13 | — | Fixed in P0 | `.github/workflows/ci.yml` exists. | done | — |
| L14 | Low | Fixed in P0 | `all_migrations.sql` regenerated; drift check added. | done | drift test |
| L15 | — | **Refuted (behaves well)** | 20 concurrent `expire_if_due` calls after `ends_at`: all returned `TIME_EXPIRED`, exactly **1** `TIME_EXPIRED` event. | — | add to P3 suite |
| L16 | Low | **Refuted as stated** | `get_history_detail` reads `final_results`, `teams`, `activity_events`, not `business_catalog` (0008:~1340–1395). But `final_results` stores totals only, so per-business end state is not in history. A gap, not a dependency bug. | P7 (decide) | P7 suite |

Not run: L7 as an isolated race, the L6 23505 branch, and L5 against the real production Auth config.

## Lock-acquisition order (as shipped)
| Function | Order |
|----------|-------|
| `admin_add_business`, `admin_set_business_level`, `admin_remove_business`, `admin_set_bankrupt` | **team** (0008:679/812/958/1071), then room (`expire_if_due`, then `rooms FOR UPDATE`) |
| `admin_release_team` | teams ⨝ rooms `FOR UPDATE` (order undefined), then `expire_if_due` |
| `admin_set_team_values`, `admin_adjust` | team lookup (no lock), room, teams |
| `admin_abort_game` (0013), `admin_finalize` (0010) | room, teams |
| `expire_if_due` | room |

Canonical order for P2: room, then teams ascending by id.

## Lifecycle matrix (enum: CREATED, LOBBY, ACTIVE, TIME_EXPIRED, FINALIZED)
Trigger-allowed transitions (0002:95–99): CREATED→LOBBY, LOBBY→ACTIVE, ACTIVE→TIME_EXPIRED, **ACTIVE→LOBBY (abort)**, TIME_EXPIRED→FINALIZED. There is no ABORTED status.

| From | open_lobby | start | abort | finalize | money RPCs |
|------|-----------|-------|-------|----------|------------|
| CREATED | ok | INVALID_TRANSITION | INVALID_TRANSITION | INVALID_TRANSITION | ROOM_NOT_EDITABLE |
| LOBBY | INVALID_TRANSITION | ok | INVALID_TRANSITION | INVALID_TRANSITION | ROOM_NOT_EDITABLE |
| ACTIVE | INVALID_TRANSITION | INVALID_TRANSITION (tested) | ok, **even past the deadline (L2, tested)** | INVALID_TRANSITION | ok |
| TIME_EXPIRED | INVALID_TRANSITION | INVALID_TRANSITION | rejected | ok | corrections only |
| FINALIZED | INVALID_TRANSITION | INVALID_TRANSITION | INVALID_TRANSITION | INVALID_TRANSITION | ROOM_NOT_EDITABLE |

Only the cells marked "tested" were exercised; the rest come from reading the source.

## Security matrix
Proven by catalog query on the local DB: all 9 public tables have RLS enabled, and clients hold SELECT only (no INSERT/UPDATE/DELETE for anon or authenticated on any table).

| Table | anon | authenticated |
|-------|------|---------------|
| activity_events, admins, team_secrets | none | SELECT |
| business_catalog, final_results, rooms, team_businesses, team_claims, teams | SELECT | SELECT |
| join_attempts | none | none |

Every `SECURITY DEFINER` function in `public` pins `search_path` (query returned 0 offenders). anon EXECUTE list: all admin_*, app_now, expire_if_due, get_admin_snapshot, get_history_detail, get_lobby, get_my_state, get_standings, get_team_snapshot, is_admin, join_team, list_history, raise_error, room_standings, server_time.

RLS policy bodies (for example that `teams` hides rivals from a claimed player) rely on existing pgTAP 0006 and were **not re-proven here**. The full role x table/RPC matrix is P6.

## Test results
| Suite | Result |
|-------|--------|
| pgTAP (7 files) | Passed, 132 tests (4 reproducers skipped) |
| Concurrency L1, un-skipped, one run | Failed as expected: 4 deadlocks in 50 iterations |
| Probes L2, L3, L4, L5, N1, L8, L9, L10, L15 | Run; observed output recorded in the register |
| vitest / typecheck / build | Not re-run this phase (no app code changed) |

## Questions for the owner
1. (P7) Do bankrupt teams rank last regardless of CV, and can a bankrupt team win?
2. (P5) Should a TIME_EXPIRED room accept a first-time claim from an unclaimed team?
3. (P3) Assumed: abort after the deadline is rejected and expired games are finalized. Confirm.
4. (P5) What is the production Supabase Auth anonymous sign-in rate limit? (manual dashboard check)

## Fix status
| ID | Status |
|----|--------|
| L1, L7 | Fixed in P2 (migration 0016). 250 race iterations, 0 deadlocks. |
| L2, L3 | Fixed in P3 (migration 0017): abort after the deadline raises `ROOM_ALREADY_EXPIRED`; lifecycle RPCs take `request_id` and replay. |
| L10 | Partly fixed in P3: `anon` lost EXECUTE on `expire_if_due`. Any signed-in player (anonymous sign-in users have the `authenticated` role) can still call it. Decide in P6 whether to revoke from `authenticated` too (only SECURITY DEFINER callers need it). |
| L15 | Test added (`concurrency/lifecycle.test.ts`): 20 concurrent callers, one `TIME_EXPIRED` event. |
| L4, L8 | Fixed in P4 (migration 0018): replay under the lock with room/team/type/actor checks; `INVALID_VALUE` bounds; adjust shape validation. Tests: pgTAP 0009, `concurrency/money.test.ts` (incl. 200 seeded random ops). |
| N1, L5, L6 | Fixed in P5 (migration 0019): failed attempts commit and throttle per user/team/room/unknown-code; claims lock the team after the room and map a racing unique violation to `TEAM_ALREADY_CLAIMED`. Tests: pgTAP 0010, `concurrency/abuse.test.ts`. The L6 23505 branch remains defence in depth: the team lock means two racing phones are serialised before it. |
| N2, N3, N4, L9, L10 | Fixed in P6 (migration 0020). **N3** (new): `get_team_snapshot` let any signed-in player read any team's snapshot by UUID. **N4** (new): `room_standings` let any player read the whole live leaderboard of their room. Both revoked from `anon`/`authenticated` (only SECURITY DEFINER callers need them). **N2**: `anon` now holds EXECUTE only on `server_time`, `get_lobby`, `join_team`, `get_my_state`, `is_admin` (RLS needs it); default privileges no longer grant new functions to `anon`. **L9**: `app_now()` honours `app.test_now` only for `postgres`/`supabase_admin` sessions. **L10**: `anon` revoked; `authenticated` keeps `expire_if_due` on purpose (residual: any signed-in player can probe room UUIDs and take a millisecond row lock; UUIDs are unguessable and the call is idempotent). Tests: pgTAP 0011 (every role x table op, role x function, search_path, RLS flags, NOT_ADMIN for every admin RPC, player isolation) and `security/security.test.ts` (HTTP as anon, player A, player B, outsider, admin, forged JWT, clock header, realtime). |
| L11, L16 | Closed in P7 (migration 0021). **L11**: ranking matches the rulebook; rules extracted verbatim with sources into `docs/SCORING_RULES.md` and each rule has a test (pgTAP 0012). The earlier owner question about bankrupt teams is answered by the public rules ("eliminated"). **L16**: `final_result_businesses` (append-only) snapshots each team's businesses with the catalog numbers at finalization; `get_history_detail` adds `businesses` and `snapshot_available`; `rooms.businesses_snapshotted` marks rooms that have one (older rooms have none and are not backfilled). `admin_finalize` ranks once and locks teams in canonical order. A new table got `TRUNCATE`/write rights from Supabase default privileges (caught by the 0011 matrix); fixed and defaults changed so new tables start with no client privileges. |
| Client side of L3/L4 | Fixed in P8: `classifyRpcError`, one `request_id` per intent, lifecycle calls carry ids, unknown outcomes are neither success nor failure, an already-reached lifecycle target counts as success. Also fixed: `NOTE_REQUIRED` and `TEAMS_NOT_JOINED` were missing from `ERROR_MAP` (arrived as `P0001`), so the "Use Force Start" hint never showed. Realtime reconcile (debounced refetch, 10 s visible polling, visibility/online/reconnect refetch, stale-response discard, cleanup) and the server-clock countdown already behaved as required and were left unchanged. Not run: the Playwright network-throttle scenario. |
