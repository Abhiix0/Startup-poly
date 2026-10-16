# Cleanup Log (Phase 10)

How candidates were found: every `export` of a value (const, let, function, class, enum) under `src/` was searched for by identifier across all text files in the repo (src, tests, scripts, supabase, docs, config, CI), ignoring its own definition. A name that appears nowhere else is a candidate. Barrel `index.ts` re-exports were counted separately so a component that is only re-exported would still show up. Exported `type`/`interface` declarations (121 prop and result types) were reviewed in bulk: they are public type surface for their components and were left alone.

Classes: **confirmed dead** (deleted) · **test-only** (used only by tests) · **intentionally retained** · **historical** · **looks unused but active**.

## Deleted (confirmed dead)

| Item | Evidence | Commit group |
|------|----------|--------------|
| `getMyStateRpc`, `joinTeamRpc`, `getLobbyRpc` in `src/data/rpc.ts` | Aliases of `rpcGetMyState`/`rpcJoinTeam`/`rpcGetLobby`. The name appears only at its definition: no import in src, tests, scripts, e2e specs, docs or config; no dynamic access (`rpc[...]`) anywhere. | dead aliases |
| `formatTime` in `src/lib/format.ts` | Zero references anywhere, including tests and docs. `formatMMSS` and `formatINR` in the same file are used and kept. | dead helper |

`src/lib/deadCodeRegression.test.ts` now also asserts these names are gone.

## Kept

| Item | Class | Why |
|------|-------|-----|
| `resaleValue`, `canAddBusiness` (`src/domain/economy.ts`) | test-only | Referenced by 2 and 6 test assertions, not by app code. They document the resale and cap rules; deleting them means deleting those tests, which is a product decision, not a cleanup. |
| `enrichStandingsWithPitch` (`LeaderboardView.tsx`) | test-only | 3 test references. |
| `BOARD_SPACES_24`, `BUSINESS_CATALOG_FULL`, `BONUS_CARDS_FULL`, `CRISIS_CARDS_FULL` (`RulesSection.tsx`) | intentionally retained | Rulebook data asserted by tests against the SQL catalog and the 24-space board rule. |
| `TEMPORARY_TEAM_COLORS`, `RULE_SECTIONS` (`RulesSection.tsx`) | intentionally retained | Used inside the file; the `export` is harmless. |
| `RpcOutcome` (`src/lib/errors.ts`) | intentionally retained | Names the non-error `COMMITTED` outcome next to the failure classes; documentation as a type. |
| All `*Props`, `*Result`, `ErrorMeta`, `IntroStage` and similar exported types | intentionally retained | Public type surface of exported components and hooks. |
| `docs/AUDIT_REMEDIATION_SUMMARY.md`, `docs/AUDIT_ROUND_2_SUMMARY.md`, `docs/LANDING_*.md`, `docs/VISUAL_LANGUAGE_DECISION.md`, `docs/DEPENDENCY_NOTES.md`, `docs/COLOR_SYSTEM.md` | historical | Earlier audit and design records. Nothing references them at runtime. Delete only on the owner's say-so. |
| `supabase/migrations/*` | historical | Never deleted. `0006_drop_legacy.sql` carries a header saying it must not be re-run. |
| `scripts/verify-prod.ts` | looks unused but active | Not imported anywhere, run by hand (`npm run verify:prod`) and named in the deploy checklist. |
| `tests/e2e/*` | looks unused but active | Run by Playwright (`playwright.config.ts`), not by vitest. |
| `src/test/*` | looks unused but active | Vitest setup and guard tests. |

## Dependencies

Every entry in `package.json` is imported by source, scripts, tests or tooling configs (`@axe-core/playwright` and `@playwright/test` by `tests/e2e`; `tsx` by `scripts/`; `jsdom` and the testing-library packages by vitest). No unused dependency found, none removed.

## Not checked

- Dead branches inside live functions and unreachable JSX were not analysed.
- CSS classes in `index.css` were not checked for use.
- The Playwright e2e suite was not run, so a spec that references removed behaviour would not be caught here.
