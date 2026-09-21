-- Migration 0007: Core Functions (Error Helper, Server Clock, Expiry Derivation)
-- STARTUPOLY Live Scoreboard & Game Management System

-- 1. Standardized Error Raising Helper
CREATE OR REPLACE FUNCTION public.raise_error(
  err_code text,
  detail jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '%', err_code USING DETAIL = detail::text;
END;
$$;

-- 2. Server Clock Function
CREATE OR REPLACE FUNCTION public.server_time()
RETURNS timestamptz
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.app_now();
$$;

REVOKE ALL ON FUNCTION public.server_time() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.server_time() TO anon, authenticated;

-- 3. Idempotent Expiry Derivation Function
CREATE OR REPLACE FUNCTION public.expire_if_due(p_room_id uuid)
RETURNS public.room_status
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.room_status;
  v_ends_at timestamptz;
BEGIN
  SELECT status, ends_at INTO v_status, v_ends_at
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND', jsonb_build_object('room_id', p_room_id));
  END IF;

  IF v_status = 'ACTIVE' AND v_ends_at IS NOT NULL AND public.app_now() >= v_ends_at THEN
    UPDATE public.rooms
    SET status = 'TIME_EXPIRED'
    WHERE id = p_room_id;

    INSERT INTO public.activity_events (
      room_id,
      type,
      note,
      created_at
    ) VALUES (
      p_room_id,
      'TIME_EXPIRED',
      'Gameplay window expired. Scores frozen.',
      public.app_now()
    );

    v_status := 'TIME_EXPIRED';
  END IF;

  RETURN v_status;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_if_due(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.expire_if_due(uuid) TO anon, authenticated;
