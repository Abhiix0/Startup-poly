-- Migration 0005: Supabase Realtime publication setup
-- STARTUPOLY Live Scoreboard & Game Management System

-- 1. Ensure tables are added to supabase_realtime publication idempotently
DO $$
BEGIN
  -- rooms
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
  END IF;

  -- teams
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'teams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
  END IF;

  -- team_businesses
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'team_businesses'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.team_businesses;
  END IF;

  -- activity_events
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'activity_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_events;
  END IF;
END $$;

-- 2. Set REPLICA IDENTITY FULL on team_businesses so DELETE events broadcast full old row (including team_id)
ALTER TABLE public.team_businesses REPLICA IDENTITY FULL;
