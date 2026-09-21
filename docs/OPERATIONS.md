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
> - The `SUPABASE_SERVICE_ROLE_KEY` has superuser bypass privileges and **MUST NEVER** be present in client-side code, `.env`, `.env.production`, or Git repositories.
> - Client code uses **only** `VITE_SUPABASE_ANON_KEY`. All administrative mutations occur via Postgres RPC functions secured by `auth.role() = 'authenticated'` and user metadata verification.

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
After each tournament or event day, export match results and audit logs for official record keeping:

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

### Creating an Event Admin User
Create admin users directly using the Supabase CLI or Dashboard:

```bash
# Using Supabase CLI
npx supabase auth admin create-user \
  --email "admin-runner1@startupoly.com" \
  --password "SecurePassphrase2026!"
```

To revoke access after an event, delete or disable the user in **Authentication** → **Users** in the Supabase Dashboard.

---
*End of Operations Manual.*
