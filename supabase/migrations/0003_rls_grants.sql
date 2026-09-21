-- Migration 0003: Row Level Security policies and role privileges
-- STARTUPOLY Live Scoreboard & Game Management System

-- 1. Revoke default privileges and grant schema usage
GRANT USAGE ON SCHEMA public TO anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Grant EXECUTE on public helpers
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.app_now() TO anon, authenticated;

-- Grant SELECT ONLY where explicit policies allow reading
GRANT SELECT ON public.admins TO authenticated;
GRANT SELECT ON public.rooms TO anon, authenticated;
GRANT SELECT ON public.teams TO anon, authenticated;
GRANT SELECT ON public.team_secrets TO authenticated;
GRANT SELECT ON public.team_claims TO anon, authenticated;
GRANT SELECT ON public.business_catalog TO anon, authenticated;
GRANT SELECT ON public.team_businesses TO anon, authenticated;
GRANT SELECT ON public.activity_events TO authenticated;
GRANT SELECT ON public.final_results TO anon, authenticated;

-- NO INSERT / UPDATE / DELETE privileges granted to anon or authenticated.
-- All mutations in subsequent phases run through SECURITY DEFINER RPCs.

-- 2. RLS Policies

-- Admins Table
CREATE POLICY "Admins can select own row"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- Rooms Table
CREATE POLICY "Admins can select all rooms"
  ON public.rooms
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Claimed users can select their room"
  ON public.rooms
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_claims tc ON t.id = tc.team_id
      WHERE t.room_id = public.rooms.id
        AND tc.user_id = (SELECT auth.uid())
    )
  );

-- Teams Table
CREATE POLICY "Admins can select all teams"
  ON public.teams
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Claimed users can select their own team"
  ON public.teams
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_claims tc
      WHERE tc.team_id = public.teams.id
        AND tc.user_id = (SELECT auth.uid())
    )
  );

-- Team Secrets Table (Admin Only)
CREATE POLICY "Admins can select team secrets"
  ON public.team_secrets
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Team Claims Table
CREATE POLICY "Admins can select all team claims"
  ON public.team_claims
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users can select own team claims"
  ON public.team_claims
  FOR SELECT
  TO anon, authenticated
  USING (user_id = (SELECT auth.uid()));

-- Join Attempts Table
-- No policies defined; completely unreadable by client roles.

-- Business Catalog Table
CREATE POLICY "Public read business catalog"
  ON public.business_catalog
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Team Businesses Table
CREATE POLICY "Admins can select all team businesses"
  ON public.team_businesses
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Claimed users can select own team businesses"
  ON public.team_businesses
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_claims tc
      WHERE tc.team_id = public.team_businesses.team_id
        AND tc.user_id = (SELECT auth.uid())
    )
  );

-- Activity Events Table (Admin Only)
CREATE POLICY "Admins can select all activity events"
  ON public.activity_events
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Final Results Table
CREATE POLICY "Admins can select all final results"
  ON public.final_results
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Claimed users can select final results when room is finalized"
  ON public.final_results
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.team_claims tc ON t.id = tc.team_id
      WHERE t.room_id = public.final_results.room_id
        AND tc.user_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1 FROM public.rooms r
      WHERE r.id = public.final_results.room_id
        AND r.status = 'FINALIZED'
    )
  );
