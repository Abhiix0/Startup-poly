# STARTUPOLY — Full Repo Audit + Remediation Plan

Scope: the whole repository (frontend, `supabase/**`, scripts, config) — not just the landing page. Everything below was verified against the actual code in this zip: `npm ci` + `npm run build` (`tsc && vite build`) succeed, `npm run typecheck` passes, `npm test` baseline is green. Nothing was modified while auditing.

## Findings

### A. Dead code

| # | Finding | Evidence |
|---|---|---|
| A1 | `lucide-react`, `tailwind-merge`, `clsx` are declared dependencies with **zero usages anywhere in `src/`** (all icons/scenery are hand-built inline SVG; class merging is done with template literals). | `grep -rn "lucide-react\|tailwind-merge\|from 'clsx'" src` → no hits. |
| A2 | `src/ui/pixel/PixelMascot.tsx` is exported from `src/ui/pixel/index.ts` but never imported/rendered anywhere else in the app. | `grep -rn "PixelMascot" src` → only its own file + the barrel export. |
| A3 | `supabase/patches/001_fix_standings_add_abort.sql` is a manually-run hotfix whose entire contents (rewritten `room_standings`, the status-transition trigger, the `GAME_ABORTED` constraint value, and `admin_abort_game`) are **already present** in `0001_schema.sql` / `0011_perf_indexes.sql` / `0012_admin_abort_game.sql` and rolled into `all_migrations.sql`. It's stale and dangerous if anyone re-runs it: it would silently redefine `room_standings`/`admin_abort_game` from an older, uncoordinated copy that doesn't know about anything added after it. | Content diff between the patch file and migrations 0001/0011/0012 — same functions, same constraint list, already superseded. |
| A4 | `tsconfig.json` sets `noUnusedLocals: false` and `noUnusedParameters: false`. This is exactly why A1/A2-style dead code can accumulate invisibly — the compiler is configured not to flag it. | `tsconfig.json`. |

### B. Inconsistencies

| # | Finding | Evidence |
|---|---|---|
| B1 | `PixelLogo.tsx` animates its two `PixelStar` sprites with Tailwind's built-in `animate-bounce` utility — a **constant** loop. Every other decorative animation in the app is a custom `.anim-*` class specifically enumerated in the shared `prefers-reduced-motion` block; `animate-bounce` is a different Tailwind-generated class name and is not part of that inventory, so it breaks both the project's own "no constant bouncing" convention and its reduced-motion guarantee. | `src/ui/pixel/PixelLogo.tsx` uses `className="... animate-bounce"`; the custom keyframe/reduced-motion inventories elsewhere never mention it. |
| B2 | Two unrelated visual-art systems exist side by side: the landing page's own scenery stack (`SkyLayer`, `PixelWorld`, `DistantHillsAndCastle`, `FloatingPlatforms`), and a completely different "wooden sign / castle / plains / roaming character" system used only on `AdminLoginPage` and `TeamJoinPage` (`WoodenSignboard`, `WoodenActionButton`, `CastleBackground`, `PlainsBackground`, `RoamingCharacter`). Nothing shares components between them. | File usage grep across `src/routes/public/**` vs `AdminLoginPage.tsx`/`TeamJoinPage.tsx`. |
| B3 | `admin_abort_game` is called from the UI with a **hardcoded** note (`'Game aborted — accidental start'`) instead of an admin-entered reason — every other correction-style admin action in the app requires the admin to type their own note. | `src/routes/admin/console/AdminConsoleView.tsx` abort-confirm handler. |
| B4 | Inconsistent test file casing/organization: `woodenSignboard.test.tsx` (lowercase) next to a `WoodenSignboard.tsx` component, and `pixelSprites.test.tsx` as one catch-all file rather than the per-component pattern used everywhere else. | File listing. |
| B5 | `package.json` pins dependency versions that don't correspond to any real release line for that package — most notably `"lucide-react": "^1.46.0"` (lucide-react has only ever shipped a `0.x` line). Combined with A1 (it's unused anyway) this is low-impact today, but if someone later actually imports it, or runs a clean install against the real registry, this version range may not resolve at all. | `package.json` dependencies block. |

### C. Bugs

| # | Finding | Severity | Evidence |
|---|---|---|---|
| C1 | **`admin_abort_game` does not reset team state.** It flips `rooms.status` back to `LOBBY` and clears `started_at`/`ends_at`, but never touches `teams.cash`, `teams.cv`, or `team_businesses`. `admin_start_game` (the function that starts the *next* attempt) also never resets team rows — it only checks room status/claims and sets the clock. So any cash/CV/business edits an admin recorded during the mistakenly-started window (rent, purchases, upgrades…) **silently survive** into the real match once it's actually started. This defeats the entire stated purpose of the abort feature. | High | `supabase/migrations/0012_admin_abort_game.sql` (no team mutation) + `admin_start_game` in `0008_functions_admin.sql` (no team reset on LOBBY→ACTIVE). |
| C2 | Unverified, needs a fresh look: whether `GAME_ABORTED` activity events are handled correctly everywhere the activity log/history UI enumerates or filters event types, since it's a later addition layered on top of the original event-type list. | To verify | Flagged for Phase 1's audit; not yet independently reproduced as broken. |

### D. Security / loopholes

| # | Finding | Severity | Evidence |
|---|---|---|---|
| D1 | `vercel.json`'s Content-Security-Policy — the header actually deployed to production — permanently whitelists `http://127.0.0.1:*`, `ws://127.0.0.1:*`, `http://localhost:*`, `ws://localhost:*` in `connect-src`. That's local-dev scaffolding shipped into every real user's browser CSP, unnecessarily widening what a compromised script on the page could talk to. | Medium | `vercel.json` `Content-Security-Policy` header. |
| D2 | Everything else re-checked this pass still holds up: RLS is deny-by-default, admin authorization runs through the `admins` table via `is_admin()` (not client claims), team access is PIN-gated and isolated via `team_claims`, no service-role key appears anywhere in `src/`, and the previously-identified admin-auth races (logout/expired-session handling, `is_admin` RPC-failure fallback) have been fixed in the current `src/data/{auth.tsx,client.ts}`. | — | Re-inspected `resolveRole`/`onAuthStateChange`/`intentionalSignOutRef` in `src/data/auth.tsx`. |

---

## Phases

```text
P1  Dead-code & dependency cleanup (A1–A4) — low risk, mechanical
 ↓
P2  Fix the game-breaking abort bug (C1) + verify C2 + fix B3
 ↓
P3  Animation/reduced-motion consistency pass (B1)
 ↓
P4  Security & config hardening (D1) + dependency version audit (B5)
 ↓
P5  Cross-page visual-language decision + consistency fixes (B2, B4)
 ↓
P6  Full regression, stricter tsconfig, final report
```

Work on a branch. After each phase: `npm run typecheck && npm test && npm run build`, then move on. Do not start a phase until the previous one is green.

---

### PHASE 1 PROMPT — Dead-code & dependency cleanup

```text
OBJECTIVE
Remove verified dead code and unused dependencies from the STARTUPOLY repo, retire a stale/dangerous SQL hotfix file, and tighten tsconfig so this class of dead code can't silently reaccumulate. Low-risk, mechanical changes only — no feature work.

CONTEXT
STARTUPOLY is a physical board game's live-scoreboard website (Vite + React 19 + TS + Tailwind 4 + Supabase). An audit found: (1) lucide-react, tailwind-merge, clsx declared in package.json dependencies with zero usages anywhere in src/; (2) src/ui/pixel/PixelMascot.tsx exported from src/ui/pixel/index.ts but never rendered anywhere; (3) supabase/patches/001_fix_standings_add_abort.sql is a manually-run hotfix whose entire content (room_standings rewrite, a status-transition trigger, the GAME_ABORTED constraint value, and admin_abort_game) is already present in supabase/migrations/0001_schema.sql, 0011_perf_indexes.sql, 0012_admin_abort_game.sql, and rolled into supabase/all_migrations.sql — it is now stale and re-running it risks overwriting those functions with an older, uncoordinated definition; (4) tsconfig.json has noUnusedLocals: false and noUnusedParameters: false, which is why this kind of dead code can hide.

EXACT REQUIREMENTS
1. Independently re-verify each finding before acting (grep the actual current source — do not trust this description blindly):
   - Confirm zero real usages of lucide-react, tailwind-merge, clsx in src/ (check imports, not just the word).
   - Confirm PixelMascot has no import/usage outside its own file and the barrel export.
   - Diff supabase/patches/001_fix_standings_add_abort.sql's three logical pieces (room_standings function body, the status-transition trigger, the activity_events type constraint list, admin_abort_game function body) against the current versions in 0001_schema.sql/0011_perf_indexes.sql/0012_admin_abort_game.sql/all_migrations.sql to confirm they are indeed superseded (identical or the patch is strictly older/less complete). If you find the patch file's room_standings or admin_abort_game body actually differs meaningfully from what's in the numbered migrations (e.g. a fix that was never carried forward), STOP and report the discrepancy instead of deleting — do not silently keep an unapplied fix.
2. If confirmed: remove lucide-react, tailwind-merge, and clsx from package.json dependencies; run npm install to update package-lock.json; grep once more afterward to be sure nothing broke.
3. If confirmed unused: delete src/ui/pixel/PixelMascot.tsx and PixelMascot.test.tsx if one exists, and remove its export line from src/ui/pixel/index.ts.
4. If confirmed superseded: delete supabase/patches/001_fix_standings_add_abort.sql and the now-empty supabase/patches/ directory if nothing else lives there. Add one line to supabase/README.md documenting that ad-hoc SQL patches are not used going forward — every change goes through a numbered migration in supabase/migrations/, and any future hotfix must be added as a new numbered migration (and reflected in all_migrations.sql) rather than a standalone patch file.
5. Enable noUnusedLocals: true and noUnusedParameters: true in tsconfig.json (use the `_`-prefix convention for intentionally-unused parameters if the codebase doesn't already have one — check first). Run npm run typecheck and fix every resulting error by removing the actual unused local/import/parameter (or prefixing intentionally-unused parameters with `_`) — do NOT silence errors with @ts-ignore or by re-disabling the flag. If the number of resulting errors is large, fix them all in this phase (it's mechanical, not a design decision) rather than deferring — this phase exists specifically to surface and clear this backlog once.
6. Double-check package.json's declared dependency versions for anything else that looks like an implausible/nonexistent release line for that package (beyond the three already removed) — if npm install is currently working against the existing lockfile, don't force any other version change in this phase, but list anything suspicious in a short docs/DEPENDENCY_NOTES.md for Phase 4 to properly investigate (that phase owns deliberate version auditing/upgrades; this phase only removes what's provably unused).

FILES TO INSPECT
package.json, package-lock.json, src/ui/pixel/{PixelMascot.tsx,index.ts}, supabase/patches/001_fix_standings_add_abort.sql, supabase/migrations/{0001_schema,0011_perf_indexes,0012_admin_abort_game}.sql, supabase/all_migrations.sql, supabase/README.md, tsconfig.json, full src/ tree (for the noUnusedLocals/Parameters cleanup).

FILES LIKELY TO MODIFY/CREATE
package.json, package-lock.json, src/ui/pixel/index.ts, delete src/ui/pixel/PixelMascot.tsx (+ its test if present), delete supabase/patches/001_fix_standings_add_abort.sql, supabase/README.md, tsconfig.json, any file touched by the noUnusedLocals/Parameters cleanup, docs/DEPENDENCY_NOTES.md (new).

DATA MODEL CHANGES
None (this phase deletes a redundant, already-superseded SQL file — it does not change the live schema, since its content is already applied via the numbered migrations).

UI REQUIREMENTS
None — zero visible change expected anywhere in the app.

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
None new; do not weaken anything while cleaning up.

ERROR HANDLING
N/A.

TESTS
Run the full existing suite unchanged and confirm 100% pass after every deletion/edit. Add a small grep-based regression test (or a one-off script step run manually and reported, if a test is awkward here) confirming lucide-react/tailwind-merge/clsx/PixelMascot no longer appear anywhere in src/ or package.json.

ACCEPTANCE CRITERIA
- The three unused dependencies are removed and npm ci still works cleanly.
- PixelMascot and the stale patch file are deleted (or, if a real discrepancy was found instead, it is clearly reported and NOT silently discarded).
- noUnusedLocals/noUnusedParameters are true and npm run typecheck is clean.
- npm run typecheck && npm test && npm run build all pass; app behavior/visuals are unchanged.

MUST NOT CHANGE
Any visible behavior or visual output of the app. Any migration's actual applied schema (only a redundant unapplied patch file is removed). Any route, RPC signature, or game logic.

VERIFICATION STEPS
1. rm -rf node_modules && npm ci
2. npm run typecheck && npm test && npm run build
3. grep -rn "lucide-react\|tailwind-merge\|from 'clsx'\|PixelMascot" src package.json → no matches.
4. ls supabase/patches → confirm removed (or directory gone).
```

---

### PHASE 2 PROMPT — Fix the abort-game state-reset bug

```text
OBJECTIVE
Fix the confirmed bug where aborting an accidentally-started match does not reset team state, so restarting the real match no longer inherits stale cash/CV/business data from the aborted attempt. Also require an admin-entered note for the abort action (consistency with every other correction-style action), and verify GAME_ABORTED is handled correctly everywhere the activity log/history UI processes event types.

CONTEXT
STARTUPOLY's admin_abort_game RPC (supabase/migrations/0012_admin_abort_game.sql) reverts an ACTIVE room back to LOBBY and clears started_at/ends_at, but does not touch teams.cash, teams.cv, or team_businesses. admin_start_game (supabase/migrations/0008_functions_admin.sql) also never resets team rows when transitioning LOBBY→ACTIVE — it only validates status/claims and sets the timer. Teams start a match at cash=1000, cv=0, zero businesses (see the teams table defaults and business rules already enforced elsewhere in the schema). The admin console calls rpcAdminAbortGame with a hardcoded note string today (src/routes/admin/console/AdminConsoleView.tsx) instead of letting the admin type one, unlike every other correction/destructive action in the console (which use a note-required modal pattern — check FinalizePanel/BankruptDialog/RemoveBusinessDialog for the existing pattern to reuse). Activity event types are enumerated with a CHECK constraint (public.activity_events, see 0001_schema.sql) and consumed by src/domain/activityText.ts and the admin activity log UI (src/routes/admin/console/{ActivityLog,ActivityRow}.tsx) and the history views (src/routes/admin/{AdminHistoryPage,AdminRoomHistoryPage}.tsx) — GAME_ABORTED was added after the original event-type list and needs verifying end to end.

EXACT REQUIREMENTS
1. Decide and implement the correct reset behavior for admin_abort_game: since an abort is defined as reverting "an accidentally started match" (i.e. treating the ACTIVE period as if it never happened), reset every team in the room back to its LOBBY-entry baseline as part of the same transaction: cash = 1000, cv = 0, is_bankrupt = false, tiebreak_order = NULL, and delete all team_businesses rows for that room. Increment each team's version column (the existing optimistic-concurrency column used by other admin_* functions) so any in-flight client edit referencing the old version correctly gets VERSION_CONFLICT rather than silently succeeding against stale state. Do this athomically in the same function/transaction as the status change (lock the room row FOR UPDATE first, as the function already does; also lock/update the team rows in a deterministic order, e.g. ORDER BY id, consistent with how other multi-row admin functions in this codebase avoid deadlocks — check admin_adjust in 0008_functions_admin.sql for the established pattern and follow it).
2. Write one BUSINESS_REMOVED-equivalent audit trail entry per removed business (reason 'CORRECTION', matching the pattern used elsewhere for corrections) OR, if that would be noisy for a full-team-wipe abort, a single grouped event is acceptable — check how other bulk actions in this codebase (e.g. bankruptcy) group their audit events and follow the same convention rather than inventing a new one. In addition to (or instead of, if it fully covers it) the existing single GAME_ABORTED event, ensure the log clearly reflects that team state was reset, not just that the room status changed.
3. Require a real note: change the admin_abort_game SQL function's note parameter to have no meaningful default (or keep a DEFAULT NULL and reject NULL/empty with an existing NOTE_REQUIRED-style error code, consistent with how other correction actions in this codebase enforce mandatory notes — check the established pattern, e.g. in edit functions that require a note after time-expiry corrections, and reuse the same error code/convention). Update the frontend: replace the hardcoded note string in AdminConsoleView.tsx's abort handler with a real text input in the existing abort confirmation modal (reuse the app's existing note-input UI pattern from another correction dialog rather than building a new one), disable the confirm button until a non-empty note is entered, and surface the NOTE_REQUIRED-equivalent error clearly if the backend rejects an empty one.
4. Verify GAME_ABORTED end to end: confirm src/domain/activityText.ts produces a sensible human-readable sentence for a GAME_ABORTED event (and for whatever new reset-related event type/shape you added in step 2, if you introduced one); confirm the admin activity log (ActivityLog/ActivityRow) renders it correctly with any relevant filter chips; confirm the admin history views don't choke on a room that was aborted-then-restarted (i.e. a room can go LOBBY→ACTIVE→LOBBY→ACTIVE→...→FINALIZED — check that nothing downstream assumes started_at is only ever set once, and that room_standings/finalize logic isn't affected by the intermediate abort). Fix anything broken found during this verification; if everything already handles it correctly, state that explicitly in your phase report rather than making speculative changes.
5. Add a pgTAP test (supabase/tests/) that: starts a room, joins the required teams, records a cash change, a CV change, and a business purchase for at least one team, calls admin_abort_game with a note, and asserts every team in the room is back to cash=1000/cv=0/zero businesses/not bankrupt, room status is LOBBY, started_at/ends_at are NULL, and calling admin_abort_game with an empty/NULL note is rejected. Also test that calling admin_start_game again afterward correctly starts a fresh match with the reset values still in place (i.e. starting doesn't need to do the resetting — aborting already did it).

FILES TO INSPECT
supabase/migrations/{0001_schema,0008_functions_admin,0012_admin_abort_game}.sql, supabase/all_migrations.sql, supabase/tests/*.sql, src/routes/admin/console/AdminConsoleView.tsx, src/routes/admin/console/{FinalizePanel,BankruptDialog,RemoveBusinessDialog}.tsx (for the existing note-input pattern), src/domain/activityText.ts, src/routes/admin/console/{ActivityLog,ActivityRow}.tsx, src/routes/admin/{AdminHistoryPage,AdminRoomHistoryPage}.tsx, src/data/rpc.ts.

FILES LIKELY TO MODIFY/CREATE
A new migration supabase/migrations/0013_fix_admin_abort_reset.sql (do NOT edit 0012 in place — this project's convention is additive numbered migrations; add a new one that CREATE OR REPLACE FUNCTIONs admin_abort_game with the corrected body), supabase/all_migrations.sql (append the same content, keeping it in sync per the convention you documented in Phase 1's README note), supabase/tests/ (new test file or addition to an existing one), src/routes/admin/console/AdminConsoleView.tsx (real note input, wired to the RPC), src/data/rpc.ts (update rpcAdminAbortGame's signature if the note parameter handling changes), src/domain/activityText.ts (only if step 4 finds a gap), tests.

DATA MODEL CHANGES
admin_abort_game's body changes (via a new migration) to reset team_businesses/teams as described; no table schema changes are anticipated (version/cash/cv/is_bankrupt/tiebreak_order columns already exist) — if you find the version column doesn't exist or doesn't behave as described, verify against the actual schema before assuming and adjust the plan accordingly, reporting the discrepancy.

UI REQUIREMENTS
The abort confirmation modal gets a required note textarea/input (reuse the existing pixel-styled input component used elsewhere, e.g. TextField), consistent with the visual language of other admin confirmation dialogs. No other UI changes.

STATE-MANAGEMENT REQUIREMENTS
No new client state beyond the note-input's local value and its validity for enabling/disabling the confirm button.

SECURITY REQUIREMENTS
admin_abort_game remains admin-only (is_admin() check unchanged); the note requirement is enforced server-side, not just client-side (a client bypass must still be rejected by the RPC).

ERROR HANDLING
NOTE_REQUIRED (or the equivalent existing error code) surfaces a clear message in the abort modal if somehow submitted empty; existing VERSION_CONFLICT semantics are preserved for any other in-flight team edit racing the abort.

TESTS
pgTAP as described in step 5. Vitest/Testing Library: abort modal's confirm button is disabled with an empty note and enabled once text is entered; submitting calls the RPC with the typed note (not the old hardcoded string); a NOTE_REQUIRED-style error from the RPC is displayed to the admin.

ACCEPTANCE CRITERIA
Aborting a match fully resets every team in that room to its starting baseline (cash/cv/businesses/bankrupt/tiebreak) in the same transaction as the status change; a note is required both client- and server-side; GAME_ABORTED (and any new event) render correctly in the activity log and don't break history views; a room that goes through LOBBY→ACTIVE→LOBBY→ACTIVE→FINALIZED works correctly end to end. npm run typecheck && npm test && npm run build pass; supabase db reset && supabase test db passes.

MUST NOT CHANGE
Any other admin_* function's behavior, RLS policies, the general shape of the activity log UI beyond what step 4 requires fixing, unrelated routes/UI.

VERIFICATION STEPS
1. supabase db reset && supabase test db
2. npm run typecheck && npm test && npm run build
3. Manual: create a room, join teams, start it, record a cash change + a business purchase for one team, abort with a note, confirm in Studio/psql that every team is back to 1000/0/no businesses, restart the room, confirm the fresh match starts clean.
4. Manual: try to abort with an empty note — confirm it's blocked both in the UI and if you bypass the UI and call the RPC directly with an empty note.
```

---

### PHASE 3 PROMPT — Animation / reduced-motion consistency pass

```text
OBJECTIVE
Bring every decorative animation in the app under the same reduced-motion guarantee and the same "no constant bouncing" convention already established for the app's custom .anim-* classes — starting with the confirmed gap (PixelLogo's use of Tailwind's animate-bounce) and then auditing for any other Tailwind animate-* utility usage that isn't covered the same way.

CONTEXT
STARTUPOLY's decorative motion is built as custom .anim-* CSS classes in src/index.css, all covered by a shared prefers-reduced-motion: reduce block that disables them and shows final states instantly. PixelLogo.tsx uses Tailwind's built-in animate-bounce utility on its two PixelStar sprites instead of a custom class — this loops constantly and is not part of the existing reduced-motion inventory (verify precisely: check whether the current global reduced-motion rule's selector list happens to already include .animate-bounce or any Tailwind-generated animation utility; if it does, this may be a smaller fix than expected — verify first, don't assume).

EXACT REQUIREMENTS
1. Grep the entire src/ tree for every Tailwind animate-* utility class (animate-bounce, animate-spin, animate-pulse, animate-ping, or any custom Tailwind 4 @theme animation utility) used anywhere, not just PixelLogo — list every occurrence with its file and component.
2. For each occurrence found: decide whether the motion is (a) intentional and appropriate to keep as a rare/low-key accent (per the app's established "ambient motion should be slow, sparse, and reduced-motion-safe" convention seen elsewhere in the codebase — e.g. LiveIndicator's pulse, coin idle-spin) — if so, replace the Tailwind utility with a custom .anim-* class matching the existing naming/behavior convention (so it's covered by the shared reduced-motion block and any tab-visibility pausing mechanism already in place, e.g. data-paused handling if that pattern exists — check src/lib/usePageVisibility.ts and where its data-paused attribute is consumed), or (b) too constant/attention-grabbing for a decorative pixel-icon accent — if so, tone it down (e.g. a slow, rare shimmer rather than a continuous bounce) using the same custom-class approach.
3. Specifically for PixelLogo's two stars: replace animate-bounce with a custom class consistent with the rest of the app's sparse "twinkle"/"idle" style accents (do not remove the motion entirely unless the codebase's existing convention for similarly-decorative elements is fully static — check comparable elements like PixelSparkle for the established pattern to match, rather than inventing a new one).
4. Ensure the shared prefers-reduced-motion block's selector list is updated to include every newly-added/renamed class from this phase, and that nothing from this phase relies on JavaScript to disable itself under reduced motion (CSS-only, matching the existing pattern).
5. If the app has a tab-visibility pausing mechanism (data-paused or similar, from usePageVisibility), extend its selector coverage to include the same newly-touched classes if it's meant to be comprehensive for all ambient motion — verify what the existing coverage actually includes before assuming a gap, and only add what's genuinely missing.
6. Do a final full-repo grep confirming no animate-bounce/animate-spin/animate-pulse/animate-ping (or any other un-vetted Tailwind animation utility) remains anywhere in src/ outside of a short allowlist you explicitly justify in your phase report (e.g. a loading spinner using animate-spin might be a legitimate, deliberate exception if the app has one and it's appropriately scoped/covered — check PixelLoader for whether it already has its own justified motion pattern before flagging it as a violation).

FILES TO INSPECT
Full src/ tree (grep for animate- utilities), src/index.css (existing reduced-motion block, existing .anim-* naming conventions, PixelSparkle/LiveIndicator/PixelCoin for the established "sparse accent" style), src/ui/pixel/{PixelLogo,PixelStar,PixelSparkle}.tsx, src/lib/usePageVisibility.ts and its consumers, src/ui/PixelLoader.tsx.

FILES LIKELY TO MODIFY/CREATE
src/ui/pixel/PixelLogo.tsx (and any other component found using a Tailwind animate- utility), src/index.css (new/renamed custom classes + reduced-motion/pause coverage), tests.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
Motion stays subtle and consistent with the app's existing sparse-accent style; nothing should look busier after this phase — if anything, PixelLogo's stars should read calmer than the constant Tailwind bounce did before.

STATE-MANAGEMENT REQUIREMENTS
None — CSS-only, matching the existing approach.

SECURITY REQUIREMENTS
None.

ERROR HANDLING
N/A.

TESTS
Vitest: a grep-based test asserting no animate-bounce/animate-spin/animate-pulse/animate-ping (or the specific list you audit) appears anywhere in src/ outside your explicitly justified allowlist; a test confirming the reduced-motion CSS block's selector text includes every class this phase introduced or renamed (parse the stylesheet source or assert against a known list); a render test for PixelLogo confirming its stars use the new custom class, not the Tailwind utility.

ACCEPTANCE CRITERIA
Every decorative animation in the app is a custom class covered by the shared reduced-motion rule; no unvetted Tailwind animate-* utility remains; PixelLogo's stars read as a subtle, sparse accent consistent with the rest of the app rather than a constant bounce; toggling OS reduced-motion now correctly stills the logo stars too. npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
Any non-animation visual property, layout, routes, backend/game logic. Any animation this phase's audit confirms is already correctly handled (don't touch what isn't broken).

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. grep -rnE "animate-(bounce|spin|pulse|ping)" src — review every remaining hit against your documented allowlist.
3. Toggle OS reduced-motion, reload the landing page and the login/join pages — confirm the logo stars (and anything else touched) go still along with everything else.
```

---

### PHASE 4 PROMPT — Security & config hardening

```text
OBJECTIVE
Remove local-development scaffolding from the production Content-Security-Policy, and do a deliberate, careful audit of package.json's dependency version pins (following up on Phase 1's docs/DEPENDENCY_NOTES.md) to catch any other implausible/incorrect version range before it causes a broken install.

CONTEXT
STARTUPOLY's vercel.json defines the CSP header actually served to real users in production. Its connect-src currently includes http://127.0.0.1:*, ws://127.0.0.1:*, http://localhost:*, ws://localhost:* alongside the legitimate https://*.supabase.co / wss://*.supabase.co entries — the loopback entries are local-dev-only and should never reach production users' browsers. Phase 1 removed lucide-react/tailwind-merge/clsx (which had an implausible lucide-react version) and logged any other suspicious version pins it noticed into docs/DEPENDENCY_NOTES.md without changing them.

EXACT REQUIREMENTS
1. Split the CSP so loopback/localhost entries in connect-src are never present in what's actually deployed to production. Since vercel.json's headers apply to the deployed site, remove the http://127.0.0.1:*, ws://127.0.0.1:*, http://localhost:*, ws://localhost:* entries from its connect-src, keeping only https://*.supabase.co and wss://*.supabase.co (plus 'self'). Verify separately (do not assume) whether local development actually needs any CSP relaxation to function — Vite's dev server typically isn't subject to vercel.json's headers at all (those are Vercel-platform-level headers, not something the Vite dev server enforces), so confirm whether removing these entries has any effect on `npm run dev` before finalizing; if local dev does break because of some other mechanism applying these headers, add a clearly-commented, environment-gated alternative (e.g. a separate local-only header config, or a documented note in README about why local dev is unaffected) rather than leaving the production policy permanently widened.
2. Read docs/DEPENDENCY_NOTES.md from Phase 1 and, for every dependency it flagged as suspicious, independently verify against what you actually know about that package's real release history/line whether the pinned version range is plausible. For any confirmed-implausible pin: correct it to a real, appropriate version for this project's React 19 / Vite / TypeScript stack, run npm install, and run the full build+test suite to confirm nothing breaks from the version correction. If you cannot be confident whether a version is real (e.g. a very recent release you're unsure about), say so explicitly in your phase report rather than guessing — do not silently change a version you're not sure is wrong.
3. While in package.json, do a final pass confirming every remaining dependency is still actually used (a quick repeat of Phase 1's zero-usage grep check, now that Phase 1's own changes have landed) — remove anything else found unused, following the same verify-before-delete discipline as Phase 1.
4. Skim the rest of vercel.json's headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, Strict-Transport-Security) for correctness and completeness given this is a Supabase-backed SPA — note but do not over-engineer; only change something if it's clearly wrong or missing something standard for this kind of deployment (e.g. confirm frame-ancestors 'none' and X-Frame-Options: DENY aren't contradicting anything the app actually needs, like an embedded iframe use-case — check whether the app embeds anything or is ever meant to be embedded before assuming DENY is correct, though it almost certainly is for this kind of admin/team tool).

FILES TO INSPECT
vercel.json, docs/DEPENDENCY_NOTES.md (from Phase 1), package.json, README.md (for any documented local-dev CSP assumptions).

FILES LIKELY TO MODIFY/CREATE
vercel.json, package.json, package-lock.json, docs/DEPENDENCY_NOTES.md (update with resolution notes — what was fixed, what was left as uncertain and why).

DATA MODEL CHANGES
None.

UI REQUIREMENTS
None.

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
Production CSP no longer references loopback/localhost addresses. No functional regression to the app's actual Supabase connectivity (https/wss to *.supabase.co must remain intact and working).

ERROR HANDLING
N/A.

TESTS
No new automated tests are expected for a header config file, but manually verify the deployed/previewed app can still successfully connect to Supabase (a build+preview smoke test hitting a real or local Supabase instance) after the CSP change. Re-run the full existing suite after any dependency version corrections.

ACCEPTANCE CRITERIA
vercel.json's connect-src contains no loopback/localhost entries; the app still functions correctly against Supabase in a preview/build; any corrected dependency version installs cleanly and the app still builds/tests/passes; docs/DEPENDENCY_NOTES.md reflects the final, honest state of every flagged item (fixed, or explicitly left as "uncertain, needs manual verification against the npm registry"). npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
Legitimate Supabase connect-src entries; any other unrelated app behavior; any migration/game logic.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. npm run preview and confirm the app still successfully talks to Supabase (network tab shows successful requests to *.supabase.co, nothing blocked by CSP in the browser console).
3. Review the final vercel.json header block for correctness.
4. rm -rf node_modules && npm ci to confirm any corrected dependency versions install cleanly from a clean state.
```

---

### PHASE 5 PROMPT — Cross-page visual-language decision + consistency fixes

```text
OBJECTIVE
Make a deliberate, documented decision about the two coexisting visual-art systems (the landing page's sky/world scenery vs. the admin-login/team-join "wooden sign + castle/plains + roaming character" system), and apply only the consistency fixes that decision calls for — without triggering a full redesign of either system.

CONTEXT
STARTUPOLY's landing page uses one scenery system (SkyLayer, PixelWorld, DistantHillsAndCastle, FloatingPlatforms). AdminLoginPage and TeamJoinPage use a completely different one (WoodenSignboard, WoodenActionButton, CastleBackground/PlainsBackground, RoamingCharacter) that shares no components with the landing page. This may be entirely intentional — a login/join screen framed as "entering a specific room in the world" (a castle gate for admin, open plains for teams) is a reasonable game-world metaphor distinct from the open-world landing page — or it may simply be organic drift from being built in separate passes. This phase does NOT assume which; it investigates, decides, documents, and then applies only the smallest fixes the decision actually requires. Do not redesign either system wholesale in this phase.

EXACT REQUIREMENTS
1. Compare the two systems specifically on: color palette usage (do both stay within the official 7-color palette + any previously-approved small extension tokens, or has one drifted into ad hoc hex values?), button/press physics (do WoodenActionButton and the landing page's ArcadeLink feel like the same "arcade button" language, or noticeably different?), border/shadow style (pixel-chunky vs. something else), and animation conventions (does WoodenSignboard/RoamingCharacter/CastleBackground/PlainsBackground follow the same reduced-motion and "sparse ambient motion" conventions established elsewhere and reinforced in Phase 3, or do they have their own separate, possibly-uncovered animations?).
2. Write a short docs/VISUAL_LANGUAGE_DECISION.md stating: (a) whether the two systems' divergence is being kept as an intentional "different room in the world" metaphor, or should be unified, with your reasoning; (b) a list of any objectively-wrong inconsistencies regardless of that decision (e.g. an off-palette hex value, a button that doesn't share the same press-physics timing/feel, an animation not covered by the reduced-motion block) that should be fixed either way.
3. If keeping them intentionally distinct: fix only the objective inconsistencies from step 2(b) — e.g. bring any off-palette color back onto the token system, ensure WoodenActionButton's press feedback uses the same underlying timing/easing convention as ArcadeLink even if styled differently, ensure every animation in CastleBackground/PlainsBackground/RoamingCharacter/WoodenSignboard is covered by the shared reduced-motion rule (extending its selector list as needed, same pattern as Phase 3). Do not merge the component systems.
4. If unifying: propose (in the doc) which system becomes the base for both contexts and roughly what would need to change — but only actually implement this in the current phase if the required change is small and low-risk (e.g. swapping one button component while keeping the surrounding scenery); if it's a substantial rebuild of either login/join page or the landing page, explicitly scope that as a follow-up phase/prompt in the doc rather than attempting it here, and instead apply only step 2(b)'s objective fixes in this phase.
5. Fix the test-file casing inconsistency found in the audit (woodenSignboard.test.tsx vs WoodenSignboard.tsx component naming, and the single catch-all pixelSprites.test.tsx) by renaming to match the project's dominant convention (PascalCase matching the component, one test file per component where that's the norm) — verify what the dominant convention actually is across the existing test suite before renaming, and do it consistently.
6. Fix the hardcoded-note admin_abort_game UI issue only if Phase 2 hasn't already addressed it (it should have — verify and skip if already done).

FILES TO INSPECT
src/routes/public/{LandingPage,SkyLayer,PixelWorld,DistantHillsAndCastle,FloatingPlatforms}.tsx, src/routes/admin/AdminLoginPage.tsx, src/routes/team/TeamJoinPage.tsx, src/ui/pixel/{WoodenSignboard,WoodenActionButton,CastleBackground,PlainsBackground,RoamingCharacter}.tsx, src/ui/ArcadeLink.tsx, src/index.css (palette tokens, reduced-motion block), the full test file listing under src/ for naming-convention comparison.

FILES LIKELY TO MODIFY/CREATE
docs/VISUAL_LANGUAGE_DECISION.md (new), targeted fixes in whichever files step 3/4 identify (likely small edits to WoodenActionButton/CastleBackground/PlainsBackground/RoamingCharacter/WoodenSignboard for palette/animation/reduced-motion coverage), renamed test files per step 5, tests.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
No visible redesign unless step 4's small-and-low-risk bar is met and explicitly chosen; otherwise, fixes are corrective only (palette/animation/consistency), not aesthetic changes.

STATE-MANAGEMENT REQUIREMENTS
None new.

SECURITY REQUIREMENTS
None.

ERROR HANDLING
N/A.

TESTS
Grep-based test confirming no off-palette hex values remain in the touched components (reuse the pattern from earlier phases if one exists, or add a scoped version for these specific files); reduced-motion coverage test extended to any newly-covered animation classes; test file renames carry their existing test content forward unchanged (no test logic should change, only file names/paths).

ACCEPTANCE CRITERIA
docs/VISUAL_LANGUAGE_DECISION.md clearly states the decision and reasoning; every objective inconsistency identified in step 2(b) is fixed; test file naming is consistent across the whole suite; no unintended visual redesign occurred. npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
The core identity/content of either visual system beyond the specific objective fixes decided in this phase; routes; backend/game logic.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. Visual check of /, /admin/login, /join at 360px and 1440px — confirm only the intended small fixes changed anything, nothing else shifted.
3. Toggle OS reduced-motion on /admin/login and /join specifically — confirm CastleBackground/PlainsBackground/RoamingCharacter/WoodenSignboard now correctly go still if they weren't already covered.
```

---

### PHASE 6 PROMPT — Full regression, stricter checks, final report

```text
OBJECTIVE
Run a full regression pass across the whole app after Phases 1–5, confirm nothing was missed, and produce a final written summary of everything found and fixed in this audit cycle.

CONTEXT
Phases 1–5 removed dead code and an unused/dangerous SQL patch file, fixed the admin_abort_game team-state-reset bug and required a real note for it, unified animation/reduced-motion handling (including PixelLogo's stars), hardened the production CSP and reviewed dependency versions, and made a documented decision about the two visual-language systems plus fixed the objective inconsistencies between them. This phase is verification and small fixes only — no new features, no further redesign.

EXACT REQUIREMENTS
1. Run the complete test suite (unit + any Playwright/E2E present) and confirm 100% pass. Re-run supabase test db against a fresh supabase db reset to confirm every pgTAP test (including the new one from Phase 2) passes.
2. Full-repo re-grep for every category from the original audit to confirm nothing regressed or was missed: unused imports of the removed dependencies; any remaining reference to PixelMascot or the deleted patch file; any remaining unvetted Tailwind animate-* utility; any remaining loopback/localhost entry in vercel.json; any off-palette hex value in the components touched by Phase 5.
3. Click through the full user journey manually end to end at least once: /  → /join → team dashboard (as a team), and / → /admin/login → create room → lobby → start → console (cash/CV/business edits, a quick action, the activity log) → abort a test room and confirm the reset behavior from Phase 2 → start again → finalize → leaderboard → history. Confirm nothing from Phases 1–5 broke any part of this flow.
4. Confirm the build output size hasn't regressed unexpectedly (removing three unused dependencies in Phase 1 should keep it flat or slightly smaller; report the before/after if you have Phase 1's original numbers, otherwise just report the current numbers).
5. Write docs/AUDIT_REMEDIATION_SUMMARY.md: a table of every finding from the original audit (A1–A4, B1–B5, C1–C2, D1–D2), its resolution (fixed / decided-to-keep-as-is with reasoning / needs-further-follow-up), and which phase addressed it. Call out explicitly anything that was intentionally NOT changed and why (e.g. the visual-language decision from Phase 5 if it chose to keep the systems distinct).

FILES TO INSPECT
Everything touched across Phases 1–5; the full test suite; docs/{DEPENDENCY_NOTES,VISUAL_LANGUAGE_DECISION}.md.

FILES LIKELY TO MODIFY/CREATE
docs/AUDIT_REMEDIATION_SUMMARY.md (new). Only fix genuinely broken things this phase's testing surfaces — no new features.

DATA MODEL CHANGES
None expected; only if this phase's regression testing surfaces a real defect from an earlier phase, fixed via a new migration with a test, same discipline as Phase 2.

UI REQUIREMENTS
None beyond fixing anything broken.

STATE-MANAGEMENT REQUIREMENTS
None new.

SECURITY REQUIREMENTS
Final confirmation that RLS/admin-auth/CSP are all still correct after every phase's changes.

ERROR HANDLING
N/A.

TESTS
Full suite run, 100% pass. Any gap found gets a new targeted test, not just a manual note.

ACCEPTANCE CRITERIA
Full test suite green; full pgTAP suite green; the complete manual user journey works end to end with no regressions; docs/AUDIT_REMEDIATION_SUMMARY.md is complete and honest about what was fixed vs. deliberately left as-is. npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
Nothing beyond fixes genuinely required by this phase's regression testing.

VERIFICATION STEPS
1. supabase db reset && supabase test db
2. npm run typecheck && npm test && npm run build
3. Full manual click-through of the end-to-end journey described in step 3.
4. Final grep sweep per step 2.
```
