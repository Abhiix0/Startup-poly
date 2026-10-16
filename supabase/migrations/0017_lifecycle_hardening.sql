-- Migration 0017: Lifecycle hardening
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- 1. admin_abort_game calls expire_if_due first and raises ROOM_ALREADY_EXPIRED (new code) for a
--    finished game. An expired game is closed with admin_finalize, never aborted.
-- 2. admin_open_lobby / admin_start_game / admin_abort_game / admin_finalize take an optional
--    request_id. It is stored on the lifecycle event (activity_events.request_id is UNIQUE).
--    Replay rule, evaluated AFTER the room lock: same room + same event type => return the
--    first call's payload shape; any other use of the id => REQUEST_ID_REUSED (new code).
-- 3. admin_start_game re-checks the initial state inside the lock (INVALID_INITIAL_STATE, new code)
--    and derives the countdown text from duration_seconds.
-- 4. expire_if_due is no longer executable by anon (it was a room-existence oracle). It is still
--    called from SECURITY DEFINER readers (get_lobby, get_my_state, ...), which run as the owner.
--
-- Lock order is unchanged (docs/OPERATIONS.md): room first, then teams ascending id.

-- Private helper: true = replay, false = first use, raises on misuse. Call only while holding the room lock.
CREATE OR REPLACE FUNCTION public.lifecycle_replay_check(p_room_id uuid, p_request_id uuid, p_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room uuid;
  v_type text;
BEGIN
  IF p_request_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT ae.room_id, ae.type INTO v_room, v_type
  FROM public.activity_events ae
  WHERE ae.request_id = p_request_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_room IS DISTINCT FROM p_room_id OR v_type <> p_type THEN
    PERFORM public.raise_error('REQUEST_ID_REUSED', jsonb_build_object('request_id', p_request_id));
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.lifecycle_replay_check(uuid, uuid, text) FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------------
-- admin_open_lobby
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_open_lobby(uuid);

CREATE FUNCTION public.admin_open_lobby(room_id uuid, request_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.room_status;
  v_room jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT status INTO v_status
  FROM public.rooms
  WHERE id = room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.lifecycle_replay_check(room_id, request_id, 'LOBBY_OPENED') THEN
    SELECT to_jsonb(r.*) INTO v_room FROM public.rooms r WHERE r.id = room_id;
    RETURN v_room;
  END IF;

  IF v_status <> 'CREATED' THEN
    PERFORM public.raise_error('INVALID_TRANSITION', jsonb_build_object('from', v_status, 'to', 'LOBBY'));
  END IF;

  UPDATE public.rooms
  SET status = 'LOBBY'
  WHERE id = room_id;

  INSERT INTO public.activity_events (
    room_id, request_id, type, note, actor_id, created_at
  ) VALUES (
    room_id, request_id, 'LOBBY_OPENED', 'Lobby opened for team connections', auth.uid(), public.app_now()
  );

  SELECT to_jsonb(r.*) INTO v_room FROM public.rooms r WHERE r.id = room_id;
  RETURN v_room;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_open_lobby(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_open_lobby(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- admin_start_game
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_start_game(uuid, boolean);

CREATE FUNCTION public.admin_start_game(
  room_id uuid,
  force boolean DEFAULT false,
  request_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.room_status;
  v_duration int;
  v_team_count int;
  v_started_prev timestamptz;
  v_ends_prev timestamptz;
  v_unclaimed_slots jsonb;
  v_started_at timestamptz;
  v_ends_at timestamptz;
  v_room jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT status, duration_seconds, team_count, started_at, ends_at
  INTO v_status, v_duration, v_team_count, v_started_prev, v_ends_prev
  FROM public.rooms
  WHERE id = room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.lifecycle_replay_check(room_id, request_id, 'GAME_STARTED') THEN
    SELECT to_jsonb(r.*) INTO v_room FROM public.rooms r WHERE r.id = room_id;
    RETURN v_room;
  END IF;

  IF v_status <> 'LOBBY' THEN
    PERFORM public.raise_error('INVALID_TRANSITION', jsonb_build_object('from', v_status, 'to', 'ACTIVE'));
  END IF;

  -- Defense in depth: a LOBBY room must be pristine.
  IF v_started_prev IS NOT NULL OR v_ends_prev IS NOT NULL
     OR (SELECT count(*) FROM public.teams t WHERE t.room_id = admin_start_game.room_id) <> v_team_count
     OR EXISTS (
       SELECT 1 FROM public.teams t
       WHERE t.room_id = admin_start_game.room_id
         AND (t.cash <> 1000 OR t.cv <> 0 OR t.is_bankrupt
              OR EXISTS (SELECT 1 FROM public.team_businesses tb WHERE tb.team_id = t.id))
     ) THEN
    PERFORM public.raise_error('INVALID_INITIAL_STATE', jsonb_build_object('room_id', room_id));
  END IF;

  IF NOT force THEN
    SELECT jsonb_agg(t.slot ORDER BY t.slot) INTO v_unclaimed_slots
    FROM public.teams t
    WHERE t.room_id = admin_start_game.room_id
      AND NOT EXISTS (SELECT 1 FROM public.team_claims tc WHERE tc.team_id = t.id);

    IF v_unclaimed_slots IS NOT NULL AND jsonb_array_length(v_unclaimed_slots) > 0 THEN
      PERFORM public.raise_error('TEAMS_NOT_JOINED', jsonb_build_object('unclaimed_slots', v_unclaimed_slots));
    END IF;
  END IF;

  v_started_at := public.app_now();
  v_ends_at := v_started_at + (v_duration || ' seconds')::interval;

  UPDATE public.rooms
  SET status = 'ACTIVE',
      started_at = v_started_at,
      ends_at = v_ends_at
  WHERE id = room_id;

  INSERT INTO public.activity_events (
    room_id, request_id, type, note, actor_id, created_at
  ) VALUES (
    room_id,
    request_id,
    'GAME_STARTED',
    format('Gameplay started. %s:%s countdown active.', lpad((v_duration / 60)::text, 2, '0'), lpad((v_duration % 60)::text, 2, '0')),
    auth.uid(),
    v_started_at
  );

  SELECT to_jsonb(r.*) INTO v_room FROM public.rooms r WHERE r.id = room_id;
  RETURN v_room;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_start_game(uuid, boolean, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_start_game(uuid, boolean, uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- admin_abort_game (ACTIVE -> LOBBY with team reset; expired games are finalized, not aborted)
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_abort_game(uuid, text);

CREATE FUNCTION public.admin_abort_game(
  p_room_id uuid,
  note text DEFAULT NULL,
  request_id uuid DEFAULT NULL
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

  -- Flip a passed deadline to TIME_EXPIRED first (takes the room lock).
  PERFORM public.expire_if_due(p_room_id);

  SELECT status INTO v_status
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.lifecycle_replay_check(p_room_id, request_id, 'GAME_ABORTED') THEN
    SELECT to_jsonb(r.*) INTO v_room FROM public.rooms r WHERE r.id = p_room_id;
    RETURN v_room;
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    PERFORM public.raise_error('ROOM_ALREADY_EXPIRED', jsonb_build_object('room_id', p_room_id));
  END IF;

  IF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('INVALID_TRANSITION', jsonb_build_object('from', v_status, 'to', 'LOBBY'));
  END IF;

  -- Lock teams in deterministic ID order to prevent deadlocks
  PERFORM 1
  FROM public.teams
  WHERE room_id = p_room_id
  ORDER BY id ASC
  FOR UPDATE;

  UPDATE public.rooms
  SET status = 'LOBBY',
      started_at = NULL,
      ends_at = NULL
  WHERE id = p_room_id;

  FOR v_biz IN
    SELECT tb.team_id, tb.business_key, tb.level
    FROM public.team_businesses tb
    JOIN public.teams t ON tb.team_id = t.id
    WHERE t.room_id = p_room_id
  LOOP
    INSERT INTO public.activity_events (
      room_id, team_id, type, business_key, prev, new, note, is_correction, actor_id, created_at
    ) VALUES (
      p_room_id, v_biz.team_id, 'BUSINESS_REMOVED', v_biz.business_key,
      jsonb_build_object('level', v_biz.level), jsonb_build_object('reason', 'CORRECTION'),
      trim(note), true, auth.uid(), public.app_now()
    );
  END LOOP;

  DELETE FROM public.team_businesses
  WHERE team_id IN (
    SELECT id FROM public.teams WHERE room_id = p_room_id
  );

  UPDATE public.teams
  SET cash = 1000,
      cv = 0,
      is_bankrupt = false,
      tiebreak_order = NULL,
      version = version + 1
  WHERE room_id = p_room_id;

  INSERT INTO public.activity_events (
    room_id, request_id, type, note, prev, new, is_correction, actor_id, created_at
  ) VALUES (
    p_room_id,
    request_id,
    'GAME_ABORTED',
    trim(note),
    jsonb_build_object('status', 'ACTIVE'),
    jsonb_build_object('status', 'LOBBY', 'teams_reset', true),
    true,
    auth.uid(),
    public.app_now()
  );

  SELECT to_jsonb(r.*) INTO v_room FROM public.rooms r WHERE r.id = p_room_id;
  RETURN v_room;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_abort_game(uuid, text, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_abort_game(uuid, text, uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- admin_finalize
-- ---------------------------------------------------------------------------
DROP FUNCTION IF EXISTS public.admin_finalize(uuid);

CREATE FUNCTION public.admin_finalize(p_room_id uuid, request_id uuid DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status public.room_status;
  v_tied_ids jsonb;
  v_winner_id uuid;
  v_standings jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  PERFORM public.expire_if_due(p_room_id);

  SELECT status INTO v_status
  FROM public.rooms
  WHERE id = p_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND', jsonb_build_object('room_id', p_room_id));
  END IF;

  IF public.lifecycle_replay_check(p_room_id, request_id, 'GAME_FINALIZED') THEN
    SELECT winner_team_id INTO v_winner_id FROM public.rooms WHERE id = p_room_id;
    SELECT coalesce(jsonb_agg(to_jsonb(s.*) ORDER BY s.rank ASC), '[]'::jsonb)
    INTO v_standings
    FROM public.room_standings(p_room_id) s;
    RETURN jsonb_build_object('room_id', p_room_id, 'winner_team_id', v_winner_id, 'standings', v_standings);
  END IF;

  IF v_status <> 'TIME_EXPIRED' THEN
    PERFORM public.raise_error('INVALID_TRANSITION', jsonb_build_object('from', v_status, 'to', 'FINALIZED'));
  END IF;

  -- Block finalize if any tie is unresolved
  SELECT jsonb_agg(s.team_id) INTO v_tied_ids
  FROM public.room_standings(p_room_id) s
  WHERE s.tie_unresolved = true;

  IF v_tied_ids IS NOT NULL AND jsonb_array_length(v_tied_ids) > 0 THEN
    PERFORM public.raise_error('UNRESOLVED_TIE', jsonb_build_object('tied_team_ids', v_tied_ids));
  END IF;

  INSERT INTO public.final_results (room_id, team_id, rank, cv, cash, business_count, is_bankrupt)
  SELECT p_room_id, s.team_id, s.rank::smallint, s.cv, s.cash, s.business_count::smallint, s.is_bankrupt
  FROM public.room_standings(p_room_id) s;

  SELECT s.team_id INTO v_winner_id
  FROM public.room_standings(p_room_id) s
  WHERE s.rank = 1 AND s.is_bankrupt = false;

  UPDATE public.rooms
  SET status = 'FINALIZED',
      winner_team_id = v_winner_id,
      finalized_at = public.app_now()
  WHERE id = p_room_id;

  INSERT INTO public.activity_events (
    room_id, request_id, type, note, actor_id, created_at
  ) VALUES (
    p_room_id, request_id, 'GAME_FINALIZED', 'Match finalized. Leaderboard permanently snapshotted.', auth.uid(), public.app_now()
  );

  SELECT coalesce(jsonb_agg(to_jsonb(s.*) ORDER BY s.rank ASC), '[]'::jsonb)
  INTO v_standings
  FROM public.room_standings(p_room_id) s;

  RETURN jsonb_build_object('room_id', p_room_id, 'winner_team_id', v_winner_id, 'standings', v_standings);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_finalize(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_finalize(uuid, uuid) TO authenticated;

-- ---------------------------------------------------------------------------
-- expire_if_due: not callable by anon (room-existence oracle). Definer readers still use it.
-- ---------------------------------------------------------------------------
REVOKE EXECUTE ON FUNCTION public.expire_if_due(uuid) FROM anon;
