-- Standings ranking: cash, then total original purchase cost of owned businesses, then total upgrades.
-- Teams equal on every criterion share a rank; eliminated teams rank below all active teams.
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

-- Alpha 1200, Beta 600, Gamma 600, Delta/Epsilon 1000 (default)
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=1), 1200, 0, gen_random_uuid(), NULL);
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=2), 600, 0, gen_random_uuid(), NULL);
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot=3), 600, 0, gen_random_uuid(), NULL);
-- Gamma buys EdTech (200) and Beta stays business-free: cash 400 vs 600 -> Beta leads Gamma on cash
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot=3), 'edtech', true, 1, gen_random_uuid(), NULL);

RESET ROLE;
SELECT is((SELECT slot FROM public.room_standings((SELECT id FROM public.rooms)) WHERE rank = 1), 1::smallint, 'Rank 1 is the team with the most cash');
SELECT is((SELECT array_agg(slot ORDER BY rank, slot) FROM public.room_standings((SELECT id FROM public.rooms))), ARRAY[1,4,5,2,3]::smallint[], 'cash decides the order; equal cash teams (4 and 5) share a rank');
SELECT is((SELECT array_agg(rank ORDER BY slot) FROM public.room_standings((SELECT id FROM public.rooms))), ARRAY[1,4,5,2,2]::int[], 'rank() leaves a gap after a shared rank');

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000023", "role": "authenticated"}', true);
SELECT public.admin_set_bankrupt((SELECT id FROM public.teams WHERE slot=1), true, 1, gen_random_uuid(), 'Bankruptcy declared');
RESET ROLE;

SELECT is((SELECT slot FROM public.room_standings((SELECT id FROM public.rooms)) WHERE is_bankrupt = true), 1::smallint, 'Alpha is marked bankrupt and eliminated');
SELECT is((SELECT rank FROM public.room_standings((SELECT id FROM public.rooms)) WHERE slot = 1), 5, 'Eliminated team ranks below all active teams');
SELECT is((SELECT array_agg(slot ORDER BY slot) FROM public.room_standings((SELECT id FROM public.rooms)) WHERE rank = 1), ARRAY[4,5]::smallint[], 'tied leaders share rank 1 after the leader is eliminated');

SELECT * FROM finish();
ROLLBACK;
