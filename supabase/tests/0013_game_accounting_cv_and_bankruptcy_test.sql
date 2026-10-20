-- Test suite for Migration 0022: Game Accounting CV and Bankruptcy
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

-- Add business to slot 1 (edtech: cost=200, initial_cv=150, u1_cost=150, u1_cv=300)
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot=1), 'edtech', true, 0, gen_random_uuid(), NULL);
SELECT is((SELECT cv FROM public.teams WHERE slot=1), 150, 'Team 1 CV is 150 after buying EdTech');
SELECT is((SELECT cash FROM public.teams WHERE slot=1), 800, 'Team 1 cash is 800 after buying EdTech');

-- Upgrade business
SELECT public.admin_set_business_level((SELECT id FROM public.teams WHERE slot=1), 'edtech', 1::smallint, true, 1, gen_random_uuid(), NULL);
SELECT is((SELECT cv FROM public.teams WHERE slot=1), 450, 'Team 1 CV is 450 (150+300) after upgrading EdTech to level 1');
SELECT is((SELECT cash FROM public.teams WHERE slot=1), 650, 'Team 1 cash is 650 after upgrading EdTech');

-- Remove business with CORRECTION: CV should deduct 450 back to 0
SELECT public.admin_remove_business((SELECT id FROM public.teams WHERE slot=1), 'edtech', 'CORRECTION', false, 2, gen_random_uuid(), 'Admin fix');
SELECT is((SELECT cv FROM public.teams WHERE slot=1), 0, 'Team 1 CV deducted back to 0 on CORRECTION removal');
SELECT is((SELECT cash FROM public.teams WHERE slot=1), 650, 'Team 1 cash unchanged on CORRECTION with credit_resale=false');

-- Test Bankruptcy setting: cash zeroes out
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=2), 500, NULL, 0, gen_random_uuid(), NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot=2), 500, 'Team 2 cash set to 500');

SELECT public.admin_set_bankrupt((SELECT id FROM public.teams WHERE slot=2), true, 1, gen_random_uuid(), 'Declared bankrupt');
SELECT is((SELECT is_bankrupt FROM public.teams WHERE slot=2), true, 'Team 2 marked bankrupt');
SELECT is((SELECT cash FROM public.teams WHERE slot=2), 0, 'Team 2 cash explicitly zeroed on bankruptcy');

-- Reject mutations on bankrupt teams
SELECT throws_ok(
  $$SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=2), 100, NULL, 2, gen_random_uuid(), NULL)$$,
  'P0001',
  'TEAM_BANKRUPT',
  'admin_set_team_values rejects bankrupt team with TEAM_BANKRUPT'
);

SELECT throws_ok(
  $$SELECT public.admin_adjust(
    jsonb_build_array(
      jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=2), 'cash_delta', 50, 'cv_delta', 0, 'expected_version', 2)
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
      jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot=2), 'cash_delta', 200, 'cv_delta', 50, 'expected_version', 3)
    ),
    'lap', 'reinstated grant', gen_random_uuid()
  )$$,
  'Adjusting reinstated team succeeds'
);
SELECT is((SELECT cash FROM public.teams WHERE slot=2), 200, 'Team 2 cash updated to 200');

SELECT * FROM finish();
ROLLBACK;
