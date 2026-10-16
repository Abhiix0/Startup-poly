# STARTUPOLY Operations & Infrastructure Manual

> **Engineering Operations & Security Reference**  
> *Target Audience: DevOps, System Administrators, and Lead Engineers*  
> *Document Version: 1.0 (Production)*

---

## 1. Environments & Deployment Architecture

STARTUPOLY operates across three strictly isolated environments:

| Environment | Frontend Host | Database / Backend | Intended Use |
|---|---|---|---|
| **Local** | `http://localhost:3000` | Local Docker Supabase (`http://127.0.0.1:54321`) | Feature development, unit tests, local e2e. |
| **Staging** | `https://staging-startupoly.vercel.app` | Dedicated Staging Supabase Project | Pre-event rehearsals, simulated load testing (`scripts/loadtest.ts`), tech runner dry-runs. |
| **Production** | `https://startupoly.vercel.app` | Dedicated Production Supabase Project | Live tournament day events only. Strict security policies. |

---

## 2. Secrets Handling & Environment Variables

### Frontend Environment Variables
Frontend variables are embedded at build time by Vite:

```env
VITE_SUPABASE_URL=https://<your-project-id>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi... (public anon key)
```

> [!CAUTION]
> **Service Role Key Security**:
> - The `SUPABASE_SERVICE_ROLE_KEY` has superuser bypass privileges and **MUST NEVER** be present in client-side code, `src/`, `.env`, `.env.production`, or Git repositories. It must never have a `VITE_` prefix.
> - Client code uses **only** `VITE_SUPABASE_ANON_KEY`. All administrative mutations occur via Postgres RPC functions secured strictly by `public.admins` table lookups (`is_admin()` helper). User metadata or app metadata claims are never trusted for authorization.

---

## 3. Production Supabase Configuration Checklist

When provisioning the new dedicated production Supabase project, verify these settings:

1. **Database Migrations**:
   Run all migration scripts in sequence:
   ```bash
   npx supabase db push --linked
   ```
2. **Auth Settings**:
   - **Anonymous Sign-Ins**: `ENABLED` (Required for team phones to receive an `auth.uid()` without creating accounts).
   - **User Signups (Email)**: `DISABLED` (Prevents unauthorized public users from creating accounts).
   - **Email Provider**: `ENABLED` (For admin email/password login).
   - **Confirm Email**: `DISABLED` (Admins are provisioned directly by operators).
   - **Minimum Password Length**: Set to `12` or higher.
   - **Site URL**: Set to `https://<your-production-domain>.vercel.app`.
   - **Redirect URLs**: Add `https://<your-production-domain>.vercel.app/**`.
3. **Run Production Verification Script**:
   ```bash
   npx tsx scripts/verify-prod.ts --url=https://<production-project>.supabase.co --key=<anon-key>
   ```
   Must yield `ALL PRODUCTION SECURITY & PERMISSION CHECKS PASSED`.

---

## 4. Key Rotation Procedure

If the public anon key or JWT secret is compromised, follow this rotation protocol:

1. **Rotate Key in Supabase**:
   - Navigate to **Project Settings** → **API**.
   - Click **Generate New API Secret** / **Rotate Anon Key**.
2. **Update Vercel Production Environment Variables**:
   - Open Vercel Project Dashboard → **Settings** → **Environment Variables**.
   - Update `VITE_SUPABASE_ANON_KEY` with the new key for the **Production** environment.
3. **Trigger Immediate Re-deployment**:
   ```bash
   vercel --prod
   ```
4. **Verify Deployment**:
   - Open the live site in an incognito window.
   - Confirm team connection (`/join`) and admin login (`/admin/login`) function normally.

---

## 5. Backups & Post-Match Data Export

### Automated Backups
- Supabase automatically performs daily database backups.
- For high-stakes tournament days, enable Point-In-Time Recovery (PITR) in project settings.

### Post-Match Event Data Export
After each tournament or event day, export match results and activity logs for official record keeping:

```sql
-- 1. Export finalized match results
COPY (
  SELECT 
    r.code AS room_code,
    r.created_at,
    fr.rank,
    fr.team_name,
    fr.cv,
    fr.cash,
    fr.business_count,
    fr.is_bankrupt
  FROM final_results fr
  JOIN rooms r ON fr.room_id = r.id
  ORDER BY r.created_at DESC, fr.rank ASC
) TO STDOUT WITH CSV HEADER;

-- 2. Export full activity audit trail
COPY (
  SELECT 
    r.code AS room_code,
    ae.created_at,
    ae.event_type,
    ae.label,
    ae.note,
    ae.changes,
    ae.is_correction
  FROM activity_events ae
  JOIN rooms r ON ae.room_id = r.id
  ORDER BY ae.created_at ASC
) TO STDOUT WITH CSV HEADER;
```

---

## 6. Access Control & Admin User Provisioning

### Who Has Admin Access
Admin accounts have full control over live match timers, cash balances, and official results. Admin access is strictly restricted to:
- Tournament Game Masters
- Designated Event Tech Runners

Authorization is strictly derived from the PostgreSQL `public.admins` table. Merely having an account in `auth.users` is not sufficient to access admin functions or RPCs.

### Creating an Event Admin User
Use the dedicated CLI script with the service role key exported in your shell:

```bash
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

npm run admin:create
# Prompts for admin email and a masked password (minimum 12 characters).
# Creates or updates the user in auth.users and registers their UID in public.admins.
```

### Revoking Admin Access
To immediately revoke all admin privileges and kill all active sessions across devices:

```bash
export SUPABASE_URL="https://<your-project>.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOi..."

npm run admin:revoke
# Prompts for target admin email.
# Removes the user from public.admins and calls auth.admin.signOut(userId, 'global').
```

---
*End of Operations Manual.*

## Database lock order (migration 0016)
Every mutating RPC takes locks in this order, so concurrent calls queue instead of deadlocking (`40P01`):
1. `rooms` row (`FOR UPDATE`, taken by `expire_if_due`)
2. `teams` rows of that room, ascending id
3. `team_businesses` / `activity_events` writes (no explicit locks)

A new RPC that touches a team must resolve `room_id` with a plain `SELECT`, lock the room, then lock the team and re-read its columns. Race tests: `npm run test:concurrency` (local DB only).

## Lifecycle rules (migration 0017)
- `admin_open_lobby`, `admin_start_game`, `admin_abort_game`, `admin_finalize` accept an optional `request_id`. Retrying with the same id after a lost response returns the first call's result. The same id on another room or action raises `REQUEST_ID_REUSED`.
- Abort is ACTIVE to LOBBY with a team reset. Once the deadline has passed the game is finished: use `admin_finalize`; abort raises `ROOM_ALREADY_EXPIRED`.
- Start refuses a lobby that is not pristine (`INVALID_INITIAL_STATE`).

## Money RPC rules (migration 0018)
- `request_id` replay is decided after the room and team locks. A retry of an in-flight call waits, then gets the first call's result. Reusing an id for another team, action or admin raises `REQUEST_ID_REUSED` and changes nothing. `admin_adjust` replays as the array of team snapshots.
- Cash and CV are capped at `public.max_money()` (1,000,000,000). Out-of-range input or results raise `INVALID_VALUE` with the field, never a raw `22003`.
- `admin_adjust` requires an array of 1 to 6 items with a uuid `team_id`, integer deltas, a required `expected_version`, no duplicate team, one room.
- After TIME_EXPIRED these remain editable as corrections (note required): set values, adjust, add/level/remove business, bankruptcy. After FINALIZED all raise `ROOM_NOT_EDITABLE`.

## Joining and PIN abuse (migration 0019)
- `join_team` now **returns** `{"error": "BAD_CODE_OR_PIN" | "TEAM_ALREADY_CLAIMED"}` for failed joins instead of raising. A raise rolled back the attempt row, so the old throttle never counted anything. `rpcJoinTeam` converts the payload to the same `AppError` code. `TOO_MANY_ATTEMPTS` and `NOT_AUTHENTICATED` still raise.
- Limits per 60 s: 5 failures per user, 10 per team (a team under attack rejects even the right PIN), 30 per room, 60 for unknown room codes (stored as a SHA-256 hash). Six phones with up to 4 typos each stay under every limit.
- Residual risk: someone who knows the room code can lock joins for that room for 60 s at a time. PINs are plaintext in `team_secrets` on purpose (organisers read them out); anyone with admin access can read them.
- A late first-time join to a TIME_EXPIRED room is still allowed (the dashboard shows the game-over view). Owner decision pending.
- **Manual checklist (do not script):** in the Supabase dashboard, Authentication, Rate Limits, confirm "Anonymous sign-ins" per hour per IP. Locally it is 30 (`config.toml`). The throttle above does not depend on it, but it caps how many sessions one IP can mint.

## Security surface (migration 0020)
- `anon` (no session) may execute only `server_time`, `get_lobby`, `join_team`, `get_my_state`, `is_admin`. Anonymous sign-in players are role `authenticated`, not `anon`.
- Internal helpers (`room_standings`, `get_team_snapshot`, `app_now`, `raise_error`, the replay checks) are not executable by any client; SECURITY DEFINER callers reach them as the owner.
- `supabase/tests/0011_security_matrix_test.sql` fails when a function or table is added without being classified, or when a SECURITY DEFINER function lacks a pinned `search_path`. Add new objects to its expected lists deliberately.
- Realtime: a claimed player receives only its own team row, its own businesses and its room (checked with a real subscription in `security/security.test.ts`). Right after `supabase db reset` Realtime needs a few seconds before it delivers anything.

## Client error handling (Phase 8)
`classifyRpcError()` in `src/lib/errors.ts` sorts every failed RPC into one class. `CODE_CLASS` must list every code the migrations raise; `classifyRpcError.test.ts` greps the migrations and fails on a missing one.

| Class | Meaning | Codes |
|-------|---------|-------|
| DEFINITELY_FAILED | Rejected, nothing written | BAD_CODE_OR_PIN, BUSINESS_CAP, BUSINESS_NOT_OWNED, INSUFFICIENT_CASH, INVALID_INITIAL_STATE, INVALID_VALUE, NON_FINAL_ROOM_EXISTS, NOTE_REQUIRED, REQUEST_ID_REUSED, ROOM_NOT_FOUND, TEAM_ALREADY_CLAIMED, TEAM_BANKRUPT, TEAMS_NOT_JOINED, TOO_MANY_ATTEMPTS, UNRESOLVED_TIE |
| CONFLICT | Someone changed it first: refetch and retry | VERSION_CONFLICT, BUSINESS_OWNED |
| SESSION_EXPIRED | Sign in again | NOT_AUTHENTICATED, PGRST301 |
| NOT_ADMIN | Account may not do this | NOT_ADMIN |
| ROOM_NOT_ACTIVE | Room status no longer allows it; the room may already be where you wanted | INVALID_TRANSITION, ROOM_NOT_EDITABLE, ROOM_ALREADY_EXPIRED, ROOM_FINALIZED, IMMUTABLE |
| OUTCOME_UNKNOWN | No trustworthy answer (network, timeout, 5xx): it may have been applied | anything else |

`COMMITTED` (success or a request_id replay) is the non-error outcome.

- One `request_id` per user intent (`src/lib/intent.ts`): the same function with the same arguments reuses its id until the outcome is known, so a double-click, a retry or a resend replays on the server instead of applying twice. An unknown outcome keeps the id; success or a definite failure drops it. Quick-action dialogs still mint their own id on open and pass it through.
- Lifecycle buttons (open lobby, start, abort, finalize) now carry a `request_id` and are retried once automatically after a dropped response. If the call still errors with ROOM_NOT_ACTIVE or an unknown outcome, the UI asks the server for the room status and shows success when the room is already in the target state.
- On an unknown outcome the console shows a neutral message, reloads the snapshot and never says "saved". Check the refreshed values before repeating the action.
