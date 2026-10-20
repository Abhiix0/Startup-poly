-- Migration 0024: Admin Extend Game (10-minute overtime / extra time)
--
-- Enables the host/admin to extend gameplay time by X seconds (default 600s / 10 mins).
-- Works when the room is ACTIVE (adding extra time) or when TIME_EXPIRED (re-activating
-- the room and pushing ends_at into the future).
--
-- 0. Updates activity_events type check constraint to permit GAME_EXTENDED.
-- 1. Updates fn_check_room_status_transition to allow TIME_EXPIRED -> ACTIVE.
-- 2. Creates public.admin_extend_game(p_room_id, p_additional_seconds, request_id).

-- 0. Update activity_events type check constraint to permit GAME_EXTENDED
ALTER TABLE public.activity_events DROP CONSTRAINT IF EXISTS activity_events_type_check;
ALTER TABLE public.activity_events ADD CONSTRAINT activity_events_type_check CHECK (type IN (
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
  'GAME_FINALIZED',
  'GAME_ABORTED',
  'GAME_EXTENDED'
));

-- 1. Update room status transition trigger
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
      (OLD.status = 'TIME_EXPIRED' AND NEW.status = 'FINALIZED') OR
      (OLD.status = 'TIME_EXPIRED' AND NEW.status = 'ACTIVE') -- Host extended game into extra time
    ) THEN
      RAISE EXCEPTION 'INVALID_TRANSITION';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Admin Extend Game Function
CREATE OR REPLACE FUNCTION public.admin_extend_game(
  p_room_id uuid,
  p_additional_seconds int DEFAULT 600,
  request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.room_status;
  v_ends_at timestamptz;
  v_duration int;
  v_new_ends_at timestamptz;
  v_mins int;
BEGIN
  -- Admin authorization check
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  -- Validate additional seconds
  IF p_additional_seconds IS NULL OR p_additional_seconds <= 0 THEN
    p_additional_seconds := 600;
  END IF;

  v_mins := p_additional_seconds / 60;

  -- Idempotency check: if this request_id was already recorded, return current room
  IF public.lifecycle_replay_check(p_room_id, request_id, 'GAME_EXTENDED') THEN
    SELECT status, ends_at, duration_seconds INTO v_status, v_ends_at, v_duration
    FROM public.rooms WHERE id = p_room_id;
    RETURN jsonb_build_object(
      'room_id', p_room_id,
      'status', v_status,
      'ends_at', v_ends_at,
      'duration_seconds', v_duration
    );
  END IF;

  -- Lock room row
  SELECT status, ends_at, duration_seconds INTO v_status, v_ends_at, v_duration
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND', jsonb_build_object('room_id', p_room_id));
  END IF;

  -- Disallow extending finalized games or unstarted lobbies
  IF v_status = 'FINALIZED' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('room_id', p_room_id, 'status', v_status));
  END IF;

  IF v_status NOT IN ('ACTIVE', 'TIME_EXPIRED') THEN
    PERFORM public.raise_error('INVALID_TRANSITION', jsonb_build_object('from', v_status, 'to', 'ACTIVE'));
  END IF;

  -- Calculate new ends_at
  IF v_status = 'TIME_EXPIRED' OR v_ends_at IS NULL OR public.app_now() >= v_ends_at THEN
    v_new_ends_at := public.app_now() + (p_additional_seconds || ' seconds')::interval;
  ELSE
    v_new_ends_at := v_ends_at + (p_additional_seconds || ' seconds')::interval;
  END IF;

  -- Update rooms row
  UPDATE public.rooms
  SET status = 'ACTIVE',
      ends_at = v_new_ends_at,
      duration_seconds = duration_seconds + p_additional_seconds
  WHERE id = p_room_id;

  -- Insert activity event
  INSERT INTO public.activity_events (
    room_id,
    request_id,
    type,
    note,
    actor_id,
    created_at
  ) VALUES (
    p_room_id,
    request_id,
    'GAME_EXTENDED',
    'Host added ' || v_mins::text || ' minutes extra time. Match clock extended.',
    auth.uid(),
    public.app_now()
  );

  RETURN jsonb_build_object(
    'room_id', p_room_id,
    'status', 'ACTIVE',
    'ends_at', v_new_ends_at,
    'duration_seconds', v_duration + p_additional_seconds
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_extend_game(uuid, int, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_extend_game(uuid, int, uuid) TO authenticated;
