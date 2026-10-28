# Final Verification: rulebook alignment and Company Value removal

Local verification on Windows (Node 24, Supabase CLI 2.117.0, Docker). Base commit `c0cc121`; work commits `7cc6236` to `b3e2cd4` plus this report.

## Results (all observed, none assumed)

| Check | Result |
|---|---|
| `npm ci` | PASS (after stopping a leftover Vite dev server that locked a native module) |
| `npm run typecheck` | PASS |
| `npm test` | PASS: 57 files, 420 tests |
| `npm run build` | PASS |
| `npm run check:bundle` | PASS |
| `supabase db reset` | PASS (migrations 0001 to 0031) |
| `supabase test db` (pgTAP) | PASS: 21 files, 610 tests |
| `npm run test:db-suites` | PASS: lockorder, lifecycle, money, gameplayrules, abuse, finalize, security, contract (incl. catalog parity) |
| `npm run test:upgrade` | PASS: a 0015-era live game upgrades to 0031 and finalizes |
| `npm run build:migrations` | no diff in `supabase/all_migrations.sql` |
| `git diff --check` | clean |
| Playwright `tests/e2e` (not part of CI) | PASS locally: 21 of 21 |
| GitHub Actions run | **NOT RUN**: nothing was pushed, so no workflow ran. The workflow's steps were each run locally as above. |

## Company Value classification

| Class | Count | Notes |
|---|---|---|
| ACTIVE (code, payloads, columns, functions) | 0 | no public column mentions cv; no RPC output has a cv key (`0018` test) |
| USER-FACING | 0 | only tests asserting CV text is absent |
| DB-ACTIVE | 0 behaviours | `admin_adjust` still names `cv_delta` only to reject it; `activity_events.type` still allows `CV_SET` so historical rows stay valid |
| HISTORICAL | rest | applied migrations 0001 to 0027, `all_migrations.sql`, stored `activity_events` JSON, audit docs and `notion_rules.md` (bannered), the execution plan, and `CV_SET` rendering for old rooms (`activityText.ts`, `ActivityLog.tsx`, `database.types.ts`) |

Stored CV values were dropped (`0029`) with no archive or compensation, per D8.

## Board and rules

- `board.test.ts`: 24 spaces, counts 1/3/10/4/4/2, corners 0/6/12/18; no change to space order, names, types or keys (only description text). `public/` images show no diff.
- The in-repo handbook's board listing did not match the physical board image; it now follows the image and `board.ts`.
- Catalog costs, upgrade costs and board spaces equal the domain tables (`catalogParity.test.ts`); rent is asserted for every tier in the domain test and in pgTAP `0019`.

## Owner decisions

D1 ranking: implemented (`0029`, `0031`). D2 and D3 card and Action C values: implemented. D4: deduction removed. D5: persistent Debt Recovery implemented. D6: purchases tied to the board space, rent computed server-side. D7: START credited on movement. D8: CV data dropped. D9: literal zero not requested; historical references are retained and classified above.

## Not enforced or still open (needs an owner answer)

1. **Forced sales "only to cover a required payment or debt"**: the server cannot tell a pending payment from a voluntary sale (no payment state exists). The 50% valuation, ownership check and debt-first proceeds are enforced; the "only when needed" part is an operator rule.
2. **Cards 1 to 6, Action D (steal)**: amounts are still entered through `admin_adjust` (admin-only, audited). Only START, purchases, upgrades and rent are server-computed. A card-draw state would be needed to go further.
3. **Upgrades are not tied to the board space**: the rulebook text says "own business, one level at a time, pay the Bank", not that the token must stand there. Order, ownership, cost and cash are enforced.
4. **Two or more teams sharing first place**: no winner is recorded (`winner_team_id` NULL). Confirm if a prize rule is wanted.
5. **Handbook vs admin tool**: where D1 to D3 are silent the handbook was taken as truth (Premium Deal 50%, Founder Bonus 50/100/200, Investor Pullout -400, forced sale 50%). Three Sixes and the extra roll on a 6 (D11) remain out of scope, as does Action B's pitch penalty.
6. **CI**: `supabase/setup-cli` is pinned to `latest` (not reproducible); the e2e specs have no CI job.

## Deployment (human step, never run by this work)

Follow `docs/DEPLOY_CHECKLIST.md`, section "Migrations 0028 to 0031": back up first, deploy outside a live event, ship the web build and the database together, hard-refresh every admin and team device, then `npm run verify:prod`. Rollback is a forward migration only. `0029` drops CV columns irreversibly.
