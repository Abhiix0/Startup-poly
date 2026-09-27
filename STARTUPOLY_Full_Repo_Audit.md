# STARTUPOLY — RPC Fix & Palette Unification Plan (revised)

Same underlying audit as before, with the Mario-removal phase dropped — the Mario/mushroom art is being kept intentionally, so the earlier IP-cleanup phase is no longer part of this plan. Everything else carries over, renumbered.

## Findings this plan addresses

### A. High — the admin "Abort Game" RPC is broken in production

`supabase/migrations/0013_fix_admin_abort_reset.sql` renamed the function's parameter `room_id` → `p_room_id`. `src/data/rpc.ts`'s `rpcAdminAbortGame` still calls `callRpc('admin_abort_game', { room_id, note })` — a named-parameter mismatch that PostgREST will reject. Every real call from the browser fails; the console's Abort button is non-functional. The existing pgTAP test calls the function positionally, so it passed anyway and hid the break.

### B. Color system — sprawling tokens, near-zero adoption

`index.css`'s `@theme` block defines 60+ color tokens across ad hoc "zones" (`sky-*`, `navy-*`, `gold-*`, `pipe-*`, `brick-*`, `block-*`, `parchment-*`, `metal-*`, `wood-*`, `castle-*`, `mountain-*`, `team-1..6`) — many of them near-duplicates of each other or of the 7 real brand colors (e.g. `castle-stone` and `metal-deep` are both `#334155`; `green-retro` duplicates `nes-green`; `flag-red` duplicates `nes-red`). Despite the block's own comment claiming this is *"Unified across Landing, Join & Admin pages,"* a repo-wide grep found raw hex literals in **116 files** — components paste colors directly instead of referencing any token. The 7 official brand hexes (`#102040`, `#FFCC00`, `#22B14C`, `#D32F2F`, `#FFFFFF`, `#B84418`, `#5C94FC`) are the most-used values by count, but they're diluted among dozens of off-palette grays/ambers/blues/greens/reds and skin tones that no design decision ever approved. This is what you're asking to fix: the landing page's palette should be the one and only palette used everywhere.

Note: `--color-team-1: #E52521` (one of the six default team-color swatches) happens to be Mario's exact red. Since Mario is being kept intentionally, this is left as-is in this plan rather than flagged for change — mention it if you want it swapped later, otherwise no action needed.

---

## Phases

```text
P1  Fix the broken admin_abort_game RPC call (production regression)
 ↓
P2  Consolidate the color system into one real token set
 ↓
P3  Migrate the shared UI library (src/ui/**) onto the tokens
 ↓
P4  Migrate the Admin routes onto the tokens
 ↓
P5  Migrate Team + Public/Landing routes onto the tokens; character skin-tone reconciliation
 ↓
P6  Full regression, permanent guardrail tests, final report
```

Work on a branch. After each phase: `npm run typecheck && npm test && npm run build`, visual check, then move on. Do not start a phase until the previous one is green.

---

### PHASE 1 PROMPT — Fix the broken admin_abort_game RPC call

```text
OBJECTIVE
Fix the parameter-name mismatch that currently makes the admin "Abort Game" feature fail every time it's actually used from the browser, and add a test that would have caught this class of bug (a real client→RPC call, not just a positional SQL call).

CONTEXT
supabase/migrations/0013_fix_admin_abort_reset.sql defines: CREATE OR REPLACE FUNCTION public.admin_abort_game(p_room_id uuid, note text DEFAULT NULL). src/data/rpc.ts's rpcAdminAbortGame calls callRpc('admin_abort_game', { room_id, note }) — a named-parameter object using the OLD parameter name room_id, which no longer matches the function signature. Supabase's PostgREST RPC endpoint matches JSON keys to the Postgres function's actual parameter names; a mismatch causes the call to fail (typically a "function not found" or schema-cache error) even though the function exists. The existing pgTAP test (supabase/tests/0004_admin_abort_game_test.sql) calls the function positionally (admin_abort_game(id, note)), which works regardless of parameter naming and is why this was never caught.

EXACT REQUIREMENTS
1. Fix the mismatch at whichever end is correct for this codebase's conventions: check how every OTHER admin_* RPC wrapper in src/data/rpc.ts names its first parameter (e.g. do they use team_id, room_id as their JS-side keys matching the SQL parameter names exactly, or is there an established p_-prefix convention elsewhere in the SQL functions that the JS layer already matches?). If the SQL layer's other functions do NOT use a p_ prefix convention, prefer reverting the SQL parameter name back to room_id (via a new migration, e.g. 0014_fix_abort_game_param_name.sql, using CREATE OR REPLACE FUNCTION with DROP FUNCTION IF EXISTS first exactly like 0013 did) for consistency with the rest of the codebase, rather than changing the JS call site — but if 0013's p_room_id rename was made for a real reason (e.g. to avoid an ambiguous-column-reference bug inside the function body against a table column also named room_id — check the function body for exactly this), keep the SQL name as p_room_id and instead fix ONLY the JS call site in rpc.ts to send { p_room_id: room_id, note } (keeping the exported TypeScript function's own parameter name room_id for callers, just fixing the key sent over the wire). Choose whichever fix is correct and least likely to reintroduce the ambiguous-reference bug 0013 may have been solving — inspect the function body's internal column references before deciding.
2. After fixing, re-verify the entire function body of admin_abort_game for any other internal ambiguous-reference risk (a plpgsql function with a parameter and a table column sharing a name is a classic source of "column reference is ambiguous" errors at runtime) — if you keep the p_ prefix, confirm it was applied consistently to avoid the exact bug it was meant to prevent; if you revert to room_id, use a fully-qualified table alias (e.g. rooms.id = admin_abort_game.room_id or an explicit table alias throughout) to avoid reintroducing that ambiguity.
3. Update supabase/all_migrations.sql to reflect the final, correct function definition (per this project's own documented convention from the prior audit's README note: every change goes through a numbered migration and is kept in sync in all_migrations.sql).
4. Add a real integration-level test that exercises the actual RPC call path the browser uses — not just a positional SQL call. If this repo has a mechanism for testing against a real local Supabase instance from the JS test suite (check for an existing pattern — e.g. a Playwright/E2E setup, or a vitest test that spins up/connects to a local Supabase and calls supabase.rpc(...) the same way the app does), add a test there that calls rpcAdminAbortGame(...) exactly as the frontend does and asserts it succeeds against a local Supabase instance. If no such integration-test mechanism exists yet, add the smallest reasonable one for this specific case (a vitest test file that, when run against a locally running `supabase start` instance, signs in a real admin and calls the actual exported rpcAdminAbortGame function) and document in the test file's header how to run it (env vars needed, that it requires a local Supabase instance) — this is worth establishing now specifically because this bug class (named-parameter drift between a Postgres migration and the JS RPC wrapper) is exactly what pgTAP's positional calls cannot catch.
5. Double-check every OTHER admin_* and public-facing RPC wrapper in src/data/rpc.ts against its corresponding SQL function signature in supabase/migrations/**, to make sure no other function has drifted in the same way (parameter renamed in a later migration without the JS wrapper being updated). Fix any other mismatch found using the same reasoning as step 1.

FILES TO INSPECT
supabase/migrations/{0008_functions_admin,0012_admin_abort_game,0013_fix_admin_abort_reset}.sql, supabase/all_migrations.sql, src/data/rpc.ts (every admin_* wrapper), supabase/tests/0004_admin_abort_game_test.sql, any existing E2E/integration test setup.

FILES LIKELY TO MODIFY/CREATE
A new migration (e.g. supabase/migrations/0014_fix_abort_game_param_name.sql) OR a targeted edit to src/data/rpc.ts (per the decision in step 1), supabase/all_migrations.sql, a new integration test file, supabase/tests/0004_admin_abort_game_test.sql (extend if needed to also verify the parameter name matches what the client sends, e.g. via an explicit named-argument call in addition to the positional one already there).

DATA MODEL CHANGES
Only the admin_abort_game function signature/body, via a new numbered migration if that's the chosen fix — never edit an already-applied migration file in place.

UI REQUIREMENTS
None — this is purely a bug fix, the Abort Game UI itself (built in the prior round) is presumably already correct and just needs its RPC call to actually succeed.

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
No change to is_admin() enforcement or the NOTE_REQUIRED validation — preserve exactly, only fix the parameter-name plumbing.

ERROR HANDLING
Confirm the frontend's existing error handling for this RPC call (toast/message on failure) still works correctly now that the call itself succeeds — verify the success path is what actually gets exercised, not just that errors are handled gracefully.

TESTS
The new integration test from step 4 (calling the real exported rpcAdminAbortGame against a local Supabase instance and asserting success + the expected team-reset side effects from the prior round's fix). Extend the pgTAP suite with a named-argument call form as well as the existing positional one, so a future rename is caught by pgTAP too, not just the new integration test. Re-run the full existing pgTAP suite (supabase test db) to confirm no other test relied on the old parameter name in a way that breaks.

ACCEPTANCE CRITERIA
Calling Abort Game from the actual admin console UI against a real local Supabase instance succeeds and correctly resets team state (cash/CV/businesses back to baseline, room back to LOBBY). Every other admin_* RPC wrapper in rpc.ts is confirmed to match its SQL function's actual current parameter names. npm run typecheck && npm test && npm run build pass; supabase db reset && supabase test db passes.

MUST NOT CHANGE
The NOTE_REQUIRED validation, is_admin() checks, the team-reset logic itself, any unrelated RPC.

VERIFICATION STEPS
1. supabase db reset && supabase test db
2. npm run typecheck && npm test && npm run build
3. Manual, end-to-end: run the app against a local Supabase instance, start a match, click Abort Game with a note, and confirm — in the actual browser, not just SQL — that it succeeds and the room returns to LOBBY with team state reset.
4. Re-grep every admin_* wrapper in rpc.ts against its migration-defined signature to confirm no other drift exists.
```

---

### PHASE 2 PROMPT — Consolidate the color token system

```text
OBJECTIVE
Replace the current sprawling, ~60-token color system in index.css with one small, deliberate, well-named set of tokens built from STARTUPOLY's actual 7-color brand palette plus only the semantic/utility extensions the app genuinely needs — producing the single source of truth that later phases will migrate every component onto. This phase changes the token definitions only; it does not yet touch component usage (that's Phases 3–5).

CONTEXT
STARTUPOLY's official brand palette (used on the landing page, and the standard everyone should converge on) is exactly 7 colors: Sky Blue #5C94FC, Arcade Green #22B14C, Coin Gold #FFCC00, Brick Brown #B84418, Card White #FFFFFF, Dark Navy #102040, Expense Red #D32F2F. index.css's current @theme block additionally defines 60+ tokens across ad hoc "zones" — sky-deep/mid/base/light/horizon, navy-deep/base/mid/surface, gold-base/hover/active/coin/sparkle/dark, pipe-green/body/dark/highlight/light, brick-base/dark/light, block-orange/gold/dark, parchment-base/light/card/border/text/muted, metal-surface/light/plate/border/mid/dark/deep, wood-dark/base/border/light/bright, castle-stone/shadow, flag-red/dark, mountain-front/mid/dark/deep, team-1..6 — many of which duplicate each other or the 7 base colors under different names (e.g. castle-stone and metal-deep are both #334155; green-retro duplicates nes-green; flag-red duplicates nes-red). A separate repo-wide grep found 116 files using raw hex literals instead of any of these tokens, across categories including: neutral grays (used for disabled states, borders, muted text — Tailwind-slate-style values like #64748B, #CBD5E1, #334155, #475569, #94A3B8, #1E293B, #F1F5F9), status/semantic colors (success greens like #4ADE80/#22C55E/#15803D, warning ambers like #FFFBEB/#92400E/#B45309/#D97706/#FEF3C7, danger/error reds like #FEECEB/#B91C1C/#991B1B/#F87171/#FEF2F2/#EF4444, info blues like #0B4FD7/#1E3A8A/#1E40AF/#0284C7/#3B82F6), and a handful of character/skin-tone colors used by pixel sprites (e.g. #FFD1A4, #FFC49A, #8B2500, #451A03 — these are legitimate sprite-art colors, not brand colors, and should remain as sprite-local constants rather than becoming global design tokens; do not try to force skin tones into the brand palette). Note: the character/mascot art (currently a Mario-style pixel character) and its signature colors, including the --color-team-1 team-color swatch, are being kept as-is intentionally — this phase is about the app's UI-chrome color system (backgrounds, borders, text, buttons, status indicators), not about the character art itself.

EXACT REQUIREMENTS
1. Independently re-run the hex-usage grep across src/ to get the current authoritative list of every distinct color in active use and roughly how many files/call-sites use each (this phase's decisions must be grounded in actual usage, not guesswork) — group them into: (a) the 7 official brand colors — keep exactly as-is; (b) neutral/gray scale used for text/borders/backgrounds/disabled states — design ONE small neutral scale (e.g. 5–7 steps from near-white to near-black, tinted toward the brand Navy rather than a generic slate, since the app's shadows/borders are already Navy-based) that can replace every ad hoc gray currently in use; (c) semantic status colors — design ONE success/warning/danger/info set, each tied conceptually to (and where reasonable, derived as a tint/shade of) the closest brand color (success → Arcade Green tints, danger → Expense Red tints, warning → Coin Gold tints, info → Sky Blue tints) rather than importing generic Tailwind ambers/blues that have nothing to do with the brand; (d) sprite-local skin-tone/character colors — leave these as local constants inside their own sprite components, not global tokens, since they're implementation details of specific pixel art, not reusable design decisions.
2. Rewrite index.css's @theme block: remove every "zone" token that is a pure duplicate of the 7 brand colors or of another zone token (document the exact list of removed tokens and what they map to going forward, in a comment block or docs/COLOR_SYSTEM.md — pick whichever this repo's convention favors, a codebase README/docs pattern already exists per prior phases, use it). Keep or introduce: the 7 brand tokens (name them clearly, e.g. --color-brand-sky, --color-brand-green, --color-brand-gold, --color-brand-brick, --color-brand-white, --color-brand-navy, --color-brand-red — or keep the existing --color-nes-* names if that's already the established convention other code might reference; check before renaming anything that's already in use, to minimize churn in this phase), the new neutral scale from step 1(b), the new semantic status set from step 1(c), and a small number of genuinely-necessary functional variants that aren't dead duplicates (e.g. a hover/active state of gold for buttons is a legitimate, non-duplicate need — keep functional variants like --color-gold-hover/--color-gold-active if they're actually consumed for interaction states, but rename/fold them under the new consolidated naming scheme rather than leaving them in their own disconnected "gold zone"). Leave the team-color swatch tokens (--color-team-1..6) untouched — they're out of scope for this phase.
3. Do NOT delete a token in this phase if doing so would break currently-compiling code without a replacement ready — since Phases 3–5 do the actual component migration, this phase's job is to define the final, correct, minimal token set and leave EXPLICIT NOTES (in docs/COLOR_SYSTEM.md) mapping every old token name to its new equivalent, so the later phases have a precise find-and-replace guide. It's acceptable for this phase to temporarily keep old token names as deprecated aliases (clearly commented as "// DEPRECATED — migrate to --color-X, removed in a later phase") pointing to the new values, so that nothing currently referencing them breaks before Phase 3-5 land — remove the deprecated aliases only once Phase 5 confirms nothing references them anymore.
4. Produce docs/COLOR_SYSTEM.md documenting: the final token list with hex values and intended usage for each; the full old-token-name → new-token-name mapping table; the neutral scale and semantic status set's derivation reasoning; an explicit note that sprite/character skin tones (including the mascot's own colors) are intentionally NOT part of the global token system and should stay local to their sprite components.
5. Do not touch any component file in this phase — verify the build still passes purely because the deprecated aliases keep old references working, not because you edited call sites.

FILES TO INSPECT
src/index.css (full @theme block), a fresh repo-wide hex-usage grep across src/, any existing docs/*.md for this repo's documentation conventions/location.

FILES LIKELY TO MODIFY/CREATE
src/index.css (@theme block rewritten with the consolidated token set + deprecated aliases), docs/COLOR_SYSTEM.md (new).

DATA MODEL CHANGES
None.

UI REQUIREMENTS
Zero visible change in this phase — every color must resolve to the exact same rendered hex value as before, since only token definitions change and deprecated aliases preserve old values until migrated.

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
None.

ERROR HANDLING
N/A.

TESTS
A test asserting the app still builds and renders identically (screenshot/DOM comparison if available, otherwise a careful manual check) since this phase is additive/aliasing only. A test verifying docs/COLOR_SYSTEM.md's mapping table covers every token that existed before this phase (nothing silently dropped without a documented replacement).

ACCEPTANCE CRITERIA
index.css contains one clean, minimal, well-documented token set (7 brand colors + one neutral scale + one semantic status set + genuinely-necessary functional variants) plus temporary deprecated aliases for anything not yet migrated; docs/COLOR_SYSTEM.md fully documents the new system and the old→new mapping; the app is pixel-identical to before this phase; npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
Any component file. Any rendered pixel. The character/mascot art or its colors. Phase 1's RPC fix.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. Screenshot / and a couple of admin/team screens before and after — must be pixel-identical (deprecated aliases preserve the old values).
3. Review docs/COLOR_SYSTEM.md for completeness before Phase 3 begins.
```

---

### PHASE 3 PROMPT — Migrate the shared UI library onto the tokens

```text
OBJECTIVE
Migrate every component under src/ui/** (the shared design-system layer used by admin, team, and public pages alike) off raw hex literals and onto the consolidated token set from docs/COLOR_SYSTEM.md. This is the highest-leverage phase — fixing colors here propagates everywhere these components are reused.

CONTEXT
Phase 2 produced docs/COLOR_SYSTEM.md: the final consolidated token set plus an old-token-name → new-token-name mapping, with deprecated aliases in index.css still keeping old values working during migration. A repo-wide hex grep previously found raw color literals in shared components including (at least) src/ui/{PixelButton,StatusPill,ConnectionPill,Countdown,Skeleton,ArcadeLink,Modal,ErrorBoundary,PixelLoader}.tsx and src/ui/Leaderboard/{Podium,LeaderboardTable}.tsx — re-verify the exact current list with a fresh grep rather than trusting this description, since Phase 2 may have already changed what's canonical.

EXACT REQUIREMENTS
1. Re-run a hex-literal grep scoped to src/ui/** to get the authoritative current list of every file/line using a raw hex color (via inline style={{...}} or Tailwind arbitrary-value classes like bg-[#XXXXXX]/text-[#XXXXXX]/border-[#XXXXXX]/shadow-[...#XXXXXX]).
2. For each hit, replace it with the corresponding token from docs/COLOR_SYSTEM.md's mapping table — using Tailwind's theme-token class syntax (e.g. bg-nes-navy or whatever the actual configured token/utility naming convention is once Phase 2 lands — check how Tailwind 4's @theme tokens are consumed elsewhere in already-token-based code in this repo, e.g. any component that already correctly uses --color-nes-* tokens via Tailwind classes, and follow that exact same pattern) rather than inline CSS custom-property references, unless a case genuinely needs an inline style (e.g. a dynamically-computed color) — in which case use var(--color-token-name) in the inline style rather than a fresh hex literal.
3. Where a raw hex value doesn't cleanly map to any token in docs/COLOR_SYSTEM.md (i.e. it's a genuinely new color nobody decided on), do NOT invent a new ad hoc token silently — instead pick the closest existing token that achieves the same visual intent (a warning color close to warning-amber, a border close to the neutral scale, etc.) and note in your phase report every case where you had to make this judgment call, so it can be reviewed. The goal is zero remaining raw hex in src/ui/**, not perfect pixel preservation of every arbitrary shade that was never a deliberate design decision in the first place.
4. Confirm visually that the shared components still look correct and cohesive after the swap — small hue/shade shifts are expected and fine (that's the point of consolidating near-duplicate colors), but nothing should look broken (e.g. text becoming unreadable against its background — recheck contrast for any component where the token swap changed a text/background pairing).
5. Do not touch src/routes/** in this phase (Phases 4–5 own that) — scope strictly to src/ui/**.

FILES TO INSPECT
docs/COLOR_SYSTEM.md, every file under src/ui/** (fresh grep for raw hex), src/index.css (to confirm the exact Tailwind-consumable token names/classes to use).

FILES LIKELY TO MODIFY/CREATE
Every src/ui/** file found to contain a raw hex literal; no new files expected beyond a phase report/notes appended to docs/COLOR_SYSTEM.md if judgment calls were made per step 3.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
Visually cohesive result using only the consolidated token set; no readability/contrast regressions; expected minor hue/shade convergence where near-duplicate colors were merged in Phase 2.

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
None.

ERROR HANDLING
N/A.

TESTS
A grep-based regression test scoped to src/ui/** asserting zero raw hex literals remain outside src/index.css (add this as a permanent test, not a one-off check — it should fail CI if a future PR reintroduces a hardcoded color in the shared UI library). Re-run existing component tests and fix any snapshot/assertion that hardcoded an old color value.

ACCEPTANCE CRITERIA
Zero raw hex literals remain in src/ui/**; every color there resolves through the consolidated token set; no visual/contrast regressions; the new grep-guardrail test is in place and passing. npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
src/routes/** (later phases), the token definitions themselves (Phase 2's output, other than noting judgment calls), Phase 1's fix.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. grep -rE "#[0-9A-Fa-f]{6}" src/ui — zero matches outside comments.
3. Visual check of every shared component's rendered states (buttons idle/hover/press/disabled, status pills in each status, modal, skeleton loading state, leaderboard podium/table) at 360px and 1440px.
```

---

### PHASE 4 PROMPT — Migrate Admin routes onto the tokens

```text
OBJECTIVE
Migrate every component under src/routes/admin/** off raw hex literals and onto the consolidated token set from docs/COLOR_SYSTEM.md, following the same discipline as Phase 3's shared-library migration.

CONTEXT
Phase 3 migrated src/ui/** onto the consolidated tokens from docs/COLOR_SYSTEM.md and added a permanent grep-guardrail test scoped to that directory. The same raw-hex problem exists throughout src/routes/admin/** — re-verify the current exact list with a fresh grep (Phase 3's changes may have already reduced how many admin files are affected, if they only used shared components correctly; re-check rather than assuming the original 116-file count still applies here).

EXACT REQUIREMENTS
1. Fresh grep for raw hex literals scoped to src/routes/admin/**.
2. Replace each with the corresponding docs/COLOR_SYSTEM.md token, using the same Tailwind theme-token class pattern established in Phase 3 (consistency across phases matters — do not introduce a second convention).
3. Same judgment-call discipline as Phase 3 step 3 for anything that doesn't cleanly map — document every judgment call.
4. Pay particular attention to admin-specific status/semantic uses found in the original audit (e.g. StandingsTable's tie-break badge, FinalizePanel's warning badge, TeamCard's claimed/unclaimed indicator dot, RequireAdmin's session-status dot, ConsoleTopBar) — these are exactly the kind of ad hoc amber/warning colors the new semantic token set (from Phase 2) was designed to replace; use the warning/success/danger/info tokens deliberately here rather than defaulting to the neutral scale.
5. Visually confirm the admin console (the highest-stakes, most information-dense screen in the app) remains fully readable and clearly organized after the swap — this is used live during a real event, so a contrast or clarity regression here is more costly than elsewhere; specifically recheck any badge/pill/status-indicator color for continued clear distinguishability between states (claimed vs unclaimed, tie vs resolved, correction vs normal, etc.).

FILES TO INSPECT
docs/COLOR_SYSTEM.md, every file under src/routes/admin/** (fresh grep for raw hex).

FILES LIKELY TO MODIFY/CREATE
Every src/routes/admin/** file found to contain a raw hex literal.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
Full readability and clear state-distinguishability preserved on the admin console specifically; consistent token usage with Phase 3's established pattern.

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
None.

ERROR HANDLING
N/A.

TESTS
Extend the grep-guardrail pattern from Phase 3 to cover src/routes/admin/** as well (either broaden the existing test's scope or add a matching one for this directory). Re-run existing admin component/route tests and fix any hardcoded-color assertions.

ACCEPTANCE CRITERIA
Zero raw hex literals remain in src/routes/admin/**; admin console remains fully readable with clear state-distinguishability; guardrail test covers this directory. npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
src/ui/** (already done), src/routes/team/** and src/routes/public/** (next phase), any admin logic/behavior — visuals only.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. grep -rE "#[0-9A-Fa-f]{6}" src/routes/admin — zero matches outside comments.
3. Full visual walkthrough of the admin console (lobby, team grid, team editor, quick actions, activity log, finalize panel, standings, history) at 1280–1920px.
```

---

### PHASE 5 PROMPT — Migrate Team + Public routes onto the tokens; sprite skin-tone reconciliation

```text
OBJECTIVE
Migrate every component under src/routes/team/** and src/routes/public/** off raw hex literals and onto the consolidated token set, and reconcile sprite/character skin-tone colors as the intentional, documented exception to the global token system per docs/COLOR_SYSTEM.md.

CONTEXT
Phases 3–4 migrated src/ui/** and src/routes/admin/** onto the consolidated color tokens with permanent grep-guardrail tests. The same work remains for src/routes/team/** (team join/dashboard/lobby-wait/game-over/final-board) and src/routes/public/** (the landing page and its scenery/character system, which per docs/COLOR_SYSTEM.md's Phase 2 decision intentionally keeps sprite/character skin-tone colors as local constants rather than global tokens — this explicitly includes the mascot character's own art colors, which are being kept as-is by product decision, not touched by this migration). Since the landing page is the source of the brand palette in the first place, it should already be closest to compliant — this phase's job there is mostly verification plus fixing any drift (e.g. any leftover wooden-sign/castle/plains styling from the admin-login/team-join pages that used off-palette browns/grays per the earlier visual-language audit) in the surrounding UI chrome, not the character art itself.

EXACT REQUIREMENTS
1. Fresh grep for raw hex literals scoped to src/routes/team/** and src/routes/public/**.
2. For UI chrome (backgrounds, borders, text, buttons, cards, status indicators) in both directories: replace with the consolidated tokens exactly as in Phases 3–4.
3. For sprite/character art specifically (the mascot character and any other creature sprite — skin tones, hair, clothing detail colors that are legitimately part of a specific piece of pixel art rather than app-wide UI chrome): per docs/COLOR_SYSTEM.md's explicit exception, these stay as local hex constants WITHIN their own sprite component file, but must be clearly marked as sprite-local art colors (e.g. a comment block or a locally-scoped constants object named something like SPRITE_COLORS at the top of the file) so they're unambiguously excluded from the "no raw hex" guardrail rather than looking like an oversight. Do NOT change the character's actual appearance/colors in this phase — this is a labeling/organization task for the guardrail test, not a redesign. Update the guardrail test approach from Phases 3–4 to allow this specific, clearly-marked exception (e.g. exclude files matching a naming pattern, or exclude hex literals inside a specifically-named constants block) rather than either wrongly flagging legitimate sprite art or accidentally creating a loophole that lets real UI-chrome hex literals sneak back in under the same exemption — be precise about the exemption's boundary.
4. Specifically verify (per the earlier visual-language audit) whether WoodenSignboard/WoodenActionButton/CastleBackground/PlainsBackground (used on admin-login/team-join per the prior "keep as intentionally distinct room-metaphor" decision, if that's what was decided — check docs/VISUAL_LANGUAGE_DECISION.md from the prior round) use colors that are either (a) legitimate sprite/prop-local art colors (acceptable per step 3's exception) or (b) actual UI-chrome colors like text/border/background that should be tokenized like everything else — tokenize (b), leave (a) as documented local art constants.
5. Confirm the landing page itself is now fully token-based for its UI chrome (backgrounds, cards, buttons, text) — it should require the least change, being the palette's origin — fix anything found. The character/mascot art and the team-color swatches are explicitly out of scope for any color change in this phase.

FILES TO INSPECT
docs/COLOR_SYSTEM.md, docs/VISUAL_LANGUAGE_DECISION.md (from the prior round, if present), every file under src/routes/team/** and src/routes/public/** (fresh grep for raw hex).

FILES LIKELY TO MODIFY/CREATE
Every affected file in src/routes/team/** and src/routes/public/**; the grep-guardrail test(s) from Phases 3–4, extended/adjusted to correctly scope the sprite-art exception.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
Team dashboard remains huge/readable/mobile-first as previously established; landing page's visual identity is preserved (it's the source of the palette, so this should mostly be verification); sprite art keeps its actual appearance unchanged (skin tones, mascot colors etc. are an intentional exception, not a bug, and are not being redesigned in this phase).

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
None.

ERROR HANDLING
N/A.

TESTS
Extend/finalize the grep-guardrail test to cover the entire src/ tree (src/ui, src/routes/admin, src/routes/team, src/routes/public all included) in one comprehensive final check, with a precisely-scoped exception for documented sprite-local color constants. Re-run existing team/public route tests and fix any hardcoded-color assertions.

ACCEPTANCE CRITERIA
Zero raw hex literals remain in src/routes/team/** and src/routes/public/** outside clearly-documented sprite-local art constants; the comprehensive repo-wide guardrail test passes; landing page visual identity unchanged; team dashboard remains fully readable; mascot/character art is visually unchanged. npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
src/ui/** and src/routes/admin/** (already done); the actual visual identity/content of the landing page and sprite/character art; any game/backend logic.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. grep -rE "#[0-9A-Fa-f]{6}" src/routes/team src/routes/public — every remaining match must be inside a clearly-documented sprite-local constants block, verified by hand.
3. Full visual walkthrough: landing page, team join, team dashboard (lobby-wait/active/game-over/final-board) at 360–430px and desktop — confirm the mascot character looks exactly the same as before.
```

---

### PHASE 6 PROMPT — Full regression, permanent guardrails, final report

```text
OBJECTIVE
Run a full regression pass across the whole app after Phases 1–5, remove the temporary deprecated color-token aliases from Phase 2 now that nothing references them, confirm every permanent guardrail test is in place and correctly scoped, and produce a final written report.

CONTEXT
Phase 1 fixed the broken admin_abort_game RPC call; Phase 2 consolidated the color token system with temporary deprecated aliases; Phases 3–5 migrated src/ui, src/routes/admin, src/routes/team, and src/routes/public onto the consolidated tokens with grep-guardrail tests along the way, while explicitly leaving the mascot character's art and team-color swatches untouched by product decision. This phase is verification, cleanup of the now-unneeded deprecated aliases, and a final report — no new features.

EXACT REQUIREMENTS
1. Grep the entire src/ tree for any remaining reference to a deprecated token alias name from Phase 2's docs/COLOR_SYSTEM.md mapping table; if truly zero references remain, delete the deprecated aliases from index.css's @theme block. If any reference remains, migrate it (same discipline as Phases 3–5) before removing the alias — do not delete an alias that's still in use.
2. Run the complete test suite (unit + any Playwright/E2E present) and confirm 100% pass, including: the Phase 1 RPC integration test and the final comprehensive color-guardrail test from Phase 5.
3. Re-run supabase test db against a fresh supabase db reset to confirm the full pgTAP suite (including the abort-game fixes) passes.
4. Full-repo final grep sweep confirming: zero raw hex literals outside src/index.css and clearly-documented sprite-local constants; the admin_abort_game RPC call path matches its current SQL signature; no other admin_* RPC has drifted (re-check, since Phase 1 already did this once — confirm nothing regressed since).
5. Manual end-to-end click-through: / (confirm the mascot renders correctly and the palette-consistent visual identity) → /join → team dashboard; / → /admin/login → create room → lobby → start → console (cash/CV/business edits, a quick action, activity log) → abort a test room (confirm it now actually works and resets team state) → restart → finalize → leaderboard → history. Confirm visual consistency of the palette across every one of these screens as you go.
6. Write docs/AUDIT_ROUND_2_SUMMARY.md: a table of every finding from this round (A, B plus their sub-items), its resolution and which phase addressed it, before/after color-token count, before/after raw-hex-literal file count.

FILES TO INSPECT
Everything touched across Phases 1–5; the full test suite; docs/COLOR_SYSTEM.md; docs/AUDIT_REMEDIATION_SUMMARY.md (from the prior round, for consistency of reporting format).

FILES LIKELY TO MODIFY/CREATE
docs/AUDIT_ROUND_2_SUMMARY.md (new), src/index.css (deprecated-alias removal, if clean), any file this phase's regression testing finds genuinely broken.

DATA MODEL CHANGES
None expected, only if regression testing surfaces a real defect from an earlier phase, fixed via a new migration with a test, same discipline as before.

UI REQUIREMENTS
None beyond fixing anything genuinely broken.

STATE-MANAGEMENT REQUIREMENTS
None new.

SECURITY REQUIREMENTS
Final confirmation the RLS/admin-auth/CSP posture from the prior round is still intact after this round's changes.

ERROR HANDLING
N/A.

TESTS
Full suite run, 100% pass, including every guardrail test added across this round. Any gap found gets a new targeted test, not just a manual note.

ACCEPTANCE CRITERIA
Full test suite green; full pgTAP suite green; zero deprecated color aliases remain (or a documented reason why one still must); the complete manual user journey works end to end with correct palette consistency and a working Abort Game feature; docs/AUDIT_ROUND_2_SUMMARY.md complete. npm run typecheck && npm test && npm run build pass.

MUST NOT CHANGE
Nothing beyond fixes genuinely required by this phase's regression testing.

VERIFICATION STEPS
1. supabase db reset && supabase test db
2. npm run typecheck && npm test && npm run build
3. Full manual click-through of the end-to-end journey described in step 5.
4. Final grep sweeps per step 4.
```
