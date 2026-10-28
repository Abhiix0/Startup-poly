-- Phase 3: lifecycle idempotency, abort-after-deadline, initial-state guard, expire_if_due exposure.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(21);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid 'a0000000-0000-0000-0000-000000000008'
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (:'admin_uid', 'lifecycle-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000008", "role": "authenticated"}', true);

CREATE TEMP TABLE ids (k text PRIMARY KEY, v uuid) ON COMMIT DROP;
GRANT ALL ON ids TO authenticated;
INSERT INTO ids VALUES ('open', gen_random_uuid()), ('start', gen_random_uuid()), ('fin', gen_random_uuid()), ('other', gen_random_uuid());

SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb);

-- open_lobby: replay returns the room, one event
SELECT lives_ok($$SELECT public.admin_open_lobby((SELECT id FROM public.rooms), (SELECT v FROM ids WHERE k='open'))$$, 'open_lobby first call');
SELECT lives_ok($$SELECT public.admin_open_lobby((SELECT id FROM public.rooms), (SELECT v FROM ids WHERE k='open'))$$, 'open_lobby replay with same request_id succeeds');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type = 'LOBBY_OPENED'), 1, 'open_lobby replay wrote one LOBBY_OPENED event');

-- start: pristine-state guard
RESET ROLE;
UPDATE public.teams SET cash = 500 WHERE slot = 1;
SET LOCAL ROLE authenticated;
SELECT throws_ok($$SELECT public.admin_start_game((SELECT id FROM public.rooms), true)$$, 'P0001', 'INVALID_INITIAL_STATE', 'start refuses a lobby team that is not at baseline');
RESET ROLE;
UPDATE public.teams SET cash = 1000 WHERE slot = 1;
SET LOCAL ROLE authenticated;

-- start: idempotent and one transition
SELECT lives_ok($$SELECT public.admin_start_game((SELECT id FROM public.rooms), true, (SELECT v FROM ids WHERE k='start'))$$, 'start first call');
CREATE TEMP TABLE first_start ON COMMIT DROP AS SELECT started_at, ends_at FROM public.rooms;
GRANT ALL ON first_start TO authenticated;
SELECT lives_ok($$SELECT public.admin_start_game((SELECT id FROM public.rooms), true, (SELECT v FROM ids WHERE k='start'))$$, 'start replay with same request_id succeeds');
SELECT is((SELECT started_at FROM public.rooms), (SELECT started_at FROM first_start), 'start replay keeps started_at');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type = 'GAME_STARTED'), 1, 'exactly one GAME_STARTED event');
SELECT is((SELECT note FROM public.activity_events WHERE type = 'GAME_STARTED'), 'Gameplay started. 50:00 countdown active.', 'start note derives from duration_seconds');
SELECT throws_ok($$SELECT public.admin_start_game((SELECT id FROM public.rooms), true, (SELECT v FROM ids WHERE k='other'))$$, 'P0001', 'INVALID_TRANSITION', 'start with a new request_id on an ACTIVE room is INVALID_TRANSITION');
SELECT throws_ok($$SELECT public.admin_start_game((SELECT id FROM public.rooms), true, (SELECT v FROM ids WHERE k='open'))$$, 'P0001', 'REQUEST_ID_REUSED', 'a lobby-open request_id cannot be replayed as start');

-- L2: abort after the deadline is refused and nothing is wiped
SELECT public.admin_set_team_values((SELECT id FROM public.teams WHERE slot = 1), 1500, (SELECT version FROM public.teams WHERE slot = 1), gen_random_uuid(), NULL);
SELECT set_config('app.test_now', '2026-03-01 11:00:00+00', true);
SELECT throws_ok($$SELECT public.admin_abort_game((SELECT id FROM public.rooms), 'too late')$$, 'P0001', 'ROOM_ALREADY_EXPIRED', 'abort after deadline raises ROOM_ALREADY_EXPIRED');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type = 'GAME_ABORTED'), 0, 'refused abort wrote no GAME_ABORTED event');
SELECT is((SELECT cash FROM public.teams WHERE slot = 1), 1500, 'refused abort kept the team cash');

-- finalize is idempotent
SELECT lives_ok($$SELECT public.admin_finalize((SELECT id FROM public.rooms), (SELECT v FROM ids WHERE k='fin'))$$, 'finalize first call');
SELECT is(public.admin_finalize((SELECT id FROM public.rooms), (SELECT v FROM ids WHERE k='fin'))->>'winner_team_id', (SELECT winner_team_id::text FROM public.rooms), 'finalize replay returns the original winner');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type = 'GAME_FINALIZED'), 1, 'exactly one GAME_FINALIZED event');
SELECT throws_ok($$SELECT public.admin_finalize((SELECT id FROM public.rooms), (SELECT v FROM ids WHERE k='other'))$$, 'P0001', 'INVALID_TRANSITION', 'finalize twice with different request_ids is INVALID_TRANSITION');

-- expire_if_due exposure
SELECT ok(NOT has_function_privilege('anon', 'public.expire_if_due(uuid)', 'EXECUTE'), 'anon cannot EXECUTE expire_if_due');
SELECT ok(has_function_privilege('authenticated', 'public.expire_if_due(uuid)', 'EXECUTE'), 'authenticated keeps EXECUTE on expire_if_due');
SELECT ok(NOT has_function_privilege('authenticated', 'public.lifecycle_replay_check(uuid,uuid,text)', 'EXECUTE'), 'replay helper is not callable by clients');

SELECT * FROM finish();
ROLLBACK;
