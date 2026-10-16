-- Migration 0021: Final business snapshot and single-pass finalize
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- Ranking was checked against docs/SCORING_RULES.md and already matches, so room_standings is unchanged.
--
-- 1. final_result_businesses (append-only, same immutability trigger as final_results) stores each team's
--    businesses at finalization together with the catalog numbers as they were THEN, so history never
--    depends on later business_catalog edits (audit L16). rooms.businesses_snapshotted marks rooms that have
--    one (false for rooms finalized before this migration), so "no rows" and "not captured" stay distinguishable.
-- 2. admin_finalize locks the room, then the room's teams in ascending id (canonical order, so no correction
--    can land between ranking and insert), computes room_standings ONCE and uses that single result for the
--    tie check, the final_results insert, the winner and the return value. Replay and error codes are as in 0017.
-- 3. get_history_detail gains `businesses` and `snapshot_available`; existing keys are unchanged.

ALTER TABLE public.rooms ADD COLUMN businesses_snapshotted boolean NOT NULL DEFAULT false;

CREATE TABLE public.final_result_businesses (
  room_id uuid NOT NULL REFERENCES public.rooms(id),
  team_id uuid NOT NULL REFERENCES public.teams(id),
  business_key text NOT NULL,
  name text NOT NULL,
  level smallint NOT NULL,
  cost int NOT NULL,
  initial_cv int NOT NULL,
  u1_cost int NOT NULL,
  u2_cost int NOT NULL,
  u1_cv int NOT NULL,
  u2_cv int NOT NULL,
  PRIMARY KEY (room_id, team_id, business_key)
);
ALTER TABLE public.final_result_businesses ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_final_result_businesses_immutable
BEFORE UPDATE OR DELETE ON public.final_result_businesses
FOR EACH ROW
EXECUTE FUNCTION public.fn_check_immutable_table();

-- Supabase default privileges hand every client role ALL rights (incl. TRUNCATE, which skips RLS and row
-- triggers) on a new table. Take them back, then grant SELECT only. Defaults are fixed so a future table
-- cannot repeat this: new tables get no client privileges until a migration grants them explicitly.
REVOKE ALL ON public.final_result_businesses FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.final_result_businesses TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;

CREATE POLICY "Admins can select all final result businesses"
  ON public.final_result_businesses
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Claimed users can select own final result businesses"
  ON public.final_result_businesses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.team_claims tc
      WHERE tc.team_id = final_result_businesses.team_id
        AND tc.user_id = (SELECT auth.uid())
    )
  );

CREATE OR REPLACE FUNCTION public.admin_finalize(p_room_id uuid, request_id uuid DEFAULT NULL)
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

  -- Canonical order: room (held), then teams ascending id. No correction can interleave from here on.
  PERFORM 1 FROM public.teams WHERE room_id = p_room_id ORDER BY id ASC FOR UPDATE;

  SELECT coalesce(jsonb_agg(to_jsonb(s.*) ORDER BY s.rank ASC), '[]'::jsonb)
  INTO v_standings
  FROM public.room_standings(p_room_id) s;

  SELECT jsonb_agg(e->'team_id') INTO v_tied_ids
  FROM jsonb_array_elements(v_standings) e
  WHERE (e->>'tie_unresolved')::boolean;

  IF v_tied_ids IS NOT NULL THEN
    PERFORM public.raise_error('UNRESOLVED_TIE', jsonb_build_object('tied_team_ids', v_tied_ids));
  END IF;

  INSERT INTO public.final_results (room_id, team_id, rank, cv, cash, business_count, is_bankrupt)
  SELECT p_room_id, (e->>'team_id')::uuid, (e->>'rank')::smallint, (e->>'cv')::int, (e->>'cash')::int,
         (e->>'business_count')::smallint, (e->>'is_bankrupt')::boolean
  FROM jsonb_array_elements(v_standings) e;

  INSERT INTO public.final_result_businesses (
    room_id, team_id, business_key, name, level, cost, initial_cv, u1_cost, u2_cost, u1_cv, u2_cv
  )
  SELECT p_room_id, tb.team_id, tb.business_key, bc.name, tb.level, bc.cost, bc.initial_cv,
         bc.u1_cost, bc.u2_cost, bc.u1_cv, bc.u2_cv
  FROM public.team_businesses tb
  JOIN public.teams t ON t.id = tb.team_id
  JOIN public.business_catalog bc ON bc.key = tb.business_key
  WHERE t.room_id = p_room_id;

  SELECT (e->>'team_id')::uuid INTO v_winner_id
  FROM jsonb_array_elements(v_standings) e
  WHERE (e->>'rank')::int = 1 AND NOT (e->>'is_bankrupt')::boolean;

  UPDATE public.rooms
  SET status = 'FINALIZED',
      winner_team_id = v_winner_id,
      businesses_snapshotted = true,
      finalized_at = public.app_now()
  WHERE id = p_room_id;

  INSERT INTO public.activity_events (
    room_id, request_id, type, note, actor_id, created_at
  ) VALUES (
    p_room_id, request_id, 'GAME_FINALIZED', 'Match finalized. Leaderboard permanently snapshotted.', auth.uid(), public.app_now()
  );

  RETURN jsonb_build_object('room_id', p_room_id, 'winner_team_id', v_winner_id, 'standings', v_standings);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_finalize(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_finalize(uuid, uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_history_detail(room_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room jsonb;
  v_results jsonb;
  v_events jsonb;
  v_businesses jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT to_jsonb(r.*) INTO v_room
  FROM public.rooms r
  WHERE r.id = room_id AND r.status = 'FINALIZED';

  IF v_room IS NULL THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND', jsonb_build_object('room_id', room_id));
  END IF;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'team_id', fr.team_id,
      'rank', fr.rank,
      'name', t.name,
      'color', t.color,
      'cv', fr.cv,
      'cash', fr.cash,
      'business_count', fr.business_count,
      'is_bankrupt', fr.is_bankrupt
    ) ORDER BY fr.rank ASC
  ), '[]'::jsonb) INTO v_results
  FROM public.final_results fr
  JOIN public.teams t ON fr.team_id = t.id
  WHERE fr.room_id = get_history_detail.room_id;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'id', ae.id,
      'team_id', ae.team_id,
      'group_id', ae.group_id,
      'type', ae.type,
      'business_key', ae.business_key,
      'prev', ae.prev,
      'new', ae.new,
      'note', ae.note,
      'is_correction', ae.is_correction,
      'created_at', ae.created_at
    ) ORDER BY ae.id DESC
  ), '[]'::jsonb) INTO v_events
  FROM public.activity_events ae
  WHERE ae.room_id = get_history_detail.room_id;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'team_id', b.team_id,
      'business_key', b.business_key,
      'name', b.name,
      'level', b.level,
      'cost', b.cost,
      'initial_cv', b.initial_cv,
      'u1_cost', b.u1_cost,
      'u2_cost', b.u2_cost,
      'u1_cv', b.u1_cv,
      'u2_cv', b.u2_cv
    ) ORDER BY b.team_id, b.business_key
  ), '[]'::jsonb) INTO v_businesses
  FROM public.final_result_businesses b
  WHERE b.room_id = get_history_detail.room_id;

  RETURN jsonb_build_object(
    'room', v_room,
    'results', v_results,
    'events', v_events,
    'businesses', v_businesses,
    'snapshot_available', (v_room->>'businesses_snapshotted')::boolean
  );
END;
$$;
