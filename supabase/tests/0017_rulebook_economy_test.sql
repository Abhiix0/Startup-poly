-- Migration 0028: approved upgrade costs and the 2-business cap.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(5);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

SELECT is(
  (SELECT string_agg(key || ':' || u1_cost || '/' || u2_cost, ',' ORDER BY key) FROM public.business_catalog),
  'ai_deeptech:250/300,cleantech:250/300,cybersecurity:200/250,devtools:150/200,ecommerce:150/200,edtech:100/150,fintech:200/250,healthtech:200/250,robotics:250/300,saas:150/200',
  'catalog upgrade costs match the approved table'
);

\set admin_uid 'a0000000-0000-0000-0000-000000000028'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'rules-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000028", "role": "authenticated"}', true);

SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot=1), 'edtech', true, 0, gen_random_uuid(), NULL);
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot=1), 'saas', true, 1, gen_random_uuid(), NULL);

SELECT throws_ok(
  $$SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot=1), 'fintech', true, 2, gen_random_uuid(), NULL)$$,
  'P0001', 'BUSINESS_CAP', 'RPC rejects a third business'
);
SELECT throws_ok(
  $$SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot=1), 'fintech', false, 2, gen_random_uuid(), 'free')$$,
  'P0001', 'BUSINESS_CAP', 'RPC rejects a free third business'
);

SELECT is((SELECT count(*)::int FROM public.team_businesses WHERE team_id = (SELECT id FROM public.teams WHERE slot=1)), 2, 'team still owns exactly 2 businesses');

SELECT public.admin_set_business_level((SELECT id FROM public.teams WHERE slot=1), 'edtech', 1::smallint, true, 2, gen_random_uuid(), NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot=1), 1000 - 200 - 300 - 100, 'EdTech upgrade 1 charges 100');

SELECT * FROM finish();
ROLLBACK;
