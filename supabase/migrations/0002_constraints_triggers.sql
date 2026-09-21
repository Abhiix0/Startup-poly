-- Migration 0002: Integrity triggers and lifecycle constraints
-- STARTUPOLY Live Scoreboard & Game Management System

-- 1. Max 3 businesses per team constraint trigger
CREATE OR REPLACE FUNCTION public.fn_check_business_cap()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT count(*) FROM public.team_businesses WHERE team_id = NEW.team_id) >= 3 THEN
    RAISE EXCEPTION 'BUSINESS_CAP';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_business_cap
BEFORE INSERT ON public.team_businesses
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_business_cap();

-- 2. Room immutability triggers (teams, team_businesses, rooms)
-- Disallow modifications to teams in a FINALIZED room
CREATE OR REPLACE FUNCTION public.fn_check_team_room_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  r_status public.room_status;
  target_room_id uuid;
BEGIN
  target_room_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.room_id ELSE NEW.room_id END;
  SELECT status INTO r_status FROM public.rooms WHERE id = target_room_id;
  IF r_status = 'FINALIZED' THEN
    RAISE EXCEPTION 'ROOM_FINALIZED';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER trg_teams_immutable
BEFORE INSERT OR UPDATE OR DELETE ON public.teams
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_team_room_immutable();

-- Disallow modifications to team_businesses in a FINALIZED room
CREATE OR REPLACE FUNCTION public.fn_check_team_business_room_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  r_status public.room_status;
  target_room_id uuid;
BEGIN
  target_room_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.room_id ELSE NEW.room_id END;
  SELECT status INTO r_status FROM public.rooms WHERE id = target_room_id;
  IF r_status = 'FINALIZED' THEN
    RAISE EXCEPTION 'ROOM_FINALIZED';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER trg_team_businesses_immutable
BEFORE INSERT OR UPDATE OR DELETE ON public.team_businesses
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_team_business_room_immutable();

-- Disallow update/delete on rooms once FINALIZED (allows the single update that sets status to FINALIZED)
CREATE OR REPLACE FUNCTION public.fn_check_room_immutable()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status = 'FINALIZED' THEN
    RAISE EXCEPTION 'ROOM_FINALIZED';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END;
$$;

CREATE TRIGGER trg_rooms_immutable
BEFORE UPDATE OR DELETE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_room_immutable();

-- 3. Room status transition trigger (forward-only progression)
CREATE OR REPLACE FUNCTION public.fn_check_room_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT (
      (OLD.status = 'CREATED' AND NEW.status = 'LOBBY') OR
      (OLD.status = 'LOBBY' AND NEW.status = 'ACTIVE') OR
      (OLD.status = 'ACTIVE' AND NEW.status = 'TIME_EXPIRED') OR
      (OLD.status = 'ACTIVE' AND NEW.status = 'LOBBY') OR
      (OLD.status = 'TIME_EXPIRED' AND NEW.status = 'FINALIZED')
    ) THEN
      RAISE EXCEPTION 'INVALID_TRANSITION';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_rooms_status_transition
BEFORE UPDATE ON public.rooms
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_room_status_transition();

-- 4. Audit and Results immutability (activity_events & final_results are append-only)
CREATE OR REPLACE FUNCTION public.fn_check_immutable_table()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'IMMUTABLE';
END;
$$;

CREATE TRIGGER trg_activity_events_immutable
BEFORE UPDATE OR DELETE ON public.activity_events
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_immutable_table();

CREATE TRIGGER trg_final_results_immutable
BEFORE UPDATE OR DELETE ON public.final_results
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_immutable_table();
