-- Test suite for game accounting (cash only) and bankruptcy
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(15);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid 'a0000000-0000-0000-0000-000000000022'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'acct-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000022", "role": "authenticated"}', true);

SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

-- Add business to slot 1 (edtech: cost=200, u1_cost=100)
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot=1), 'edtech', true, 0, gen_random_uuid(), NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot=1), 800, 'Team 1 cash is 800 after buying EdTech');

-- Upgrade business
SELECT public.admin_set_business_level((SELECT id FROM public.teams WHERE slot=1), 'edtech', 1::smallint, true, 1, gen_random_uuid(), NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot=1), 700, 'Team 1 cash is 700 after upgrading EdTech');

-- Remove business with CORRECTION: no money moves and nothing else is deducted
SELECT public.admin_remove_business((SELECT id FROM public.teams WHERE slot=1), 'edtech', 'CORRECTION', false, 2, gen_random_uuid(), 'Admin fix');
SELECT is((SELECT count(*)::int FROM public.team_businesses tb JOIN public.teams t ON t.id = tb.team_id WHERE t.slot=1), 0, 'CORRECTION removal deletes the business');
SELECT is((SELECT cash FROM public.teams WHERE slot=1), 700, 'Team 1 cash unchanged on CORRECTION with credit_resale=false');

-- Test Bankruptcy setting: cash zeroes out
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=2), 500, 0, gen_random_uuid(), NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot=2), 500, 'Team 2 cash set to 500');

SELECT public.admin_set_bankrupt((SELECT id FROM public.teams WHERE slot=2), true, 1, gen_random_uuid(), 'Declared bankrupt');
SELECT is((SELECT is_bankrupt FROM public.teams WHERE slot=2), true, 'Team 2 marked bankrupt');
SELECT is((SELECT cash FROM public.teams WHERE slot=2), 0, 'Team 2 cash explicitly zeroed on bankruptcy');

-- Reject mutations on bankrupt teams
SELECT throws_ok(
  $$SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=2), 100, 2, gen_random_uuid(), NULL)$$,
  'P0001',
  'TEAM_BANKRUPT',
  'admin_set_team_values rejects bankrupt team with TEAM_BANKRUPT'
);

SELECT throws_ok(
  $$SELECT public.admin_adjust(
    jsonb_build_array(
      jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=2), 'cash_delta', 50, 'expected_version', 2)
    ),
    'lap', 'test note', gen_random_uuid()
  )$$,
  'P0001',
  'TEAM_BANKRUPT',
  'admin_adjust rejects bankrupt team with TEAM_BANKRUPT'
);

-- Undoing bankruptcy requires a note
SELECT throws_ok(
  $$SELECT public.admin_set_bankrupt((SELECT id FROM public.teams WHERE slot=2), false, 2, gen_random_uuid(), NULL)$$,
  'P0001',
  'NOTE_REQUIRED',
  'Undoing bankruptcy without note fails with NOTE_REQUIRED'
);

-- Undoing bankruptcy with note succeeds
SELECT lives_ok(
  $$SELECT public.admin_set_bankrupt((SELECT id FROM public.teams WHERE slot=2), false, 2, gen_random_uuid(), 'Reinstating team after review')$$,
  'Undoing bankruptcy with note succeeds'
);
SELECT is((SELECT is_bankrupt FROM public.teams WHERE slot=2), false, 'Team 2 is no longer bankrupt');

-- Team 2 can now receive adjustments again
SELECT lives_ok(
  $$SELECT public.admin_adjust(
    jsonb_build_array(
      jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=2), 'cash_delta', 200, 'expected_version', 3)
    ),
    'lap', 'reinstated grant', gen_random_uuid()
  )$$,
  'Adjusting reinstated team succeeds'
);
SELECT is((SELECT cash FROM public.teams WHERE slot=2), 200, 'Team 2 cash updated to 200');

-- The retired cv_delta field is rejected rather than silently ignored
SELECT throws_ok(
  $$SELECT public.admin_adjust(
    jsonb_build_array(
      jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=2), 'cash_delta', 10, 'cv_delta', 5, 'expected_version', 4)
    ),
    'lap', 'cv attempt', gen_random_uuid()
  )$$,
  'P0001',
  'INVALID_VALUE',
  'admin_adjust rejects the retired cv_delta field'
);

SELECT * FROM finish();
ROLLBACK;
