-- Phase 4: request_id replay/misuse, numeric bounds, adjust shape validation, post-FINALIZED lockout.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(26);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid 'a0000000-0000-0000-0000-000000000009'
\set admin2_uid 'a0000000-0000-0000-0000-00000000000a'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'money-admin@test.local', now(), now()),
  (:'admin2_uid', 'money-admin2@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid'), (:'admin2_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000009", "role": "authenticated"}', true);

CREATE TEMP TABLE rid (k text PRIMARY KEY, v uuid DEFAULT gen_random_uuid()) ON COMMIT DROP;
GRANT ALL ON rid TO authenticated;
INSERT INTO rid (k) VALUES ('set'), ('adj');

SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

-- replay of set_team_values: one effect, identical response
SELECT lives_ok($$SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 1200, 0, (SELECT v FROM rid WHERE k='set'), NULL)$$, 'set_team_values first call');
SELECT is(
  public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 1200, 0, (SELECT v FROM rid WHERE k='set'), NULL)->'team'->>'cash',
  '1200',
  'set_team_values replay returns the team snapshot');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type='CASH_SET'), 1, 'replay wrote one CASH_SET event');
SELECT is((SELECT version FROM public.teams WHERE slot=1), 1, 'replay did not bump the version again');

-- misuse of a request_id
SELECT throws_ok($$SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=2), 900, 0, (SELECT v FROM rid WHERE k='set'), NULL)$$, 'P0001', 'REQUEST_ID_REUSED', 'same request_id for another team is REQUEST_ID_REUSED');
SELECT is((SELECT cash FROM public.teams WHERE slot=2), 1000, 'misused request_id changed nothing');
SELECT throws_ok($$SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot=1), 'saas', true, 1, (SELECT v FROM rid WHERE k='set'), NULL)$$, 'P0001', 'REQUEST_ID_REUSED', 'request_id from another action type is REQUEST_ID_REUSED');
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-00000000000a", "role": "authenticated"}', true);
SELECT throws_ok($$SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 1200, 1, (SELECT v FROM rid WHERE k='set'), NULL)$$, 'P0001', 'REQUEST_ID_REUSED', 'request_id from another admin is REQUEST_ID_REUSED');
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000009", "role": "authenticated"}', true);

-- no-op set does not bump the version
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 1200, 1, gen_random_uuid(), NULL);
SELECT is((SELECT version FROM public.teams WHERE slot=1), 1, 'no-op set_team_values leaves the version alone');

-- adjust: replay returns the array shape and applies once
SELECT lives_ok($$SELECT public.admin_adjust(
  jsonb_build_array(
    jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=2), 'cash_delta', 50, 'expected_version', 0),
    jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=3), 'cash_delta', -50, 'expected_version', 0)),
  'lap', 'n', (SELECT v FROM rid WHERE k='adj'))$$, 'adjust first call');
SELECT is(jsonb_array_length(public.admin_adjust(
  jsonb_build_array(
    jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=2), 'cash_delta', 50, 'expected_version', 0),
    jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=3), 'cash_delta', -50, 'expected_version', 0)),
  'lap', 'n', (SELECT v FROM rid WHERE k='adj'))), 2, 'adjust replay returns the 2 snapshots, not idempotent_duplicate');
SELECT is((SELECT cash FROM public.teams WHERE slot=2), 1050, 'adjust applied once');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type='ADJUSTMENT'), 2, 'adjust wrote exactly 2 events');

-- adjust shape validation: clean INVALID_VALUE, no raw cast errors
SELECT throws_ok($$SELECT public.admin_adjust('"nope"'::jsonb, 'x', 'n')$$, 'P0001', 'INVALID_VALUE', 'adjust: non-array');
SELECT throws_ok($$SELECT public.admin_adjust('[]'::jsonb, 'x', 'n')$$, 'P0001', 'INVALID_VALUE', 'adjust: empty array');
SELECT throws_ok($$SELECT public.admin_adjust('[{"team_id":"not-a-uuid","expected_version":0}]'::jsonb, 'x', 'n')$$, 'P0001', 'INVALID_VALUE', 'adjust: bad uuid');
SELECT throws_ok($$SELECT public.admin_adjust(jsonb_build_array(jsonb_build_object('team_id',(SELECT id FROM public.teams WHERE slot=1),'cash_delta',1.5,'expected_version',1)), 'x', 'n')$$, 'P0001', 'INVALID_VALUE', 'adjust: fractional delta');
SELECT throws_ok($$SELECT public.admin_adjust(jsonb_build_array(jsonb_build_object('team_id',(SELECT id FROM public.teams WHERE slot=1),'cash_delta',1)), 'x', 'n')$$, 'P0001', 'INVALID_VALUE', 'adjust: missing expected_version');
SELECT throws_ok($$SELECT public.admin_adjust(jsonb_build_array(jsonb_build_object('team_id',(SELECT id FROM public.teams WHERE slot=1),'expected_version',1),jsonb_build_object('team_id',(SELECT id FROM public.teams WHERE slot=1),'expected_version',1)), 'x', 'n')$$, 'P0001', 'INVALID_VALUE', 'adjust: duplicate team');

-- numeric bounds
SELECT throws_ok($$SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 1000000001, 1, gen_random_uuid(), NULL)$$, 'P0001', 'INVALID_VALUE', 'set_team_values above the cap is INVALID_VALUE');
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 1000000000, 1, gen_random_uuid(), NULL);
SELECT throws_ok($$SELECT public.admin_adjust(jsonb_build_array(jsonb_build_object('team_id',(SELECT id FROM public.teams WHERE slot=1),'cash_delta',1,'expected_version',2)), 'x', 'n')$$, 'P0001', 'INVALID_VALUE', 'adjust past the cap is INVALID_VALUE, not 22003');
SELECT throws_ok($$SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=2), -1, 1, gen_random_uuid(), NULL)$$, 'P0001', 'INVALID_VALUE', 'negative cash is INVALID_VALUE');

-- audit parity for a team touched only by adjust: one version bump, one event
SELECT is((SELECT version FROM public.teams WHERE slot=2),
          (SELECT count(*)::int FROM public.activity_events ae JOIN public.teams t ON t.id = ae.team_id WHERE t.slot = 2 AND ae.type IN ('CASH_SET','ADJUSTMENT','BUSINESS_ADDED')),
          'team 2: version bumps equal financial audit rows');

-- FINALIZED: every money RPC is locked out and nothing changes
SELECT set_config('app.test_now', '2026-03-01 12:00:00+00', true);
SELECT public.admin_finalize((SELECT id FROM public.rooms));
CREATE TEMP TABLE frozen ON COMMIT DROP AS SELECT id, cash, version FROM public.teams;
GRANT ALL ON frozen TO authenticated;
SELECT throws_ok($$SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 5, (SELECT version FROM public.teams WHERE slot=1), gen_random_uuid(), 'n')$$, 'P0001', 'ROOM_NOT_EDITABLE', 'FINALIZED: set_team_values locked');
SELECT throws_ok($$SELECT public.admin_set_bankrupt((SELECT id FROM public.teams WHERE slot=1), true, (SELECT version FROM public.teams WHERE slot=1), gen_random_uuid(), 'n')$$, 'P0001', 'ROOM_NOT_EDITABLE', 'FINALIZED: set_bankrupt locked');
SELECT is((SELECT count(*)::int FROM public.teams t JOIN frozen f USING (id) WHERE t.cash=f.cash AND t.version=f.version), 5, 'FINALIZED: no team row changed');

SELECT * FROM finish();
ROLLBACK;
