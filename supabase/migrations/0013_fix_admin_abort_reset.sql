-- Migration 0013: Fix Admin Abort Reset
-- STARTUPOLY Live Scoreboard & Game Management System
-- Reverts match to LOBBY, resets team cash/cv/bankrupt/tiebreak to baseline, deletes businesses,
-- increments team versions, records audit events, and requires a non-empty note.

CREATE OR REPLACE FUNCTION public.admin_abort_game(
  room_id uuid,
  note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.room_status;
  v_room jsonb;
  v_biz RECORD;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  IF note IS NULL OR trim(note) = '' THEN
    PERFORM public.raise_error('NOTE_REQUIRED');
  END IF;

  SELECT status INTO v_status
  FROM public.rooms
  WHERE id = room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('INVALID_TRANSITION', jsonb_build_object('from', v_status, 'to', 'LOBBY'));
  END IF;

  -- Lock teams in deterministic ID order to prevent deadlocks
  PERFORM 1
  FROM public.teams
  WHERE room_id = admin_abort_game.room_id
  ORDER BY id ASC
  FOR UPDATE;

  -- Reset room back to LOBBY
  UPDATE public.rooms
  SET status = 'LOBBY',
      started_at = NULL,
      ends_at = NULL
  WHERE id = room_id;

  -- Record audit events for removed businesses
  FOR v_biz IN
    SELECT tb.team_id, tb.business_key, tb.level
    FROM public.team_businesses tb
    JOIN public.teams t ON tb.team_id = t.id
    WHERE t.room_id = admin_abort_game.room_id
  LOOP
    INSERT INTO public.activity_events (
      room_id,
      team_id,
      type,
      business_key,
      prev,
      new,
      note,
      is_correction,
      actor_id,
      created_at
    ) VALUES (
      room_id,
      v_biz.team_id,
      'BUSINESS_REMOVED',
      v_biz.business_key,
      jsonb_build_object('level', v_biz.level),
      jsonb_build_object('reason', 'CORRECTION'),
      trim(note),
      true,
      auth.uid(),
      public.app_now()
    );
  END LOOP;

  -- Delete all team businesses for this room
  DELETE FROM public.team_businesses
  WHERE team_id IN (
    SELECT id FROM public.teams WHERE room_id = admin_abort_game.room_id
  );

  -- Reset all teams in the room back to LOBBY baseline and increment version
  UPDATE public.teams
  SET cash = 1000,
      cv = 0,
      is_bankrupt = false,
      tiebreak_order = NULL,
      version = version + 1
  WHERE room_id = admin_abort_game.room_id;

  -- Log the abort event with reset details
  INSERT INTO public.activity_events (
    room_id,
    type,
    note,
    prev,
    new,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    room_id,
    'GAME_ABORTED',
    trim(note),
    jsonb_build_object('status', 'ACTIVE'),
    jsonb_build_object('status', 'LOBBY', 'teams_reset', true),
    true,
    auth.uid(),
    public.app_now()
  );

  SELECT to_jsonb(r.*) INTO v_room FROM public.rooms r WHERE r.id = room_id;
  RETURN v_room;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_abort_game(uuid, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_abort_game(uuid, text) TO authenticated;
