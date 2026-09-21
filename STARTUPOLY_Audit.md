# STARTUPOLY — Codebase Audit & Phased Implementation Blueprint

Audited: `Startup-poly-main.zip` (70 files), `STARTUPOLY_Master_Rulebook.docx`, UI reference image.
Baseline verified: `npm ci` OK, `npm run build` OK (613 kB JS bundle), existing engine test script passes (46 assertions). Nothing was modified.

**How I audited.** I read fully: `GameContext.tsx`, `services/supabase.ts`, `types/game.ts`, all `constants/*`, `gameEngine.ts` (all money-moving paths, ranking, manual adjust), `test/*`, `App.tsx`, all config/env/README files, legacy `app.js`/`styles.css`. I traced the join, admin-login, timer and realtime flows end to end. The 21 admin/player component files were inspected by size, grep and targeted reading (join view, admin login, player shell, waiting room), not line by line — they are all slated for replacement, so nothing in this plan depends on their internals.

**Secrets rule followed:** no credential values appear in this document.

---

## 1. Executive Summary

**What the app currently is.** A React 19 + Vite + Tailwind 4 + Supabase app that is a **full digital version of the board game**: admin enters dice rolls, the engine moves tokens, resolves landings, buys/upgrades/charges rent, draws cards, runs forced sales and bankruptcy, keeps undo snapshots, and broadcasts the entire match as one JSON blob to every phone. It also contains a multi-device simulator, a 24-space board renderer, roll animations and audio.

**What it does well.**
- The economy tables (10 businesses, costs, initial CV, upgrade costs, +300/+400 CV, 50/75/100% rent) match the rulebook exactly.
- Bonus/Crisis card effects, Steal Talent, Lose the Feature, CV floor at 0, forced-sale-at-purchase-price, and the CV → Cash → Businesses ranking match the rulebook.
- Real Supabase realtime plumbing exists; the app builds; the engine is a pure module with a test script.

**Biggest problems (ordered by event risk).**
1. **No security at all.** RLS policies are `FOR ALL TO public USING (true)` on both tables. Admin login is a client-side string compare against passcodes that are printed on the login screen. Team PINs are printed on the public join screen and broadcast inside the shared state JSON. Anyone with the (public) anon key can read, overwrite or delete every match.
2. **Wrong product.** The rulebook (§18) and your brief define a *scoreboard*. The repo is a *game engine*. ~70% of the code (engine, dice/turn/landing panels, board, simulator, roll animations, undo snapshots) must be deleted, not fixed.
3. **Timer is a client `setInterval`** running in *every* browser (players included), stored as a decrementing counter, and it can be **paused**. Laptop sleep = clock stops. Phone background throttling = drift.
4. **Last-write-wins on a single JSON blob.** Any player's stale tab writes the whole `MatchState` back to the DB every 5 s and can silently overwrite admin edits. Echo suppression is a 100 ms `setTimeout` flag. DB write failures are swallowed.
5. **Rulebook-vs-brief conflicts not handled:** no room lifecycle, no per-room isolation (room code *is* the primary key, so reusing a code overwrites history), history lives inside client-side JSON, teams can't be configured (fixed "Team 01…06"), no final-freeze enforcement.
6. Committed credentials (DB connection string with password in `.env.example` and `test/setupSchema.ts`), a Node Postgres driver (`pg`) shipped in a browser project.

**What the target product is.** A **Live Scoreboard + Game Management System**:
- Admin (laptop, authenticated) creates a room, configures 5–6 teams, opens a lobby, starts the server-authoritative 50:00 clock, records cash/CV/business/upgrade changes (with optional rule-derived pre-fill), sees a live audit log, finalizes, and browses history.
- Each team (phone, anonymous but PIN-gated) sees only its own cash, CV, businesses, and the countdown, live, read-only.
- All mutations go through database functions that enforce the rulebook and write the audit log in the same transaction. The browser is never trusted.

---

## 2. Current Architecture (as discovered)

```text
Browser (every device: admin laptop AND every phone runs the SAME bundle)
 ├─ App.tsx  ── hash routing hacks (#/admin, #/simulator, #/play)
 ├─ GameContext.tsx  (single god-context, ~500 lines)
 │    ├─ state: MatchState  (teams, businesses, turn, pendingLanding, pendingSale,
 │    │                      transactions[], archivedMatches[], timer, settings…)
 │    ├─ localStorage  ← source of truth on reload (state + auth session)
 │    ├─ BroadcastChannel  ← same-browser cross-tab sync
 │    ├─ setInterval(1s)   ← timer tick, runs on ALL roles
 │    └─ every mutation: engine(state) → setState → localStorage
 │                        → Supabase upsert(whole JSON) → broadcast(whole JSON)
 │                        → insert last transaction (fire-and-forget)
 ├─ engine/gameEngine.ts  (dice, turns, landings, rent, forced sale, undo…)
 ├─ services/supabase.ts  (anon client, module-level singleton channel)
 └─ components/{admin,player,simulator,common,auth}

Supabase (project created by test/setupSchema.ts, run with a DB password)
 ├─ matches(id = room code TEXT PK, …columns…, state_json JSONB)   ← entire game
 ├─ match_events(id, match_id, …, snapshot_before JSONB)
 ├─ RLS: FOR ALL TO public USING(true) WITH CHECK(true)
 └─ Realtime: postgres_changes on matches + broadcast 'state_sync'

Auth:  admin = client-side compare with hardcoded passcodes
       player = room code + 4-digit PIN compared in the browser against state.teams[].pin
Legacy: root app.js + styles.css (old vanilla prototype, unused; package.json "main")
```

**Data flow example (admin edits cash):** admin click → engine clones full state → `broadcastState` → localStorage + BroadcastChannel + upsert entire JSON + realtime broadcast of entire JSON → every phone `setState(remote)` (skipped for 100 ms after its own writes). Every phone also ticks its own timer and upserts the entire JSON every 5th second.

---

## 3. Target Architecture

**Principle: Postgres is the game. React is a display + form layer.** Keep the stack (Vite, React 19, TypeScript, Tailwind 4, Supabase). Add only: `react-router-dom` (replace hash hacks), `vitest` (+ Testing Library), `@playwright/test` (multi-browser realtime/E2E). Remove: `pg`, `@types/pg`, the audio module and Mario/board/simulator code.

```text
                ┌──────────────── Supabase ─────────────────┐
 Admin laptop   │ Auth: email+password (admins allowlist)   │
 (authenticated)│ Auth: anonymous sessions for phones       │
     │          │                                            │
     │ RPC only │ Tables (no direct client writes)           │
     ├─────────►│ rooms · teams · team_secrets · team_claims │
     │          │ team_businesses · business_catalog         │
     │          │ activity_events (append-only)              │
 Team phone     │ final_results (immutable after finalize)   │
 (anonymous)    │                                            │
     │ RPC read │ SECURITY DEFINER functions = the only      │
     ├─────────►│ write path; each enforces rules, checks    │
     │          │ role + room status + optimistic version,   │
     │ Realtime │ writes the audit event in same transaction │
     │◄─────────┤ Realtime (RLS-filtered postgres_changes)  │
                └────────────────────────────────────────────┘
```

- **Frontend structure:** `src/routes/{admin,team,shared}`, `src/domain/` (pure rules helpers + types), `src/data/` (typed Supabase RPC wrappers + query hooks), `src/ui/` (design system), `src/lib/` (server clock, env, errors). No global god-context; small hooks: `useAdminSession`, `useRoomSnapshot(roomId)`, `useMyTeam()`, `useServerClock(endsAt)`.
- **Routing:** `/` landing (Join / Admin), `/join`, `/team`, `/admin/login`, `/admin` (current room or create), `/admin/room/:id`, `/admin/history`, `/admin/history/:id`.
- **State management:** server is the single source of truth. Client keeps a *snapshot* fetched via RPC; **every realtime event triggers a refetch of the snapshot** (not payload patching) → no ordering bugs, no stale merges. Plus 10–15 s visibility-aware polling fallback and refetch on `online`/`visibilitychange`.
- **Domain model:** Room (lifecycle) → Teams (cash, CV, bankrupt flag) → TeamBusinesses (business_key, level 0–2). CV is **stored independently** of businesses (rulebook §15: CV survives forced sale; §8/§10/§11 change CV without touching businesses), so it cannot be derived.
- **Room lifecycle:** `CREATED → LOBBY → ACTIVE → TIME_EXPIRED → FINALIZED`.
  - CREATED: admin configures teams/colors; teams cannot join.
  - LOBBY: code+PINs live; teams join; no clock (rulebook "Setup 5 min").
  - ACTIVE: `started_at` and `ends_at` set by the DB clock; edits allowed.
  - TIME_EXPIRED: reached when `now() >= ends_at` — **derived, not dependent on any browser**; any RPC/poll materializes it idempotently. Teams see GAME OVER. Admin may only reconcile late-entered physical transactions (mandatory note, tagged in log) and record tie-break order (see Clarification C2).
  - FINALIZED: standings snapshotted into `final_results`; room is immutable (trigger-enforced). Wrap-up (rulebook 5 min).
- **Team identity & reconnection:** Supabase **anonymous sign-in** per phone gives a persistent session (survives refresh/close). Join = room code + choose team + team PIN → RPC links `auth.uid()` to the team in `team_claims`. RLS then lets that uid read only that team's rows. If storage is cleared, the team re-enters code + PIN. Admin sees claimed/not-claimed per team and can release a slot.
- **Timer:** DB stores `started_at`, `ends_at`. Clients call `server_time()` once on load/reconnect, compute offset, render `ends_at - (Date.now()+offset)` with `requestAnimationFrame`/1 s tick purely for display. No pause. Refresh-safe by construction.
- **Activity log:** `activity_events` append-only (trigger blocks UPDATE/DELETE), admin-only RLS, one row per changed team per action, with `prev`/`new` JSON, business key, actor uid, optional note, `group_id` for multi-team actions, `request_id` for idempotency.
- **Leaderboard:** one implementation, in SQL (`room_standings(room_id)`), following §17 exactly. Finalize snapshots it.
- **Error handling:** typed error codes from RPCs (`VERSION_CONFLICT`, `ROOM_NOT_ACTIVE`, `INVALID_VALUE`, `BUSINESS_CAP`, `BUSINESS_OWNED`, `NOT_ADMIN`…) → mapped to human messages; global error boundary; visible connection indicator; no swallowed `console.warn`.
- **Testing:** SQL tests (pgTAP) for rules/RLS/lifecycle, Vitest for domain + hooks, Playwright for multi-context realtime/reconnect/timer. See §8.

---

## 4. Rule / Code Mismatch Report

Statuses: ✅ Correct · 🟡 Partial · ❌ Incorrect · ⛔ Missing · ❓ Ambiguous (needs owner).

| # | Official rule (Rulebook §) | Current implementation | Status | Required change | Affected code / DB / tests |
|---|---|---|---|---|---|
| R1 | Website = scoreboard only; gameplay is physical (§18, brief §1) | Full digital engine: dice, turns, landings, pending states, undo, animations | ❌ | Delete engine/turn/landing/undo/simulator/board; replace with record-keeping RPCs | `engine/*`, `GameContext`, `AdminResolutionPanel`, `AdminTurnController`, `AdminBoardMap`, `StartupolyBoard`, `LiveRollBoardModal`, `MultiViewSimulator`, `Player*Modal`, `test/gameEngine.test.ts` |
| R2 | Start ₹1,000 cash, 0 CV, 0 businesses (§1) | `getInitialState` = 1000/0/[] | ✅ | Move to DB defaults + check | `teams` table defaults |
| R3 | 5–6 teams (§2) | `teamCount` 5/6 in settings; not enforced | 🟡 | DB `CHECK (team_count BETWEEN 5 AND 6)` + exact team rows | `rooms`, tests |
| R4 | Team names/colors configurable (brief §2) | Fixed "Team 01–06", color by index | ❌ | Admin configures name/color per team | `teams`, admin setup UI |
| R5 | Gameplay window exactly 50:00, started by admin, not pausable (§3, §17, brief §6) | `secondsRemaining` decremented by client interval in all browsers; **`toggleTimer` pauses**; admin tab drives DB | ❌ | `started_at/ends_at` from DB clock; remove pause; derive expiry server-side | `GameContext` timer effect, `toggleTimer`, `matches.seconds_remaining/timer_running`, `TimerBadge` |
| R6 | At 50:00 scoreboard frozen instantly; no extra turn (§17) | Status flips to `finished` client-side; **`manualAdjustTeam` and most engine paths are not gated by status**; nothing server-side | 🟡 | Server rejects normal edits when `now() >= ends_at`; post-expiry reconciliation only with note | RPCs, `activity_events`, tests |
| R7 | Max 3 businesses/team (§6.3) | Enforced only in `buyBusiness()` (client engine) | 🟡 | Enforce in DB trigger + RPC | `team_businesses` trigger |
| R8 | Each business owned by ≤1 team | Dual bookkeeping: `Team.businesses[]` **and** `Business.owner` (can diverge) | 🟡 | `UNIQUE(room_id, business_key)` single source | schema |
| R9 | 10 businesses, cost + initial CV (§5.1) | Matches for all 10 (4 provisional) | ✅ | Move to `business_catalog` table; flag provisional | `constants/businesses.ts`, catalog seed |
| R10 | Provisional values for 4 businesses; CleanTech dominated by Robotics (§5.2) | Values match; editable in `AdminSettingsModal` | ❓ | Keep catalog data-driven; owner decision C5 | catalog |
| R11 | Upgrade cost scaled by business cost (§7.2); +300 / +400 CV (§7.1) | Correct in engine | ✅ | Catalog columns `u1_cost,u2_cost,u1_cv,u2_cv` | catalog, domain helpers, tests |
| R12 | Levels: Base→U1→U2 only (§7) | `level: 0|1|2` | ✅ | `CHECK (level BETWEEN 0 AND 2)`; RPC disallows skipping without note | schema |
| R13 | Rent 50/75/100% of cost; owner CV 50/75/100% of initial CV (§8) | Correct (with `Math.round`) | ✅ | Keep only as a *pre-fill calculator* (Phase 8), not gameplay | `calculateRentAndOwnerCv` → `domain/` |
| R14 | START: +₹200; growth bonus +200 CV @2 biz, +500 CV @3 (§10) | Correct; ⚠ README/UI text "+500 (total)" ambiguous vs engine (gives 500, not 200+500) | ❓ | Confirm "+500 total" means 500 not 700 (C6); pre-fill helper | domain, quick action |
| R15 | Bonus/Crisis cards #1–6 effects (§11–12) | Correct in engine | ✅ | Optional pre-fill helper only | Phase 8 |
| R16 | CV cannot fall below 0 (§12) | `Math.max(0,…)` for CV; **also silently clamps cash** in `manualAdjustTeam` | 🟡 | DB `CHECK cv >= 0, cash >= 0`; RPC **rejects** (or asks confirm) instead of silent clamp | schema, RPCs |
| R17 | Forced sale: sells at purchase cost, upgrades lost, CV retained, team chooses (§15) | Correct in engine | ✅ | `admin_remove_business` with `resale` option; CV untouched | RPC, Phase 8 |
| R18 | No voluntary selling (§15.1) | Not applicable to engine; admin can remove anything | 🟡 | Remove requires reason type: `FORCED_SALE` or `BANKRUPTCY` | RPC |
| R19 | Bankruptcy = eliminated; businesses return to bank (§16) | `isBankrupt`, cash=0, businesses freed | 🟡 | `teams.is_bankrupt`; RPC frees businesses; excluded from winner | schema, RPC |
| R20 | Winner = **active** team, highest CV; tie-breaks Cash → Businesses → judged pitch (§17) | Ranking: bankrupt last, CV, Cash, Businesses, then **team number** | 🟡 | Replace step 5 with admin-recorded pitch result; block finalize on unresolved tie | `room_standings`, finalize RPC |
| R21 | Lifecycle: setup 5 / play 50 / wrap-up 5 (§3) | `status: setup|waiting|live|paused|finished` | ❌ | `CREATED/LOBBY/ACTIVE/TIME_EXPIRED/FINALIZED` | enum, RPC |
| R22 | One board, 6 matches, new teams each match, prior digital data cleared for the *scoreboard* (§22.2, §23) vs. "retain history" (brief §11) | `resetMatch` rebuilds state under same code, archives into client JSON | ❌ / ❓ | New room per match; history persisted in DB; C8 | `rooms`, `final_results`, history UI |
| R23 | Scoreboard shows Team, Cash, CV, businesses, levels (§18) | Players also see board positions, turn order, other teams (board tab receives all `state.teams`) | ❌ | Team payload = own team only | `get_my_state()`, RLS |
| R24 | Tech Runners (2) operate scoreboard (§20) | One admin session assumed | ❓ | Allow ≥2 concurrent admin sessions with optimistic versions (C7) | RPC `expected_version` |
| R25 | Steal Talent, Lose the Feature, Pitch skip rules (§14) | Correct in engine | ✅ | Steal = atomic 2-team transfer helper (Phase 8) | RPC `admin_adjust` |
| R26 | Turn order / 6s / 3×6 cancel / movement (§9) | Implemented digitally | ❌ (out of scope) | Delete — physical only | `engine` |
| R27 | Wildcards give no cash/CV/business (§13) | `resolveWildcard` logs only | ✅ | Nothing to record | — |

---

## 5. UX / UI Gap Analysis

**Reference image, what to take:** sky-blue sky with pixel clouds, brick ground strip, green pipes as dividers/frames, chunky 3–4 px bordered cream/white cards, gold coin/star iconography, pixel display font for titles, big green primary button + gold secondary, dark-navy bottom bar. **What to leave out** (conflicts with rules/brief):

| Reference element | Problem | Decision |
|---|---|---|
| "LOGIN" on team splash, host/"You" roster, "2/5 players joined" | Teams have no accounts; one phone per team | Splash = **JOIN GAME** only; waiting room shows *team* status ("Team Aurora joined · waiting for start"), no player roster |
| SaaS "Initial Value ₹160", "Rent ₹50/100/150" | Rulebook: SaaS cost ₹300, initial CV 180, rent ₹150/225/300 | Never hardcode display numbers from the image; read catalog |
| "Match Format 50 minutes (5+5+5)" | Rulebook: 5 setup + 50 play + 5 wrap-up | Fix copy or omit |
| Bottom nav Home/Portfolio/Rules/Settings | Brief: no unnecessary interactions | Team app = **single page**, no nav |
| "Recent Activity" list on team phone | Brief: don't expose admin activity log | Omit (C11); if owner wants, show only own team's last ~5 changes |
| "Bonus Card / Collect" button | Teams are read-only; cards are physical | Omit |
| Rules tab | Not needed for scoreboard | Omit (or one static, read-only page later) |
| Mario, Toad, pipes, star sprites | Nintendo IP — risk at a public event | Use **original** pixel mascot/sprites in the same style |

**Current UI vs. requirements (by surface)**

| Surface | Current | Gap | Target |
|---|---|---|---|
| Visual identity | `index.html` says Mario theme, `README`/`tailwind.config.js` say dark "Equinox" navy/blue/neon-green; three competing palettes | Inconsistent; none use the specified palette | Tokens: Sky `#5C94FC`, Green `#22B14C`, Gold `#FFCC00`, Brick `#B84418`, White `#FFFFFF`, Navy `#102040`, Red `#D32F2F` |
| Team mobile | 5 tabs (Home/Portfolio/Board/Activity/Rules), turn banner, board with all teams, event modals, sounds | Leaks other teams; complex; not read-only-minimal | One screen: team name/color, giant ₹ cash, giant CV, businesses (name, level, value), countdown; nothing else |
| Team join | Prefilled PIN, PINs printed on each team tile, teams listed from shared state | Security failure | Code → team tiles (names/colors only) → PIN → join |
| Admin desktop | 397-line shell mixing turn controller, resolution panel, board map, results modal, settings | Optimized for running a *digital game*, not for speed of recording | Top bar (code, status, big clock, Start/Finalize) · team grid (5–6 cards) · selected-team editor · live log |
| Lobby | Player-count style waiting room | Wrong model | Admin: room code (huge), per-team PIN + claimed status, Start. Team: "Joined — waiting for start" |
| Active game | Turn-centric | Wrong model | Team-centric edits |
| Timer | `TimerBadge` counts client ticks, pause state | Not authoritative | Server-clock countdown `MM:SS` + "GAME TIME LEFT"; `GAME OVER` |
| Activity log | Exists, shows engine transactions, undo | No prev/new, no actor, unbounded in-JSON | Admin-only DB-backed log with prev→new, note, filter by team |
| Final leaderboard | `AdminResultsModal` + `PlayerWinnerScreen` (top 3, CV only) | Ranking shows no cash/biz tie-break detail; visible before admin finalizes | Arcade podium + full table (rank, team, CV, cash, businesses, bankrupt) shown only after FINALIZED |
| History | `archivedMatches[]` in client JSON | Not durable | `/admin/history` from `final_results` |
| Error/loading/empty | `console.warn`; no skeletons; `isConnected` boolean | Silent failures | Connection pill, skeletons, retry banners, explicit conflict/permission messages, empty states ("No businesses yet") |
| Responsiveness | Player fixed `max-w-[430px]` ok; admin has mobile "cockpit" | Admin should be desktop-first | Two separate layouts; admin min-width 1100 px; team 360–430 px |
| Accessibility | `maximum-scale=1,user-scalable=no` | Blocks zoom | Remove; ≥44 px targets; contrast ≥ 4.5:1 on white cards |
| Animation | Roll animations, sounds, particles | Not needed | Only: number change flash (green up / red down, ≤600 ms), timer last-minute pulse, small screen transitions; respect `prefers-reduced-motion` |

---

## 6. Security Audit

| # | Severity | Finding | Fix |
|---|---|---|---|
| S1 | **Critical** | RLS on `matches` and `match_events`: `FOR ALL TO public USING (true) WITH CHECK (true)` → anyone with the anon key (shipped in the bundle by design) can read/modify/delete everything | Drop both tables; new schema with RLS deny-by-default; no client write privileges; all writes via `SECURITY DEFINER` RPCs with `SET search_path = public` and explicit role checks |
| S2 | **Critical** | Admin auth = client-side compare with hardcoded passcodes, and the login screen prints them; role stored in `localStorage` | Supabase Auth email+password, `admins` allowlist, `is_admin()` checked inside every admin RPC and RLS policy; no client-side role trust |
| S3 | **Critical** | DB connection string **with password** committed in `.env.example` and `test/setupSchema.ts` | Remove from repo; **rotate the database password now**; assume it is compromised; check git history and purge if it was ever committed (or create a fresh Supabase project for the event); never put `DATABASE_URL` in a Vite project |
| S4 | **High** | Team PINs visible on the join screen for every team and broadcast in shared state; PIN prefilled | PINs live in admin-only `team_secrets`; join is an RPC with throttling; nothing PIN-related is ever sent to teams |
| S5 | **High** | Every client receives all teams' data (full `state_json` broadcast) — Team A can read Team B trivially | `get_my_state()` returns own team only; RLS on `teams`/`team_businesses` via `team_claims`; no broadcast of state |
| S6 | High | Player browsers write the whole match state (timer sync) | Clients have zero write privileges |
| S7 | Medium | Hardcoded project URL and a JWT-shaped anon-key fallback in `supabase.ts` | Env-only; fail loudly if missing; document that the anon key is public and safe *only after* RLS is fixed |
| S8 | Medium | Room code is the row primary key; guessable default `EQX-4821` hardcoded in several places | Random 6-char code from an unambiguous alphabet; code is only a lookup handle — PIN gates access; no default code |
| S9 | Medium | PIN brute force (4 digits) once join is an RPC | Throttle: max N failed attempts per (uid, team) per minute; generic error message; only while room is LOBBY/ACTIVE |
| S10 | Medium | `#/simulator` route exposes admin + player views in any browser | Delete simulator |
| S11 | Low | `snapshot_before` JSON blobs in events bloat and leak full state | Replace with compact `prev/new` per field |
| S12 | Low | No security headers / CSP for deployment | Add on host (Vercel/Netlify): CSP allowing only self + Supabase + Google Fonts |
| S13 | Info | Anonymous sign-in must be enabled while public email sign-up must not be | Verify both in Supabase Auth settings (the toggles can interact; document the working config). Create admin users manually. |

Secret handling instruction pattern: *Secret found in `.env.example` and `test/setupSchema.ts` → move to local-only env / delete file → rotate credential → purge from history if it was ever pushed.*

---

## 7. Data Model / Backend Plan

Use Supabase CLI migrations (`supabase/migrations/*.sql`) — one source of schema truth; drop the ad-hoc `setupSchema.ts`.

```text
rooms(id uuid PK, code text, status room_status, team_count smallint CHECK 5..6,
      duration_seconds int DEFAULT 3000, started_at, ends_at, finalized_at,
      winner_team_id, tiebreak_note, created_by, created_at)
      UNIQUE(code) WHERE status <> 'FINALIZED'
teams(id uuid PK, room_id FK, slot smallint 1..6, name, color '#RRGGBB',
      cash int DEFAULT 1000 CHECK >=0, cv int DEFAULT 0 CHECK >=0,
      is_bankrupt bool DEFAULT false, tiebreak_order smallint NULL,
      version int DEFAULT 0, UNIQUE(room_id, slot), UNIQUE(room_id, color))
team_secrets(team_id PK/FK, join_pin text)            -- admin-only RLS
team_claims(user_id uuid, team_id FK, claimed_at, PRIMARY KEY(user_id, team_id))
business_catalog(key PK, name, cost, initial_cv, u1_cost, u2_cost,
                 u1_cv DEFAULT 300, u2_cv DEFAULT 400, is_provisional, sort_order)
team_businesses(id, room_id, team_id, business_key FK, level 0..2,
                acquired_at, UNIQUE(room_id, business_key))
      trigger: ≤3 per team; team must belong to room
activity_events(id bigint identity, room_id, team_id NULL, group_id uuid,
                request_id uuid UNIQUE, type text CHECK(list), business_key NULL,
                prev jsonb, new jsonb, note text, actor_id uuid, created_at)
      append-only trigger
final_results(room_id, team_id, rank, cv, cash, business_count, is_bankrupt,
              PRIMARY KEY(room_id, team_id))          -- immutable
admins(user_id PK)
```

**Integrity rules the DB enforces:** cash ≥ 0, CV ≥ 0, level 0..2, ≤3 businesses/team, one owner per business per room, 5–6 teams, status transitions only forward, no writes to a FINALIZED room, events immutable, final results immutable.

**Functions (all `SECURITY DEFINER`):**
- Public/anon-session: `server_time()`, `get_lobby(code)`, `join_team(code, slot, pin)`, `get_my_state()`.
- Admin: `admin_create_room`, `admin_update_team_config`, `admin_open_lobby`, `admin_release_team`, `admin_start_game`, `admin_set_team_values`, `admin_adjust` (atomic multi-team deltas), `admin_add_business`, `admin_set_business_level`, `admin_remove_business`, `admin_set_bankrupt`, `admin_set_tiebreak`, `admin_finalize`, `get_admin_snapshot(room_id)`, `list_history()`, `get_history_detail(room_id)`.
- Internal: `expire_if_due(room_id)` (idempotent; called by every RPC and by `server_time`-adjacent polls), `room_standings(room_id)`.

**Realtime:** publish `rooms`, `teams`, `team_businesses`, `activity_events`. Team subscriptions are RLS-filtered by `team_claims`. Because DELETE events don't carry full RLS-filtered rows, the client **always refetches the snapshot** on any event.

**History:** `final_results` + events retained; FINALIZED rooms immutable; "reset for next match" = create a new room.

---

## 8. Testing Strategy

| Layer | Tool | What |
|---|---|---|
| DB rules & security | pgTAP via `supabase test db` (needs Docker/Supabase CLI) | Room creation, 5–6 team bounds, join with right/wrong PIN, throttle, **team isolation** (uid A cannot select team B, its businesses, events, secrets), anon cannot call admin RPCs, non-admin authenticated cannot either, cash/CV updates & rejection of negatives, business add/cap/uniqueness/level bounds, upgrade & removal, bankrupt, `VERSION_CONFLICT`, idempotent `request_id`, lifecycle transitions, **timer**: expiry derived from `now()` (use `SET LOCAL`/injected clock function for tests), edits rejected after expiry except reconciliation, finalize, immutability after finalize, standings incl. every tie-break level & unresolved-tie block, event append-only |
| Domain (pure TS) | Vitest | `upgradeCost`, `rent`, `landingCv`, `startReward`, `businessCvValue`, money formatting; table-driven from the rulebook tables |
| UI/hooks | Vitest + Testing Library | Server-clock hook (fake timers, offset), snapshot hook refetch-on-event, error mapping, admin edit forms (confirm/diff/disable while pending) |
| E2E | Playwright with several browser contexts | Admin + 6 team contexts: join, start, edit → phone updates <2 s, refresh mid-game keeps clock/team, offline→online catch-up, second admin conflict, expiry → GAME OVER on all, finalize → leaderboard, history |
| Manual | Event rehearsal script | Phase 11 checklist |

Current coverage: one `tsx` script (46 assertions, `process.exit` style, not wired to `npm test`, `tsx` isn't even a dependency) covering only the digital engine. **None of it maps to the new architecture**; it is deleted in Phase 4. Missing today: RLS, auth, timer persistence/expiry, reconnect, realtime, finalization, history, UI.

---

## Clarifications required from the project owner (rules ambiguous or brief vs rulebook)

Each has a **recommended default** the plan assumes unless you say otherwise.

| ID | Question | Default assumed |
|---|---|---|
| C1 | Team identity: rulebook/brief say "select your team"; security needs a secret. | Room code + team tile + **team PIN** generated per room and shown only on admin screen. |
| C2 | §17 says frozen at 50:00 — but Tech Runners may still be entering transactions that physically happened before 50:00. | Normal edits blocked at expiry; admin can **reconcile** in TIME_EXPIRED with mandatory note, tagged `POST_EXPIRY_CORRECTION` in log. Phones show GAME OVER + "final scores pending". |
| C3 | Pause: brief forbids; rulebook silent. Emergency (power/dispute)? | No pause. No emergency abort in v1. |
| C4 | Team dashboard "Value ₹300" per business: rulebook has no per-business "value". (Brief examples e.g. AI L2 "₹750" match no rule; AI base CV 250 + 300 + 400 = 950.) | Show per business: name, level, and **"CV contribution" = initial CV + 300 (if L≥1) + 400 (if L2)** labelled as such. Team CV is a separate stored number. |
| C5 | Provisional 4 businesses; CleanTech dominated by Robotics. | Catalog data-driven, `is_provisional` flagged; ships with rulebook values; you edit catalog before the event. |
| C6 | START growth bonus at 3 businesses: "+500 CV (total)". | Interpreted as +500 (not 200+500). |
| C7 | Two Tech Runners simultaneously? | Yes, supported via optimistic versions + realtime; both are admins. |
| C8 | §22.2 says digital data cleared per match; brief says keep history. | New room per match (scoreboard starts fresh), history retained in DB. |
| C9 | Tie-break 3 (judged pitch). | Admin records final order for tied teams via `admin_set_tiebreak`; finalize blocked while any tie is unresolved (applies to all ranks, not only 1st). |
| C10 | Ranking of bankrupt teams among themselves. | After all active teams; ordered by CV then cash then businesses; marked ELIMINATED. |
| C11 | Team phone "Recent Activity" (in image). | Omitted. |
| C12 | Do teams see the final leaderboard? | Yes, only after FINALIZED (rank, team, CV, cash, businesses). Never during ACTIVE/TIME_EXPIRED. |
| C13 | Upgrades skipping levels (0→2) and removing an upgrade. | Allowed only through admin edit with note (corrections); log records it. |

---

## 9. Phased Implementation Roadmap

**Ordering rationale (from the audit):** security and correctness live in the database, so schema → RPCs come *before* any UI; the old app is deleted at the start of the UI work (Phase 4) so nothing new is built on the game-engine model; team and admin surfaces are independent after the lobby exists; hardening and polish come last. Work on a branch (`rebuild`); **do not deploy until Phase 10 passes.** Every phase ends with build + tests green.

```text
P1 Hygiene & secrets
 ↓
P2 DB schema + RLS + auth model ──────────────┐
 ↓                                            │
P3 DB functions: lifecycle, timer, edits,     │ (SQL tests gate P3)
   ranking, join                              │
 ↓                                            │
P4 App foundation: routing, auth, data layer, │
   design system, domain, DELETE legacy       ┘
 ↓
P5 Admin: create room + lobby + start
 ├────────────────────────┐
 ↓                        ↓
P6 Team join + dashboard  P7 Admin live console (edits + log)
 │                        ↓
 │                        P8 Rule-derived quick actions
 │                        │
 └───────────┬────────────┘
             ↓
P9 Game over + finalize + leaderboard + history
 ↓
P10 Realtime hardening + E2E + load test
 ↓
P11 Visual polish + event readiness + deployment
```

| Phase | Name | Depends on | Key output |
|---|---|---|---|
| 1 | Hygiene & secrets | — | Clean repo, env-only config, Vitest wired |
| 2 | DB schema, RLS, auth model | 1 | Migrations, RLS, catalog seed, pgTAP for isolation/constraints |
| 3 | DB functions | 2 | All RPCs, lifecycle, server timer, ranking, join, SQL tests |
| 4 | App foundation & legacy removal | 3 | Router, admin auth, typed data layer, tokens/primitives, domain module |
| 5 | Admin room setup & lobby | 4 | Create room, teams, code/PINs, claimed status, open lobby, start |
| 6 | Team app | 5 | Join, reconnect, waiting, live dashboard, countdown |
| 7 | Admin live console | 5 | Team grid, cash/CV/business/upgrade edits, bankrupt, activity log |
| 8 | Quick actions | 7 | Rent/START/Buy/Upgrade/Forced sale/Steal/Cards as pre-filled confirmations |
| 9 | End-game & history | 6, 7 | Expiry UX, tie-break, finalize, leaderboard, history |
| 10 | Realtime hardening & E2E | 6–9 | Reconnect/polling/conflict handling, Playwright suite, load test |
| 11 | Polish & event readiness | 10 | Final visuals, a11y, deployment, runbook, rehearsal |

**Per-phase summary** (full detail is in the prompts):

**Phase 1 — Hygiene & secrets.** *Fixes:* S3, S7, dead code, `pg` in browser bundle, stale README, `user-scalable=no`. *Files:* root `app.js`, `styles.css`, `test/setupSchema.ts`, `package.json`, `.env.example`, `services/supabase.ts`, `index.html`, `README.md`. *DB:* none. *Tests:* Vitest installed; secret-scan clean. *Acceptance:* build/typecheck pass; no credentials in repo.

**Phase 2 — Schema/RLS.** *Fixes:* S1, S4, S5, S8, R2–R4, R7–R9, R11, R12, R16 (constraints), R21. *Files:* `supabase/**`. *DB:* all tables, triggers, RLS, grants, realtime publication, catalog seed; legacy tables dropped. *Tests:* pgTAP RLS + constraints. *Acceptance:* Team A uid cannot read Team B; anon cannot read admin tables; direct writes denied.

**Phase 3 — DB functions.** *Fixes:* R5, R6, R18–R20, R22, R24, S2 (server-side admin), S9. *Files:* `supabase/migrations/*`, `supabase/tests/*`. *DB:* RPCs, `app_now()`, `expire_if_due`, `room_standings`, throttle. *Tests:* full rules/lifecycle/timer/ranking matrix. *Acceptance:* every rule in the mismatch table with a DB responsibility has a passing test.

**Phase 4 — App foundation.** *Fixes:* R1, R26, S2 (client), S10, god-context, hash routing. *Files:* everything under `src/` (mostly deletions), new `src/{routes,data,domain,ui,lib}`. *DB:* none (types generated). *Tests:* domain + hooks (server clock, error mapping). *Acceptance:* legacy gone, admin can log in for real, router works.

**Phase 5 — Admin room/lobby.** *Fixes:* R3, R4, R21 (UI), C1. *Tests:* form validation, lobby realtime. *Acceptance:* admin creates room, sees code+PINs+claimed status, starts game.

**Phase 6 — Team app.** *Fixes:* R23, S4/S5 (client side), reconnection, timer display. *Tests:* clock offset, reconnect, isolation E2E. *Acceptance:* refresh keeps team and clock; sees only own data.

**Phase 7 — Admin console.** *Fixes:* admin UX, R7/R8 in UI, activity log, conflicts. *Tests:* forms, conflict handling. *Acceptance:* all brief §8/§9 requirements.

**Phase 8 — Quick actions.** *Fixes:* speed for the most frequent physical events (rent, START, purchases, upgrades, forced sale, steal, cards). *Tests:* domain calculators vs rulebook tables. *Acceptance:* each action pre-fills correct deltas, always editable and confirmed.

**Phase 9 — End-game.** *Fixes:* R6, R20, R22, C2, C9, C12. *Tests:* standings/tie-break UI, finalize, history immutability. *Acceptance:* GAME OVER → reconcile → tie-break → finalize → leaderboard on admin and phones → history.

**Phase 10 — Hardening.** *Fixes:* race conditions, stale state, duplicate subscriptions, silent failures. *Tests:* Playwright multi-context + load. *Acceptance:* all event-critical scenarios pass repeatedly.

**Phase 11 — Polish/readiness.** *Fixes:* visual gap to reference, a11y, deployment, runbook. *Acceptance:* checklist in §11 fully ticked.

---

## 10. Antigravity Prompts

Each prompt is self-contained. Paste one at a time, in order. After each: review the diff, run the verification steps, commit, then proceed.

---

### PHASE 1 PROMPT — Hygiene & secrets

```text
OBJECTIVE
Clean the STARTUPOLY repository of committed secrets, dead legacy files and wrong tooling, and wire up a test runner. This phase must NOT change any application behaviour or UI.

CONTEXT
STARTUPOLY is a physical startup board game (one board, 5–6 teams, 50-minute match). The website is a live digital SCOREBOARD + game management system, not the game. Stack: Vite + React 19 + TypeScript + Tailwind 4 + Supabase. The current repo is a full digital game engine that will be replaced in later phases. Right now we only clean up.

EXACT REQUIREMENTS
1. Delete these files: root app.js, root styles.css (unused legacy prototype), test/setupSchema.ts (contains a database connection string with a password).
2. package.json: remove dependencies "pg" and "@types/pg"; remove the "main": "app.js" field; rename package to "startupoly-scoreboard" and set a one-line honest description; add devDependencies "vitest" and "tsx"; add scripts: "typecheck": "tsc --noEmit", "test": "vitest run --passWithNoTests", "test:legacy": "tsx test/gameEngine.test.ts". Keep dev/build/preview. Run npm install so package-lock.json is consistent. Do not upgrade or downgrade any other dependency.
3. .env.example must contain ONLY:
   VITE_SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   No real project ref, no DATABASE_URL, no password anywhere.
4. src/services/supabase.ts: remove the hardcoded fallback URL and fallback anon key. Read only import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. If either is missing, throw an Error at module load with a clear message ("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local"). Add typed ImportMetaEnv in src/vite-env.d.ts.
5. index.html: remove "maximum-scale=1.0, user-scalable=no" from the viewport meta (keep width=device-width, initial-scale=1, viewport-fit=cover); change <title> to "STARTUPOLY"; set theme-color to #5C94FC. Keep the Google Fonts links.
6. .gitignore: add .env.local, .env*.local, supabase/.temp, playwright-report, test-results, coverage.
7. Rewrite README.md (short): what the project is (scoreboard, not the game), the two user types, setup (.env.local), scripts, and a clearly marked note "Rebuild in progress — see docs/BLUEPRINT.md if present". Remove all claims about the dark Equinox palette, dice roller, undo and simulator.
8. Run a secret scan over the repo excluding node_modules and package-lock.json for: "postgres://", "postgresql://", "password", "secret", "service_role", and long JWT-looking strings (eyJ followed by 20+ base64url chars). Fix every hit that is a real credential. In your final report list only file paths and line numbers of findings, NEVER print secret values.

FILES TO INSPECT
package.json, .env.example, .gitignore, index.html, README.md, src/services/supabase.ts, test/*, repository root.

FILES LIKELY TO MODIFY
package.json, package-lock.json, .env.example, .gitignore, index.html, README.md, src/services/supabase.ts, src/vite-env.d.ts. Delete: app.js, styles.css, test/setupSchema.ts.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
None. The app UI must look and behave exactly as before.

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
No secrets in any tracked file. Env-only configuration. Do not add any service-role key anywhere in a Vite project.

ERROR HANDLING
Missing-env failure must be loud and human-readable.

TESTS
None new. Ensure existing test/gameEngine.test.ts still passes via "npm run test:legacy". "npm test" must exit 0 (no tests yet).

ACCEPTANCE CRITERIA
- npm ci, npm run typecheck, npm run build, npm test, npm run test:legacy all succeed (with a local .env.local providing dummy values for build if needed).
- Secret scan reports zero real credentials.
- app.js, styles.css, test/setupSchema.ts no longer exist; pg and @types/pg no longer in package.json.

MUST NOT CHANGE
Anything under src/ other than src/services/supabase.ts and src/vite-env.d.ts. No game logic, no components, no styling.

VERIFICATION STEPS
1. rm -rf node_modules && npm ci
2. npm run typecheck && npm run build && npm test && npm run test:legacy
3. Re-run the secret scan and confirm clean.
4. Final report must include the OWNER MANUAL STEPS: (a) rotate the Supabase database password (it was committed); (b) check git history for the old connection string and purge or start a fresh Supabase project for the event; (c) confirm the anon key in use is the project's public anon key only.
```

---

### PHASE 2 PROMPT — Database schema, RLS, auth model

```text
OBJECTIVE
Replace the insecure JSON-blob schema with a relational, RLS-protected schema managed by Supabase CLI migrations. No application UI changes in this phase. Nothing except read access is granted to clients; all writes will be added in Phase 3 as SECURITY DEFINER functions.

CONTEXT
STARTUPOLY = physical startup board game; website = live scoreboard + game management. Two user types: (1) Event Admin: authenticated laptop user (Supabase email+password) who records what happened physically; (2) Teams: one anonymous phone per team (Supabase anonymous sign-in), strictly read-only, allowed to see ONLY their own team's data. 5–6 teams per match; 50-minute gameplay; rooms have a lifecycle CREATED → LOBBY → ACTIVE → TIME_EXPIRED → FINALIZED. Only one non-finalized room may exist at a time. Each match is a new room; finished rooms are retained as immutable history.
Official rulebook data (source of truth):
- Start: cash 1000, company value (CV) 0, 0 businesses. Max 3 businesses per team. CV cannot go below 0. Business upgrade levels: 0 (base), 1, 2.
- Catalog (key | name | cost | initial CV | upgrade1 cost | upgrade2 cost | provisional):
  edtech | EdTech | 200 | 150 | 150 | 200 | no
  saas | SaaS | 300 | 180 | 200 | 250 | no
  ecommerce | E-Commerce | 300 | 180 | 200 | 250 | no
  fintech | FinTech | 400 | 200 | 250 | 300 | no
  healthtech | HealthTech | 400 | 200 | 250 | 300 | no
  ai_deeptech | AI / DeepTech | 500 | 250 | 300 | 350 | no
  devtools | DevTools / Infrastructure | 300 | 190 | 200 | 250 | YES
  cybersecurity | Cybersecurity | 400 | 220 | 250 | 300 | YES
  cleantech | CleanTech / Energy | 500 | 240 | 300 | 350 | YES
  robotics | Robotics & IoT | 500 | 250 | 300 | 350 | YES
  Upgrade CV gain: +300 (level 0→1), +400 (level 1→2) for every business.

EXACT REQUIREMENTS
1. Initialise the Supabase CLI project (supabase init) if absent; put all SQL in supabase/migrations/ as ordered files: 0001_schema.sql, 0002_constraints_triggers.sql, 0003_rls_grants.sql, 0004_catalog_seed.sql, 0005_realtime.sql, 0006_drop_legacy.sql. Add supabase/tests/ for pgTAP.
2. Types: enum room_status ('CREATED','LOBBY','ACTIVE','TIME_EXPIRED','FINALIZED').
3. Tables (all in schema public, all with RLS ENABLED):
   - admins(user_id uuid PK references auth.users on delete cascade)
   - rooms(id uuid PK default gen_random_uuid(), code text NOT NULL, status room_status NOT NULL default 'CREATED', team_count smallint NOT NULL check (team_count between 5 and 6), duration_seconds int NOT NULL default 3000 check (duration_seconds > 0), started_at timestamptz, ends_at timestamptz, finalized_at timestamptz, winner_team_id uuid, tiebreak_note text, created_by uuid references auth.users, created_at timestamptz default now()). code: exactly 6 chars from alphabet ABCDEFGHJKLMNPQRSTUVWXYZ23456789 (check constraint regex). Partial unique index on code where status <> 'FINALIZED'. Unique index on ((true)) where status <> 'FINALIZED' so only one non-finalized room exists. check (status in ('CREATED','LOBBY') or started_at is not null) is NOT required; instead check (ends_at is null or started_at is not null).
   - teams(id uuid PK, room_id uuid NOT NULL references rooms on delete restrict, slot smallint NOT NULL check (slot between 1 and 6), name text NOT NULL check (char_length(name) between 1 and 30), color text NOT NULL check (color ~ '^#[0-9A-Fa-f]{6}$'), cash integer NOT NULL default 1000 check (cash >= 0), cv integer NOT NULL default 0 check (cv >= 0), is_bankrupt boolean NOT NULL default false, tiebreak_order smallint, version integer NOT NULL default 0, created_at timestamptz default now(), unique(room_id, slot), unique(room_id, color), unique(id, room_id)).
   - team_secrets(team_id uuid PK references teams on delete cascade, join_pin text NOT NULL check (join_pin ~ '^[0-9]{4}$'))
   - team_claims(user_id uuid NOT NULL references auth.users on delete cascade, team_id uuid NOT NULL references teams on delete cascade, claimed_at timestamptz default now(), primary key (user_id, team_id))
   - join_attempts(id bigint identity PK, user_id uuid, team_id uuid, success boolean, attempted_at timestamptz default now())
   - business_catalog(key text PK, name text NOT NULL, cost int NOT NULL, initial_cv int NOT NULL, u1_cost int NOT NULL, u2_cost int NOT NULL, u1_cv int NOT NULL default 300, u2_cv int NOT NULL default 400, is_provisional boolean NOT NULL default false, sort_order smallint NOT NULL)
   - team_businesses(id uuid PK default gen_random_uuid(), room_id uuid NOT NULL, team_id uuid NOT NULL, business_key text NOT NULL references business_catalog, level smallint NOT NULL default 0 check (level between 0 and 2), acquired_at timestamptz default now(), unique(room_id, business_key), foreign key (team_id, room_id) references teams(id, room_id))
   - activity_events(id bigint generated always as identity PK, room_id uuid NOT NULL references rooms, team_id uuid references teams, group_id uuid, request_id uuid unique, type text NOT NULL check (type in ('ROOM_CREATED','TEAM_CONFIGURED','LOBBY_OPENED','TEAM_CLAIMED','TEAM_RELEASED','GAME_STARTED','CASH_SET','CV_SET','ADJUSTMENT','BUSINESS_ADDED','BUSINESS_LEVEL_SET','BUSINESS_REMOVED','BANKRUPTCY_SET','TIEBREAK_SET','TIME_EXPIRED','GAME_FINALIZED')), business_key text, prev jsonb, new jsonb, note text, is_correction boolean NOT NULL default false, actor_id uuid, created_at timestamptz NOT NULL default now())
   - final_results(room_id uuid references rooms, team_id uuid references teams, rank smallint NOT NULL, cv int NOT NULL, cash int NOT NULL, business_count smallint NOT NULL, is_bankrupt boolean NOT NULL, primary key (room_id, team_id))
   Add indexes: teams(room_id), team_businesses(team_id), activity_events(room_id, id desc), activity_events(room_id, team_id), team_claims(team_id).
4. Helper functions: public.is_admin() returns boolean, SECURITY DEFINER, STABLE, SET search_path = public, checks exists(admins where user_id = auth.uid()). public.app_now() returns timestamptz: returns now(), unless current_setting('app.test_now', true) is non-empty AND current_setting('app.env', true) = 'test', in which case return that timestamp (used by tests to control time). Revoke EXECUTE on app_now from anon/authenticated only if it is not called from client-facing SQL; otherwise keep it harmless.
5. Triggers (in 0002): 
   - business cap: BEFORE INSERT on team_businesses raises 'BUSINESS_CAP' if the team would have more than 3.
   - room immutability: BEFORE INSERT/UPDATE/DELETE on teams, team_businesses, and BEFORE UPDATE/DELETE on rooms raises 'ROOM_FINALIZED' if the parent room status is FINALIZED (allow the single UPDATE that sets status to FINALIZED itself).
   - status transitions: BEFORE UPDATE on rooms allows only the forward moves CREATED→LOBBY→ACTIVE→TIME_EXPIRED→FINALIZED, raising 'INVALID_TRANSITION' otherwise.
   - activity_events and final_results: BEFORE UPDATE OR DELETE raise 'IMMUTABLE'.
6. Privileges & RLS (0003): REVOKE ALL on all tables from anon and authenticated, then GRANT SELECT only where a policy below exists. NO insert/update/delete grants to anon/authenticated on any table. Policies (use (select auth.uid()) form):
   - admins: select own row.
   - rooms: SELECT for is_admin(); SELECT for a user who has a claim on any team in that room.
   - teams: SELECT for is_admin(); SELECT for rows where a team_claims row exists for auth.uid() and that team_id.
   - team_secrets: SELECT for is_admin() only.
   - team_claims: SELECT for is_admin(); SELECT own rows (user_id = auth.uid()).
   - join_attempts: no policies (no access).
   - business_catalog: SELECT for all roles (anon and authenticated).
   - team_businesses: SELECT for is_admin(); SELECT own team's rows via claim.
   - activity_events: SELECT for is_admin() only.
   - final_results: SELECT for is_admin(); SELECT for a user with a claim on a team in that room AND the room status = 'FINALIZED'.
7. Seed (0004): insert the 10 catalog rows exactly as listed in CONTEXT, with sort_order 1..10, provisional flags as listed.
8. Realtime (0005): add rooms, teams, team_businesses, activity_events to the supabase_realtime publication (idempotent). Set REPLICA IDENTITY FULL on team_businesses (so DELETE events carry team_id).
9. Legacy (0006): DROP TABLE IF EXISTS match_events, matches CASCADE. Add a SQL comment header that this migration is destructive and must only be run after the owner confirms no old match data is needed.
10. Auth configuration (document in supabase/README.md and verify in the Supabase dashboard): enable Anonymous sign-ins; disable public email sign-ups and email confirmation is irrelevant; create the admin user(s) manually and insert their user_id into admins via a SQL snippet documented in the README (do not commit real emails). Note that toggles for sign-ups and anonymous sign-ins may interact — document the configuration that actually works.
11. Generate TypeScript types: supabase gen types typescript --local > src/data/database.types.ts (create the folder). Do not import them anywhere yet.

FILES TO INSPECT
test/setupSchema.ts history (already deleted in Phase 1: refer to old table names matches/match_events), src/services/supabase.ts, src/types/game.ts (only to understand what is being replaced).

FILES LIKELY TO MODIFY/CREATE
supabase/config.toml, supabase/migrations/0001..0006, supabase/tests/*.sql, supabase/README.md, src/data/database.types.ts, package.json (scripts: "db:start": "supabase start", "db:reset": "supabase db reset", "db:test": "supabase test db", "db:types").

DATA MODEL CHANGES
As specified above — this is the whole phase.

UI REQUIREMENTS
None.

STATE-MANAGEMENT REQUIREMENTS
None.

SECURITY REQUIREMENTS
Deny by default. No client can insert/update/delete anything. team_secrets, activity_events, join_attempts are unreadable by teams. Team A's user must be unable to select Team B's row, businesses or claims. Anonymous users who never claimed a team must see nothing except business_catalog. No service-role key in the frontend.

ERROR HANDLING
Trigger errors use short machine-readable messages (BUSINESS_CAP, ROOM_FINALIZED, INVALID_TRANSITION, IMMUTABLE) so the app can map them later.

TESTS (pgTAP in supabase/tests/)
- constraints: team_count 4 and 7 rejected; slot 7 rejected; negative cash/cv rejected; level 3 rejected; duplicate business in a room rejected; 4th business for a team rejected; second non-finalized room rejected; bad color/code format rejected.
- immutability: after status FINALIZED, inserts/updates on teams/team_businesses fail; activity_events/final_results UPDATE/DELETE fail; backward status transition fails.
- RLS isolation (use set local role authenticated + set_config('request.jwt.claims', ...) to impersonate): user A claimed on team 1 sees exactly team 1 row and its businesses, zero rows of team 2, team_secrets, activity_events; unclaimed anonymous user sees zero rows everywhere except business_catalog; admin sees all; nobody (including admin) can INSERT/UPDATE/DELETE directly; final_results visible to claimed user only when FINALIZED.
- catalog seed has 10 rows and matches the values above.

ACCEPTANCE CRITERIA
- supabase db reset applies all migrations cleanly on a fresh local database.
- supabase test db passes.
- Types file generated and compiles under npm run typecheck.

MUST NOT CHANGE
Any React code, existing components, or routing. Do not add RPC functions yet (except is_admin and app_now).

VERIFICATION STEPS
1. npm run db:start && npm run db:reset
2. npm run db:test (all green)
3. Manually as an impersonated non-claimed anon role, confirm `select * from teams` returns 0 rows and `insert into teams ...` errors with permission denied.
4. npm run typecheck && npm run build
```

---

### PHASE 3 PROMPT — Database functions (lifecycle, timer, edits, ranking, join)

```text
OBJECTIVE
Implement every write path and every team-facing read path as SECURITY DEFINER Postgres functions that enforce the official STARTUPOLY rules, write the audit log in the same transaction, and derive the game timer from the database clock. Then cover them with pgTAP tests. No frontend changes.

CONTEXT
STARTUPOLY is a physical board game; the website records state only. Admin (authenticated, in admins table) records cash, company value (CV), purchased businesses, upgrade levels; teams (anonymous Supabase sessions) are read-only. Schema from Phase 2 exists: rooms, teams, team_secrets, team_claims, join_attempts, business_catalog, team_businesses, activity_events, final_results, admins, plus is_admin() and app_now() (test clock).
Rules to enforce (official rulebook):
- Start 1000 cash / 0 CV / 0 businesses; max 3 businesses; unique owner per business; levels 0–2; CV never below 0; cash never below 0 (a team that cannot pay must do a forced sale first).
- Buying a business: cash -= cost, CV += initial_cv. Upgrade 0→1: cash -= u1_cost, CV += u1_cv (300). Upgrade 1→2: cash -= u2_cost, CV += u2_cv (400).
- Forced sale: business removed (level lost), cash += purchase cost, CV NOT reduced. No voluntary selling: removal requires a reason.
- Bankruptcy: team eliminated; its businesses return to the bank (rows deleted); excluded from winning.
- Game lasts exactly 50:00 from admin start; cannot be paused; at 00:00 everything freezes.
- Winner = highest CV among NON-bankrupt teams; tie-breaks: higher cash, then more businesses, then a judged pitch (admin records the order).
Lifecycle: CREATED → LOBBY → ACTIVE → TIME_EXPIRED → FINALIZED. TIME_EXPIRED is DERIVED: any function first calls expire_if_due(room_id), which flips ACTIVE→TIME_EXPIRED when app_now() >= ends_at (idempotent, writes one TIME_EXPIRED event). No browser or cron is responsible for expiry.

EXACT REQUIREMENTS
Create migrations 0007_functions_core.sql, 0008_functions_admin.sql, 0009_functions_team.sql, 0010_standings_finalize.sql. All functions: SECURITY DEFINER, SET search_path = public, EXECUTE revoked from PUBLIC and granted only to the roles that need it (authenticated for admin_*, get_*, join_team; server_time to anon and authenticated). Errors: RAISE EXCEPTION with MESSAGE = one of these codes and DETAIL = a JSON string with context: NOT_ADMIN, NOT_AUTHENTICATED, ROOM_NOT_FOUND, INVALID_TRANSITION, ROOM_NOT_EDITABLE, VERSION_CONFLICT, INVALID_VALUE, INSUFFICIENT_CASH, BUSINESS_CAP, BUSINESS_OWNED, BUSINESS_NOT_OWNED, TEAM_BANKRUPT, NOTE_REQUIRED, TEAMS_NOT_JOINED, UNRESOLVED_TIE, BAD_CODE_OR_PIN, TOO_MANY_ATTEMPTS, NON_FINAL_ROOM_EXISTS.

Public / team-side:
1. server_time() → timestamptz (app_now()).
2. get_lobby(code text) → json: {status, team_count, teams:[{slot,name,color,claimed}]} only for rooms in LOBBY/ACTIVE/TIME_EXPIRED; never return ids or PINs. Unknown code → BAD_CODE_OR_PIN (same error for all failures).
3. join_team(code text, slot int, pin text) → json {team_id, room_id}. Requires auth.uid() not null. Throttle: if ≥5 failed attempts for (auth.uid()) in the last 60 s (join_attempts) → TOO_MANY_ATTEMPTS. Compare pin to team_secrets; log attempt; on success upsert team_claims (idempotent) and write TEAM_CLAIMED event only the first time. Allowed in LOBBY/ACTIVE/TIME_EXPIRED.
4. get_my_state() → json for auth.uid()'s most recent claim in a non-FINALIZED room, otherwise in the most recently finalized room: {room:{status, started_at, ends_at, server_now}, team:{slot,name,color,cash,cv,is_bankrupt}, businesses:[{business_key,name,level,cost,initial_cv,cv_contribution}], leaderboard: null unless room FINALIZED, in which case [{rank,name,color,cv,cash,business_count,is_bankrupt}]}. cv_contribution = initial_cv + (level>=1 ? u1_cv:0) + (level>=2 ? u2_cv:0). It calls expire_if_due first. It NEVER returns other teams' data before FINALIZED, never returns ids of other teams, PINs or versions.

Admin-side (all begin with: is_admin() else NOT_ADMIN; lock the room row FOR UPDATE; expire_if_due):
5. admin_create_room(team_count int, teams jsonb) → room. teams = array of {name,color} of length team_count. Generates a 6-char code from the safe alphabet (retry on collision) and a random 4-digit PIN per team (unique within the room). Inserts teams (slot 1..n) and team_secrets; event ROOM_CREATED. Fails with NON_FINAL_ROOM_EXISTS if another non-finalized room exists.
6. admin_update_team_config(team_id, name, color) — only CREATED/LOBBY; event TEAM_CONFIGURED.
7. admin_open_lobby(room_id) CREATED→LOBBY; event LOBBY_OPENED.
8. admin_release_team(team_id) — deletes all claims for the team; event TEAM_RELEASED (LOBBY/ACTIVE/TIME_EXPIRED).
9. admin_start_game(room_id, force boolean default false) LOBBY→ACTIVE; if any team has no claim and force is false → TEAMS_NOT_JOINED with the unclaimed slots in DETAIL; sets started_at = app_now(), ends_at = started_at + duration_seconds; event GAME_STARTED.
Edit functions (common contract): parameters include expected_version int (per team), request_id uuid, note text default null. Steps: is_admin; lock room then team rows (order by id); expire_if_due; room status must be ACTIVE, or TIME_EXPIRED in which case note is REQUIRED (NOTE_REQUIRED) and events are written with is_correction = true; otherwise ROOM_NOT_EDITABLE; IDEMPOTENCY: if an event with this request_id exists, return the current state without applying again; team.version must equal expected_version else VERSION_CONFLICT (DETAIL includes current version and values); apply; increment version; write events with prev/new JSON; return the updated team snapshot json (team fields + businesses).
10. admin_set_team_values(team_id, cash int default null, cv int default null, expected_version, request_id, note) — absolute set; each non-null value must be >= 0 else INVALID_VALUE; writes CASH_SET / CV_SET events with prev/new.
11. admin_adjust(changes jsonb, label text, note, request_id) — ATOMIC multi-team deltas; changes = [{team_id, cash_delta, cv_delta, expected_version}]. Lock teams ordered by id. Resulting cash < 0 → INSUFFICIENT_CASH (DETAIL: team_id and shortfall) and NOTHING is applied. Resulting CV < 0 → clamp CV to 0 (rule: CV cannot fall below zero) and record clamped=true in the event's new JSON. All events share one group_id; type ADJUSTMENT with label in note-prefix.
12. admin_add_business(team_id, business_key, apply_purchase boolean default true, expected_version, request_id, note): team not bankrupt; not owned in room (BUSINESS_OWNED); team has <3 (BUSINESS_CAP). If apply_purchase: cash -= cost (INSUFFICIENT_CASH if short) and cv += initial_cv; otherwise record ownership only. Event BUSINESS_ADDED with prev/new including any cash/cv change.
13. admin_set_business_level(team_id, business_key, new_level, apply_upgrade boolean default true, expected_version, request_id, note): must be owned. If apply_upgrade: new_level must equal level+1 and applies cost/CV from catalog (INSUFFICIENT_CASH if short). Any other change (skip levels, downgrade) requires apply_upgrade = false AND a note, and changes only the level. Event BUSINESS_LEVEL_SET.
14. admin_remove_business(team_id, business_key, reason text check in ('FORCED_SALE','BANKRUPTCY','CORRECTION'), credit_resale boolean default true, expected_version, request_id, note): deletes the ownership row (level lost). FORCED_SALE with credit_resale → cash += catalog cost. CV never changes. Event BUSINESS_REMOVED with reason in new JSON.
15. admin_set_bankrupt(team_id, value boolean, expected_version, request_id, note): true → is_bankrupt = true and delete all its team_businesses (one BUSINESS_REMOVED event each, reason BANKRUPTCY); false requires note (correction). Event BANKRUPTCY_SET.
16. admin_set_tiebreak(room_id, ordered_team_ids uuid[], note) — only TIME_EXPIRED; sets tiebreak_order 1..n in the given order, clears others in the list; event TIEBREAK_SET; store judge note in rooms.tiebreak_note.
17. room_standings(room_id) → table(team_id, slot, name, rank, is_bankrupt, cv, cash, business_count, tiebreak_order, tie_unresolved boolean). Order: is_bankrupt asc, cv desc, cash desc, business_count desc, tiebreak_order asc nulls last, slot asc. A tie group = teams with identical (is_bankrupt, cv, cash, business_count); tie_unresolved = group size > 1 and (any member has NULL tiebreak_order OR two members share the same value). rank = position in that order (1-based). Admin-only via wrapper get_standings(room_id).
18. admin_finalize(room_id): expire_if_due; status must be TIME_EXPIRED (else INVALID_TRANSITION); if any tie_unresolved → UNRESOLVED_TIE with the tied team ids; snapshot standings into final_results; set winner_team_id = rank-1 team if not bankrupt else NULL; status FINALIZED, finalized_at; event GAME_FINALIZED.
19. get_admin_snapshot(room_id) → json {room, server_now, teams:[{id,slot,name,color,cash,cv,is_bankrupt,version,claimed,tiebreak_order,pin, businesses:[{business_key,name,level}]}], events: last 200 (id,created_at,team_id,type,business_key,prev,new,note,is_correction,group_id)}. Includes PINs (admin only).
20. list_history() → finalized rooms [{room_id, code, created_at, finalized_at, winner_name, team_count}] ; get_history_detail(room_id) → {room, results (from final_results joined to team names/colors), events}.

FILES TO INSPECT
supabase/migrations/0001–0006, supabase/tests/*, src/data/database.types.ts.

FILES LIKELY TO MODIFY/CREATE
supabase/migrations/0007–0010, supabase/tests/*.sql, src/data/database.types.ts (regenerate), supabase/README.md (document every function and error code).

DATA MODEL CHANGES
Only functions (plus optional helper indexes). No table changes unless a defect in Phase 2 is found — if so, fix it in a new migration and report it.

UI REQUIREMENTS
None.

STATE-MANAGEMENT REQUIREMENTS
Server-side only: optimistic concurrency via teams.version; idempotency via request_id; deadlock avoidance via ordered locking.

SECURITY REQUIREMENTS
Every admin_* and get_admin_* starts with is_admin(). Anonymous sessions can only call server_time, get_lobby, join_team, get_my_state. No function accepts a user id from the client — always auth.uid(). Never return PINs except in get_admin_snapshot. Uniform BAD_CODE_OR_PIN for unknown code, wrong slot and wrong PIN.

ERROR HANDLING
All error codes above with structured DETAIL. No function may silently clamp cash, or silently ignore an invalid request.

TESTS (pgTAP; use set_config('app.env','test',true) and set_config('app.test_now', ...) to control time)
- create room: 5 and 6 teams OK; 4 and 7 fail; PINs unique per room; second non-final room fails; non-admin fails.
- lobby/join: get_lobby exposes no ids/PINs; right PIN joins; wrong PIN/slot/code identical error; 6th failure within 60 s throttled; reconnect with same uid idempotent; different uid with right PIN also claims (multi-device); release removes access immediately.
- isolation via get_my_state: team 1 never sees team 2 data; before FINALIZED leaderboard is null; after FINALIZED it is present.
- start: TEAMS_NOT_JOINED unless force; started_at/ends_at exact = 50:00; cannot start twice.
- timer: at started_at+2999 s edits succeed; at +3000 s the room becomes TIME_EXPIRED (one TIME_EXPIRED event even after many calls); normal edits then fail with NOTE_REQUIRED; with a note they succeed and are is_correction = true; get_my_state after expiry reports TIME_EXPIRED without any admin call.
- edits: absolute set; negative rejected; VERSION_CONFLICT with current values; duplicate request_id applies once; atomic admin_adjust rolls back fully on INSUFFICIENT_CASH; CV clamps to 0 with clamped flag.
- businesses: buy applies −cost/+CV; 4th business BUSINESS_CAP; already-owned BUSINESS_OWNED; upgrades 0→1 (−u1, +300) and 1→2 (−u2, +400) for every catalog row via a table-driven test; skip-level needs apply_upgrade=false + note; forced sale credits cost and leaves CV unchanged; bankrupt deletes businesses.
- standings: CV order; cash tiebreak; business-count tiebreak; tiebreak_order resolves; unresolved tie blocks finalize; bankrupt teams ranked after all active; all-bankrupt → winner NULL.
- finalize: writes final_results, room immutable afterwards, history functions return it.
- events: every mutation produced the expected event rows with prev/new and actor_id.

ACCEPTANCE CRITERIA
supabase db reset && supabase test db → all green. Each rule row in the Rule/Code Mismatch Report that has a DB responsibility (R2–R9, R11–R12, R16–R22, R24) has at least one passing test. No client-side code changed.

MUST NOT CHANGE
Any React/TypeScript source except regenerating src/data/database.types.ts. Do not weaken any Phase 2 RLS policy or constraint.

VERIFICATION STEPS
1. npm run db:reset && npm run db:test
2. In psql as an impersonated anonymous user, call admin_create_room and confirm NOT_ADMIN; call get_my_state before joining and confirm an empty/no-team result rather than any data.
3. npm run typecheck && npm run build
```

---

### PHASE 4 PROMPT — App foundation, real admin auth, design system, legacy removal

```text
OBJECTIVE
Replace the legacy digital-game-engine frontend with a clean scoreboard app foundation: router, real Supabase admin auth, typed data layer over the Phase 3 RPCs, server-clock hook, pure domain helpers, design tokens and UI primitives. Delete all legacy code. Work on branch "rebuild"; the app is not deployable until Phase 10.

CONTEXT
STARTUPOLY is a physical board game; the website is a live scoreboard + game management system (NOT a digital board game). Users: Event Admin (authenticated, desktop-first) and Teams (anonymous phone, read-only, mobile-first). Backend (Phases 2–3): Postgres tables + SECURITY DEFINER RPCs listed in supabase/README.md; error codes come back as the exception MESSAGE (NOT_ADMIN, VERSION_CONFLICT, INSUFFICIENT_CASH, …) with JSON DETAIL. Stack stays: Vite + React 19 + TS + Tailwind 4 + supabase-js. Palette: Sky #5C94FC, Arcade Green #22B14C, Coin Gold #FFCC00, Brick Brown #B84418, Card White #FFFFFF, Dark Navy #102040, Expense Red #D32F2F. Visual direction: 8-bit NES platformer meets polished mobile game UI; NOT a finance dashboard.
Catalog (from DB business_catalog): 10 businesses; upgrade CV +300 (0→1) and +400 (1→2); rent = 50/75/100% of cost by level; owner landing CV = 50/75/100% of initial CV; START = +₹200 cash and growth CV +200 (2 businesses) / +500 (3 businesses).

EXACT REQUIREMENTS
1. Dependencies: add react-router-dom; add @testing-library/react, @testing-library/jest-dom, jsdom (dev). Configure Vitest (jsdom environment, setup file). Keep clsx/tailwind-merge/lucide-react. Do not add state-management libraries.
2. DELETE (verify each with git rm and that nothing references it): src/context/GameContext.tsx, src/engine/gameEngine.ts, src/constants/{board,cards,theme,businesses}.ts, src/types/game.ts, src/utils/audio.ts, src/components/** (all admin, player, simulator, common, auth components), test/gameEngine.test.ts, and the "test:legacy" script and the tsx devDependency. Also remove root index.css classes that only served deleted components (keep only what the new design system needs).
3. New structure: src/routes/{public,admin,team}/, src/data/ (client, rpc wrappers, hooks), src/domain/, src/ui/ (design system), src/lib/ (env, errors, format, clock).
4. Routing (BrowserRouter): / (landing: two big buttons JOIN GAME and ADMIN), /join, /team, /admin/login, /admin (index), /admin/room/:roomId, /admin/history, /admin/history/:roomId, * (NotFound). Add a RequireAdmin route guard. Routes not yet implemented in later phases must simply not exist yet (no stub pages) — except /admin, /join and /team which show a minimal real "coming next" page ONLY inside their route files if needed to keep the build meaningful; keep these as small as possible and list them in the final report so Phase 5/6 replace them.
5. Supabase client (src/data/client.ts): single typed client (Database types from src/data/database.types.ts), persistSession true, autoRefreshToken true. Export helpers ensureAnonymousSession() (signInAnonymously only if there is no session) and getSessionRole() → 'admin' | 'team' | 'none' (admin determined by calling a small RPC or selecting own row from admins — never by localStorage flags).
6. Admin auth: /admin/login = email + password form using supabase.auth.signInWithPassword; on success verify admins membership; if not an admin, sign out and show "Not an admin account". Logout button. Remove ALL hardcoded passcodes and hints.
7. Typed RPC layer (src/data/rpc.ts): one function per RPC from Phase 3 with typed params/returns. All calls go through a wrapper that (a) throws AppError {code, message, detail} parsed from the Postgres error (code = the MESSAGE string), (b) never swallows errors. src/lib/errors.ts maps every code to a short human message and a flag "retryable".
8. src/lib/clock.ts + hook useServerClock(endsAt: string | null): calls server_time() on mount, on window "online" and on document visibilitychange→visible; computes offset = serverNow − (Date.now() + rtt/2); returns {remainingMs, status: 'idle'|'running'|'expired'}; ticks with a 1 s interval but derives every value from Date.now()+offset (no decrementing counters). Provide formatMMSS().
9. src/domain/ (pure TS, no React, no Supabase): types for Business (catalog row), Level 0|1|2, money formatter formatINR (en-IN, ₹), upgradeCost(b, currentLevel), upgradeCvGain(b, currentLevel), rentFor(b, level) = round(cost*{0.5,0.75,1}), landingCvFor(b, level) = round(initial_cv*{0.5,0.75,1}), startReward(businessCount) → {cash:200, cv: 0 | 200 | 500}, cvContribution(b, level) = initial_cv + (level>=1?u1_cv:0) + (level>=2?u2_cv:0), resaleValue(b) = cost, canAddBusiness(count) = count < 3.
10. src/ui/ design system with Tailwind 4 @theme tokens for the palette above, pixel display font (Press Start 2P for titles/labels ONLY) and a highly legible mono/tabular font for numbers (VT323 or JetBrains Mono; already loaded in index.html), 3–4 px hard borders, hard offset shadows (no blur), radius small (4–8 px). Components: PixelButton (variants primary green, secondary gold, danger red, ghost; min height 48 px), PixelCard, BigNumber (label + value, tabular), StatusPill, ConnectionPill, Modal/ConfirmDialog, TextField/NumberField (inputMode numeric), Toast, Skeleton, EmptyState, ErrorBanner, Countdown (MM:SS + label), ColorSwatchPicker. Respect prefers-reduced-motion. No sound. No particle effects.
11. ErrorBoundary at app root with a friendly reload screen; global unhandled RPC errors surface via Toast.
12. index.html/theme: body background sky blue; no dark theme.

FILES TO INSPECT
Everything under src/ before deleting (to confirm nothing valuable is lost — the only reusable ideas are the economy numbers, already in the DB catalog and in the CONTEXT above), supabase/README.md, src/data/database.types.ts.

FILES LIKELY TO MODIFY/CREATE
package.json, vite.config.ts (vitest), tailwind/postcss config or CSS @theme, index.html, src/main.tsx, src/App.tsx, src/index.css, all new files under src/{routes,data,domain,ui,lib}.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
Only the landing page, admin login, and the design-system primitives are fully designed in this phase. Admin layouts are desktop-first (min 1100 px design width); team layouts are mobile-first (360–430 px). Buttons ≥ 44 px targets. Text contrast ≥ 4.5:1 on white cards.

STATE-MANAGEMENT REQUIREMENTS
No global god-context. Small hooks and a single AuthProvider (session + role only). Server is the source of truth; no game state in localStorage; the only localStorage use is supabase-js's own session persistence.

SECURITY REQUIREMENTS
Role from the server, never from localStorage. No admin route renders without a verified admin. No secrets in the bundle other than the public URL + anon key.

ERROR HANDLING
Every rpc failure becomes an AppError with a mapped message; loading/error/empty states on every async view; env-missing screen from Phase 1 remains.

TESTS
Vitest: domain functions table-driven against the rulebook (all 10 businesses × levels for upgrade cost, rent, landing CV, cvContribution; START reward for 0,1,2,3 businesses; canAddBusiness); error mapper covers every code; useServerClock with fake timers (offset applied, expiry, refetch on visibility); RequireAdmin redirects unauthenticated users; login rejects a non-admin.

ACCEPTANCE CRITERIA
- No file from the DELETE list remains; no import errors; npm run typecheck, npm test, npm run build succeed; bundle is smaller than before.
- Admin can log in with a real Supabase admin user; a non-admin user is refused; refresh keeps the admin session; logout works.
- Landing page and login match the visual direction (sky background, brick ground strip, pixel title).

MUST NOT CHANGE
supabase/** migrations and tests. Do not add gameplay logic. Do not reintroduce dice/turn/board concepts.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. npm run dev; visit /admin/login; log in as the seeded admin; refresh; confirm session persists; visit /admin/history unauthenticated in a private window and confirm redirect.
3. grep -r "equinox\|passcode\|simulator\|processRoll" src → no matches.
```

---

### PHASE 5 PROMPT — Admin: create room, configure teams, lobby, start

```text
OBJECTIVE
Build the admin flow from "no room" to "game started": create a room, configure 5–6 teams (names + colors), show the room code and per-team PINs, open the lobby, watch teams join live, and start the 50-minute game.

CONTEXT
STARTUPOLY is a physical board game; the website is a live scoreboard + game management system. Event Admin (authenticated laptop user, desktop-first) operates it; teams are anonymous read-only phones that join with room code + team + PIN. Foundation from Phase 4 exists (router, AuthProvider, typed RPC layer in src/data/rpc.ts, useServerClock, UI primitives, domain helpers). Backend RPCs (Phase 3): admin_create_room(team_count, teams jsonb[{name,color}]), admin_update_team_config, admin_open_lobby, admin_release_team, admin_start_game(room_id, force), get_admin_snapshot(room_id). Room lifecycle: CREATED → LOBBY → ACTIVE → TIME_EXPIRED → FINALIZED. Only one non-finalized room can exist. Teams: 5 minimum, 6 maximum. Palette: Sky #5C94FC, Green #22B14C, Gold #FFCC00, Brick #B84418, White #FFFFFF, Navy #102040, Red #D32F2F.

EXACT REQUIREMENTS
1. /admin (index): call a small "current room" lookup (the non-finalized room, via get_admin_snapshot or a dedicated select). If one exists → redirect to /admin/room/:roomId. Else show the Create Room screen plus a link to History.
2. Create Room screen: choose team count (5 or 6, big segmented control); for each team: name (1–30 chars, default "Team 1…"), color from a fixed swatch list of 6 distinct, high-contrast colors that are legible on white and navy (define them as tokens; none may equal another). Validate uniqueness of names and colors client-side; the DB is still the authority. Submit → admin_create_room → navigate to /admin/room/:roomId.
3. /admin/room/:roomId renders by status:
   - CREATED: team config editor (rename/recolor via admin_update_team_config) + big button OPEN LOBBY (with confirm).
   - LOBBY: HUGE room code (readable from 3 m away, monospaced, letter-spaced) and a card per team with name, color, PIN (large), and a live "JOINED / NOT JOINED" pill; per-team RELEASE button (confirm) for lost/wrong devices; joined counter "4/6 teams joined"; big START GAME button. Clicking START opens a confirm dialog that lists any unjoined teams and requires an explicit "Start anyway" (calls admin_start_game with force=true); if all joined, single confirm. No countdown before start (the 50:00 clock starts only on ACTIVE).
   - ACTIVE / TIME_EXPIRED / FINALIZED: for now render a compact, READ-ONLY summary page: status pill, large Countdown (server-clock based), and a table of teams (name/color, cash, CV, businesses count). Phase 7 and 9 replace this with the full console; structure the route so that swap is a one-component change.
4. Data hook useAdminRoom(roomId): fetches get_admin_snapshot, subscribes to Realtime postgres_changes on rooms, teams, team_businesses, team_claims? (admins can read claims) and activity_events filtered by room_id, and on ANY event refetches the snapshot (debounced 150 ms). Do not patch state from event payloads. Expose {snapshot, status:'loading'|'ready'|'error', error, refetch, connection}.
5. Realtime channel management: one channel per room per hook instance, cleaned up on unmount, safe under React StrictMode double-mount (no duplicate channels/handlers), removeChannel on cleanup.
6. Show ConnectionPill (connected / reconnecting / offline) and the "last updated" age.

FILES TO INSPECT
src/data/rpc.ts, src/data/client.ts, src/lib/errors.ts, src/lib/clock.ts, src/ui/*, src/routes/admin/*, supabase/README.md, src/data/database.types.ts.

FILES LIKELY TO MODIFY/CREATE
src/routes/admin/{AdminIndex,CreateRoom,RoomPage,LobbyView,SetupView,ActiveSummary}.tsx, src/data/useAdminRoom.ts, src/data/realtime.ts (channel helper), tests.

DATA MODEL CHANGES
None (if a needed read is missing from Phase 3, report it and add the smallest possible RPC in a new migration with a pgTAP test — do not select tables directly with broad queries).

UI REQUIREMENTS
Desktop-first (≥1100 px), large controls (≥48 px), clear confirmation dialogs, arcade styling per design system. The lobby screen must be readable when projected. No emojis as the only signal; use color + text. Empty/loading/error states for every panel.

STATE-MANAGEMENT REQUIREMENTS
Server snapshot + refetch-on-event. Buttons disable while their RPC is pending; every mutating call sends a fresh request_id (crypto.randomUUID()) so a double-click or retry cannot double-apply. After each successful mutation, refetch.

SECURITY REQUIREMENTS
All screens under RequireAdmin. PINs are displayed only on admin screens and never logged to console. Do not put PINs or the room code in the URL.

ERROR HANDLING
Map: NON_FINAL_ROOM_EXISTS → redirect to that room; TEAMS_NOT_JOINED → open the force-start dialog; INVALID_TRANSITION / ROOM_NOT_EDITABLE → toast + refetch; NOT_ADMIN → sign out and go to login; network failure → inline retry.

TESTS
Vitest + Testing Library with the RPC layer mocked: create-room validation (duplicate name/color blocked, 5 and 6 only), redirect when a room already exists, lobby renders joined/not-joined from snapshot, force-start dialog lists unjoined teams, StrictMode does not create duplicate channels (assert channel count), buttons disabled while pending, request_id differs per click but is stable across an automatic retry of the same action.

ACCEPTANCE CRITERIA
Admin can create a 5- or 6-team room, see code + PINs, open lobby, see teams flip to JOINED live (verified in Phase 6), release a team, and start the game; the ACTIVE summary shows the server-driven countdown; refreshing the page at any status returns to the same screen with the correct clock.

MUST NOT CHANGE
supabase/** (except the optional minimal RPC noted), the domain helpers' behavior, the delete list from Phase 4.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. Local Supabase + dev server: create a 5-team room; refresh in each status; open two admin tabs and confirm both update live when one opens the lobby.
3. In the Supabase SQL editor confirm one ROOM_CREATED, one LOBBY_OPENED, one GAME_STARTED event exist.
```

---

### PHASE 6 PROMPT — Team app: join, reconnect, waiting, live dashboard

```text
OBJECTIVE
Build the mobile-first, strictly read-only team experience: join with room code + team + PIN, survive refresh/close/network loss, wait in the lobby, then show the live dashboard with the authoritative countdown.

CONTEXT
STARTUPOLY is a physical board game; teams play physically and only LOOK at this scoreboard on one phone per team. Teams have no accounts: each phone gets a Supabase anonymous session (persisted by supabase-js) and links to a team by calling join_team(code, slot, pin). Backend RPCs available (Phase 3): get_lobby(code) → {status, team_count, teams:[{slot,name,color,claimed}]}; join_team(code, slot, pin); get_my_state() → {room:{status,started_at,ends_at,server_now}, team:{slot,name,color,cash,cv,is_bankrupt}, businesses:[{business_key,name,level,cost,initial_cv,cv_contribution}], leaderboard: null | [...] (only after FINALIZED)}; server_time(). Teams must never see other teams' data before FINALIZED, never see admin data, never edit anything. Foundation from Phase 4 exists (router, RPC layer, useServerClock, UI primitives, domain helpers).
Design reference: 8-bit NES platformer meets polished mobile game UI. Sky #5C94FC background with pixel clouds, brick-brown ground strip at the bottom, green pipe accents, white chunky-bordered cards, gold coin for cash, navy status bar. Use ORIGINAL pixel art (do not use Mario, Toad or Nintendo sprites). From the reference take composition, spacing, hierarchy and atmosphere; DO NOT copy: LOGIN button, player roster/host, Rules/Settings tabs, bonus "Collect" buttons, or the "Recent Activity" list. No bottom navigation.

EXACT REQUIREMENTS
1. Route /join (three steps on one screen, big touch targets, numeric keypad for PIN via inputMode="numeric"):
   a. Enter 6-char room code (auto-uppercase, safe-alphabet only) → call get_lobby(code).
   b. Show team tiles (name + color only; tiles already claimed are still selectable because a team may have several phones/reconnect).
   c. Enter 4-digit PIN → ensureAnonymousSession() then join_team. On success navigate to /team. All failures show the same neutral message ("Code, team or PIN didn't match") except TOO_MANY_ATTEMPTS ("Too many tries — wait a minute").
2. Route /team (guard: requires an anonymous session that has a claim; otherwise redirect to /join). Fetch get_my_state() and render by room status:
   - LOBBY: "You're in! Waiting for the game to start" + team name/color + starting stats.
   - ACTIVE: the dashboard: team name + color chip; game clock (Countdown MM:SS with label "GAME TIME LEFT", turns red and pulses gently below 05:00 and 01:00 — subtle, reduced-motion safe); HUGE cash "₹1,450" (gold coin icon); HUGE CV "1,850 CV"; "YOUR BUSINESSES n/3" list of cards: business name, "Level 0/1/2" (pixel level pips), and "CV value ₹/CV" showing cv_contribution labelled exactly "CV contribution"; empty state "No businesses yet". Bankrupt team: full-width red "ELIMINATED" banner; values still shown.
   - TIME_EXPIRED: "GAME OVER" full-screen state with the team's final-looking values labelled "Final scores pending" (values may still be reconciled by the admin; they stay live).
   - FINALIZED: show GAME OVER + the final leaderboard from get_my_state (rank, team, CV, cash, businesses), with the team's own row highlighted and a winner banner if rank 1. (Leaderboard visuals are polished in Phase 9; render a correct, readable table now.)
3. Reconnection: session persists across refresh/close. If the session is lost, /join with code+PIN restores. On app start, /team must show a skeleton (not a flash of the join screen) while the session/state loads. 
4. Realtime: subscribe to postgres_changes on teams and team_businesses and rooms (RLS filters to the team's own rows); on ANY event refetch get_my_state(); additionally poll get_my_state every 15 s while the tab is visible and refetch immediately on visibilitychange→visible and window "online". Flash animation on value change (green up / red down, ≤600 ms, disabled for reduced motion).
5. Timer: derive remaining time only from room.ends_at using useServerClock. A phone whose clock is wrong must still show the correct time. When remaining hits 0, call get_my_state once to pick up TIME_EXPIRED (do not trust local zero as the status).
6. Connection UX: small ConnectionPill; if the last successful fetch is >20 s old show a yellow "Reconnecting… last update 23 s ago" bar; values are never blanked while offline.
7. No zoom lock, no horizontal scroll at 360 px width; safe-area padding; screen stays readable in sunlight (high contrast, large numerals ≥ 44 px for cash/CV).

FILES TO INSPECT
src/routes/public/*, src/data/{client,rpc}.ts, src/lib/{clock,errors,format}.ts, src/ui/*, src/domain/*.

FILES LIKELY TO MODIFY/CREATE
src/routes/team/{JoinPage,TeamPage,LobbyWait,ActiveDashboard,GameOver,FinalBoard}.tsx, src/data/useMyTeam.ts, src/ui/pixel/* (original sprites as inline SVG or small PNG data — clouds, coin, pipe, brick tile, mascot), tests.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
Single-column, no nav. Cards white with 3–4 px navy borders and hard shadows; numbers in a tabular legible font; pixel font only for headings/labels. Money formatted with formatINR. Show only: team identity, clock, cash, CV, businesses, plus status states above. Nothing else.

STATE-MANAGEMENT REQUIREMENTS
useMyTeam(): {state, status, error, lastUpdatedAt, refetch}. Server snapshot + refetch-on-event + polling fallback. One channel per mount, cleaned up (StrictMode-safe). No game data persisted in localStorage.

SECURITY REQUIREMENTS
The client sends no team ids; the server derives the team from auth.uid(). Verify that the browser network tab shows no other team's data in any response before FINALIZED. PIN is never stored in localStorage/sessionStorage and never logged. The join screen must not reveal whether a code exists vs PIN wrong.

ERROR HANDLING
Handle: no session → /join; claim released by admin → back to /join with message "Ask the organiser to rejoin you"; room finalized/gone; RPC failures with retry; slow network skeletons.

TESTS
Vitest + Testing Library (RPC mocked): join happy path; uniform error message for wrong code/slot/PIN; throttle message; /team redirects without a claim; each room status renders the right view; bankrupt banner; value-change flash class toggles; refetch on realtime event, visibility and online; polling stops when hidden; offline bar appears after 20 s. Clock tests: wrong device clock still shows correct remaining time (mock Date.now skew).
Playwright (add @playwright/test, basic config, run against local Supabase): admin creates room; two team contexts join with correct PINs; a third context with a wrong PIN fails; team A's page contains none of team B's numbers; reload of a team page keeps team and clock within ±1 s of the admin's clock.

ACCEPTANCE CRITERIA
- Join, refresh, close/reopen tab, and lose/regain network all return to the same team and correct clock.
- Team A can never see Team B's cash/CV/businesses (verified in the Playwright test by inspecting network responses).
- Layout works at 360×640, 390×844, 430×932; no horizontal scroll.
- Lobby "JOINED" pill on the admin screen (Phase 5) flips within 2 s of a team joining.

MUST NOT CHANGE
Any supabase/** migration, admin routes, or the domain helper behavior. Do not add navigation tabs, rules pages, activity feeds, sounds or any interactive game control.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. npx playwright test (multi-context suite) passes.
3. Real phone test on the same Wi-Fi: join, lock screen for 30 s, unlock — state and clock correct within 2 s.
```

---

### PHASE 7 PROMPT — Admin live console: edits, businesses, bankruptcy, activity log

```text
OBJECTIVE
Replace the read-only ACTIVE summary with the real Admin operations console: see all teams at a glance, select a team, edit cash and Company Value, add/edit/remove businesses and upgrade levels, mark bankruptcy, and watch a live activity log — optimised for accuracy and speed during a live event.

CONTEXT
STARTUPOLY is a physical board game; the Event Admin (laptop) records what physically happened; teams' phones update live. Backend RPCs (Phase 3): get_admin_snapshot(room_id) → teams (with version, pin, claimed, businesses) + last 200 events + server_now; admin_set_team_values(team_id, cash, cv, expected_version, request_id, note); admin_add_business(team_id, business_key, apply_purchase, expected_version, request_id, note); admin_set_business_level(team_id, business_key, new_level, apply_upgrade, expected_version, request_id, note); admin_remove_business(team_id, business_key, reason FORCED_SALE|BANKRUPTCY|CORRECTION, credit_resale, expected_version, request_id, note); admin_set_bankrupt(...). Errors: VERSION_CONFLICT (someone else changed the team — two Tech Runners may work simultaneously), INSUFFICIENT_CASH, BUSINESS_CAP, BUSINESS_OWNED, ROOM_NOT_EDITABLE, NOTE_REQUIRED (after time expiry corrections need a note). Rules: max 3 businesses/team; levels 0–2; upgrades add +300 CV (0→1) and +400 CV (1→2) and cost per catalog; buying costs cost and adds initial CV; forced sale returns cost and does NOT reduce CV; CV ≥ 0, cash ≥ 0. Catalog (business_catalog table): EdTech 200/150; SaaS 300/180; E-Commerce 300/180; FinTech 400/200; HealthTech 400/200; AI/DeepTech 500/250; DevTools 300/190*; Cybersecurity 400/220*; CleanTech 500/240*; Robotics 500/250* (cost/initial CV; *provisional).
Admin priorities in order: accuracy, readability, speed, low cognitive load, large controls, clear confirmation, reliable updates, live sync. Desktop-first.

EXACT REQUIREMENTS
1. Layout at ≥1100 px (design at 1440×900): TOP BAR (room code, status pill, huge server-clock Countdown, connection pill, "last updated"); LEFT/CENTER: TEAM GRID — one card per team (color bar, name, CASH, CV, businesses n/3 with level pips, ELIMINATED state, JOINED/NOT JOINED dot), click selects; RIGHT COLUMN: activity log; BOTTOM/CENTER: SELECTED TEAM EDITOR.
2. Selected team editor sections:
   a. Cash: number field prefilled with current value + UPDATE button; below it quick delta chips (+50, +100, −100, +200, custom). Clicking UPDATE opens an inline confirm strip showing "₹1,450 → ₹1,750 (+₹300)" in green/red (Expense Red for negative), with CONFIRM / CANCEL. Enter key confirms; Esc cancels. Negative input is blocked in the UI.
   b. Company Value: identical pattern (label "CV").
   c. Businesses: header "Businesses n/3" and [+ Add Business]. Add opens a picker listing the 10 catalog businesses, disabling ones already owned by any team (show owner) and disabling all if the team has 3; a checkbox "Apply purchase (−₹cost, +initial CV)" default ON, showing exact numbers; confirm. Each owned business row: name, Level 0/1/2 pips, "CV contribution", buttons [Upgrade → Level n] (shows −₹cost / +CV, default apply) and [Edit] (opens advanced: set level directly with mandatory note, no cost side effects) and [Remove] (choose reason FORCED SALE with "credit ₹cost" checkbox default ON, or CORRECTION; confirm).
   d. Team status: [Mark bankrupt] (big red, double confirm, explains businesses return to bank); after bankrupt, editor is read-only except an "Undo bankruptcy (correction)" requiring a note.
3. Every mutation: fresh request_id, expected_version from the snapshot, button disabled + spinner while pending, success toast + brief value flash on the affected card. On VERSION_CONFLICT: show a modal "Team changed elsewhere" with the current values and a "Reload and retry" button — never overwrite silently. On INSUFFICIENT_CASH: explain the shortfall and offer "Do a forced sale first" (focuses the Remove flow).
4. Activity log (right column, newest first, auto-updating): time (HH:MM:SS local, tooltip with full timestamp), team color chip + name, human sentence ("Team Alpha cash ₹1,450 → ₹1,750", "Team Beta bought SaaS", "Team Gamma upgraded HealthTech to Level 1", "Team Alpha CV −200"), red/green amounts, note if any, badge CORRECTION if is_correction, actor label. Filter chips: All / per team / Money / Businesses / System. Show group_id rows (multi-team actions) together. Virtualization not needed (≤ 200 rows), but keep a "Load older" button using get_admin_snapshot's paging parameter or a small events RPC if needed.
5. After TIME_EXPIRED: the console shows a full-width banner "GAME OVER — scores frozen. Corrections need a note." and every confirm dialog requires a note; the note field is prominent and pre-focused. FINALIZED handled in Phase 9.
6. Keyboard-friendliness: arrow keys / number keys 1–6 select teams; tab order follows visual order; focus never lost after a refetch.
7. Loading/empty/error states for every panel; offline banner disables all edit buttons with an explanation.

FILES TO INSPECT
src/routes/admin/*, src/data/useAdminRoom.ts, src/data/rpc.ts, src/domain/*, src/ui/*, src/lib/errors.ts.

FILES LIKELY TO MODIFY/CREATE
src/routes/admin/console/{ConsolePage,TopBar,TeamGrid,TeamCard,TeamEditor,ValueEditor,BusinessList,AddBusinessDialog,UpgradeDialog,RemoveBusinessDialog,BankruptDialog,ConflictDialog,ActivityLog,ActivityRow}.tsx, src/domain/activityText.ts (turn an event into a sentence), tests.

DATA MODEL CHANGES
None, except: if the log needs paging or a per-team filter that get_admin_snapshot does not provide, add one small admin RPC in a new migration with a pgTAP test.

UI REQUIREMENTS
Large controls (≥48 px), dense-but-readable, clear team separation via color bars, numbers in a legible tabular font, red/green delta coloring, no more than two clicks to any edit, no nested menus. No animations except a ≤600 ms value flash and toast transitions.

STATE-MANAGEMENT REQUIREMENTS
Snapshot from useAdminRoom (refetch-on-event). Editor drafts are local component state keyed by team id + version; if the team's version changes while a draft is open and the draft differs, show "Values changed elsewhere" with the option to reset the draft — never silently discard or silently apply. Never optimistic-update money; update only after server confirms (the refetch).

SECURITY REQUIREMENTS
All routes admin-guarded; every call goes through RPCs; no direct table writes; PINs visible only in the lobby/settings panel, not in the log.

ERROR HANDLING
Map every code from CONTEXT to an actionable message. Network errors keep the draft and show Retry. Duplicate-click safety through request_id.

TESTS
Vitest + Testing Library: cash/CV confirm strips show correct diff and colors; negative blocked; add-business picker disables owned/over-cap; apply-purchase numbers per catalog row; upgrade shows correct cost/CV for all rows and hides at level 2; remove flow forced-sale credit default; VERSION_CONFLICT modal flow; INSUFFICIENT_CASH suggestion; note required after expiry; activity sentence generator for each event type; filters; keyboard team selection; buttons disabled while pending.
Playwright: two admin contexts editing the same team → second gets a conflict, not an overwrite; admin edit reaches the team phone < 2 s.

ACCEPTANCE CRITERIA
Everything in the original brief §8 and §9 works: select a team, update cash/CV with confirm, add a business from the official list, change upgrade levels, see live log with prev→new, all teams' state visible at once, live sync to phones, no silent overwrites.

MUST NOT CHANGE
supabase/** existing functions or policies; team routes; delete-list items. Do not add dice/turn/board features.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. npx playwright test
3. Manual: run a scripted 10-minute mock (5 teams: buy, upgrade, forced sale, bankrupt one team) with a phone watching; confirm phone values equal admin values after every step and log entries match.
```

---

### PHASE 8 PROMPT — Rule-derived quick actions (pre-fill only)

```text
OBJECTIVE
Speed up the most frequent physical events by adding calculator-style quick actions that PRE-FILL correct amounts from the official rules, always show the numbers, and require an explicit confirm. These are data-entry helpers, not gameplay: the admin still decides what physically happened.

CONTEXT
STARTUPOLY is a physical board game; the site only records state. During play the Bank/Tech Runners repeatedly record: rent payments between teams, START laps, purchases, upgrades, forced sales, Steal Talent, and Bonus/Crisis cards. Console from Phase 7 exists (team grid, editor, log). Backend: admin_adjust(changes jsonb [{team_id,cash_delta,cv_delta,expected_version}], label, note, request_id) is ATOMIC across teams (all or nothing; INSUFFICIENT_CASH aborts everything; CV clamps at 0 with a flag), plus admin_add_business / admin_set_business_level / admin_remove_business. Domain helpers in src/domain (Phase 4): rentFor, landingCvFor, startReward, upgradeCost, upgradeCvGain, resaleValue.
Official rules:
- Rent when landing on another team's business: payer pays 50% / 75% / 100% of the business PURCHASE COST at level 0 / 1 / 2; the owner receives the same cash AND CV equal to 50% / 75% / 100% of the business's INITIAL CV.
- START (pass or land): +₹200 cash; growth CV: 0 CV with fewer than 2 businesses, +200 CV with 2, +500 CV with 3 (interpreted as +500, not cumulative; owner may override).
- Steal Talent: chosen team takes ₹100 from another team, or all its cash if it has less (₹0 is valid).
- Lose the Feature: −200 CV (floor 0).
- Bonus cards: #1 +₹300; #2 +300 CV; #3 +₹200 and +200 CV; #4 cash = purchase cost of the team's most expensive owned business; #5 ₹100 × businesses owned; #6 Lucky Break: ₹100 × a reward roll (admin enters the roll 1–6).
- Crisis cards: #1 −₹300; #2 −300 CV; #3 −₹200 and −200 CV; #4 −₹100 × businesses owned; #5 −200 CV and −₹100; #6 −₹500. If a cash penalty exceeds cash, the team must do a FORCED SALE (sell businesses of its choice at purchase price; CV kept) until covered; bankruptcy if nothing left to sell.

EXACT REQUIREMENTS
1. Add a "QUICK ACTIONS" bar above the team editor with buttons: RENT, START LAP, BUY, UPGRADE, FORCED SALE, STEAL TALENT, BONUS CARD, CRISIS CARD, LOSE FEATURE. (BUY/UPGRADE reuse Phase 7 flows but from a team-first shortcut.)
2. Each opens ONE dialog: choose team(s) and needed inputs (e.g., RENT: payer team → business owned by another team; the owner is derived; BONUS: team + card number 1–6 (+ reward roll for #6); STEAL: thief + victim). The dialog shows a preview table per affected team: cash before → after, CV before → after, in green/red, with the rule text used ("Rent = 75% of ₹300 = ₹225; owner CV +135 = 75% of 180"). Every computed number is editable via an "Adjust amounts" toggle before confirming.
3. Confirm → one admin_adjust call (atomic across payer/owner or thief/victim) with label such as "RENT", so the log shows one grouped action. START LAP: cash +200 and CV per business count for the chosen team. Steal: amount = min(100, victim cash), editable.
4. Cash shortfalls: if a computed payment exceeds the payer's cash, do NOT submit; show "Team X needs a forced sale (short by ₹N)" and open the FORCED SALE flow prefilled: pick businesses to sell (each credits purchase cost, level lost, CV unchanged); after the sale(s) the original payment is re-offered with updated numbers. If the team has nothing left to sell, offer the bankruptcy flow.
5. Duplicate protection: each dialog generates its request_id when opened and reuses it on retry; the confirm button is disabled while pending.
6. Domain: add src/domain/quickActions.ts with pure functions returning preview structures (e.g., computeRent(payerTeam, business, ownerTeam), computeStart(team), computeSteal(thief, victim), computeBonus(team, cardNo, rewardRoll), computeCrisis(team, cardNo), computeLoseFeature(team)). No React, no Supabase.
7. Keyboard: hotkeys R (rent), S (START lap), B (buy), U (upgrade) when no input is focused; Esc closes.

FILES TO INSPECT
src/routes/admin/console/*, src/domain/*, src/data/rpc.ts, src/lib/errors.ts.

FILES LIKELY TO MODIFY/CREATE
src/domain/quickActions.ts (+ tests), src/routes/admin/console/quick/{QuickActionsBar,RentDialog,StartLapDialog,ForcedSaleDialog,StealDialog,CardDialog,LoseFeatureDialog,PreviewTable}.tsx.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
Each dialog fits one screen at 1440×900 without scrolling; preview table is the visual focus; confirm is a big green button; negative amounts use Expense Red. No dice, no board, no turn concepts.

STATE-MANAGEMENT REQUIREMENTS
Dialog state is local. Team versions come from the latest snapshot at confirm time; on VERSION_CONFLICT, re-run the computation with fresh data and re-show the preview (never auto-submit).

SECURITY REQUIREMENTS
No new privileges; everything through existing admin RPCs.

ERROR HANDLING
INSUFFICIENT_CASH → forced-sale path; VERSION_CONFLICT → recompute preview; BUSINESS_CAP/BUSINESS_OWNED as in Phase 7.

TESTS
Vitest table-driven from the rulebook: rent for all 10 businesses × 3 levels (cash and owner CV); START for 0/1/2/3 businesses; steal with cash 250, 100, 60, 0; every Bonus and Crisis card for teams with 0, 1, 2, 3 businesses including "most expensive business" and Lucky Break rolls 1–6; CV floor at 0; shortfall detection. Component tests: dialog previews show the rule text and correct numbers; editing an amount updates the preview; confirm calls admin_adjust once with the expected changes array and a single request_id.

ACCEPTANCE CRITERIA
Every quick action reproduces the rulebook numbers exactly, is fully editable, is atomic, appears as ONE grouped log entry, and cannot be submitted twice.

MUST NOT CHANGE
supabase/** and Phase 7 direct-edit flows (they remain the fallback for anything unusual). Do not auto-advance any turn concept.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. Manual: perform RENT (payer short of cash → forced sale → rent), START lap with 3 businesses, Steal from a ₹0 team, Lucky Break with roll 4; verify amounts on team phones and in the log.
```

---

### PHASE 9 PROMPT — Game over, reconciliation, tie-break, finalize, leaderboard, history

```text
OBJECTIVE
Implement the end-game experience: automatic GAME OVER at 50:00, admin reconciliation window, tie-break entry, finalization, the arcade-styled final leaderboard (admin + phones), and immutable game history.

CONTEXT
STARTUPOLY is a physical board game; the site records state. Rulebook: at 50:00 everyone stops; no extra turn. Winner = ACTIVE (non-bankrupt) team with the highest Company Value (CV). Tie-breaks in order: higher Cash; more Businesses; then a 30-second pitch judged by the Game Master (admin records the resulting order). Bankrupt teams are eliminated and rank after all active teams. Wrap-up is 5 minutes: result recorded, finalized, then a NEW room is used for the next match (history retained). Backend (Phase 3): room status derives to TIME_EXPIRED server-side; in TIME_EXPIRED edits require a note and are tagged is_correction; get_standings(room_id) → rows with rank, tie_unresolved; admin_set_tiebreak(room_id, ordered_team_ids, note); admin_finalize(room_id) (fails with UNRESOLVED_TIE if any tie is unresolved); list_history(); get_history_detail(room_id); get_my_state() returns leaderboard only when FINALIZED. Teams see the leaderboard only after FINALIZED.
Design: 8-bit NES × modern mobile UI; palette Sky #5C94FC, Green #22B14C, Gold #FFCC00, Brick #B84418, White, Navy #102040, Red #D32F2F. Original pixel art only (no Nintendo characters). The leaderboard is arcade-inspired but must stay extremely readable.

EXACT REQUIREMENTS
1. Admin console, status TIME_EXPIRED: the top-bar clock shows GAME OVER; banner explains reconciliation mode; all edits require a note (already in Phase 7). Add a "FINALIZE" panel: live standings table from get_standings (rank, team, CV, cash, businesses, ELIMINATED flag, tie badge) that refreshes on every change; where tie_unresolved, show "Tied on CV, cash and businesses — record pitch result" and a drag-and-drop or up/down-arrow ordering control for the tied group + a judge note field → admin_set_tiebreak. FINALIZE button disabled until no tie is unresolved; click opens a confirm dialog warning it is permanent, then calls admin_finalize.
2. After FINALIZED: console becomes read-only "RESULT" view with the podium/leaderboard and a button START NEW MATCH (navigates to create-room). No edit controls are rendered.
3. Final leaderboard component (shared by admin, team phones and history): podium for top 3 (pixel blocks/pipes styling, gold/silver/bronze-like using palette only) plus a full table for all teams: rank, team (color chip + name), CV, cash, businesses count, ELIMINATED tag. Winner banner "WINNER". Highlight the viewer's team on phones. Ties resolved by pitch show a small "won on pitch" note. Large numerals; works at 360 px and on a projected 1080p screen (add a "Presentation mode" toggle on admin that enlarges the leaderboard full-screen, hides controls).
4. Team phones: on TIME_EXPIRED show GAME OVER + "Final scores pending"; on FINALIZED swap to the leaderboard automatically via realtime/refetch (Phase 6 wiring). Never show other teams' data before FINALIZED.
5. History: /admin/history lists finalized rooms (date/time, room code, winner, team count) newest first; /admin/history/:roomId shows the immutable final leaderboard plus the full activity log (read-only, same ActivityRow component, filters) and a "Copy results as text" button (rank, team, CV, cash, businesses). Optional CSV export of final results only if trivial (client-side, no server). Empty state when none.
6. Everything read-only in history; no route offers a mutation for a finalized room.

FILES TO INSPECT
src/routes/admin/console/*, src/routes/team/{GameOver,FinalBoard,TeamPage}.tsx, src/data/rpc.ts, src/domain/activityText.ts, supabase/README.md.

FILES LIKELY TO MODIFY/CREATE
src/routes/admin/console/{FinalizePanel,StandingsTable,TieBreakOrder}.tsx, src/routes/admin/{History,HistoryDetail}.tsx, src/ui/Leaderboard/{Podium,LeaderboardTable}.tsx, src/routes/team/FinalBoard.tsx (use shared component), src/data/useStandings.ts, tests.

DATA MODEL CHANGES
None expected. If get_standings/list_history/get_history_detail lack a needed field, add the smallest change in a new migration with pgTAP tests.

UI REQUIREMENTS
Podium + table as above; presentation mode; history table dense but readable; reduced-motion safe (a single short reveal of the podium ≤800 ms is allowed, skipped when reduced motion is set).

STATE-MANAGEMENT REQUIREMENTS
Standings fetched by RPC and refetched on realtime events; finalize button state derived from tie_unresolved returned by the server (never recomputed client-side).

SECURITY REQUIREMENTS
Standings/history/finalize admin-only. Teams only get the leaderboard via get_my_state after FINALIZED. Confirm that a team session cannot call get_standings or get_history_detail.

ERROR HANDLING
UNRESOLVED_TIE → scroll to the tie group; INVALID_TRANSITION → refetch; finalize failure leaves the room in TIME_EXPIRED with a clear message; history load failure with retry.

TESTS
Vitest: standings table renders all tie badges; finalize disabled while unresolved and enabled after set_tiebreak (mock); leaderboard renders correct order for (CV, cash, businesses, pitch) fixtures; eliminated teams after actives; presentation mode toggles controls off; copy-as-text format snapshot.
Playwright: time expiry (use a room with a short duration_seconds set via a test-only admin RPC/SQL seed) → all team contexts show GAME OVER within 3 s of ends_at without any admin action; reconcile edit with note; tie → record order → finalize → admin and team phones show the leaderboard; history lists the game; attempting to edit a finalized room fails.

ACCEPTANCE CRITERIA
Full end-game flow works exactly per rulebook §17; finalized games are immutable and appear in history with complete logs; phones never see leaderboard early.

MUST NOT CHANGE
Rule semantics in SQL (ranking order, tie-break order); the Phase 7/8 edit flows.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. npx playwright test
3. Manual rehearsal with a 3-minute duration room: let it expire with the admin laptop asleep/closed; open a phone — it must show GAME OVER.
```

---

### PHASE 10 PROMPT — Realtime hardening, failure recovery, E2E and load test

```text
OBJECTIVE
Make live behaviour boringly reliable: eliminate duplicate subscriptions, stale state, silent failures and race conditions; add automatic recovery from network loss; and prove it with an end-to-end suite and a load test that mimics the real event (1–2 admins + 6 phones).

CONTEXT
STARTUPOLY is a physical board game; a bug during a live 50-minute match with six teams watching is unacceptable. Architecture: Postgres RPCs are the only write path; clients keep a server snapshot and refetch on realtime events (never patch from payloads); timer derives from ends_at + server clock offset. The legacy app had: duplicate/global channels, a 100 ms echo-suppression hack, last-write-wins JSON, swallowed save errors, background-tab timer drift. None of that may reappear. Hooks to harden: useAdminRoom, useMyTeam, useServerClock, realtime helper.

EXACT REQUIREMENTS
1. Realtime helper (src/data/realtime.ts): a single utility that creates a channel with a unique topic per hook instance, tracks status (SUBSCRIBED / CHANNEL_ERROR / TIMED_OUT / CLOSED), exposes it as connection state, and ALWAYS removes the channel in cleanup. Under React StrictMode there must never be two live channels for the same hook. Add exponential backoff resubscribe (1 s → 2 s → 5 s → 10 s cap) with jitter, and after reconnect do an immediate full snapshot refetch.
2. Snapshot hooks: coalesce bursts (debounce 150 ms, but guarantee a refetch at most 1 s after the first event); ignore out-of-order responses (monotonic request counter — a slower older response must never overwrite a newer one); keep last good data on failure and mark stale.
3. Fallback polling: every 15 s while visible (admin: 10 s), pause when hidden; refetch immediately on visibilitychange→visible, window "online", and after any mutation.
4. Staleness UX: ConnectionPill states (Live / Reconnecting / Offline) and "Last updated Ns ago"; team phones show a yellow bar after 20 s stale; admin edit buttons disabled when offline or stale >30 s with an explanation; never blank existing values.
5. Clock: re-sync server offset every 5 minutes and on reconnect; compute RTT and use the sample with the lowest RTT of the last 3; guard against negative remaining; when remaining hits 0 force a snapshot refetch and retry until the status is TIME_EXPIRED.
6. Mutations: all admin mutations already carry request_id; add automatic single retry for network errors (same request_id) but NOT for business errors; show a persistent "Not saved — retry" chip if it ultimately fails; never leave the UI claiming success without a confirmed refetch.
7. Auth resilience: handle expired admin session mid-game (refresh token; if it fails show a modal "Session expired — sign in again" WITHOUT losing the open draft); handle anonymous session loss on phones (redirect to /join with the message).
8. Database performance/limits review: confirm indexes for all filter columns used by RLS and Realtime; confirm the Supabase plan's concurrent Realtime connection and message limits cover 2 admins + 6–12 phones + spectators; document in supabase/README.md. Add a tiny SQL function or view if any snapshot query is slow (target < 100 ms).
9. Logging: replace stray console.warn with a small logger that includes context and (in production) does not print PINs or full payloads. Remove leftover dead code found during this phase.
10. Load/soak script (scripts/loadtest.ts using supabase-js): 1 admin + 8 anonymous team clients (6 real + 2 extra); admin performs ~60 edits/minute across teams for 10 minutes; assert every team client's state equals the DB after each burst within 2 s; log p50/p95 propagation latency and error counts.

FILES TO INSPECT
src/data/{realtime,useAdminRoom,useMyTeam,client,rpc}.ts, src/lib/clock.ts, src/routes/**, supabase/README.md, package.json.

FILES LIKELY TO MODIFY/CREATE
src/data/realtime.ts, src/data/useAdminRoom.ts, src/data/useMyTeam.ts, src/lib/{clock,logger}.ts, src/ui/ConnectionPill.tsx, tests/e2e/*.spec.ts, scripts/loadtest.ts, playwright.config.ts, supabase/README.md.

DATA MODEL CHANGES
None, except indexes if the review requires (new migration + comment).

UI REQUIREMENTS
Only staleness/connection indicators and the session-expired modal. Keep them calm: no full-screen blockers except for expired auth.

STATE-MANAGEMENT REQUIREMENTS
As specified: server truth, refetch-on-event, ordered responses, stale marking, no local persistence of game state.

SECURITY REQUIREMENTS
Re-verify with the E2E suite that no team context ever receives another team's numbers over REST or Realtime, and that a team session calling any admin RPC gets NOT_ADMIN.

ERROR HANDLING
All failure classes above have a visible, non-alarming UX and automatic recovery where safe.

TESTS
Vitest: realtime helper (mock channel: cleanup on unmount, StrictMode no duplicates, backoff schedule with fake timers, refetch after reconnect); out-of-order response guard; coalescing; clock resync/RTT selection; retry logic (network vs business errors).
Playwright (multi-context, real local Supabase): (a) six team contexts + admin: 100 edits, every phone converges; (b) throttle a team context offline for 45 s (context.setOffline) while edits happen → on reconnect it shows the latest state within 3 s; (c) reload admin mid-game → same clock, same data; (d) close and reopen a phone tab → same team; (e) two admins editing the same team → conflict handled; (f) admin laptop sleep simulation (stop admin context) → phones still reach GAME OVER on time; (g) kill the Realtime connection (route block WebSocket) → polling keeps phones within 15 s; (h) expired admin token mid-edit keeps the draft.
Load test run captured in a report file (not committed if large).

ACCEPTANCE CRITERIA
All E2E scenarios pass 3 times consecutively; load test shows p95 propagation < 2 s and zero divergences; no console errors during the suite; no duplicate channels observed (assert via supabase.getChannels().length).

MUST NOT CHANGE
Rule semantics, RLS policies, RPC signatures (unless a defect is found — then fix in a new migration + test and report).

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build
2. npx playwright test --repeat-each=3
3. npx tsx scripts/loadtest.ts against local Supabase; attach the summary to the final report.
4. Manual: airplane-mode a real phone for 60 s during a mock game; confirm recovery and correct clock.
```

---

### PHASE 11 PROMPT — Visual polish, accessibility, deployment, event readiness

```text
OBJECTIVE
Bring the UI to the final visual target (8-bit NES platformer × polished mobile game UI), verify accessibility and performance, deploy to a dedicated production environment, and produce the event runbook. No functional or rule changes.

CONTEXT
STARTUPOLY is a physical board game; the site is a live scoreboard + game management system. Admin: desktop/laptop; Teams: one phone each, read-only. Palette (mandatory): Sky Blue #5C94FC (background/headers), Arcade Green #22B14C (primary actions), Coin Gold #FFCC00 (cash, stars, bonuses), Brick Brown #B84418 (ground/brick elements), Card White #FFFFFF (cards), Dark Navy #102040 (status/navigation), Expense Red #D32F2F (negative changes). The reference image shows: splash with pixel logo and "DREAM · BUILD · GROW", brick ground with green pipes and clouds, chunky white cards with navy borders, gold coin/star icons, green + gold buttons. Adopt composition, spacing, hierarchy and atmosphere; use ORIGINAL art (no Nintendo characters/sprites); do not copy conflicting elements (LOGIN for teams, player roster, Rules/Settings tabs, Collect buttons, activity list on phones). Animation stays minimal: number-change flash, final-minute clock pulse, short transitions, one short podium reveal; everything respects prefers-reduced-motion.

EXACT REQUIREMENTS
1. Visual pass, screen by screen: landing, join (3 steps), team lobby-wait, team dashboard, GAME OVER, final leaderboard, admin login, create room, admin lobby (projector-legible code), admin console, quick-action dialogs, finalize panel, presentation mode, history, error/empty/loading states. Compare each against the reference and the palette; fix spacing, hierarchy and proportions. Numbers: cash/CV ≥ 44 px on phones and ≥ 32 px in admin cards; pixel font limited to titles/labels.
2. Original pixel art set as inline SVG/sprite sheet: logo wordmark "STARTUPOLY" (no third-party trademarks), mascot (original character), clouds, coin, star, brick tile, pipe, small business icons (10) in the same style. Keep total image weight < 150 kB.
3. Accessibility: contrast ≥ 4.5:1 for body text; focus rings visible; all controls ≥ 44 px on phones; screen-reader labels on icon-only buttons; color never the only signal (arrows/signs for +/−); zoom allowed; reduced-motion honored; test with keyboard only on admin.
4. Responsive audit: team at 360×640, 375×667, 390×844, 430×932 and landscape phone; admin at 1280×720, 1440×900, 1920×1080 (and a 1366×768 laptop). No horizontal page scroll; admin has a sensible minimum width message below 1024 px ("Use a laptop for the admin console").
5. Performance: Lighthouse mobile ≥ 90 performance on /join and /team; JS bundle for team routes < 200 kB gzip (split admin code via route-level lazy loading); fonts preloaded with font-display: swap; no layout shift on number updates (tabular numerals, fixed widths).
6. Deployment: Vercel or Netlify (choose one; document) with a SPA fallback rewrite; environment variables for production Supabase project (separate from dev — a NEW project; run all migrations; create admin users; configure Auth: anonymous ON, public email sign-up OFF, site URL/redirects set); security headers including a CSP allowing only self, the Supabase project origin (https + wss) and Google Fonts; HTTPS only; noindex meta. Add scripts/verify-prod.ts that checks: anon cannot select from teams/rooms/activity_events, anon cannot call any admin RPC, join with a wrong PIN fails, business_catalog readable.
7. Docs: docs/RUNBOOK.md — event-day procedure for Tech Runners (pre-event checklist, per-match procedure: create room → configure teams → open lobby → distribute PINs → confirm all joined → start on the Game Master's signal → record events → 50:00 GAME OVER → reconcile with note → tie-break → finalize → next match), troubleshooting table (phone can't join, phone lost session, admin laptop died, Wi-Fi outage, wrong value entered, two admins conflict), and a paper fallback scoreboard template description. docs/OPERATIONS.md — environments, secrets handling, rotating keys, backups (Supabase daily backup + export of final_results/events after each match), who has admin access.
8. Seed/rehearsal tooling: a script to create a demo room with 6 teams and simulated activity in a NON-production project only.

FILES TO INSPECT
All src/ui/*, src/routes/**, index.html, vite.config.ts, package.json, supabase/README.md, docs/*.

FILES LIKELY TO MODIFY/CREATE
src/ui/**, src/index.css / theme tokens, src/ui/pixel/*, route files (styling only), vite.config.ts (code-splitting), vercel.json or netlify.toml (rewrites + headers), scripts/verify-prod.ts, docs/RUNBOOK.md, docs/OPERATIONS.md, README.md.

DATA MODEL CHANGES
None.

UI REQUIREMENTS
As above. Team UI stays minimal — do not add elements just to "fill" the composition.

STATE-MANAGEMENT REQUIREMENTS
None (no behavior changes).

SECURITY REQUIREMENTS
Production uses only the public anon key; service-role key never enters the repo or the build; CSP verified in the deployed site; verify-prod.ts passes.

ERROR HANDLING
Verify every error/empty/loading state visually and with the network throttled.

TESTS
Update Playwright screenshots (visual snapshots at the sizes above); axe-core accessibility check on join, team dashboard, admin console (zero serious/critical violations); Lighthouse CI thresholds; rerun the entire prior test suite.

ACCEPTANCE CRITERIA
- All screens match the palette and reference direction; no corporate-dashboard look; team screen shows only identity, clock, cash, CV, businesses.
- axe: zero serious/critical; Lighthouse mobile perf ≥ 90 on team routes.
- Production deployment live, verify-prod passes, RUNBOOK and OPERATIONS documents complete.
- Full rehearsal (see checklist) completed once end to end.

MUST NOT CHANGE
Business logic, RPCs, RLS, routes, or the rules encoded anywhere.

VERIFICATION STEPS
1. npm run typecheck && npm test && npm run build && npx playwright test
2. Deploy to production; run npx tsx scripts/verify-prod.ts against it.
3. Perform the full rehearsal: 1 admin laptop + 6 real phones on the event Wi-Fi, 20-minute mock match with a shortened duration on a staging project, including a forced sale, a bankruptcy, a tie, expiry with the admin laptop lid closed for 30 s, finalize, history.
```

---

## 11. Final Event-Readiness Checklist

Tick every item on the **production** deployment, on the **event network**, with **real phones**, no earlier than 24 h before the event and again 1 h before.

**Access & setup**
- [ ] Admin login works for every Tech Runner account; a non-admin account is refused; session survives laptop refresh.
- [ ] Room creation works for 5 and 6 teams; names/colors unique; code + PINs displayed large and correctly.
- [ ] Only one non-finalized room can exist (creating a second is refused with a clear message).
- [ ] Team joining: correct PIN succeeds; wrong PIN/code/team fails with the same message; 6th rapid failure is throttled.
- [ ] Team isolation: network inspector on Team A's phone shows no Team B numbers (REST or Realtime); `verify-prod` passes.
- [ ] Game initialization: every team starts at ₹1,000, 0 CV, 0 businesses; catalog values match the rulebook (and provisional 4 are decided — see C5).

**Clock & lifecycle**
- [ ] Timer: starts only on admin START; shows the same time (±1 s) on admin and all phones; no pause exists.
- [ ] Refresh/reconnect: reload admin and phones mid-game → same clock, same data; phone locked 60 s → correct on wake; airplane mode 60 s → recovers < 5 s after reconnect.
- [ ] Admin laptop closed/asleep at 50:00 → phones still show GAME OVER on time.
- [ ] TIME_EXPIRED: edits require a note, tagged CORRECTION in the log.

**Recording**
- [ ] Cash updates: absolute set + quick deltas with confirm; negative refused; INSUFFICIENT_CASH guides to forced sale.
- [ ] CV updates: floor at 0 works and is flagged in the log.
- [ ] Business management: add from official list; 4th business refused; already-owned business refused; owner shown.
- [ ] Upgrade management: 0→1 (−cost, +300 CV), 1→2 (−cost, +400 CV) for every business; skip-level requires note.
- [ ] Forced sale credits purchase price, drops level, leaves CV; bankruptcy frees businesses and excludes team from winning.
- [ ] Quick actions (rent, START, steal, cards) reproduce rulebook numbers; each is one grouped log entry.
- [ ] Two admins editing the same team → conflict dialog, no overwrite.
- [ ] Realtime updates reach phones < 2 s (p95) with all 6 phones + 2 admins connected.
- [ ] Activity log shows time, team, action, previous → new value, business, note, actor; visible to admin only.

**End-game**
- [ ] Game over: all phones show GAME OVER; no leaderboard visible to teams yet.
- [ ] Leaderboard: ranking = CV → cash → businesses → recorded pitch order; eliminated teams last; finalize blocked while a tie is unresolved.
- [ ] Finalize is permanent; finalized room accepts no edits; leaderboard appears on admin (presentation mode) and phones.
- [ ] History: finished match listed with complete log; "copy results" works; new match creates a fresh room.

**Platform**
- [ ] Security: RLS deny-by-default confirmed; anon cannot call admin RPCs; no secrets in repo/bundle; **old DB password rotated**; production is a separate Supabase project from dev; CSP/HTTPS active.
- [ ] Mobile responsiveness verified on at least one small Android and one iPhone; no horizontal scroll; numbers readable outdoors.
- [ ] Desktop responsiveness verified on the actual admin laptop and on the projector.
- [ ] Error handling: offline banner, retry chips, session-expired modal exercised deliberately.
- [ ] Network recovery: Wi-Fi drop/restore on admin and phones exercised.
- [ ] Production environment: env vars set, migrations applied, admin users created, Auth settings verified, backups enabled, Supabase plan limits cover connections.
- [ ] Deployment: latest commit tagged; rollback plan noted; nobody deploys during the event.
- [ ] Event-day testing: full 20-minute rehearsal with shortened duration completed by the actual Tech Runners; paper fallback scoreboard printed and at the Bank station; RUNBOOK read by both Tech Runners and the Game Master.
- [ ] Between matches: export `final_results` + events, create a new room, confirm the previous room is FINALIZED and history shows it.
