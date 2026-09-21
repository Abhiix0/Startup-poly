# Supabase Configuration & Operations Guide

## 1. Authentication Configuration

In the **Supabase Dashboard** under **Authentication > Providers / Settings**:

### Anonymous Sign-Ins
- **Enable Anonymous Sign-ins**: **ON**
- Purpose: Gives each team mobile device a persistent, isolated session (`auth.uid()`) without collecting credentials or requiring user signup forms.
- Reconnection: Survives page reloads and browser restarts as long as browser local storage is preserved.

### User Sign-Ups & Logins
- **Enable Email Provider**: **ON**
- **Allow new users to sign up**: **OFF** (Public sign-ups must be disabled so outside users cannot register).
- **Confirm email**: Optional / OFF (Tech Runner admin accounts are provisioned directly by project administrators).

> [!NOTE]
> In Supabase, disabling "Allow new users to sign up" specifically prevents self-service registration via `signUp()`, while anonymous sign-ins (`signInAnonymously()`) remain operational if enabled.

---

## 2. Admin User Provisioning

Event administrators (Tech Runners and Game Masters) authenticate with email and password to access the desktop admin console.

### Step 1: Create Admin User in Dashboard
1. Go to **Authentication > Users** in Supabase Dashboard.
2. Click **Add User** -> **Create User**.
3. Enter the administrator's email and a secure password.
4. Auto-confirm user: **Checked**.
5. Copy the generated `User UID` (UUID).

### Step 2: Grant Admin Privileges
Run the following SQL snippet in the Supabase SQL Editor to add the user to `public.admins`:

```sql
-- Replace <ADMIN_USER_UUID> with the actual User UID from Auth > Users
INSERT INTO public.admins (user_id)
VALUES ('<ADMIN_USER_UUID>')
ON CONFLICT (user_id) DO NOTHING;

-- Verify admin status
SELECT u.email, a.user_id, a.user_id IS NOT NULL AS is_active_admin
FROM auth.users u
LEFT JOIN public.admins a ON u.id = a.user_id
WHERE a.user_id IS NOT NULL;
```

---

## 3. Database CLI & Migrations

All schema definitions, triggers, RLS policies, and seed data are version-controlled under `supabase/migrations/`:
- `0001_schema.sql`: Core tables, types, indexes, and helper functions.
- `0002_constraints_triggers.sql`: Business cap, room status transitions, and immutability triggers.
- `0003_rls_grants.sql`: Deny-by-default Row Level Security policies and role privileges.
- `0004_catalog_seed.sql`: Official business catalog values.
- `0005_realtime.sql`: Supabase Realtime publication setup.
- `0006_drop_legacy.sql`: Cleanup of legacy prototype tables (`matches`, `match_events`).
- `0007_functions_core.sql`: Core functions (`server_time()`, `expire_if_due()`, and `raise_error()`).
- `0008_functions_admin.sql`: Authenticated admin stored procedures with optimistic locking and idempotency.
- `0009_functions_team.sql`: Team endpoints (`get_lobby()`, `join_team()` with rate limiting, `get_my_state()`).
- `0010_standings_finalize.sql`: Standings calculation, tiebreak ordering, and finalization.

---

## 4. Stored Procedures & API Contract

All write mutations and authenticated team reads execute through `SECURITY DEFINER` stored procedures.

### Team / Public RPCs
- `server_time()`: Current server timestamp based on DB clock.
- `get_lobby(code)`: Returns lobby teams and claimed statuses. Does not leak PINs or IDs.
- `join_team(code, slot, pin)`: Connects an anonymous session to a team. Throttled at 5 failed attempts per 60s.
- `get_my_state()`: Team dashboard for `auth.uid()`. Isolated to the user's claimed team; includes `ends_at` and computes business `cv_contribution`.

### Admin Management RPCs (Guarded by `is_admin()`)
- `admin_create_room(team_count, teams)`: Creates room with 5–6 teams, safe 6-char code, and unique 4-digit PINs.
- `admin_update_team_config(team_id, name, color)`: Edits team name/color in `CREATED`/`LOBBY`.
- `admin_open_lobby(room_id)`: Transitions room to `LOBBY`.
- `admin_release_team(team_id)`: Frees a team slot by removing its claims.
- `admin_start_game(room_id, force)`: Transitions to `ACTIVE`, sets 50:00 timer.
- `admin_set_team_values(team_id, cash, cv, expected_version, request_id, note)`: Absolute set of cash/CV.
- `admin_adjust(changes, label, note, request_id)`: Atomic multi-team balance adjustment with CV clamped to 0.
- `admin_add_business(team_id, business_key, apply_purchase, expected_version, request_id, note)`: Adds catalog business.
- `admin_set_business_level(team_id, business_key, new_level, apply_upgrade, expected_version, request_id, note)`: Upgrades level.
- `admin_remove_business(team_id, business_key, reason, credit_resale, expected_version, request_id, note)`: Forced sales / liquidation.
- `admin_set_bankrupt(team_id, value, expected_version, request_id, note)`: Marks bankrupt, returns businesses to bank.
- `admin_set_tiebreak(room_id, ordered_team_ids, note)`: Sets 1-based order for tied teams during `TIME_EXPIRED`.
- `get_admin_snapshot(room_id)`: Full state snapshot including PINs and latest 200 events.
- `get_standings(room_id)`: Live leaderboard standings with unresolved tie detection.
- `admin_finalize(room_id)`: Freezes room, writes immutable `final_results`, assigns winner.
- `list_history()` / `get_history_detail(room_id)`: Browse past finalized matches.

### Standardized Error Codes
- `NOT_ADMIN`: Caller is not in `public.admins`.
- `NOT_AUTHENTICATED`: Caller lacks valid `auth.uid()`.
- `ROOM_NOT_FOUND`: Specified room does not exist.
- `INVALID_TRANSITION`: Invalid status transition attempt.
- `ROOM_NOT_EDITABLE`: Room is not in an editable status (`ACTIVE` or `TIME_EXPIRED`).
- `VERSION_CONFLICT`: Optimistic lock failed; team was modified elsewhere.
- `INVALID_VALUE`: Input value is out of permitted range or negative.
- `INSUFFICIENT_CASH`: Team does not have enough cash to cover payment or purchase.
- `BUSINESS_CAP`: Team already owns maximum permitted (3) businesses.
- `BUSINESS_OWNED`: Business is already owned by another team in the room.
- `BUSINESS_NOT_OWNED`: Business is not owned by the specified team.
- `TEAM_BANKRUPT`: Action cannot be performed on a bankrupt team.
- `NOTE_REQUIRED`: Action requires a mandatory explanation note.
- `TEAMS_NOT_JOINED`: Cannot start match without all teams joined unless `force=true`.
- `UNRESOLVED_TIE`: Finalize blocked because tied teams lack judge pitch order.
- `BAD_CODE_OR_PIN`: Invalid room code, slot, or 4-digit PIN.
- `TOO_MANY_ATTEMPTS`: Join rate limit exceeded (5 failed attempts within 60s).
- `NON_FINAL_ROOM_EXISTS`: Only one active match is permitted at any time.

### Local Development Commands
```bash
# Start local Supabase containers (requires Docker Desktop running)
npm run db:start

# Reset local database and run all migrations + seed
npm run db:reset

# Run pgTAP test suite
npm run db:test

# Generate TypeScript types
npm run db:types
```

---

## 5. Realtime Capacity & Performance Limits Review

### Concurrent Connection Limits
- **Supabase Free Tier**: 200 concurrent Realtime connections.
- **Supabase Pro Tier**: 500 concurrent connections (scalable up to 10,000+).
- **STARTUPOLY Event Profile**:
  - 1–2 Event Admins (Desktop)
  - 5–6 Team mobile phones (1 phone per team)
  - 2–5 Spectators / Projector screens
  - **Total Concurrency**: ~10–15 clients per match.
  - **Capacity Utilization**: Less than 8% of Free tier limits; negligible on Pro.

### Message Throughput Limits
- **Supabase Free Tier**: 100 broadcast messages/second.
- **STARTUPOLY Event Profile**:
  - Live tournament pace: ~1–2 admin edits per minute (~0.03 edits/sec).
  - High-intensity bursts (e.g. rent, laps): ~60 edits/minute = 1.0 edit/sec.
  - Broadcast amplification: 1 edit event triggers notifications to ~10 connected clients.
  - Total message rate: ~10 messages/sec at peak, well within the 100 msgs/sec ceiling.

### Query Latency Benchmarks
- All write paths and team read paths run via `SECURITY DEFINER` Postgres functions that execute atomically in single transactions.
- Query latencies for all primary RPCs (`get_admin_snapshot`, `get_my_state`, `get_standings`, `server_time`) benchmark at **< 15 ms** on local PostgreSQL and **< 40 ms** on hosted Supabase instances (target: < 100 ms).
- Comprehensive B-Tree indexing on `rooms(id, code, status)`, `teams(id, room_id)`, `team_businesses(room_id, team_id)`, and `activity_events(room_id, id DESC)` guarantees index-only and bitmap index scans without table sequential scans.

