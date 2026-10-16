-- Migration 0018: Money RPC hardening
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- 1. request_id replay is evaluated AFTER the room and team locks, so a retry that arrives while the
--    original is in flight waits and then replays instead of failing with VERSION_CONFLICT/BUSINESS_OWNED.
--    A replay must match the room, the team (where one applies), the event family and the actor;
--    anything else raises REQUEST_ID_REUSED (added in 0017). A replay returns the same shape as the
--    first call (admin_adjust: the array of team snapshots, no more 'idempotent_duplicate').
-- 2. Money is capped at public.max_money() (1,000,000,000, far above any rulebook value). Arithmetic is
--    checked in bigint before it can overflow int; violations raise INVALID_VALUE with the field.
--    teams.cash / teams.cv get matching CHECK constraints.
-- 3. admin_adjust validates `changes` up front (array of 1..6 objects, uuid team_id, integer deltas,
--    required expected_version, no duplicate team, one room).
-- 4. admin_set_team_values leaves a no-op call untouched (no version bump), so a retry of a no-op
--    cannot turn into VERSION_CONFLICT.
--
-- Deliberately editable after TIME_EXPIRED (note required, is_correction = true): set_team_values,
-- adjust, add/level/remove business, set_bankrupt. After FINALIZED every one raises ROOM_NOT_EDITABLE.
-- Costs, resale, upgrade and CV rules are unchanged.

CREATE OR REPLACE FUNCTION public.max_money()
RETURNS int
LANGUAGE sql
IMMUTABLE
AS $$ SELECT 1000000000 $$;

REVOKE ALL ON FUNCTION public.max_money() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.teams ADD CONSTRAINT teams_cash_cap CHECK (cash <= 1000000000) NOT VALID;
ALTER TABLE public.teams ADD CONSTRAINT teams_cv_cap CHECK (cv <= 1000000000) NOT VALID;
ALTER TABLE public.teams VALIDATE CONSTRAINT teams_cash_cap;
ALTER TABLE public.teams VALIDATE CONSTRAINT teams_cv_cap;

-- Private helper: true = replay, false = first use, raises REQUEST_ID_REUSED on misuse.
-- Call only while holding the room and team locks. p_team_id NULL skips the team check (admin_adjust).
CREATE OR REPLACE FUNCTION public.money_replay_check(p_room_id uuid, p_team_id uuid, p_request_id uuid, p_types text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ev RECORD;
BEGIN
  IF p_request_id IS NULL THEN
    RETURN false;
  END IF;

  SELECT ae.room_id, ae.team_id, ae.type, ae.actor_id INTO v_ev
  FROM public.activity_events ae
  WHERE ae.request_id = p_request_id;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  IF v_ev.room_id IS DISTINCT FROM p_room_id
     OR NOT (v_ev.type = ANY (p_types))
     OR v_ev.actor_id IS DISTINCT FROM auth.uid()
     OR (p_team_id IS NOT NULL AND v_ev.team_id IS DISTINCT FROM p_team_id) THEN
    PERFORM public.raise_error('REQUEST_ID_REUSED', jsonb_build_object('request_id', p_request_id));
  END IF;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.money_replay_check(uuid, uuid, uuid, text[]) FROM PUBLIC, anon, authenticated;

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

  IF (SELECT count(*) FROM public.team_businesses WHERE team_businesses.team_id = admin_add_business.team_id) >= 3 THEN
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

CREATE OR REPLACE FUNCTION public.admin_set_business_level(
  team_id uuid,
  business_key text,
  new_level smallint,
  apply_upgrade boolean DEFAULT true,
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
  v_curr_ver int;
  v_cash int;
  v_cv int;
  v_curr_level smallint;
  v_cost int;
  v_cv_gain int;
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
  SELECT t.version, t.cash, t.cv
  INTO v_curr_ver, v_cash, v_cv
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

  v_prev := jsonb_build_object('level', v_curr_level, 'cash', v_cash, 'cv', v_cv);

  IF apply_upgrade THEN
    IF new_level <> v_curr_level + 1 THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('current_level', v_curr_level, 'new_level', new_level));
    END IF;

    IF new_level = 1 THEN
      SELECT u1_cost, u1_cv INTO v_cost, v_cv_gain FROM public.business_catalog WHERE key = business_key;
    ELSIF new_level = 2 THEN
      SELECT u2_cost, u2_cv INTO v_cost, v_cv_gain FROM public.business_catalog WHERE key = business_key;
    END IF;

    IF v_cash < v_cost THEN
      PERFORM public.raise_error('INSUFFICIENT_CASH', jsonb_build_object('cash', v_cash, 'cost', v_cost, 'shortfall', v_cost - v_cash));
    END IF;

    v_cash := v_cash - v_cost;
    IF v_cv::bigint + v_cv_gain > public.max_money() THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cv', 'max', public.max_money()));
    END IF;
    v_cv := v_cv + v_cv_gain;
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
      cv = v_cv,
      version = version + 1
  WHERE id = team_id;

  v_new := jsonb_build_object('level', new_level, 'cash', v_cash, 'cv', v_cv, 'apply_upgrade', apply_upgrade);

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
$$;

CREATE OR REPLACE FUNCTION public.admin_remove_business(
  team_id uuid,
  business_key text,
  reason text,
  credit_resale boolean DEFAULT true,
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

  v_new := jsonb_build_object('business_key', business_key, 'reason', reason, 'credit_resale', credit_resale, 'cash', v_cash);

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
$$;

CREATE OR REPLACE FUNCTION public.admin_set_bankrupt(
  team_id uuid,
  value boolean,
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
  v_curr_ver int;
  v_curr_bankrupt boolean;
  v_biz RECORD;
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

  -- Team row is locked after the room; columns are re-read under the lock.
  SELECT t.version, t.is_bankrupt
  INTO v_curr_ver, v_curr_bankrupt
  FROM public.teams t
  WHERE t.id = team_id AND t.room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['BANKRUPTCY_SET']) THEN
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

  IF NOT value AND (note IS NULL OR trim(note) = '') THEN
    PERFORM public.raise_error('NOTE_REQUIRED', jsonb_build_object('reason', 'undoing_bankruptcy_requires_note'));
  END IF;

  IF value THEN
    -- Liquidate all owned businesses back to the bank
    FOR v_biz IN SELECT business_key, level FROM public.team_businesses WHERE team_businesses.team_id = admin_set_bankrupt.team_id LOOP
      DELETE FROM public.team_businesses
      WHERE team_businesses.team_id = admin_set_bankrupt.team_id
        AND team_businesses.business_key = v_biz.business_key;

      INSERT INTO public.activity_events (
        room_id, team_id, type, business_key, prev, new, note, is_correction, actor_id, created_at
      ) VALUES (
        v_room_id, team_id, 'BUSINESS_REMOVED', v_biz.business_key, jsonb_build_object('level', v_biz.level), jsonb_build_object('reason', 'BANKRUPTCY'), note, v_is_correction, auth.uid(), public.app_now()
      );
    END LOOP;
  END IF;

  UPDATE public.teams
  SET is_bankrupt = value,
      version = version + 1
  WHERE id = team_id;

  INSERT INTO public.activity_events (
    room_id,
    team_id,
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
    team_id,
    request_id,
    'BANKRUPTCY_SET',
    jsonb_build_object('is_bankrupt', v_curr_bankrupt),
    jsonb_build_object('is_bankrupt', value),
    note,
    v_is_correction,
    auth.uid(),
    public.app_now()
  );

  RETURN public.get_team_snapshot(team_id);
END;
$$;

-- ---------------------------------------------------------------------------
-- admin_set_team_values
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_set_team_values(
  team_id uuid,
  cash int DEFAULT NULL,
  cv int DEFAULT NULL,
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
  v_curr_version int;
  v_curr_cash int;
  v_curr_cv int;
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

  SELECT version, teams.cash, teams.cv
  INTO v_curr_version, v_curr_cash, v_curr_cv
  FROM public.teams
  WHERE id = team_id AND room_id = v_room_id
  FOR UPDATE;

  IF NOT FOUND THEN
    PERFORM public.raise_error('ROOM_NOT_FOUND');
  END IF;

  IF public.money_replay_check(v_room_id, team_id, request_id, ARRAY['CASH_SET', 'CV_SET']) THEN
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
      'cash', v_curr_cash,
      'cv', v_curr_cv
    ));
  END IF;

  IF cash IS NOT NULL AND (cash < 0 OR cash > public.max_money()) THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cash', 'cash', cash, 'max', public.max_money()));
  END IF;

  IF cv IS NOT NULL AND (cv < 0 OR cv > public.max_money()) THEN
    PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cv', 'cv', cv, 'max', public.max_money()));
  END IF;

  IF (cash IS NULL OR cash = v_curr_cash) AND (cv IS NULL OR cv = v_curr_cv) THEN
    RETURN public.get_team_snapshot(team_id);
  END IF;

  UPDATE public.teams
  SET cash = coalesce(admin_set_team_values.cash, teams.cash),
      cv = coalesce(admin_set_team_values.cv, teams.cv),
      version = version + 1
  WHERE id = team_id;

  IF cash IS NOT NULL AND cash <> v_curr_cash THEN
    INSERT INTO public.activity_events (
      room_id, team_id, request_id, type, prev, new, note, is_correction, actor_id, created_at
    ) VALUES (
      v_room_id, team_id, request_id, 'CASH_SET', jsonb_build_object('cash', v_curr_cash), jsonb_build_object('cash', cash), note, v_is_correction, auth.uid(), public.app_now()
    );
  END IF;

  IF cv IS NOT NULL AND cv <> v_curr_cv THEN
    INSERT INTO public.activity_events (
      room_id, team_id, request_id, type, prev, new, note, is_correction, actor_id, created_at
    ) VALUES (
      v_room_id, team_id, CASE WHEN cash IS NOT NULL AND cash <> v_curr_cash THEN NULL ELSE request_id END, 'CV_SET', jsonb_build_object('cv', v_curr_cv), jsonb_build_object('cv', cv), note, v_is_correction, auth.uid(), public.app_now()
    );
  END IF;

  RETURN public.get_team_snapshot(team_id);
END;
$$;

-- ---------------------------------------------------------------------------
-- admin_adjust
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.admin_adjust(
  changes jsonb,
  label text,
  note text DEFAULT NULL,
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
  v_cv_delta int;
  v_exp_ver int;
  v_curr_ver int;
  v_curr_cash int;
  v_curr_cv int;
  v_res_cash int;
  v_res_cv int;
  v_clamped boolean;
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

    FOREACH v_key IN ARRAY ARRAY['cash_delta', 'cv_delta', 'expected_version'] LOOP
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
    v_cv_delta := coalesce((v_item->>'cv_delta')::int, 0);
    v_exp_ver := (v_item->>'expected_version')::int;

    SELECT version, cash, cv INTO v_curr_ver, v_curr_cash, v_curr_cv
    FROM public.teams
    WHERE id = v_team_id;

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

    IF v_curr_cv::bigint + v_cv_delta > v_max THEN
      PERFORM public.raise_error('INVALID_VALUE', jsonb_build_object('field', 'cv', 'team_id', v_team_id, 'max', v_max));
    END IF;
  END LOOP;

  -- Phase 2 execution
  FOR v_item IN SELECT * FROM jsonb_array_elements(changes) ORDER BY (value->>'team_id')::uuid ASC LOOP
    v_team_id := (v_item->>'team_id')::uuid;
    v_cash_delta := coalesce((v_item->>'cash_delta')::int, 0);
    v_cv_delta := coalesce((v_item->>'cv_delta')::int, 0);

    SELECT cash, cv INTO v_curr_cash, v_curr_cv FROM public.teams WHERE id = v_team_id;

    v_res_cash := v_curr_cash + v_cash_delta;
    v_res_cv := v_curr_cv + v_cv_delta;
    v_clamped := false;

    IF v_res_cv < 0 THEN
      v_res_cv := 0;
      v_clamped := true;
    END IF;

    UPDATE public.teams
    SET cash = v_res_cash,
        cv = v_res_cv,
        version = version + 1
    WHERE id = v_team_id;

    INSERT INTO public.activity_events (
      room_id, team_id, group_id, request_id, type, prev, new, note, is_correction, actor_id, created_at
    ) VALUES (
      v_room_id,
      v_team_id,
      v_group_id,
      CASE WHEN v_first THEN request_id ELSE NULL END,
      'ADJUSTMENT',
      jsonb_build_object('cash', v_curr_cash, 'cv', v_curr_cv),
      jsonb_build_object('cash', v_res_cash, 'cv', v_res_cv, 'cash_delta', v_cash_delta, 'cv_delta', v_cv_delta, 'clamped', v_clamped),
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
$$;
