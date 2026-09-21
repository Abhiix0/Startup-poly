-- Migration 0001: Core relational schema, types, indexes, and helper functions
-- STARTUPOLY Live Scoreboard & Game Management System

-- 1. Custom Types
CREATE TYPE public.room_status AS ENUM (
  'CREATED',
  'LOBBY',
  'ACTIVE',
  'TIME_EXPIRED',
  'FINALIZED'
);

-- 2. Admins Table (created before is_admin() function)
CREATE TABLE public.admins (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE
);
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Helper Functions
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admins WHERE user_id = auth.uid()
  );
END;
$$;

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
  IF test_now IS NOT NULL AND test_now <> '' AND app_env = 'test' THEN
    RETURN test_now::timestamptz;
  END IF;
  RETURN clock_timestamp();
END;
$$;

-- 4. Core Tables

-- Rooms Table
CREATE TABLE public.rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL CHECK (code ~ '^[A-HJ-NP-Z2-9]{6}$'),
  status public.room_status NOT NULL DEFAULT 'CREATED',
  team_count smallint NOT NULL CHECK (team_count BETWEEN 5 AND 6),
  duration_seconds int NOT NULL DEFAULT 3000 CHECK (duration_seconds > 0),
  started_at timestamptz,
  ends_at timestamptz,
  finalized_at timestamptz,
  winner_team_id uuid,
  tiebreak_note text,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  CHECK (ends_at IS NULL OR started_at IS NOT NULL)
);
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_rooms_unique_active_code ON public.rooms (code) WHERE status <> 'FINALIZED';
CREATE UNIQUE INDEX idx_rooms_single_active ON public.rooms ((true)) WHERE status <> 'FINALIZED';

-- Teams Table
CREATE TABLE public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  slot smallint NOT NULL CHECK (slot BETWEEN 1 AND 6),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 30),
  color text NOT NULL CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  cash integer NOT NULL DEFAULT 1000 CHECK (cash >= 0),
  cv integer NOT NULL DEFAULT 0 CHECK (cv >= 0),
  is_bankrupt boolean NOT NULL DEFAULT false,
  tiebreak_order smallint,
  version integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE (room_id, slot),
  UNIQUE (room_id, color),
  UNIQUE (id, room_id)
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- Add deferred circular foreign key for winner_team_id
ALTER TABLE public.rooms
  ADD CONSTRAINT fk_rooms_winner_team
  FOREIGN KEY (winner_team_id)
  REFERENCES public.teams(id);

-- Team Secrets Table (Admin only)
CREATE TABLE public.team_secrets (
  team_id uuid PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  join_pin text NOT NULL CHECK (join_pin ~ '^[0-9]{4}$')
);
ALTER TABLE public.team_secrets ENABLE ROW LEVEL SECURITY;

-- Team Claims Table (Anonymous phone sessions linked to team)
CREATE TABLE public.team_claims (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  claimed_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, team_id)
);
ALTER TABLE public.team_claims ENABLE ROW LEVEL SECURITY;

-- Join Attempts Table (Throttling / Audit)
CREATE TABLE public.join_attempts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid,
  team_id uuid,
  success boolean,
  attempted_at timestamptz DEFAULT now()
);
ALTER TABLE public.join_attempts ENABLE ROW LEVEL SECURITY;

-- Business Catalog Table
CREATE TABLE public.business_catalog (
  key text PRIMARY KEY,
  name text NOT NULL,
  cost int NOT NULL,
  initial_cv int NOT NULL,
  u1_cost int NOT NULL,
  u2_cost int NOT NULL,
  u1_cv int NOT NULL DEFAULT 300,
  u2_cv int NOT NULL DEFAULT 400,
  is_provisional boolean NOT NULL DEFAULT false,
  sort_order smallint NOT NULL
);
ALTER TABLE public.business_catalog ENABLE ROW LEVEL SECURITY;

-- Team Businesses Table
CREATE TABLE public.team_businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL,
  team_id uuid NOT NULL,
  business_key text NOT NULL REFERENCES public.business_catalog(key),
  level smallint NOT NULL DEFAULT 0 CHECK (level BETWEEN 0 AND 2),
  acquired_at timestamptz DEFAULT now(),
  UNIQUE (room_id, business_key),
  FOREIGN KEY (team_id, room_id) REFERENCES public.teams(id, room_id) ON DELETE CASCADE
);
ALTER TABLE public.team_businesses ENABLE ROW LEVEL SECURITY;

-- Activity Events Table (Append-only Audit Log)
CREATE TABLE public.activity_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  room_id uuid NOT NULL REFERENCES public.rooms(id),
  team_id uuid REFERENCES public.teams(id),
  group_id uuid,
  request_id uuid UNIQUE,
  type text NOT NULL CHECK (type IN (
    'ROOM_CREATED',
    'TEAM_CONFIGURED',
    'LOBBY_OPENED',
    'TEAM_CLAIMED',
    'TEAM_RELEASED',
    'GAME_STARTED',
    'CASH_SET',
    'CV_SET',
    'ADJUSTMENT',
    'BUSINESS_ADDED',
    'BUSINESS_LEVEL_SET',
    'BUSINESS_REMOVED',
    'BANKRUPTCY_SET',
    'TIEBREAK_SET',
    'TIME_EXPIRED',
    'GAME_FINALIZED'
  )),
  business_key text,
  prev jsonb,
  new jsonb,
  note text,
  is_correction boolean NOT NULL DEFAULT false,
  actor_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;

-- Final Results Table (Immutable after finalization)
CREATE TABLE public.final_results (
  room_id uuid NOT NULL REFERENCES public.rooms(id),
  team_id uuid NOT NULL REFERENCES public.teams(id),
  rank smallint NOT NULL,
  cv int NOT NULL,
  cash int NOT NULL,
  business_count smallint NOT NULL,
  is_bankrupt boolean NOT NULL,
  PRIMARY KEY (room_id, team_id)
);
ALTER TABLE public.final_results ENABLE ROW LEVEL SECURITY;

-- Indexes for high-frequency queries, RLS filtering, and Realtime
CREATE INDEX idx_teams_room_id ON public.teams(room_id);
CREATE INDEX idx_team_businesses_team_id ON public.team_businesses(team_id);
CREATE INDEX idx_activity_events_room_id_id ON public.activity_events(room_id, id DESC);
CREATE INDEX idx_activity_events_room_team ON public.activity_events(room_id, team_id);
CREATE INDEX idx_team_claims_team_id ON public.team_claims(team_id);
