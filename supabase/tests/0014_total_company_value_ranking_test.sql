-- Test suite for Migration 0023: Total Company Value Ranking (Cash + CV)
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(6);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid 'a0000000-0000-0000-0000-000000000023'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'rank-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000023", "role": "authenticated"}', true);

SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

-- Team 1 (Alpha): Cash = 1200, CV = 300 -> Total = 1500
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 1200, 300, 0, gen_random_uuid(), NULL);

-- Team 2 (Beta): Cash = 600, CV = 800 -> Total = 1400 (Has higher CV than Team 1, but lower Total Valuation!)
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=2), 600, 800, 0, gen_random_uuid(), NULL);

-- Team 3 (Gamma): Cash = 500, CV = 900 -> Total = 1400 (Tied with Beta on Total 1400, but Beta has higher Cash 600 vs 500)
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=3), 500, 900, 0, gen_random_uuid(), NULL);

-- Verify rankings:
RESET ROLE;
-- Rank 1: Alpha (Total 1500 beats Beta's 1400, even though Beta has 800 CV > 300 CV)
SELECT is(
  (SELECT slot FROM public.room_standings((SELECT id FROM public.rooms)) WHERE rank = 1),
  1::smallint,
  'Rank 1 is Team 1 with highest Total Company Value (1200 cash + 300 cv = 1500)'
);

-- Rank 2: Beta (Total 1400 with 600 cash beats Gamma's 1400 with 500 cash)
SELECT is(
  (SELECT slot FROM public.room_standings((SELECT id FROM public.rooms)) WHERE rank = 2),
  2::smallint,
  'Rank 2 is Team 2 (Tied total 1400, broken by higher cash 600 vs 500)'
);

-- Rank 3: Gamma
SELECT is(
  (SELECT slot FROM public.room_standings((SELECT id FROM public.rooms)) WHERE rank = 3),
  3::smallint,
  'Rank 3 is Team 3 (Total 1400, cash 500)'
);

-- Mark Team 1 as bankrupt: should drop to last place regardless of valuation
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000023", "role": "authenticated"}', true);
SELECT public.admin_set_bankrupt((SELECT id FROM public.teams WHERE slot=1), true, 1, gen_random_uuid(), 'Bankruptcy declared');
RESET ROLE;

SELECT is(
  (SELECT slot FROM public.room_standings((SELECT id FROM public.rooms)) WHERE rank = 1),
  2::smallint,
  'Beta moves to Rank 1 after Alpha is eliminated'
);

SELECT is(
  (SELECT slot FROM public.room_standings((SELECT id FROM public.rooms)) WHERE is_bankrupt = true),
  1::smallint,
  'Alpha is marked bankrupt and eliminated'
);

SELECT is(
  (SELECT rank FROM public.room_standings((SELECT id FROM public.rooms)) WHERE slot = 1),
  5,
  'Eliminated team ranks below all active teams'
);

SELECT * FROM finish();
ROLLBACK;
