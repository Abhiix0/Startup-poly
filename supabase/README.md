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
