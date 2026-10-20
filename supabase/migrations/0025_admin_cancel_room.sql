-- Migration 0025: Admin Cancel / Discard Room & Player Leave Team
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- Enables:
-- 1. Host/admin to cancel or discard an unstarted (CREATED, LOBBY) or accidental ACTIVE room.
-- 2. Players to voluntarily disconnect from a team slot during LOBBY if they joined by mistake.
--
-- Updates fn_check_room_status_transition to allow CREATED -> FINALIZED, LOBBY -> FINALIZED, and ACTIVE -> FINALIZED.

-- 1. Update room status transition trigger
CREATE OR REPLACE FUNCTION public.fn_check_room_status_transition()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    IF NOT (
      (OLD.status = 'CREATED' AND NEW.status = 'LOBBY') OR
      (OLD.status = 'CREATED' AND NEW.status = 'FINALIZED') OR -- Discard during setup
      (OLD.status = 'LOBBY' AND NEW.status = 'ACTIVE') OR
      (OLD.status = 'LOBBY' AND NEW.status = 'FINALIZED') OR   -- Cancel during lobby
      (OLD.status = 'ACTIVE' AND NEW.status = 'TIME_EXPIRED') OR
      (OLD.status = 'ACTIVE' AND NEW.status = 'LOBBY') OR
      (OLD.status = 'ACTIVE' AND NEW.status = 'FINALIZED') OR  -- Early cancel during active
      (OLD.status = 'TIME_EXPIRED' AND NEW.status = 'FINALIZED') OR
      (OLD.status = 'TIME_EXPIRED' AND NEW.status = 'ACTIVE')  -- Host extended game into extra time
    ) THEN
      RAISE EXCEPTION 'INVALID_TRANSITION';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Admin Cancel Room Function
CREATE OR REPLACE FUNCTION public.admin_cancel_room(
  p_room_id uuid,
  note text DEFAULT 'Cancelled by organizer',
  request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.room_status;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT status INTO v_status
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND', jsonb_build_object('room_id', p_room_id));
  END IF;

  IF v_status = 'FINALIZED' THEN
    PERFORM public.raise_error('ROOM_FINALIZED');
  END IF;

  -- Disconnect all claimed sessions for this room
  DELETE FROM public.team_claims
  WHERE team_id IN (SELECT id FROM public.teams WHERE room_id = p_room_id);

  -- Transition room to FINALIZED
  UPDATE public.rooms
  SET status = 'FINALIZED',
      ended_at = coalesce(ended_at, public.app_now())
  WHERE id = p_room_id;

  -- Record audit event
  INSERT INTO public.activity_events (room_id, type, note, is_correction, created_at)
  VALUES (p_room_id, 'GAME_FINALIZED', coalesce(note, 'Match cancelled by organizer'), true, public.app_now());

  RETURN jsonb_build_object('room_id', p_room_id, 'status', 'FINALIZED', 'cancelled', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_cancel_room(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_cancel_room(uuid, text, uuid) TO authenticated;

-- 3. Player Leave Team Function (LOBBY only)
CREATE OR REPLACE FUNCTION public.leave_team()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_team_id uuid;
  v_room_id uuid;
  v_status public.room_status;
  v_slot int;
  v_name text;
BEGIN
  IF v_user_id IS NULL THEN
    PERFORM public.raise_error('NOT_AUTHENTICATED');
  END IF;

  SELECT tc.team_id, t.room_id, t.slot, t.name, r.status
  INTO v_team_id, v_room_id, v_slot, v_name, v_status
  FROM public.team_claims tc
  JOIN public.teams t ON tc.team_id = t.id
  JOIN public.rooms r ON t.room_id = r.id
  WHERE tc.user_id = v_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', true, 'message', 'No active team claim');
  END IF;

  -- Only allow voluntary departure during LOBBY stage
  IF v_status <> 'LOBBY' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  DELETE FROM public.team_claims WHERE user_id = v_user_id;

  INSERT INTO public.activity_events (
    room_id, team_id, type, note, actor_id, created_at
  ) VALUES (
    v_room_id, v_team_id, 'TEAM_RELEASED',
    'Player voluntarily disconnected from Slot #' || v_slot || ' (' || v_name || ')',
    v_user_id, public.app_now()
  );

  RETURN jsonb_build_object('success', true, 'team_id', v_team_id, 'slot', v_slot);
END;
$$;

REVOKE ALL ON FUNCTION public.leave_team() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.leave_team() TO authenticated;
