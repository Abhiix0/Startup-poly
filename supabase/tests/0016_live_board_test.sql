-- Persistent admin live-board positions and movement RPC.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(8);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-10-27 12:00:00+00', true);

SELECT throws_ok(
  $$SELECT public.admin_move_team('00000000-0000-0000-0000-000000000000'::uuid, 1, 0)$$,
  'P0001', 'NOT_ADMIN', 'move requires an admin'
);

\set admin_uid 'a0000000-0000-0000-0000-000000000027'
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (:'admin_uid', 'board-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000027", "role": "authenticated"}', true);

SELECT public.admin_create_room(5, '[
  {"name":"Alpha","color":"#E52521"}, {"name":"Beta","color":"#22B14C"},
  {"name":"Gamma","color":"#00AEEF"}, {"name":"Delta","color":"#FFCC00"},
  {"name":"Epsilon","color":"#A855F7"}
]'::jsonb);

SELECT is((SELECT count(*)::int FROM public.teams WHERE board_position = 0), 5, 'all teams begin on START');
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

SELECT lives_ok($$SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 6, 0, '00000000-0000-0000-0000-000000000027'::uuid)$$, 'admin moves a token');
SELECT is((SELECT board_position FROM public.teams WHERE slot = 1), 6::smallint, 'position is persisted');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type = 'TEAM_MOVED'), 1, 'movement is recorded in the audit trail');

SELECT lives_ok($$SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 6, 0, '00000000-0000-0000-0000-000000000027'::uuid)$$, 'same request safely replays');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type = 'TEAM_MOVED'), 1, 'replay does not create a duplicate move');
SELECT throws_ok($$SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 7, 1)$$, 'P0001', 'INVALID_VALUE', 'only normal dice rolls are accepted');

SELECT * FROM finish();
ROLLBACK;
