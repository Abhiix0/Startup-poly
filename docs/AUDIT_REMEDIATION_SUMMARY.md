# STARTUPOLY Repo Audit & Remediation Summary

This document summarizes the findings, decisions, and resolutions from the complete repository audit outlined in `STARTUPOLY_Full_Repo_Audit.md`. All phases were executed, verified against the test suites (`npm run typecheck`, `npm test`, `supabase test db`, `npm run build`), and committed phase-by-phase.

---

## Audit Matrix & Resolutions

| ID | Category | Original Finding | Resolution Status | Phase Addressed | Detailed Notes |
|---|---|---|---|---|---|
| **A1** | Dead Code | `lucide-react`, `tailwind-merge`, `clsx` declared in dependencies but never used in `src/`. | **Fixed** | Phase 1 (`50f937d`) | Pruned all three packages from `package.json` and `package-lock.json`. Verified 0 usages remain. |
| **A2** | Dead Code | `src/ui/pixel/PixelMascot.tsx` exported from barrel but never rendered in app. | **Fixed** | Phase 1 (`50f937d`) | Removed `PixelMascot.tsx` and its export in `src/ui/pixel/index.ts`. |
| **A3** | Dead Code / DB | `supabase/patches/001_fix_standings_add_abort.sql` was a stale unnumbered patch that risked overwriting newer migrations. | **Fixed** | Phase 1 (`50f937d`) | Removed patch file. Documented numbered-migration policy in `supabase/README.md`. |
| **A4** | Compiler Config | `tsconfig.json` had `noUnusedLocals: false` and `noUnusedParameters: false`, allowing dead code to accumulate. | **Fixed** | Phase 1 (`50f937d`) | Enabled both flags. Mechanically cleaned all unused locals and prefixed intentionally-unused parameters with `_`. |
| **B1** | Inconsistency | `PixelLogo.tsx` used Tailwind's `animate-bounce` outside project's reduced-motion and ambient motion conventions. | **Fixed** | Phase 3 (`6c2f78f`) | Replaced with custom `.anim-star-twinkle`. Swept all `animate-(bounce\|spin)` in `src/` (also fixed cloud float, trophy bob, and admin loader). Enforced in `PixelLogoAnimation.test.tsx`. |
| **B2** | Inconsistency | Two distinct visual systems: landing open-air scenery vs join/admin wooden signboard and castle/plains scenery. | **Decided: Keep Distinct** | Phase 5 (`424ac41`) | Documented in `docs/VISUAL_LANGUAGE_DECISION.md`. Kept as an intentional "world vs room entry" game metaphor. Fixed objective inconsistencies (button press physics, off-palette tokens, reduced-motion coverage). |
| **B3** | Inconsistency | `admin_abort_game` called from UI with hardcoded note (`'Game aborted — accidental start'`) rather than admin-typed reason. | **Fixed** | Phase 2 (`b5566ca`) | Added required note input modal in `AdminConsoleView.tsx` with client-side validation and audit log integration. |
| **B4** | Inconsistency | Test file casing and catch-all test files (`woodenSignboard.test.tsx`, `pixelSprites.test.tsx`). | **Fixed** | Phase 5 (`424ac41`) | Renamed to `WoodenSignboard.test.tsx` and `PixelSprites.test.tsx` (PascalCase), and extracted dedicated `PixelInputSlots.test.tsx` and `WoodenActionButton.test.tsx`. |
| **B5** | Inconsistency | Declared dependency versions (`lucide-react: ^1.46.0`) and version pins. | **Fixed / Audited** | Phase 4 (`709cc77`) | Audited all packages against installed `node_modules` (verified modern Vite 8, TS 7, React 19). Pruned unused `autoprefixer`. Documented in `docs/DEPENDENCY_NOTES.md`. |
| **C1** | High Bug | `admin_abort_game` did not reset team cash, CV, businesses, or bankruptcy status back to LOBBY baseline. | **Fixed** | Phase 2 (`b5566ca`) & Phase 6 | Created migration `0013_fix_admin_abort_reset.sql` with full team state reset (cash=1000, cv=0, bankrupt=false, tiebreak=NULL, businesses deleted, version incremented). Disambiguated `p_room_id` parameter. Verified with 16 pgTAP tests. |
| **C2** | Bug Verification | Verify `GAME_ABORTED` activity event handling across UI filters and activity log. | **Verified & Fixed** | Phase 2 (`b5566ca`) | Added `GAME_ABORTED` formatting in `src/domain/activityText.ts` and added event type to `SYSTEM` filter in `ActivityLog.tsx`. |
| **D1** | Security | `vercel.json` production CSP whitelisted `localhost` and `127.0.0.1` loopback addresses in `connect-src`. | **Fixed** | Phase 4 (`709cc77`) | Removed loopback/localhost entries from `vercel.json`. Kept `'self'`, `https://*.supabase.co`, and `wss://*.supabase.co`. |
| **D2** | Security | Full audit of RLS, admin auth, PIN gating, and optimistic locking. | **Verified** | Phase 4 & Phase 6 | Confirmed deny-by-default RLS, strict `is_admin()` checks, PIN isolation via `team_claims`, and optimistic locking. 100% pass across 112 pgTAP database security tests. |

---

## Verification Test Results

### 1. Database pgTAP Test Suite (`supabase test db`)
```text
/supabase/tests/0001_schema_test.sql ............ ok (21 tests)
/supabase/tests/0002_functions_test.sql ......... ok (31 tests)
/supabase/tests/0003_admin_authz_test.sql ....... ok (44 tests)
/supabase/tests/0004_admin_abort_game_test.sql .. ok (16 tests)
All 4 test files successful. Total 112 tests passed (100% green).
```

### 2. Frontend Vitest Suite (`npm test`)
```text
Test Files  40 passed (40)
     Tests  238 passed (238)
```

### 3. TypeScript Typecheck (`npm run typecheck`)
```text
> tsc --noEmit
0 errors. Clean pass with noUnusedLocals and noUnusedParameters enabled.
```

### 4. Production Build (`npm run build`)
```text
vite v8.3.0 building client environment for production...
dist/index.html                                 1.64 kB │ gzip:  0.71 kB
dist/assets/index-BNLenjDi.css                108.63 kB │ gzip: 19.19 kB
dist/assets/rolldown-runtime-CbXtAM7H.js        0.58 kB │ gzip:  0.36 kB
dist/assets/teams-BKsF2ZYE.js                   1.07 kB │ gzip:  0.65 kB
dist/assets/AdminRoomHistoryPage-zBqaKaW5.js    3.42 kB │ gzip:  1.52 kB
dist/assets/AdminHistoryPage-VonavdkG.js        3.91 kB │ gzip:  1.49 kB
dist/assets/AdminLoginPage-HEcnpIgb.js          4.18 kB │ gzip:  1.78 kB
dist/assets/AdminDashboardPage--sB6tfqP.js      8.05 kB │ gzip:  2.94 kB
dist/assets/ActivityLog-CuiwA9-n.js            11.48 kB │ gzip:  3.77 kB
dist/assets/AdminRoomPage-BNr9RlHA.js         122.60 kB │ gzip: 24.81 kB
dist/assets/index-Dv1s1Mz8.js                 290.68 kB │ gzip: 84.15 kB
dist/assets/ui-CO85jLt9.js                    396.52 kB │ gzip: 94.81 kB
Built in ~760ms. Output bundles clean and optimized.
```

---

## Intentionally Preserved Architectural Decisions
- **Visual Art Metaphor**: The open-air landing scenery (`SkyLayer`, `PixelWorld`, `Founder`) and the grounded entry scenery (`WoodenSignboard`, `CastleBackground`, `PlainsBackground`) were intentionally kept distinct rather than merged. Moving from the open world to a wooden signpost or castle keep fits the physical board game metaphor.
- **Dependency Line**: The installed dependencies (`typescript@7.0.2`, `vite@8.3.0`, `@supabase/supabase-js@2.116.0`, `tailwindcss@4.3.3`) match the genuine installed environment and were preserved without forced downgrades.
