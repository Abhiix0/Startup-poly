-- Company Value is gone from the schema and every payload; teams tied on all ranking criteria finalize with no single winner.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(8);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

SELECT is(
  (SELECT count(*)::int FROM information_schema.columns WHERE table_schema = 'public' AND column_name ~* 'cv'),
  0, 'no public column mentions cv');

\set admin_uid 'a0000000-0000-0000-0000-000000000029'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'nocv-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000029", "role": "authenticated"}', true);

SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);
RESET ROLE; UPDATE public.teams SET board_position = 3 WHERE slot = 1; SET LOCAL ROLE authenticated;
SELECT ok(public.admin_add_business((SELECT id FROM public.teams WHERE slot = 1), 'saas', true, 0, gen_random_uuid(), NULL)::text !~* '"[a-z_]*cv[a-z_]*"', 'team snapshot returned by a money RPC has no cv key');

SELECT ok(public.get_admin_snapshot((SELECT id FROM public.rooms))::text !~* '"[a-z_]*cv[a-z_]*"', 'admin snapshot has no cv key');
SELECT ok(public.get_standings((SELECT id FROM public.rooms))::text !~* '"[a-z_]*cv[a-z_]*"', 'standings have no cv key');

-- Slots 2-5 stay at 1000 with no business (shared rank 2); slots 1 and 2 are made equal below for a shared first place.
SELECT public.admin_remove_business((SELECT id FROM public.teams WHERE slot = 1), 'saas', 'CORRECTION', false, 1, gen_random_uuid(), 'reset for tie');
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot = 1), 1500, 2, gen_random_uuid(), NULL);
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot = 2), 1500, 0, gen_random_uuid(), NULL);

SELECT set_config('app.test_now', '2026-03-01 10:55:00+00', true);
SELECT public.expire_if_due(id) FROM public.rooms;
SELECT lives_ok($$SELECT public.admin_finalize(id) FROM public.rooms$$, 'finalize needs no judged order when teams tie');
SELECT is((SELECT winner_team_id FROM public.rooms), NULL::uuid, 'teams sharing first place leave winner_team_id NULL');
SELECT is((SELECT count(*)::int FROM public.final_results WHERE rank = 1), 2, 'both tied teams are stored with rank 1');
SELECT ok(public.get_history_detail((SELECT id FROM public.rooms))::text !~* '"[a-z_]*cv[a-z_]*"', 'history detail has no cv key');

SELECT * FROM finish();
ROLLBACK;
