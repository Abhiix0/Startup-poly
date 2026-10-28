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
