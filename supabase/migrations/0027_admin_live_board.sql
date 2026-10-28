-- Migration 0027: Admin live-board positions
--
-- Positions are organizer-only state for the physical board. They never reach
-- player phones, but are persisted so a refreshed admin laptop retains the
-- exact location of every team token.

ALTER TABLE public.teams
  ADD COLUMN board_position smallint NOT NULL DEFAULT 0
  CHECK (board_position BETWEEN 0 AND 23);

ALTER TABLE public.activity_events DROP CONSTRAINT IF EXISTS activity_events_type_check;
ALTER TABLE public.activity_events ADD CONSTRAINT activity_events_type_check CHECK (type IN (
  'ROOM_CREATED', 'TEAM_CONFIGURED', 'LOBBY_OPENED', 'TEAM_CLAIMED', 'TEAM_RELEASED',
  'GAME_STARTED', 'CASH_SET', 'CV_SET', 'ADJUSTMENT', 'BUSINESS_ADDED',
  'BUSINESS_LEVEL_SET', 'BUSINESS_REMOVED', 'BANKRUPTCY_SET', 'TIEBREAK_SET',
  'TIME_EXPIRED', 'GAME_FINALIZED', 'GAME_ABORTED', 'GAME_EXTENDED', 'TEAM_MOVED'
));

CREATE OR REPLACE FUNCTION public.admin_move_team(
  team_id uuid,
  steps smallint,
  expected_version int,
  request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_position smallint;
  v_version int;
  v_next_position smallint;
  v_passed_start boolean;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  IF steps IS NULL OR steps NOT BETWEEN 1 AND 6 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'steps'));
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;
  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  SELECT board_position, version INTO v_position, v_version
  FROM public.teams
  WHERE id = team_id AND room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['TEAM_MOVED']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_version <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object(
      'expected_version', expected_version,
      'current_version', v_version,
      'board_position', v_position
    ));
  END IF;

  v_next_position := ((v_position + steps) % 24)::smallint;
  v_passed_start := v_position + steps >= 24;

  UPDATE public.teams
  SET board_position = v_next_position,
      version = version + 1
  WHERE id = team_id;

  INSERT INTO public.activity_events (
    room_id, team_id, request_id, type, prev, new, note, actor_id, created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'TEAM_MOVED',
    jsonb_build_object('board_position', v_position),
    jsonb_build_object('board_position', v_next_position, 'steps', steps, 'passed_start', v_passed_start),
    format('Moved %s space%s to board space #%s%s.', steps, CASE WHEN steps = 1 THEN '' ELSE 's' END, v_next_position, CASE WHEN v_passed_start THEN ' and passed START' ELSE '' END),
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_move_team(uuid, smallint, int, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_move_team(uuid, smallint, int, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_admin_snapshot(room_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room jsonb;
  v_teams jsonb;
  v_events jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  PERFORM public.expire_if_due(room_id);

  SELECT to_jsonb(r.*) INTO v_room FROM public.rooms r WHERE r.id = room_id;
  IF v_room IS NULL THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', t.id, 'slot', t.slot, 'name', t.name, 'color', t.color,
    'cash', t.cash, 'cv', t.cv, 'board_position', t.board_position,
    'is_bankrupt', t.is_bankrupt, 'version', t.version, 'tiebreak_order', t.tiebreak_order,
    'claimed', EXISTS (SELECT 1 FROM public.team_claims tc WHERE tc.team_id = t.id),
    'pin', ts.join_pin,
    'businesses', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'business_key', tb.business_key, 'name', bc.name, 'level', tb.level,
        'cost', bc.cost, 'initial_cv', bc.initial_cv
      ) ORDER BY bc.sort_order)
      FROM public.team_businesses tb JOIN public.business_catalog bc ON tb.business_key = bc.key
      WHERE tb.team_id = t.id
    ), '[]'::jsonb)
  ) ORDER BY t.slot), '[]'::jsonb) INTO v_teams
  FROM public.teams t LEFT JOIN public.team_secrets ts ON t.id = ts.team_id
  WHERE t.room_id = get_admin_snapshot.room_id;

  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'id', ae.id, 'team_id', ae.team_id, 'group_id', ae.group_id, 'type', ae.type,
    'business_key', ae.business_key, 'prev', ae.prev, 'new', ae.new, 'note', ae.note,
    'is_correction', ae.is_correction, 'created_at', ae.created_at
  ) ORDER BY ae.id DESC), '[]'::jsonb) INTO v_events
  FROM (SELECT * FROM public.activity_events WHERE public.activity_events.room_id = get_admin_snapshot.room_id ORDER BY id DESC LIMIT 200) ae;

  RETURN jsonb_build_object('room', v_room, 'server_now', public.app_now(), 'teams', v_teams, 'events', v_events);
END;
$$;

REVOKE ALL ON FUNCTION public.get_admin_snapshot(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_admin_snapshot(uuid) TO authenticated;

-- Returning an active match to the lobby also returns every tracked token to START.
CREATE OR REPLACE FUNCTION public.reset_board_positions_after_abort()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.type = 'GAME_ABORTED' THEN
    UPDATE public.teams SET board_position = 0 WHERE room_id = NEW.room_id;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.reset_board_positions_after_abort() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER reset_board_positions_after_abort
AFTER INSERT ON public.activity_events
FOR EACH ROW EXECUTE FUNCTION public.reset_board_positions_after_abort();
