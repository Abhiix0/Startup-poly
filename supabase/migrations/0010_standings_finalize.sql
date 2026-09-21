-- Migration 0010: Standings, Tiebreaks, and Finalization
-- STARTUPOLY Live Scoreboard & Game Management System

-- 1. room_standings(p_room_id) Table Function
CREATE OR REPLACE FUNCTION public.room_standings(p_room_id uuid)
RETURNS TABLE (
  team_id uuid,
  slot smallint,
  name text,
  rank int,
  is_bankrupt boolean,
  cv int,
  cash int,
  business_count int,
  tiebreak_order smallint,
  tie_unresolved boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH team_biz AS (
    SELECT t.id AS tid, count(tb.id)::int AS b_count
    FROM public.teams t
    LEFT JOIN public.team_businesses tb ON t.id = tb.team_id
    WHERE t.room_id = p_room_id
    GROUP BY t.id
  ),
  base AS (
    SELECT
      t.id AS tid,
      t.slot,
      t.name,
      t.is_bankrupt,
      t.cv,
      t.cash,
      tbz.b_count AS business_count,
      t.tiebreak_order,
      count(*) OVER (PARTITION BY t.is_bankrupt, t.cv, t.cash, tbz.b_count) AS tie_group_size,
      count(t.tiebreak_order) OVER (PARTITION BY t.is_bankrupt, t.cv, t.cash, tbz.b_count) AS count_with_order
    FROM public.teams t
    JOIN team_biz tbz ON t.id = tbz.tid
    WHERE t.room_id = p_room_id
  ),
  -- Compute distinct tiebreak_order count per tie-group using a plain GROUP BY
  tie_distinct AS (
    SELECT
      b.is_bankrupt AS td_bankrupt,
      b.cv          AS td_cv,
      b.cash        AS td_cash,
      b.business_count AS td_biz,
      count(DISTINCT b.tiebreak_order) AS distinct_orders
    FROM base b
    GROUP BY b.is_bankrupt, b.cv, b.cash, b.business_count
  )
  SELECT
    b.tid AS team_id,
    b.slot,
    b.name,
    row_number() OVER (
      ORDER BY
        b.is_bankrupt ASC,
        b.cv DESC,
        b.cash DESC,
        b.business_count DESC,
        b.tiebreak_order ASC NULLS LAST,
        b.slot ASC
    )::int AS rank,
    b.is_bankrupt,
    b.cv,
    b.cash,
    b.business_count,
    b.tiebreak_order,
    (b.tie_group_size > 1 AND (b.count_with_order < b.tie_group_size OR td.distinct_orders < b.tie_group_size)) AS tie_unresolved
  FROM base b
  JOIN tie_distinct td
    ON b.is_bankrupt = td.td_bankrupt
   AND b.cv = td.td_cv
   AND b.cash = td.td_cash
   AND b.business_count = td.td_biz
  ORDER BY rank ASC;
END;
$$;

-- 2. get_standings(p_room_id) Admin Wrapper
CREATE OR REPLACE FUNCTION public.get_standings(p_room_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_standings jsonb;
  v_has_unresolved boolean;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  PERFORM public.expire_if_due(p_room_id);

  SELECT coalesce(jsonb_agg(to_jsonb(s.*) ORDER BY s.rank ASC), '[]'::jsonb)
  INTO v_standings
  FROM public.room_standings(p_room_id) s;

  SELECT EXISTS (
    SELECT 1 FROM public.room_standings(p_room_id) s WHERE s.tie_unresolved = true
  ) INTO v_has_unresolved;

  RETURN jsonb_build_object(
    'standings', v_standings,
    'has_unresolved_tie', v_has_unresolved
  );
END;
$$;

-- 3. admin_finalize(p_room_id)
CREATE OR REPLACE FUNCTION public.admin_finalize(p_room_id uuid)
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

  -- Snapshot into final_results table
  INSERT INTO public.final_results (
    room_id,
    team_id,
    rank,
    cv,
    cash,
    business_count,
    is_bankrupt
  )
  SELECT
    p_room_id,
    s.team_id,
    s.rank::smallint,
    s.cv,
    s.cash,
    s.business_count::smallint,
    s.is_bankrupt
  FROM public.room_standings(p_room_id) s;

  -- Winner is rank 1 active team (NULL if all bankrupt)
  SELECT s.team_id INTO v_winner_id
  FROM public.room_standings(p_room_id) s
  WHERE s.rank = 1 AND s.is_bankrupt = false;

  UPDATE public.rooms
  SET status = 'FINALIZED',
      winner_team_id = v_winner_id,
      finalized_at = public.app_now()
  WHERE id = p_room_id;

  INSERT INTO public.activity_events (
    room_id,
    type,
    note,
    actor_id,
    created_at
  ) VALUES (
    p_room_id,
    'GAME_FINALIZED',
    'Match finalized. Leaderboard permanently snapshotted.',
    auth.uid(),
    public.app_now()
  );

  SELECT coalesce(jsonb_agg(to_jsonb(s.*) ORDER BY s.rank ASC), '[]'::jsonb)
  INTO v_standings
  FROM public.room_standings(p_room_id) s;

  RETURN jsonb_build_object(
    'room_id', p_room_id,
    'winner_team_id', v_winner_id,
    'standings', v_standings
  );
END;
$$;

-- Permissions
REVOKE ALL ON FUNCTION public.room_standings(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.room_standings(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_standings(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_standings(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.admin_finalize(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_finalize(uuid) TO authenticated;
