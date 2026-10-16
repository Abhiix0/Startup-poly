-- Migration 0020: Security surface lock-down
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- 1. N3/N4 (privacy leaks found in the Phase 6 audit):
--    get_team_snapshot and room_standings are SECURITY DEFINER with no caller check and were executable by
--    signed-in players (anonymous sign-in users have role `authenticated`) and, for room_standings, by anon.
--    A player could read any team's cash/CV/businesses by UUID, or the whole leaderboard of their own room
--    during play. Both are internal helpers: only other SECURITY DEFINER functions (running as the owner)
--    call them, so EXECUTE is revoked from anon and authenticated.
-- 2. N2: anon (no session at all) keeps EXECUTE only on what the public pages call:
--    server_time, get_lobby, join_team, get_my_state, plus is_admin, which RLS policies evaluate for every
--    caller. Everything else is revoked, and default privileges stop future functions from being granted
--    to anon automatically.
-- 3. L9: app_now() honours the app.test_now hook only when the SESSION user is postgres or supabase_admin
--    (psql / pgTAP / CLI; on Supabase `postgres` is not a true superuser, so rolsuper cannot be used).
--    PostgREST connects as `authenticator`, so no HTTP caller can move the clock even if a GUC could be set. app_now and raise_error are internal and no longer executable by clients.
--    expire_if_due stays executable by authenticated (see docs/BACKEND_AUDIT.md, L10).

CREATE OR REPLACE FUNCTION public.app_now()
RETURNS timestamptz
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  test_now text;
  app_env text;
BEGIN
  test_now := current_setting('app.test_now', true);
  app_env := current_setting('app.env', true);
  IF test_now IS NOT NULL AND test_now <> '' AND app_env = 'test'
     AND session_user IN ('postgres', 'supabase_admin') THEN
    RETURN test_now::timestamptz;
  END IF;
  RETURN clock_timestamp();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_team_snapshot(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.room_standings(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.app_now() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.raise_error(text, jsonb) FROM PUBLIC, anon, authenticated;

-- anon allowlist. is_admin must stay: RLS policies call it for every role.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT p.oid::regprocedure AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prokind = 'f'
      AND p.proname NOT IN ('server_time', 'get_lobby', 'join_team', 'get_my_state', 'is_admin')
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', r.sig);
  END LOOP;
END $$;

ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE EXECUTE ON FUNCTIONS FROM anon;
