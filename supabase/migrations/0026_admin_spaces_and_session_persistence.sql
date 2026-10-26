-- Migration 0026: Admin Multi-Tenancy (Dedicated Admin Spaces) & Match Isolation
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- Enables:
-- 1. Multiple independent administrators (e.g. 3 concurrent event organizers) to each
--    manage their own distinct matches without collision or blocking.
-- 2. Scopes NON_FINAL_ROOM_EXISTS check in admin_create_room to the calling admin's user ID.
-- 3. Scopes list_history() to the calling admin's created rooms.
-- 4. Ensures admin_cancel_room enforces room ownership when created_by is set.

-- 1. Update admin_create_room to isolate active room check per admin
CREATE OR REPLACE FUNCTION public.admin_create_room(
  team_count int,
  teams jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id uuid;
  v_code text;
  v_alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_team_id uuid;
  v_team_elem jsonb;
  v_name text;
  v_color text;
  v_pin text;
  i int;
  v_room jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  -- Multi-admin workspace isolation: check if THIS admin already has an active room
  IF EXISTS (
    SELECT 1 FROM public.rooms
    WHERE status <> 'FINALIZED'
      AND (created_by = auth.uid() OR (created_by IS NULL AND auth.uid() IS NULL))
  ) THEN
    PERFORM public.raise_error('NON_FINAL_ROOM_EXISTS');
  END IF;

  IF team_count NOT BETWEEN 5 AND 6 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('team_count', team_count));
  END IF;

  IF jsonb_array_length(teams) <> team_count THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('teams_length', jsonb_array_length(teams)));
  END IF;

  -- Generate unique 6-character room code across all non-finalized rooms
  LOOP
    v_code := '';
    FOR i IN 1..6 LOOP
      v_code := v_code || substr(v_alphabet, floor(random() * 32)::int + 1, 1);
    END LOOP;
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.rooms WHERE code = v_code AND status <> 'FINALIZED');
  END LOOP;

  INSERT INTO public.rooms (code, status, team_count, created_by, created_at)
  VALUES (v_code, 'CREATED', team_count, auth.uid(), public.app_now())
  RETURNING id INTO v_room_id;

  -- Insert teams & unique PINs
  FOR i IN 1..team_count LOOP
    v_team_elem := teams->(i - 1);
    v_name := trim(coalesce(v_team_elem->>'name', ''));
    v_color := upper(trim(coalesce(v_team_elem->>'color', '')));

    IF char_length(v_name) < 1 OR char_length(v_name) > 30 OR v_color !~ '^#[0-9A-Fa-f]{6}$' THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('slot', i, 'name', v_name, 'color', v_color));
    END IF;

    -- Generate random 4-digit PIN unique within this room
    LOOP
      v_pin := lpad(floor(random() * 10000)::text, 4, '0');
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM public.team_secrets ts
        JOIN public.teams t ON ts.team_id = t.id
        WHERE t.room_id = v_room_id AND ts.join_pin = v_pin
      );
    END LOOP;

    INSERT INTO public.teams (room_id, slot, name, color, cash, cv, version, created_at)
    VALUES (v_room_id, i, v_name, v_color, 1000, 0, 0, public.app_now())
    RETURNING id INTO v_team_id;

    INSERT INTO public.team_secrets (team_id, join_pin)
    VALUES (v_team_id, v_pin);
  END LOOP;

  INSERT INTO public.activity_events (
    room_id,
    type,
    note,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    'ROOM_CREATED',
    'Room created with ' || team_count::text || ' teams by admin workspace ' || coalesce(auth.uid()::text, 'system'),
    auth.uid(),
    public.app_now()
  );

  SELECT jsonb_build_object(
    'id', r.id,
    'code', r.code,
    'status', r.status,
    'team_count', r.team_count,
    'created_at', r.created_at,
    'teams', coalesce(jsonb_agg(
      jsonb_build_object(
        'id', t.id,
        'slot', t.slot,
        'name', t.name,
        'color', t.color,
        'pin', ts.join_pin
      ) ORDER BY t.slot
    ), '[]'::jsonb)
  ) INTO v_room
  FROM public.rooms r
  JOIN public.teams t ON r.id = t.room_id
  JOIN public.team_secrets ts ON t.id = ts.team_id
  WHERE r.id = v_room_id
  GROUP BY r.id, r.code, r.status, r.team_count, r.created_at;

  RETURN v_room;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_room(int, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_create_room(int, jsonb) TO authenticated;

-- 2. Update list_history() to show matches belonging to this admin
CREATE OR REPLACE FUNCTION public.list_history()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_history jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'room_id', r.id,
      'code', r.code,
      'created_at', r.created_at,
      'finalized_at', r.finalized_at,
      'winner_name', w.name,
      'winner_color', w.color,
      'team_count', r.team_count
    ) ORDER BY r.finalized_at DESC NULLS LAST
  ), '[]'::jsonb) INTO v_history
  FROM public.rooms r
  LEFT JOIN public.teams w ON r.winner_team_id = w.id
  WHERE r.status = 'FINALIZED'
    AND (r.created_by = auth.uid() OR r.created_by IS NULL OR auth.uid() IS NULL);

  RETURN v_history;
END;
$$;

REVOKE ALL ON FUNCTION public.list_history() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.list_history() TO authenticated;

-- 3. Update admin_cancel_room to protect against cross-admin cancellation
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
  v_created_by uuid;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT status, created_by INTO v_status, v_created_by
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND', jsonb_build_object('room_id', p_room_id));
  END IF;

  IF v_created_by IS NOT NULL AND auth.uid() IS NOT NULL AND v_created_by <> auth.uid() THEN
    PERFORM public.raise_error('NOT_ROOM_OWNER');
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
