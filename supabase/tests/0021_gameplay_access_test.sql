-- Access to the gameplay RPCs added in 0030, and shared board spaces.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(7);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

-- Non-admin and anon callers
SELECT throws_ok(
  $$SELECT public.admin_charge_rent('f0000000-0000-0000-0000-000000000001'::uuid, 'saas', 0, 0, '99000000-0000-0000-0000-000000000021'::uuid, 'x')$$,
  'P0001', 'NOT_ADMIN', 'non-admin: admin_charge_rent raises NOT_ADMIN');
SELECT throws_ok(
  $$SELECT public.admin_move_team('f0000000-0000-0000-0000-000000000001'::uuid, 2::smallint, 0, '99000000-0000-0000-0000-000000000022'::uuid)$$,
  'P0001', 'NOT_ADMIN', 'non-admin: admin_move_team raises NOT_ADMIN');

SET LOCAL ROLE anon;
SELECT throws_ok(
  $$SELECT public.admin_charge_rent('f0000000-0000-0000-0000-000000000001'::uuid, 'saas', 0, 0, NULL, NULL)$$,
  '42501', NULL, 'anon: admin_charge_rent is denied EXECUTE');
SELECT throws_ok(
  $$SELECT public.admin_move_team('f0000000-0000-0000-0000-000000000001'::uuid, 2::smallint, 0, NULL)$$,
  '42501', NULL, 'anon: admin_move_team is denied EXECUTE');
RESET ROLE;

-- Teams may share a space: tokens never block each other.
\set admin_uid 'a0000000-0000-0000-0000-000000000032'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'access-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000032", "role": "authenticated"}', true);
SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

SELECT lives_ok($$SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 3::smallint, 0, gen_random_uuid())$$, 'first team moves to space 3');
SELECT lives_ok($$SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 2), 3::smallint, 0, gen_random_uuid())$$, 'second team moves to the same space');
SELECT is((SELECT count(*)::int FROM public.teams WHERE board_position = 3), 2, 'two teams share one space');

SELECT * FROM finish();
ROLLBACK;
