-- ==========================================
-- FILE: 0028_rulebook_economy_alignment.sql
-- ==========================================
-- Rulebook alignment: upgrade costs per the approved table and a 2-business cap per team.
-- Forward-only. Teams already holding 3 businesses keep them but cannot add more.

UPDATE public.business_catalog AS c
SET u1_cost = v.u1, u2_cost = v.u2
FROM (VALUES
  ('edtech', 100, 150),
  ('saas', 150, 200), ('ecommerce', 150, 200), ('devtools', 150, 200),
  ('fintech', 200, 250), ('healthtech', 200, 250), ('cybersecurity', 200, 250),
  ('ai_deeptech', 250, 300), ('cleantech', 250, 300), ('robotics', 250, 300)
) AS v(key, u1, u2)
WHERE c.key = v.key;

CREATE OR REPLACE FUNCTION public.fn_check_business_cap()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF (SELECT count(*) FROM public.team_businesses WHERE team_id = NEW.team_id) >= 2 THEN
    RAISE EXCEPTION 'BUSINESS_CAP';
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_add_business(
  team_id uuid,
  business_key text,
  apply_purchase boolean DEFAULT true,
  expected_version int DEFAULT 0,
  request_id uuid DEFAULT NULL,
  note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_is_bankrupt boolean;
  v_curr_ver int;
  v_cash int;
  v_cv int;
  v_cost int;
  v_initial_cv int;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.is_bankrupt, t.version, t.cash, t.cv
  INTO v_is_bankrupt, v_curr_ver, v_cash, v_cv
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_ADDED']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_is_bankrupt THEN
    PERFORM public.raise_error('TEAM_BANKRUPT');
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  IF EXISTS (SELECT 1 FROM public.team_businesses WHERE room_id = v_room_id AND team_businesses.business_key = admin_add_business.business_key) THEN
    PERFORM public.raise_error('BUSINESS_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  IF (SELECT count(*) FROM public.team_businesses WHERE team_businesses.team_id = admin_add_business.team_id) >= 2 THEN
    PERFORM public.raise_error('BUSINESS_CAP');
  END IF;

  SELECT cost, initial_cv INTO v_cost, v_initial_cv
  FROM public.business_catalog
  WHERE key = business_key;

  IF NOT FOUND THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('business_key', business_key));
  END IF;

  v_prev := jsonb_build_object('cash', v_cash, 'cv', v_cv, 'business_key', business_key);

  IF apply_purchase THEN
    IF v_cash < v_cost THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object('cash', v_cash, 'cost', v_cost, 'shortfall', v_cost - v_cash));
    END IF;
    v_cash := v_cash - v_cost;
    IF v_cv::bigint + v_initial_cv > public.max_money() THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cv', 'max', public.max_money()));
    END IF;
    v_cv := v_cv + v_initial_cv;
  END IF;

  INSERT INTO public.team_businesses (room_id, team_id, business_key, level, acquired_at)
  VALUES (v_room_id, team_id, business_key, 0, public.app_now());

  UPDATE public.teams
  SET cash = v_cash,
      cv = v_cv,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object('cash', v_cash, 'cv', v_cv, 'business_key', business_key, 'level', 0, 'apply_purchase', apply_purchase);

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_ADDED',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$$;


-- ==========================================
-- FILE: 0029_remove_company_value.sql
-- ==========================================
-- Remove Company Value (CV) from the active system and replace the ranking.
-- Owner decisions: D1 (ranking), D4 (no CORRECTION-removal deduction), D8 (stored CV data removed).
-- Ranking: cash, then total original purchase cost of owned businesses, then total upgrades; equal teams share a rank.
-- Forward-only. Historical activity_events keep their stored JSON (and the CV_SET / TIEBREAK_SET event types stay
-- valid) so the audit trail is intact; nothing reads them for game behaviour.
-- Deploy the database and the app together: RPC signatures and payloads change.

DROP FUNCTION IF EXISTS public.admin_set_tiebreak(uuid, uuid[], text);
DROP FUNCTION IF EXISTS public.room_standings(uuid);

CREATE FUNCTION public.room_standings(p_room_id uuid)
RETURNS TABLE(team_id uuid, slot smallint, name text, rank integer, is_bankrupt boolean, cash integer,
              business_count integer, business_cost integer, upgrade_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH base AS (
    SELECT t.id AS tid, t.slot, t.name, t.is_bankrupt, t.cash,
           count(tb.id)::int AS business_count,
           coalesce(sum(bc.cost), 0)::int AS business_cost,
           coalesce(sum(tb.level), 0)::int AS upgrade_count
    FROM public.teams t
    LEFT JOIN public.team_businesses tb ON tb.team_id = t.id
    LEFT JOIN public.business_catalog bc ON bc.key = tb.business_key
    WHERE t.room_id = p_room_id
    GROUP BY t.id
  )
  SELECT b.tid, b.slot, b.name,
         (rank() OVER (ORDER BY b.is_bankrupt ASC, b.cash DESC, b.business_cost DESC, b.upgrade_count DESC))::int,
         b.is_bankrupt, b.cash, b.business_count, b.business_cost, b.upgrade_count
  FROM base b
  ORDER BY 4 ASC, b.slot ASC;
$function$;

REVOKE ALL ON FUNCTION public.room_standings(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.get_standings(p_room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_standings jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  PERFORM public.expire_if_due(p_room_id);

  SELECT coalesce(jsonb_agg(to_jsonb(s.*) ORDER BY s.rank ASC), '[]'::jsonb)
  INTO v_standings
  FROM public.room_standings(p_room_id) s;

  RETURN jsonb_build_object('standings', v_standings);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_finalize(p_room_id uuid, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status public.room_status;
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

  INSERT INTO public.final_results (room_id, team_id, rank, cash, business_count, is_bankrupt)
  SELECT p_room_id, (e->>'team_id')::uuid, (e->>'rank')::smallint, (e->>'cash')::int,
         (e->>'business_count')::smallint, (e->>'is_bankrupt')::boolean
  FROM jsonb_array_elements(v_standings) e;

  INSERT INTO public.final_result_businesses (
    room_id, team_id, business_key, name, level, cost, u1_cost, u2_cost
  )
  SELECT p_room_id, tb.team_id, tb.business_key, bc.name, tb.level, bc.cost,
         bc.u1_cost, bc.u2_cost
  FROM public.team_businesses tb
  JOIN public.teams t ON t.id = tb.team_id
  JOIN public.business_catalog bc ON bc.key = tb.business_key
  WHERE t.room_id = p_room_id;

  -- Teams that tie on every criterion share rank 1: then there is no single winner.
  SELECT CASE WHEN count(*) = 1 THEN min(e->>'team_id')::uuid END INTO v_winner_id
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
$function$;

DROP FUNCTION IF EXISTS public.admin_set_team_values(uuid, integer, integer, integer, uuid, text);

CREATE FUNCTION public.admin_set_team_values(team_id uuid, cash integer DEFAULT NULL::integer, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_curr_version int;
  v_curr_cash int;
  v_curr_bankrupt boolean;
  v_is_correction boolean := false;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  SELECT version, teams.cash, teams.is_bankrupt
  INTO v_curr_version, v_curr_cash, v_curr_bankrupt
  FROM public.teams
  WHERE id = team_id AND room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF v_curr_bankrupt THEN
    PERFORM public.raise_error('TEAM_BANKRUPT');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['CASH_SET']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_curr_version <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object(
      'expected_version', expected_version,
      'current_version', v_curr_version,
      'cash', v_curr_cash
    ));
  END IF;

  IF cash IS NOT NULL AND (cash < 0 OR cash > public.max_money()) THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cash', 'max', public.max_money()));
  END IF;

  IF cash IS NULL OR cash = v_curr_cash THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  UPDATE public.teams
  SET cash = coalesce(admin_set_team_values.cash, teams.cash),
      version = version + 1
  WHERE id = team_id;

  IF cash IS NOT NULL AND cash <> v_curr_cash THEN
    INSERT INTO public.activity_events (
      room_id, team_id, request_id, type, prev, new, note, is_correction, actor_id, created_at
    ) VALUES (
      v_room_id, team_id, request_id, 'CASH_SET', jsonb_build_object('cash', v_curr_cash), jsonb_build_object('cash', cash), note, v_is_correction, auth.uid(), public.app_now()
    );
  END IF;

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

REVOKE ALL ON FUNCTION public.admin_set_team_values(uuid, integer, integer, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_team_values(uuid, integer, integer, uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_adjust(changes jsonb, label text, note text DEFAULT NULL::text, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_is_correction boolean := false;
  v_group_id uuid := gen_random_uuid();
  v_max bigint := public.max_money();
  v_el jsonb;
  v_key text;
  v_txt text;
  v_ids uuid[];
  v_found int;
  v_rooms int;
  v_item jsonb;
  v_team_id uuid;
  v_cash_delta int;
  v_exp_ver int;
  v_curr_ver int;
  v_curr_cash int;
  v_curr_bankrupt boolean;
  v_res_cash int;
  v_first boolean := true;
  v_results jsonb := '[]'::jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  -- Shape validation: nothing below may surface a raw cast error.
  IF changes IS NULL OR jsonb_typeof(changes) <> 'array' OR jsonb_array_length(changes) NOT BETWEEN 1 AND 6 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'changes', 'reason', 'expected array of 1..6 items'));
  END IF;

  FOR v_el IN SELECT value FROM jsonb_array_elements(changes) LOOP
    IF jsonb_typeof(v_el) <> 'object'
       OR coalesce(v_el->>'team_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'team_id'));
    END IF;

    IF v_el ? 'cv_delta' THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cv_delta', 'reason', 'unsupported'));
    END IF;

    FOREACH v_key IN ARRAY ARRAY['cash_delta', 'expected_version'] LOOP
      v_txt := v_el->>v_key;
      IF v_txt IS NULL THEN
        IF v_key = 'expected_version' THEN
          PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', v_key, 'reason', 'required'));
        END IF;
        CONTINUE;
      END IF;
      -- Two steps: Postgres does not guarantee OR short-circuit order, so never cast before the regex passes.
      IF jsonb_typeof(v_el->v_key) <> 'number' OR v_txt !~ '^-?[0-9]{1,10}$' THEN
        PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', v_key));
      END IF;
      IF abs(v_txt::bigint) > v_max OR (v_key = 'expected_version' AND v_txt::bigint < 0) THEN
        PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', v_key, 'max', v_max));
      END IF;
    END LOOP;
  END LOOP;

  SELECT array_agg((value->>'team_id')::uuid ORDER BY (value->>'team_id')::uuid) INTO v_ids
  FROM jsonb_array_elements(changes);

  IF (SELECT count(DISTINCT x) FROM unnest(v_ids) x) <> array_length(v_ids, 1) THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'team_id', 'reason', 'duplicate team'));
  END IF;

  SELECT count(*), count(DISTINCT t.room_id), (array_agg(t.room_id))[1]
  INTO v_found, v_rooms, v_room_id
  FROM public.teams t
  WHERE t.id = ANY (v_ids);

  IF v_found <> array_length(v_ids, 1) THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF v_rooms <> 1 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'team_id', 'reason', 'teams span several rooms'));
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Canonical order: room, then teams ascending id.
  PERFORM 1 FROM public.teams t WHERE t.id = ANY (v_ids) ORDER BY t.id FOR UPDATE;

  IF public.money_replay_check(v_room_id, NULL, request_id, ARRAY['ADJUSTMENT']) THEN
    SELECT coalesce(jsonb_agg(public.get_team_snapshot(ae.team_id) ORDER BY ae.team_id), '[]'::jsonb)
    INTO v_results
    FROM public.activity_events ae
    WHERE ae.group_id = (SELECT g.group_id FROM public.activity_events g WHERE g.request_id = admin_adjust.request_id);
    RETURN v_results;
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  -- Phase 1 validation (all-or-nothing)
  FOR v_item IN SELECT * FROM jsonb_array_elements(changes) ORDER BY (value->>'team_id')::uuid ASC LOOP
    v_team_id := (v_item->>'team_id')::uuid;
    v_cash_delta := coalesce((v_item->>'cash_delta')::int, 0);
    v_exp_ver := (v_item->>'expected_version')::int;

    SELECT version, cash, is_bankrupt INTO v_curr_ver, v_curr_cash, v_curr_bankrupt
    FROM public.teams
    WHERE id = v_team_id;

    IF v_curr_bankrupt THEN
      PERFORM public.raise_error('TEAM_BANKRUPT', jsonb_build_object('team_id', v_team_id));
    END IF;

    IF v_curr_ver <> v_exp_ver THEN
      PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object(
        'team_id', v_team_id,
        'expected_version', v_exp_ver,
        'current_version', v_curr_ver
      ));
    END IF;

    IF v_curr_cash::bigint + v_cash_delta < 0 THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object(
        'team_id', v_team_id,
        'cash', v_curr_cash,
        'delta', v_cash_delta,
        'shortfall', abs(v_curr_cash::bigint + v_cash_delta)
      ));
    END IF;

    IF v_curr_cash::bigint + v_cash_delta > v_max THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cash', 'team_id', v_team_id, 'max', v_max));
    END IF;
  END LOOP;

  -- Phase 2 execution
  FOR v_item IN SELECT * FROM jsonb_array_elements(changes) ORDER BY (value->>'team_id')::uuid ASC LOOP
    v_team_id := (v_item->>'team_id')::uuid;
    v_cash_delta := coalesce((v_item->>'cash_delta')::int, 0);

    SELECT cash INTO v_curr_cash FROM public.teams WHERE id = v_team_id;

    v_res_cash := v_curr_cash + v_cash_delta;

    UPDATE public.teams
    SET cash = v_res_cash,
        version = version + 1
    WHERE id = v_team_id;

    INSERT INTO public.activity_events (
      room_id,
      team_id,
      group_id,
      request_id,
      type,
      prev,
      new,
      note,
      is_correction,
      actor_id,
      created_at
    ) VALUES (
      v_room_id,
      v_team_id,
      v_group_id,
      CASE WHEN v_first THEN request_id ELSE NULL END,
      'ADJUSTMENT',
      jsonb_build_object('cash', v_curr_cash),
      jsonb_build_object('cash', v_res_cash, 'cash_delta', v_cash_delta),
      coalesce(label || ': ', '') || coalesce(note, ''),
      v_is_correction,
      auth.uid(),
      public.app_now()
    );

    v_first := false;
    v_results := v_results || public.get_team_snapshot(v_team_id);
  END LOOP;

  RETURN v_results;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_add_business(team_id uuid, business_key text, apply_purchase boolean DEFAULT true, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_is_bankrupt boolean;
  v_curr_ver int;
  v_cash int;
  v_cost int;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.is_bankrupt, t.version, t.cash
  INTO v_is_bankrupt, v_curr_ver, v_cash
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_ADDED']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_is_bankrupt THEN
    PERFORM public.raise_error('TEAM_BANKRUPT');
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  IF EXISTS (SELECT 1 FROM public.team_businesses WHERE room_id = v_room_id AND team_businesses.business_key = admin_add_business.business_key) THEN
    PERFORM public.raise_error('BUSINESS_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  IF (SELECT count(*) FROM public.team_businesses WHERE team_businesses.team_id = admin_add_business.team_id) >= 2 THEN
    PERFORM public.raise_error('BUSINESS_CAP');
  END IF;

  SELECT cost INTO v_cost
  FROM public.business_catalog
  WHERE key = business_key;

  IF NOT FOUND THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('business_key', business_key));
  END IF;

  v_prev := jsonb_build_object('cash', v_cash, 'business_key', business_key);

  IF apply_purchase THEN
    IF v_cash < v_cost THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object('cash', v_cash, 'cost', v_cost, 'shortfall', v_cost - v_cash));
    END IF;
    v_cash := v_cash - v_cost;
  END IF;

  INSERT INTO public.team_businesses (room_id, team_id, business_key, level, acquired_at)
  VALUES (v_room_id, team_id, business_key, 0, public.app_now());

  UPDATE public.teams
  SET cash = v_cash,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object('cash', v_cash, 'business_key', business_key, 'level', 0, 'apply_purchase', apply_purchase);

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_ADDED',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_business_level(team_id uuid, business_key text, new_level smallint, apply_upgrade boolean DEFAULT true, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_curr_ver int;
  v_cash int;
  v_curr_level smallint;
  v_cost int;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.version, t.cash
  INTO v_curr_ver, v_cash
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_LEVEL_SET']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  SELECT level INTO v_curr_level
  FROM public.team_businesses
  WHERE team_businesses.team_id = admin_set_business_level.team_id
    AND team_businesses.business_key = admin_set_business_level.business_key
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('BUSINESS_NOT_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  IF new_level NOT BETWEEN 0 AND 2 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('new_level', new_level));
  END IF;

  v_prev := jsonb_build_object('level', v_curr_level, 'cash', v_cash);

  IF apply_upgrade THEN
    IF new_level <> v_curr_level + 1 THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('current_level', v_curr_level, 'new_level', new_level));
    END IF;

    IF new_level = 1 THEN
      SELECT u1_cost INTO v_cost FROM public.business_catalog WHERE key = business_key;
    ELSIF new_level = 2 THEN
      SELECT u2_cost INTO v_cost FROM public.business_catalog WHERE key = business_key;
    END IF;

    IF v_cash < v_cost THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object('cash', v_cash, 'cost', v_cost, 'shortfall', v_cost - v_cash));
    END IF;

    v_cash := v_cash - v_cost;
  ELSE
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED', jsonb_build_object('reason', 'manual_level_change_requires_note'));
    END IF;
  END IF;

  UPDATE public.team_businesses
  SET level = new_level
  WHERE team_businesses.team_id = admin_set_business_level.team_id
    AND team_businesses.business_key = admin_set_business_level.business_key;

  UPDATE public.teams
  SET cash = v_cash,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object('level', new_level, 'cash', v_cash, 'apply_upgrade', apply_upgrade);

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_LEVEL_SET',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_remove_business(team_id uuid, business_key text, reason text, credit_resale boolean DEFAULT true, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_curr_ver int;
  v_cash int;
  v_curr_level smallint;
  v_cost int;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  IF reason NOT IN ('FORCED_SALE', 'BANKRUPTCY', 'CORRECTION') THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('reason', reason));
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.version, t.cash
  INTO v_curr_ver, v_cash
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_REMOVED']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF reason = 'CORRECTION' THEN
    v_is_correction := true;
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  SELECT level INTO v_curr_level
  FROM public.team_businesses
  WHERE team_businesses.team_id = admin_remove_business.team_id
    AND team_businesses.business_key = admin_remove_business.business_key
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('BUSINESS_NOT_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  v_prev := jsonb_build_object('business_key', business_key, 'level', v_curr_level, 'cash', v_cash);

  DELETE FROM public.team_businesses
  WHERE team_businesses.team_id = admin_remove_business.team_id
    AND team_businesses.business_key = admin_remove_business.business_key;

  IF reason = 'FORCED_SALE' AND credit_resale THEN
    SELECT cost INTO v_cost FROM public.business_catalog WHERE key = business_key;
    IF v_cash::bigint + v_cost > public.max_money() THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cash', 'max', public.max_money()));
    END IF;
    v_cash := v_cash + v_cost;
  END IF;

  UPDATE public.teams
  SET cash = v_cash,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object(
    'business_key', business_key,
    'reason', reason,
    'credit_resale', credit_resale,
    'cash', v_cash
  );

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_REMOVED',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_abort_game(p_room_id uuid, note text DEFAULT NULL::text, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_create_room(team_count integer, teams jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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

    INSERT INTO public.teams (room_id, slot, name, color, cash, version, created_at)
    VALUES (v_room_id, i, v_name, v_color, 1000, 0, public.app_now())
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_start_game(room_id uuid, force boolean DEFAULT false, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
         AND (t.cash <> 1000 OR t.is_bankrupt
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
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_snapshot(room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'cash', t.cash, 'board_position', t.board_position,
    'is_bankrupt', t.is_bankrupt, 'version', t.version, 'tiebreak_order', t.tiebreak_order,
    'claimed', EXISTS (SELECT 1 FROM public.team_claims tc WHERE tc.team_id = t.id),
    'pin', ts.join_pin,
    'businesses', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'business_key', tb.business_key, 'name', bc.name, 'level', tb.level,
        'cost', bc.cost
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
$function$;

CREATE OR REPLACE FUNCTION public.get_team_snapshot(p_team_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_team jsonb;
  v_businesses jsonb;
BEGIN
  SELECT to_jsonb(t.*) INTO v_team
  FROM public.teams t
  WHERE t.id = p_team_id;

  IF v_team IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'business_key', tb.business_key,
      'name', bc.name,
      'level', tb.level,
      'cost', bc.cost
    ) ORDER BY bc.sort_order
  ), '[]'::jsonb) INTO v_businesses
  FROM public.team_businesses tb
  JOIN public.business_catalog bc ON tb.business_key = bc.key
  WHERE tb.team_id = p_team_id;

  RETURN jsonb_build_object('team', v_team, 'businesses', v_businesses);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_history_detail(room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      'u1_cost', b.u1_cost,
      'u2_cost', b.u2_cost
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
$function$;

CREATE OR REPLACE FUNCTION public.get_my_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_team_id uuid;
  v_room_id uuid;
  v_status public.room_status;
  v_started_at timestamptz;
  v_ends_at timestamptz;
  v_slot smallint;
  v_name text;
  v_color text;
  v_cash int;
  v_is_bankrupt boolean;
  v_businesses jsonb;
  v_final_result jsonb := NULL;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Priority 1: User's claim in a non-FINALIZED room
  SELECT tc.team_id, t.room_id INTO v_team_id, v_room_id
  FROM public.team_claims tc
  JOIN public.teams t ON tc.team_id = t.id
  JOIN public.rooms r ON t.room_id = r.id
  WHERE tc.user_id = v_user_id AND r.status <> 'FINALIZED'
  ORDER BY tc.claimed_at DESC
  LIMIT 1;

  -- Priority 2: User's claim in the most recently finalized room
  IF v_room_id IS NULL THEN
    SELECT tc.team_id, t.room_id INTO v_team_id, v_room_id
    FROM public.team_claims tc
    JOIN public.teams t ON tc.team_id = t.id
    JOIN public.rooms r ON t.room_id = r.id
    WHERE tc.user_id = v_user_id AND r.status = 'FINALIZED'
    ORDER BY r.finalized_at DESC NULLS LAST, tc.claimed_at DESC
    LIMIT 1;
  END IF;

  IF v_room_id IS NULL THEN
    RETURN NULL;
  END IF;

  v_status := public.expire_if_due(v_room_id);

  SELECT status, started_at, ends_at INTO v_status, v_started_at, v_ends_at
  FROM public.rooms
  WHERE id = v_room_id;

  SELECT slot, name, color, cash, is_bankrupt
  INTO v_slot, v_name, v_color, v_cash, v_is_bankrupt
  FROM public.teams
  WHERE id = v_team_id;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'business_key', tb.business_key,
      'name', bc.name,
      'level', tb.level,
      'cost', bc.cost
    ) ORDER BY bc.sort_order
  ), '[]'::jsonb) INTO v_businesses
  FROM public.team_businesses tb
  JOIN public.business_catalog bc ON tb.business_key = bc.key
  WHERE tb.team_id = v_team_id;

  IF v_status = 'FINALIZED' THEN
    SELECT jsonb_build_object(
      'rank', fr.rank,
      'cash', fr.cash,
      'business_count', fr.business_count,
      'is_bankrupt', fr.is_bankrupt
    ) INTO v_final_result
    FROM public.final_results fr
    WHERE fr.room_id = v_room_id AND fr.team_id = v_team_id;
  END IF;

  RETURN jsonb_build_object(
    'room', jsonb_build_object(
      'status', v_status,
      'started_at', v_started_at,
      'ends_at', v_ends_at,
      'server_now', public.app_now()
    ),
    'team', jsonb_build_object(
      'slot', v_slot,
      'name', v_name,
      'color', v_color,
      'cash', v_cash,
      'is_bankrupt', v_is_bankrupt
    ),
    'businesses', v_businesses,
    'final_result', v_final_result
  );
END;
$function$;

-- Stored CV values are removed (no compensation); constraints on the dropped columns go with them.
ALTER TABLE public.teams DROP COLUMN cv;
ALTER TABLE public.business_catalog DROP COLUMN initial_cv, DROP COLUMN u1_cv, DROP COLUMN u2_cv;
ALTER TABLE public.final_results DROP COLUMN cv;
ALTER TABLE public.final_result_businesses DROP COLUMN initial_cv, DROP COLUMN u1_cv, DROP COLUMN u2_cv;


-- ==========================================
-- FILE: 0030_server_authoritative_gameplay.sql
-- ==========================================
-- Server-authoritative gameplay rules (owner decisions D6 and D7).
--  * Crossing or landing on START credits 200 inside admin_move_team, once per move, idempotent by request_id.
--  * A purchase is only accepted while the team's token stands on that business's board space.
--    Free additions and manual level changes need a note and are recorded as corrections.
--  * Rent is computed by the server (admin_charge_rent) from the business's cost and level; the client sends no amount.
-- Not covered (no rule or state exists to enforce it): persistent Debt Recovery, see the phase report.

ALTER TABLE public.business_catalog ADD COLUMN board_position smallint;
UPDATE public.business_catalog AS c
SET board_position = v.pos
FROM (VALUES
  ('ai_deeptech', 1), ('saas', 3), ('fintech', 5), ('healthtech', 7), ('edtech', 10),
  ('devtools', 13), ('cybersecurity', 15), ('cleantech', 17), ('robotics', 19), ('ecommerce', 23)
) AS v(key, pos)
WHERE c.key = v.key;
ALTER TABLE public.business_catalog
  ALTER COLUMN board_position SET NOT NULL,
  ADD CONSTRAINT business_catalog_board_position_check CHECK (board_position BETWEEN 0 AND 23),
  ADD CONSTRAINT business_catalog_board_position_key UNIQUE (board_position);

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
  v_cash int;
  v_bankrupt boolean;
  v_next_position smallint;
  v_crossings int;
  v_reward int;
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

  SELECT board_position, version, cash, is_bankrupt INTO v_position, v_version, v_cash, v_bankrupt
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

  IF v_bankrupt THEN
    PERFORM public.raise_error('TEAM_BANKRUPT');
  END IF;

  IF v_version <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object(
      'expected_version', expected_version,
      'current_version', v_version,
      'board_position', v_position
    ));
  END IF;

  v_next_position := ((v_position + steps) % 24)::smallint;
  -- Reaching or passing START counts; landing exactly on it (position + steps = 24) is one crossing.
  v_crossings := (v_position + steps) / 24;
  v_reward := 200 * v_crossings;

  IF v_cash::bigint + v_reward > public.max_money() THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cash', 'max', public.max_money()));
  END IF;

  UPDATE public.teams
  SET board_position = v_next_position,
      cash = cash + v_reward,
      version = version + 1
  WHERE id = team_id;

  INSERT INTO public.activity_events (
    room_id, team_id, request_id, type, prev, new, note, actor_id, created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'TEAM_MOVED',
    jsonb_build_object('board_position', v_position, 'cash', v_cash),
    jsonb_build_object('board_position', v_next_position, 'cash', v_cash + v_reward, 'steps', steps,
                       'passed_start', v_crossings > 0, 'start_reward', v_reward),
    format('Moved %s space%s to board space #%s%s.', steps, CASE WHEN steps = 1 THEN '' ELSE 's' END, v_next_position,
           CASE WHEN v_crossings > 0 THEN format(' and reached START (+%s cash)', v_reward) ELSE '' END),
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_add_business(team_id uuid, business_key text, apply_purchase boolean DEFAULT true, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_is_bankrupt boolean;
  v_curr_ver int;
  v_cash int;
  v_cost int;
  v_position smallint;
  v_space smallint;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.is_bankrupt, t.version, t.cash
  INTO v_is_bankrupt, v_curr_ver, v_cash
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_ADDED']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_is_bankrupt THEN
    PERFORM public.raise_error('TEAM_BANKRUPT');
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  IF EXISTS (SELECT 1 FROM public.team_businesses WHERE room_id = v_room_id AND team_businesses.business_key = admin_add_business.business_key) THEN
    PERFORM public.raise_error('BUSINESS_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  IF (SELECT count(*) FROM public.team_businesses WHERE team_businesses.team_id = admin_add_business.team_id) >= 2 THEN
    PERFORM public.raise_error('BUSINESS_CAP');
  END IF;

  SELECT cost, board_position INTO v_cost, v_space
  FROM public.business_catalog
  WHERE key = business_key;

  IF NOT FOUND THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('business_key', business_key));
  END IF;

  v_prev := jsonb_build_object('cash', v_cash, 'business_key', business_key);

  IF apply_purchase THEN
    -- A purchase is only offered to the team whose token stands on the business's space.
    SELECT t.board_position INTO v_position FROM public.teams t WHERE t.id = team_id;
    IF v_position IS DISTINCT FROM v_space THEN
      PERFORM public.raise_error('NOT_ON_BUSINESS_SPACE', jsonb_build_object('business_key', business_key, 'board_position', v_position, 'required_position', v_space));
    END IF;

    IF v_cash < v_cost THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object('cash', v_cash, 'cost', v_cost, 'shortfall', v_cost - v_cash));
    END IF;
    v_cash := v_cash - v_cost;
  ELSE
    -- Manual entry bypasses the purchase rules: it must be explained and is audited as a correction.
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED', jsonb_build_object('reason', 'manual_business_entry_requires_note'));
    END IF;
    v_is_correction := true;
  END IF;

  INSERT INTO public.team_businesses (room_id, team_id, business_key, level, acquired_at)
  VALUES (v_room_id, team_id, business_key, 0, public.app_now());

  UPDATE public.teams
  SET cash = v_cash,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object('cash', v_cash, 'business_key', business_key, 'level', 0, 'apply_purchase', apply_purchase);

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_ADDED',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_business_level(team_id uuid, business_key text, new_level smallint, apply_upgrade boolean DEFAULT true, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_curr_ver int;
  v_cash int;
  v_curr_level smallint;
  v_cost int;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.version, t.cash
  INTO v_curr_ver, v_cash
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_LEVEL_SET']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  SELECT level INTO v_curr_level
  FROM public.team_businesses
  WHERE team_businesses.team_id = admin_set_business_level.team_id
    AND team_businesses.business_key = admin_set_business_level.business_key
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('BUSINESS_NOT_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  IF new_level NOT BETWEEN 0 AND 2 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('new_level', new_level));
  END IF;

  v_prev := jsonb_build_object('level', v_curr_level, 'cash', v_cash);

  IF apply_upgrade THEN
    IF new_level <> v_curr_level + 1 THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('current_level', v_curr_level, 'new_level', new_level));
    END IF;

    IF new_level = 1 THEN
      SELECT u1_cost INTO v_cost FROM public.business_catalog WHERE key = business_key;
    ELSIF new_level = 2 THEN
      SELECT u2_cost INTO v_cost FROM public.business_catalog WHERE key = business_key;
    END IF;

    IF v_cash < v_cost THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object('cash', v_cash, 'cost', v_cost, 'shortfall', v_cost - v_cash));
    END IF;

    v_cash := v_cash - v_cost;
  ELSE
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED', jsonb_build_object('reason', 'manual_level_change_requires_note'));
    END IF;
    v_is_correction := true;
  END IF;

  UPDATE public.team_businesses
  SET level = new_level
  WHERE team_businesses.team_id = admin_set_business_level.team_id
    AND team_businesses.business_key = admin_set_business_level.business_key;

  UPDATE public.teams
  SET cash = v_cash,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object('level', new_level, 'cash', v_cash, 'apply_upgrade', apply_upgrade);

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_LEVEL_SET',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

CREATE FUNCTION public.admin_charge_rent(
  payer_team_id uuid,
  business_key text,
  payer_expected_version int,
  owner_expected_version int,
  request_id uuid DEFAULT NULL,
  note text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_room_id uuid;
  v_position smallint;
  v_owner_id uuid;
  v_level smallint;
  v_cost int;
  v_space smallint;
  v_rent int;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id, t.board_position INTO v_room_id, v_position FROM public.teams t WHERE t.id = payer_team_id;
  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  -- A retried request returns the stored result without re-validating against newer state.
  IF public.money_replay_check(v_room_id, NULL, request_id, ARRAY['ADJUSTMENT']) THEN
    RETURN (
      SELECT coalesce(jsonb_agg(public.get_team_snapshot(ae.team_id) ORDER BY ae.team_id), '[]'::jsonb)
      FROM public.activity_events ae
      WHERE ae.group_id = (SELECT g.group_id FROM public.activity_events g WHERE g.request_id = admin_charge_rent.request_id)
    );
  END IF;

  SELECT tb.team_id, tb.level INTO v_owner_id, v_level
  FROM public.team_businesses tb
  JOIN public.teams t ON t.id = tb.team_id
  WHERE t.room_id = v_room_id AND tb.business_key = admin_charge_rent.business_key;
  IF NOT FOUND THEN
    PERFORM public.raise_error('BUSINESS_NOT_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  IF v_owner_id = payer_team_id THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'payer_team_id', 'reason', 'no rent on your own business'));
  END IF;

  SELECT bc.cost, bc.board_position INTO v_cost, v_space FROM public.business_catalog bc WHERE bc.key = admin_charge_rent.business_key;
  IF v_position IS DISTINCT FROM v_space THEN
    PERFORM public.raise_error('NOT_ON_BUSINESS_SPACE', jsonb_build_object('business_key', business_key, 'board_position', v_position, 'required_position', v_space));
  END IF;

  -- Rent is 50% / 75% / 100% of the purchase cost by upgrade level (200->100/150/200 ... 500->250/375/500).
  v_rent := v_cost * (CASE v_level WHEN 0 THEN 50 WHEN 1 THEN 75 ELSE 100 END) / 100;

  -- admin_adjust locks room then teams in id order, checks both versions (a move, sale or upgrade between the reads
  -- above and its locks bumps a version), debits the payer (INSUFFICIENT_CASH on a shortfall) and audits both sides.
  RETURN public.admin_adjust(
    jsonb_build_array(
      jsonb_build_object('team_id', payer_team_id, 'cash_delta', -v_rent, 'expected_version', payer_expected_version),
      jsonb_build_object('team_id', v_owner_id, 'cash_delta', v_rent, 'expected_version', owner_expected_version)
    ),
    'RENT', note, request_id
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_charge_rent(uuid, text, int, int, uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_charge_rent(uuid, text, int, int, uuid, text) TO authenticated;


-- ==========================================
-- FILE: 0031_debt_recovery.sql
-- ==========================================
-- Debt Recovery and half-price forced sales (owner decisions D5 and the player handbook).
--  * teams.debt holds what a team still owes after it has nothing left to sell.
--  * A mandatory payment the team cannot cover is refused (INSUFFICIENT_CASH) while it owns a business: it must
--    force-sell first. With no business left, the unpaid part becomes debt.
--  * Every incoming amount (START, rent, cards, sale proceeds) clears debt first; the remainder is cash.
--  * A team in debt cannot buy or upgrade, and ranks as ineligible: it cannot win.
--  * A forced sale pays 50% of the original purchase cost; upgrades add nothing.

ALTER TABLE public.teams
  ADD COLUMN debt integer NOT NULL DEFAULT 0,
  ADD CONSTRAINT teams_debt_check CHECK (debt >= 0),
  ADD CONSTRAINT teams_debt_cap CHECK (debt <= 1000000000);

CREATE OR REPLACE FUNCTION public.admin_adjust(changes jsonb, label text, note text DEFAULT NULL::text, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_is_correction boolean := false;
  v_group_id uuid := gen_random_uuid();
  v_max bigint := public.max_money();
  v_el jsonb;
  v_key text;
  v_txt text;
  v_ids uuid[];
  v_found int;
  v_rooms int;
  v_item jsonb;
  v_team_id uuid;
  v_cash_delta int;
  v_exp_ver int;
  v_curr_ver int;
  v_curr_cash int;
  v_curr_debt int;
  v_curr_bankrupt boolean;
  v_res_cash int;
  v_res_debt int;
  v_first boolean := true;
  v_results jsonb := '[]'::jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  -- Shape validation: nothing below may surface a raw cast error.
  IF changes IS NULL OR jsonb_typeof(changes) <> 'array' OR jsonb_array_length(changes) NOT BETWEEN 1 AND 6 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'changes', 'reason', 'expected array of 1..6 items'));
  END IF;

  FOR v_el IN SELECT value FROM jsonb_array_elements(changes) LOOP
    IF jsonb_typeof(v_el) <> 'object'
       OR coalesce(v_el->>'team_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'team_id'));
    END IF;

    IF v_el ? 'cv_delta' THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cv_delta', 'reason', 'unsupported'));
    END IF;

    FOREACH v_key IN ARRAY ARRAY['cash_delta', 'expected_version'] LOOP
      v_txt := v_el->>v_key;
      IF v_txt IS NULL THEN
        IF v_key = 'expected_version' THEN
          PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', v_key, 'reason', 'required'));
        END IF;
        CONTINUE;
      END IF;
      -- Two steps: Postgres does not guarantee OR short-circuit order, so never cast before the regex passes.
      IF jsonb_typeof(v_el->v_key) <> 'number' OR v_txt !~ '^-?[0-9]{1,10}$' THEN
        PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', v_key));
      END IF;
      IF abs(v_txt::bigint) > v_max OR (v_key = 'expected_version' AND v_txt::bigint < 0) THEN
        PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', v_key, 'max', v_max));
      END IF;
    END LOOP;
  END LOOP;

  SELECT array_agg((value->>'team_id')::uuid ORDER BY (value->>'team_id')::uuid) INTO v_ids
  FROM jsonb_array_elements(changes);

  IF (SELECT count(DISTINCT x) FROM unnest(v_ids) x) <> array_length(v_ids, 1) THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'team_id', 'reason', 'duplicate team'));
  END IF;

  SELECT count(*), count(DISTINCT t.room_id), (array_agg(t.room_id))[1]
  INTO v_found, v_rooms, v_room_id
  FROM public.teams t
  WHERE t.id = ANY (v_ids);

  IF v_found <> array_length(v_ids, 1) THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF v_rooms <> 1 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'team_id', 'reason', 'teams span several rooms'));
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Canonical order: room, then teams ascending id.
  PERFORM 1 FROM public.teams t WHERE t.id = ANY (v_ids) ORDER BY t.id FOR UPDATE;

  IF public.money_replay_check(v_room_id, NULL, request_id, ARRAY['ADJUSTMENT']) THEN
    SELECT coalesce(jsonb_agg(public.get_team_snapshot(ae.team_id) ORDER BY ae.team_id), '[]'::jsonb)
    INTO v_results
    FROM public.activity_events ae
    WHERE ae.group_id = (SELECT g.group_id FROM public.activity_events g WHERE g.request_id = admin_adjust.request_id);
    RETURN v_results;
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  -- Phase 1 validation (all-or-nothing)
  FOR v_item IN SELECT * FROM jsonb_array_elements(changes) ORDER BY (value->>'team_id')::uuid ASC LOOP
    v_team_id := (v_item->>'team_id')::uuid;
    v_cash_delta := coalesce((v_item->>'cash_delta')::int, 0);
    v_exp_ver := (v_item->>'expected_version')::int;

    SELECT version, cash, is_bankrupt INTO v_curr_ver, v_curr_cash, v_curr_bankrupt
    FROM public.teams
    WHERE id = v_team_id;

    IF v_curr_bankrupt THEN
      PERFORM public.raise_error('TEAM_BANKRUPT', jsonb_build_object('team_id', v_team_id));
    END IF;

    IF v_curr_ver <> v_exp_ver THEN
      PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object(
        'team_id', v_team_id,
        'expected_version', v_exp_ver,
        'current_version', v_curr_ver
      ));
    END IF;

    -- A team that still owns a business must force-sell before an unaffordable payment; with none left it goes into debt.
    IF v_curr_cash::bigint + v_cash_delta < 0
       AND EXISTS (SELECT 1 FROM public.team_businesses tb WHERE tb.team_id = v_team_id) THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object(
        'team_id', v_team_id,
        'cash', v_curr_cash,
        'delta', v_cash_delta,
        'shortfall', abs(v_curr_cash::bigint + v_cash_delta)
      ));
    END IF;

    IF v_curr_cash::bigint + v_cash_delta > v_max THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cash', 'team_id', v_team_id, 'max', v_max));
    END IF;
  END LOOP;

  -- Phase 2 execution
  FOR v_item IN SELECT * FROM jsonb_array_elements(changes) ORDER BY (value->>'team_id')::uuid ASC LOOP
    v_team_id := (v_item->>'team_id')::uuid;
    v_cash_delta := coalesce((v_item->>'cash_delta')::int, 0);

    SELECT cash, debt INTO v_curr_cash, v_curr_debt FROM public.teams WHERE id = v_team_id;

    IF v_cash_delta >= 0 THEN
      -- Incoming money clears debt first; the remainder is cash.
      v_res_debt := v_curr_debt - least(v_curr_debt, v_cash_delta);
      v_res_cash := v_curr_cash + v_cash_delta - (v_curr_debt - v_res_debt);
    ELSIF v_curr_cash + v_cash_delta >= 0 THEN
      v_res_cash := v_curr_cash + v_cash_delta;
      v_res_debt := v_curr_debt;
    ELSE
      -- Unpayable mandatory payment and nothing left to sell: the unpaid part becomes debt.
      v_res_cash := 0;
      v_res_debt := v_curr_debt - (v_curr_cash + v_cash_delta);
    END IF;

    IF v_res_debt > v_max THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'debt', 'team_id', v_team_id, 'max', v_max));
    END IF;

    UPDATE public.teams
    SET cash = v_res_cash,
        debt = v_res_debt,
        version = version + 1
    WHERE id = v_team_id;

    INSERT INTO public.activity_events (
      room_id,
      team_id,
      group_id,
      request_id,
      type,
      prev,
      new,
      note,
      is_correction,
      actor_id,
      created_at
    ) VALUES (
      v_room_id,
      v_team_id,
      v_group_id,
      CASE WHEN v_first THEN request_id ELSE NULL END,
      'ADJUSTMENT',
      jsonb_build_object('cash', v_curr_cash, 'debt', v_curr_debt),
      jsonb_build_object('cash', v_res_cash, 'debt', v_res_debt, 'cash_delta', v_cash_delta),
      coalesce(label || ': ', '') || coalesce(note, ''),
      v_is_correction,
      auth.uid(),
      public.app_now()
    );

    v_first := false;
    v_results := v_results || public.get_team_snapshot(v_team_id);
  END LOOP;

  RETURN v_results;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_move_team(team_id uuid, steps smallint, expected_version integer, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_position smallint;
  v_version int;
  v_cash int;
  v_debt int;
  v_pay int;
  v_bankrupt boolean;
  v_next_position smallint;
  v_crossings int;
  v_reward int;
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

  SELECT board_position, version, cash, debt, is_bankrupt INTO v_position, v_version, v_cash, v_debt, v_bankrupt
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

  IF v_bankrupt THEN
    PERFORM public.raise_error('TEAM_BANKRUPT');
  END IF;

  IF v_version <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object(
      'expected_version', expected_version,
      'current_version', v_version,
      'board_position', v_position
    ));
  END IF;

  v_next_position := ((v_position + steps) % 24)::smallint;
  -- Reaching or passing START counts; landing exactly on it (position + steps = 24) is one crossing.
  v_crossings := (v_position + steps) / 24;
  v_reward := 200 * v_crossings;

  IF v_cash::bigint + v_reward > public.max_money() THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cash', 'max', public.max_money()));
  END IF;

  -- The reward clears outstanding debt first; the remainder is cash.
  v_pay := least(v_debt, v_reward);

  UPDATE public.teams
  SET board_position = v_next_position,
      cash = cash + v_reward - v_pay,
      debt = debt - v_pay,
      version = version + 1
  WHERE id = team_id;

  INSERT INTO public.activity_events (
    room_id, team_id, request_id, type, prev, new, note, actor_id, created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'TEAM_MOVED',
    jsonb_build_object('board_position', v_position, 'cash', v_cash, 'debt', v_debt),
    jsonb_build_object('board_position', v_next_position, 'cash', v_cash + v_reward - v_pay, 'debt', v_debt - v_pay, 'steps', steps,
                       'passed_start', v_crossings > 0, 'start_reward', v_reward),
    format('Moved %s space%s to board space #%s%s.', steps, CASE WHEN steps = 1 THEN '' ELSE 's' END, v_next_position,
           CASE WHEN v_crossings > 0 THEN format(' and reached START (+%s cash)', v_reward) ELSE '' END),
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_remove_business(team_id uuid, business_key text, reason text, credit_resale boolean DEFAULT true, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_curr_ver int;
  v_cash int;
  v_debt int;
  v_pay int;
  v_curr_level smallint;
  v_cost int;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  IF reason NOT IN ('FORCED_SALE', 'BANKRUPTCY', 'CORRECTION') THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('reason', reason));
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.version, t.cash, t.debt
  INTO v_curr_ver, v_cash, v_debt
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_REMOVED']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF reason = 'CORRECTION' THEN
    v_is_correction := true;
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  SELECT level INTO v_curr_level
  FROM public.team_businesses
  WHERE team_businesses.team_id = admin_remove_business.team_id
    AND team_businesses.business_key = admin_remove_business.business_key
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('BUSINESS_NOT_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  v_prev := jsonb_build_object('business_key', business_key, 'level', v_curr_level, 'cash', v_cash, 'debt', v_debt);

  DELETE FROM public.team_businesses
  WHERE team_businesses.team_id = admin_remove_business.team_id
    AND team_businesses.business_key = admin_remove_business.business_key;

  IF reason = 'FORCED_SALE' AND credit_resale THEN
    -- A forced sale pays 50% of the original purchase cost; upgrades add nothing and are not refunded.
    SELECT cost / 2 INTO v_cost FROM public.business_catalog WHERE key = business_key;
    IF v_cash::bigint + v_cost > public.max_money() THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cash', 'max', public.max_money()));
    END IF;
    -- Sale proceeds clear debt first.
    v_pay := least(v_debt, v_cost);
    v_debt := v_debt - v_pay;
    v_cash := v_cash + v_cost - v_pay;
  END IF;

  UPDATE public.teams
  SET cash = v_cash,
      debt = v_debt,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object(
    'business_key', business_key,
    'reason', reason,
    'credit_resale', credit_resale,
    'cash', v_cash,
    'debt', v_debt
  );

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_REMOVED',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_add_business(team_id uuid, business_key text, apply_purchase boolean DEFAULT true, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_is_bankrupt boolean;
  v_curr_ver int;
  v_cash int;
  v_debt int;
  v_cost int;
  v_position smallint;
  v_space smallint;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.is_bankrupt, t.version, t.cash, t.debt
  INTO v_is_bankrupt, v_curr_ver, v_cash, v_debt
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_ADDED']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_is_bankrupt THEN
    PERFORM public.raise_error('TEAM_BANKRUPT');
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  IF EXISTS (SELECT 1 FROM public.team_businesses WHERE room_id = v_room_id AND team_businesses.business_key = admin_add_business.business_key) THEN
    PERFORM public.raise_error('BUSINESS_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  IF (SELECT count(*) FROM public.team_businesses WHERE team_businesses.team_id = admin_add_business.team_id) >= 2 THEN
    PERFORM public.raise_error('BUSINESS_CAP');
  END IF;

  SELECT cost, board_position INTO v_cost, v_space
  FROM public.business_catalog
  WHERE key = business_key;

  IF NOT FOUND THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('business_key', business_key));
  END IF;

  v_prev := jsonb_build_object('cash', v_cash, 'business_key', business_key);

  IF apply_purchase THEN
    -- Debt Recovery: a team in debt cannot buy.
    IF v_debt > 0 THEN
      PERFORM public.raise_error('IN_DEBT', jsonb_build_object('debt', v_debt));
    END IF;

    -- A purchase is only offered to the team whose token stands on the business's space.
    SELECT t.board_position INTO v_position FROM public.teams t WHERE t.id = team_id;
    IF v_position IS DISTINCT FROM v_space THEN
      PERFORM public.raise_error('NOT_ON_BUSINESS_SPACE', jsonb_build_object('business_key', business_key, 'board_position', v_position, 'required_position', v_space));
    END IF;

    IF v_cash < v_cost THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object('cash', v_cash, 'cost', v_cost, 'shortfall', v_cost - v_cash));
    END IF;
    v_cash := v_cash - v_cost;
  ELSE
    -- Manual entry bypasses the purchase rules: it must be explained and is audited as a correction.
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED', jsonb_build_object('reason', 'manual_business_entry_requires_note'));
    END IF;
    v_is_correction := true;
  END IF;

  INSERT INTO public.team_businesses (room_id, team_id, business_key, level, acquired_at)
  VALUES (v_room_id, team_id, business_key, 0, public.app_now());

  UPDATE public.teams
  SET cash = v_cash,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object('cash', v_cash, 'business_key', business_key, 'level', 0, 'apply_purchase', apply_purchase);

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_ADDED',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_set_business_level(team_id uuid, business_key text, new_level smallint, apply_upgrade boolean DEFAULT true, expected_version integer DEFAULT 0, request_id uuid DEFAULT NULL::uuid, note text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_room_id uuid;
  v_status public.room_status;
  v_curr_ver int;
  v_cash int;
  v_debt int;
  v_curr_level smallint;
  v_cost int;
  v_is_correction boolean := false;
  v_prev jsonb;
  v_new jsonb;
BEGIN
  IF NOT public.is_admin() THEN
    PERFORM public.raise_error('NOT_ADMIN');
  END IF;

  SELECT t.room_id INTO v_room_id FROM public.teams t WHERE t.id = team_id;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  PERFORM public.expire_if_due(v_room_id);
  SELECT status INTO v_status FROM public.rooms WHERE id = v_room_id FOR UPDATE;

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.version, t.cash, t.debt
  INTO v_curr_ver, v_cash, v_debt
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BUSINESS_LEVEL_SET']) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  IF v_status = 'TIME_EXPIRED' THEN
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED');
    END IF;
    v_is_correction := true;
  ELSIF v_status <> 'ACTIVE' THEN
    PERFORM public.raise_error('ROOM_NOT_EDITABLE', jsonb_build_object('status', v_status));
  END IF;

  IF v_curr_ver <> expected_version THEN
    PERFORM public.raise_error('VERSION_CONFLICT', jsonb_build_object('expected_version', expected_version, 'current_version', v_curr_ver));
  END IF;

  SELECT level INTO v_curr_level
  FROM public.team_businesses
  WHERE team_businesses.team_id = admin_set_business_level.team_id
    AND team_businesses.business_key = admin_set_business_level.business_key
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('BUSINESS_NOT_OWNED', jsonb_build_object('business_key', business_key));
  END IF;

  IF new_level NOT BETWEEN 0 AND 2 THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('new_level', new_level));
  END IF;

  v_prev := jsonb_build_object('level', v_curr_level, 'cash', v_cash);

  IF apply_upgrade THEN
    -- Debt Recovery: a team in debt cannot upgrade.
    IF v_debt > 0 THEN
      PERFORM public.raise_error('IN_DEBT', jsonb_build_object('debt', v_debt));
    END IF;

    IF new_level <> v_curr_level + 1 THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('current_level', v_curr_level, 'new_level', new_level));
    END IF;

    IF new_level = 1 THEN
      SELECT u1_cost INTO v_cost FROM public.business_catalog WHERE key = business_key;
    ELSIF new_level = 2 THEN
      SELECT u2_cost INTO v_cost FROM public.business_catalog WHERE key = business_key;
    END IF;

    IF v_cash < v_cost THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object('cash', v_cash, 'cost', v_cost, 'shortfall', v_cost - v_cash));
    END IF;

    v_cash := v_cash - v_cost;
  ELSE
    IF note IS NULL OR trim(note) = '' THEN
      PERFORM public.raise_error('NOTE_REQUIRED', jsonb_build_object('reason', 'manual_level_change_requires_note'));
    END IF;
    v_is_correction := true;
  END IF;

  UPDATE public.team_businesses
  SET level = new_level
  WHERE team_businesses.team_id = admin_set_business_level.team_id
    AND team_businesses.business_key = admin_set_business_level.business_key;

  UPDATE public.teams
  SET cash = v_cash,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object('level', new_level, 'cash', v_cash, 'apply_upgrade', apply_upgrade);

  INSERT INTO public.activity_events (
    room_id,
    team_id,
    request_id,
    type,
    business_key,
    prev,
    new,
    note,
    is_correction,
    actor_id,
    created_at
  ) VALUES (
    v_room_id,
    team_id,
    request_id,
    'BUSINESS_LEVEL_SET',
    business_key,
    v_prev,
    v_new,
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$function$;

DROP FUNCTION IF EXISTS public.room_standings(uuid);

CREATE FUNCTION public.room_standings(p_room_id uuid)
RETURNS TABLE(team_id uuid, slot smallint, name text, rank integer, is_bankrupt boolean, debt integer, cash integer,
              business_count integer, business_cost integer, upgrade_count integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH base AS (
    SELECT t.id AS tid, t.slot, t.name, t.is_bankrupt, t.debt, t.cash,
           count(tb.id)::int AS business_count,
           coalesce(sum(bc.cost), 0)::int AS business_cost,
           coalesce(sum(tb.level), 0)::int AS upgrade_count
    FROM public.teams t
    LEFT JOIN public.team_businesses tb ON tb.team_id = t.id
    LEFT JOIN public.business_catalog bc ON bc.key = tb.business_key
    WHERE t.room_id = p_room_id
    GROUP BY t.id
  )
  SELECT b.tid, b.slot, b.name,
         -- A team still in debt (or eliminated) is ineligible: it ranks below every eligible team and cannot win.
         (rank() OVER (ORDER BY (b.is_bankrupt OR b.debt > 0) ASC, b.cash DESC, b.business_cost DESC, b.upgrade_count DESC))::int,
         b.is_bankrupt, b.debt, b.cash, b.business_count, b.business_cost, b.upgrade_count
  FROM base b
  ORDER BY 4 ASC, b.slot ASC;
$function$;

REVOKE ALL ON FUNCTION public.room_standings(uuid) FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION public.admin_finalize(p_room_id uuid, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_status public.room_status;
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

  INSERT INTO public.final_results (room_id, team_id, rank, cash, business_count, is_bankrupt)
  SELECT p_room_id, (e->>'team_id')::uuid, (e->>'rank')::smallint, (e->>'cash')::int,
         (e->>'business_count')::smallint, (e->>'is_bankrupt')::boolean OR (e->>'debt')::int > 0
  FROM jsonb_array_elements(v_standings) e;

  INSERT INTO public.final_result_businesses (
    room_id, team_id, business_key, name, level, cost, u1_cost, u2_cost
  )
  SELECT p_room_id, tb.team_id, tb.business_key, bc.name, tb.level, bc.cost,
         bc.u1_cost, bc.u2_cost
  FROM public.team_businesses tb
  JOIN public.teams t ON t.id = tb.team_id
  JOIN public.business_catalog bc ON bc.key = tb.business_key
  WHERE t.room_id = p_room_id;

  -- Teams that tie on every criterion share rank 1: then there is no single winner.
  SELECT CASE WHEN count(*) = 1 THEN min(e->>'team_id')::uuid END INTO v_winner_id
  FROM jsonb_array_elements(v_standings) e
  WHERE (e->>'rank')::int = 1 AND NOT (e->>'is_bankrupt')::boolean AND (e->>'debt')::int = 0;

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
$function$;

CREATE OR REPLACE FUNCTION public.get_admin_snapshot(room_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    'cash', t.cash, 'debt', t.debt, 'board_position', t.board_position,
    'is_bankrupt', t.is_bankrupt, 'version', t.version, 'tiebreak_order', t.tiebreak_order,
    'claimed', EXISTS (SELECT 1 FROM public.team_claims tc WHERE tc.team_id = t.id),
    'pin', ts.join_pin,
    'businesses', coalesce((
      SELECT jsonb_agg(jsonb_build_object(
        'business_key', tb.business_key, 'name', bc.name, 'level', tb.level,
        'cost', bc.cost
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
$function$;

CREATE OR REPLACE FUNCTION public.get_my_state()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_team_id uuid;
  v_room_id uuid;
  v_status public.room_status;
  v_started_at timestamptz;
  v_ends_at timestamptz;
  v_slot smallint;
  v_name text;
  v_color text;
  v_cash int;
  v_debt int;
  v_is_bankrupt boolean;
  v_businesses jsonb;
  v_final_result jsonb := NULL;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN NULL;
  END IF;

  -- Priority 1: User's claim in a non-FINALIZED room
  SELECT tc.team_id, t.room_id INTO v_team_id, v_room_id
  FROM public.team_claims tc
  JOIN public.teams t ON tc.team_id = t.id
  JOIN public.rooms r ON t.room_id = r.id
  WHERE tc.user_id = v_user_id AND r.status <> 'FINALIZED'
  ORDER BY tc.claimed_at DESC
  LIMIT 1;

  -- Priority 2: User's claim in the most recently finalized room
  IF v_room_id IS NULL THEN
    SELECT tc.team_id, t.room_id INTO v_team_id, v_room_id
    FROM public.team_claims tc
    JOIN public.teams t ON tc.team_id = t.id
    JOIN public.rooms r ON t.room_id = r.id
    WHERE tc.user_id = v_user_id AND r.status = 'FINALIZED'
    ORDER BY r.finalized_at DESC NULLS LAST, tc.claimed_at DESC
    LIMIT 1;
  END IF;

  IF v_room_id IS NULL THEN
    RETURN NULL;
  END IF;

  v_status := public.expire_if_due(v_room_id);

  SELECT status, started_at, ends_at INTO v_status, v_started_at, v_ends_at
  FROM public.rooms
  WHERE id = v_room_id;

  SELECT slot, name, color, cash, debt, is_bankrupt
  INTO v_slot, v_name, v_color, v_cash, v_debt, v_is_bankrupt
  FROM public.teams
  WHERE id = v_team_id;

  SELECT coalesce(jsonb_agg(
    jsonb_build_object(
      'business_key', tb.business_key,
      'name', bc.name,
      'level', tb.level,
      'cost', bc.cost
    ) ORDER BY bc.sort_order
  ), '[]'::jsonb) INTO v_businesses
  FROM public.team_businesses tb
  JOIN public.business_catalog bc ON tb.business_key = bc.key
  WHERE tb.team_id = v_team_id;

  IF v_status = 'FINALIZED' THEN
    SELECT jsonb_build_object(
      'rank', fr.rank,
      'cash', fr.cash,
      'business_count', fr.business_count,
      'is_bankrupt', fr.is_bankrupt
    ) INTO v_final_result
    FROM public.final_results fr
    WHERE fr.room_id = v_room_id AND fr.team_id = v_team_id;
  END IF;

  RETURN jsonb_build_object(
    'room', jsonb_build_object(
      'status', v_status,
      'started_at', v_started_at,
      'ends_at', v_ends_at,
      'server_now', public.app_now()
    ),
    'team', jsonb_build_object(
      'slot', v_slot,
      'name', v_name,
      'color', v_color,
      'cash', v_cash,
      'debt', v_debt,
      'is_bankrupt', v_is_bankrupt
    ),
    'businesses', v_businesses,
    'final_result', v_final_result
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_abort_game(p_room_id uuid, note text DEFAULT NULL::text, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
      debt = 0,
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
$function$;

CREATE OR REPLACE FUNCTION public.admin_start_game(room_id uuid, force boolean DEFAULT false, request_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
         AND (t.cash <> 1000 OR t.debt <> 0 OR t.is_bankrupt
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
$function$;


-- ==========================================
-- FILE: 0032_multi_admin_rooms.sql
-- ==========================================
-- Multi-admin rooms: 0026 scoped the NON_FINAL_ROOM_EXISTS check per admin, but the global
-- one-non-final-room index from 0001 still blocked every other admin. Drop it.
-- idx_rooms_unique_active_code stays: room codes remain unique among non-final rooms.
-- Audit: no other function assumes a single global active room (player lookups are per user/room).
DROP INDEX IF EXISTS public.idx_rooms_single_active;
