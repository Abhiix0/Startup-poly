-- Phase 6 security matrix. One named assertion per cell: role x table x operation, role x function.
-- A function or table missing from the expected lists below FAILS the "classified" assertions, so a new
-- object cannot ship without someone deciding its exposure.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT no_plan();

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

-- ---------------------------------------------------------------------------
-- Expected exposure (anon, authenticated)
-- ---------------------------------------------------------------------------
CREATE TEMP TABLE exp_tables (t text, anon_select bool, auth_select bool) ON COMMIT DROP;
INSERT INTO exp_tables VALUES
  ('activity_events', false, true), ('admins', false, true), ('business_catalog', true, true),
  ('final_results', true, true), ('final_result_businesses', false, true), ('join_attempts', false, false), ('rooms', true, true),
  ('team_businesses', true, true), ('team_claims', true, true), ('team_secrets', false, true),
  ('teams', true, true);

CREATE TEMP TABLE exp_funcs (f text PRIMARY KEY, anon_x bool, auth_x bool) ON COMMIT DROP;
INSERT INTO exp_funcs VALUES
  ('admin_abort_game', false, true), ('admin_add_business', false, true), ('admin_adjust', false, true),
  ('admin_cancel_room', false, true),
  ('admin_create_room', false, true), ('admin_extend_game', false, true), ('admin_finalize', false, true), ('admin_open_lobby', false, true),
  ('admin_release_team', false, true), ('admin_remove_business', false, true), ('admin_set_bankrupt', false, true),
  ('admin_set_business_level', false, true), ('admin_set_team_values', false, true), ('admin_set_tiebreak', false, true),
  ('admin_start_game', false, true), ('admin_update_team_config', false, true),
  ('get_admin_snapshot', false, true), ('get_history_detail', false, true), ('get_standings', false, true),
  ('list_history', false, true), ('expire_if_due', false, true),
  ('leave_team', false, true),
  ('get_lobby', true, true), ('get_my_state', true, true), ('join_team', true, true),
  ('is_admin', true, true), ('server_time', true, true),
  ('app_now', false, false), ('raise_error', false, false), ('get_team_snapshot', false, false),
  ('room_standings', false, false), ('lifecycle_replay_check', false, false), ('money_replay_check', false, false),
  ('max_money', false, false),
  ('fn_check_business_cap', false, false), ('fn_check_immutable_table', false, false), ('fn_check_room_immutable', false, false),
  ('fn_check_room_status_transition', false, false), ('fn_check_team_business_room_immutable', false, false),
  ('fn_check_team_room_immutable', false, false);

CREATE TEMP VIEW our_funcs AS
  SELECT p.oid, p.proname, p.prosecdef, p.proconfig
  FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public' AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e');

-- ---------------------------------------------------------------------------
-- Classification: nothing unlisted, nothing missing
-- ---------------------------------------------------------------------------
SELECT is((SELECT coalesce(string_agg(proname, ','), '') FROM our_funcs WHERE proname NOT IN (SELECT f FROM exp_funcs)), '', 'every public function is classified in the matrix');
SELECT is((SELECT coalesce(string_agg(f, ','), '') FROM exp_funcs WHERE f NOT IN (SELECT proname FROM our_funcs)), '', 'the matrix lists no function that does not exist');
SELECT is((SELECT coalesce(string_agg(c.relname, ','), '') FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relname NOT IN (SELECT t FROM exp_tables)), '', 'every public table is classified in the matrix');

-- ---------------------------------------------------------------------------
-- role x table x operation
-- ---------------------------------------------------------------------------
SELECT is(has_table_privilege(r.role, 'public.' || e.t, 'SELECT'), CASE r.role WHEN 'anon' THEN e.anon_select ELSE e.auth_select END,
          format('%s SELECT on %s', r.role, e.t))
FROM exp_tables e CROSS JOIN (VALUES ('anon'), ('authenticated')) r(role) ORDER BY e.t, r.role;

SELECT is(has_table_privilege(r.role, 'public.' || e.t, o.op), false, format('%s %s on %s is not granted', r.role, o.op, e.t))
FROM exp_tables e CROSS JOIN (VALUES ('anon'), ('authenticated')) r(role) CROSS JOIN (VALUES ('INSERT'), ('UPDATE'), ('DELETE'), ('TRUNCATE')) o(op)
ORDER BY e.t, r.role, o.op;

SELECT ok(c.relrowsecurity, format('RLS is enabled on %s', c.relname))
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname;

-- ---------------------------------------------------------------------------
-- role x function EXECUTE
-- ---------------------------------------------------------------------------
SELECT is(has_function_privilege('anon', f.oid, 'EXECUTE'), e.anon_x, format('anon EXECUTE %s', f.proname))
FROM our_funcs f JOIN exp_funcs e ON e.f = f.proname ORDER BY f.proname;
SELECT is(has_function_privilege('authenticated', f.oid, 'EXECUTE'), e.auth_x, format('authenticated EXECUTE %s', f.proname))
FROM our_funcs f JOIN exp_funcs e ON e.f = f.proname ORDER BY f.proname;

-- Every SECURITY DEFINER function pins search_path (a future function without it fails here)
SELECT ok(coalesce(proconfig::text, '') LIKE '%search_path=%', format('%s pins search_path', proname))
FROM our_funcs WHERE prosecdef ORDER BY proname;

-- The test-clock hook is limited to admin sessions (L9)
SELECT matches((SELECT prosrc FROM pg_proc WHERE proname = 'app_now'), 'session_user IN \(''postgres'', ''supabase_admin''\)', 'app_now honours the test hook only for postgres/supabase_admin sessions');

-- ---------------------------------------------------------------------------
-- Behaviour: seed a started room with two claimed players
-- ---------------------------------------------------------------------------
\set admin_uid 'a0000000-0000-0000-0000-00000000000c'
\set pa 'c1000000-0000-0000-0000-000000000001'
\set pb 'c1000000-0000-0000-0000-000000000002'
\set pc 'c1000000-0000-0000-0000-000000000003'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'sec-admin@test.local', now(), now()), (:'pa', 'sec-a@test.local', now(), now()),
  (:'pb', 'sec-b@test.local', now(), now()), (:'pc', 'sec-c@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

CREATE TEMP TABLE admin_calls (fn text, msg text) ON COMMIT DROP;
GRANT ALL ON admin_calls TO authenticated;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-00000000000c", "role": "authenticated"}', true);
SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT r.code AS code, r.id AS room_id,
       (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 1) AS pin1,
       (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 2) AS pin2,
       (SELECT id FROM public.teams WHERE room_id = r.id AND slot = 2) AS team_b
FROM public.rooms r \gset
SELECT public.admin_start_game(:'room_id'::uuid, true);
SELECT public.admin_set_team_values(:'team_b'::uuid, 5000, 700, 0, gen_random_uuid(), NULL);

SELECT set_config('request.jwt.claims', '{"sub": "c1000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);
SELECT public.join_team(:'code', 1, :'pin1');
SELECT set_config('request.jwt.claims', '{"sub": "c1000000-0000-0000-0000-000000000002", "role": "authenticated"}', true);
SELECT public.join_team(:'code', 2, :'pin2');

-- Team A (claimed player) cannot see Team B or any secret
SELECT set_config('request.jwt.claims', '{"sub": "c1000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);
SELECT is((SELECT count(*)::int FROM public.teams), 1, 'team A sees exactly one teams row');
SELECT is((SELECT count(*)::int FROM public.teams WHERE id = :'team_b'::uuid), 0, 'team A cannot read team B row (cash/CV)');
SELECT is((SELECT count(*)::int FROM public.team_secrets), 0, 'team A cannot read any PIN');
SELECT is((SELECT count(*)::int FROM public.activity_events), 0, 'team A cannot read the activity log');
SELECT is((SELECT count(*)::int FROM public.team_claims), 1, 'team A sees only its own claim');
SELECT throws_ok($$SELECT count(*) FROM public.join_attempts$$, '42501', NULL, 'team A cannot read join_attempts');
SELECT is(public.get_my_state()->'team'->>'cash', '1000', 'get_my_state returns team A, not team B');
SELECT throws_ok($$SELECT public.get_team_snapshot((SELECT id FROM public.teams))$$, '42501', NULL, 'team A cannot call get_team_snapshot');
SELECT throws_ok(format('SELECT public.get_team_snapshot(%L)', :'team_b'), '42501', NULL, 'team A cannot read team B through get_team_snapshot');
SELECT throws_ok(format('SELECT * FROM public.room_standings(%L)', :'room_id'), '42501', NULL, 'team A cannot read the live leaderboard through room_standings');
SELECT throws_ok(format('SELECT public.get_standings(%L)', :'room_id'), 'P0001', 'NOT_ADMIN', 'team A cannot read standings through get_standings');
SELECT throws_ok($$INSERT INTO public.teams (room_id, slot, name, color) VALUES (gen_random_uuid(), 9, 'x', '#000000')$$, '42501', NULL, 'team A cannot INSERT into teams');
SELECT throws_ok($$UPDATE public.teams SET cash = 999999$$, '42501', NULL, 'team A cannot UPDATE teams');
SELECT throws_ok($$DELETE FROM public.teams$$, '42501', NULL, 'team A cannot DELETE from teams');
SELECT throws_ok($$UPDATE public.rooms SET status = 'FINALIZED'$$, '42501', NULL, 'team A cannot UPDATE rooms');
SELECT throws_ok($$INSERT INTO public.team_claims (user_id, team_id) SELECT 'c1000000-0000-0000-0000-000000000001', id FROM public.teams$$, '42501', NULL, 'team A cannot forge a claim');

-- A non-admin authenticated user with no claim sees nothing and every admin RPC says NOT_ADMIN
SELECT set_config('request.jwt.claims', '{"sub": "c1000000-0000-0000-0000-000000000003", "role": "authenticated"}', true);
SELECT is((SELECT count(*)::int FROM public.teams), 0, 'unclaimed user sees no teams');
SELECT is((SELECT count(*)::int FROM public.rooms), 0, 'unclaimed user sees no rooms');
SELECT is(public.get_my_state() IS NULL, true, 'unclaimed user gets NULL from get_my_state');
DO $$
DECLARE r record; v_msg text;
BEGIN
  FOR r IN SELECT p.proname, p.pronargs FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
           WHERE n.nspname = 'public' AND (p.proname LIKE 'admin\_%' OR p.proname IN ('get_admin_snapshot', 'get_history_detail', 'get_standings', 'list_history'))
  LOOP
    BEGIN
      EXECUTE format('SELECT public.%I(%s)', r.proname, coalesce((SELECT string_agg('NULL', ',') FROM generate_series(1, r.pronargs)), ''));
      v_msg := 'no error';
    EXCEPTION WHEN OTHERS THEN
      v_msg := SQLERRM;
    END;
    INSERT INTO admin_calls VALUES (r.proname, v_msg);
  END LOOP;
END $$;
SELECT is(msg, 'NOT_ADMIN', format('non-admin: %s raises NOT_ADMIN', fn)) FROM admin_calls ORDER BY fn;

-- Anonymous (no session): the public lobby works, secrets and admin data do not
RESET ROLE;
SET LOCAL ROLE anon;
SELECT set_config('request.jwt.claims', '{"role": "anon"}', true);
SELECT throws_ok($$SELECT count(*) FROM public.team_secrets$$, '42501', NULL, 'anon cannot read team_secrets');
SELECT throws_ok($$SELECT count(*) FROM public.activity_events$$, '42501', NULL, 'anon cannot read activity_events');
SELECT is(jsonb_typeof(public.get_lobby((SELECT :'code'))), 'object', 'anon can read the public lobby');
SELECT throws_ok(format('SELECT public.expire_if_due(%L)', :'room_id'), '42501', NULL, 'anon cannot call expire_if_due');

SELECT * FROM finish();
ROLLBACK;
