# CI Baseline

Recorded at the start of the rulebook-alignment work (base commit `c0cc121`, Windows, Node 24, Supabase CLI 2.117.0, local Docker stack).
Steps follow `.github/workflows/ci.yml` in order.

| # | Step | Command | Before fixes | After fixes | Cause / fix |
|---|---|---|---|---|---|
| 1 | Start stack | `supabase start` | PASS | PASS | |
| 2 | Reset DB | `supabase db reset` | PASS | PASS | |
| 3 | pgTAP | `supabase test db` | **FAIL** (2 files) | PASS | `0016_live_board_test.sql` called `admin_move_team` with `integer` literals but the function takes `smallint` (0027); `0011_security_matrix_test.sql` did not classify `admin_move_team` and `reset_board_positions_after_abort`. Tests fixed; schema untouched. |
| 4 | Install | `npm ci` | PASS | PASS | |
| 5 | Types | `npm run typecheck` | PASS | PASS | |
| 6 | Unit tests | `npm test` | **FAIL** (1 of 423) | PASS | `adminColorGuardrail.test.ts` flagged raw hex in `LiveBoardPanel.tsx`; replaced with `--color-board-*` tokens (same values) in `src/index.css`. Guardrail test unmodified. |
| 7 | Build | `npm run build` | PASS | PASS | Dummy/local `VITE_SUPABASE_*`. |
| 8 | Bundle scan | `npm run check:bundle` | PASS | PASS | |
| 9 | DB suites | `npm run test:db-suites` | **FAIL** (`contract`) | PASS | `rpcContract.test.ts` had no wrapper entry for `admin_move_team`; entry added. |
| 10 | Upgrade path | `npm run test:upgrade` | PASS | PASS | |

## Not changed (reported only)

- `supabase/setup-cli` is pinned to `version: latest` in CI (non-reproducible).
- Playwright specs in `tests/e2e` have no npm script and no CI step.
- No lint/format tooling exists.
