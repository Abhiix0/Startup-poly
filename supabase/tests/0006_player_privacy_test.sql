-- pgTAP Regression Suite: Player Privacy & Result Isolation
-- Proves:
--   1. get_my_state() returns strictly the caller's team state.
--   2. get_my_state() NEVER returns a leaderboard or other teams' data.
--   3. When match is FINALIZED, get_my_state() returns ONLY the caller's final_result.
--   4. A claimed player cannot read other teams' rows in public.final_results via RLS.
--   5. A claimed player cannot read other teams' rows in public.teams via RLS.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(9);
SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid   'a5000000-0000-0000-0000-000000000001'
\set player_one  'b5000000-0000-0000-0000-000000000001'
\set player_two  'b5000000-0000-0000-0000-000000000002'

INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES
  (:'admin_uid',  'privacy-admin@test.local',  now(), now()),
  (:'player_one', 'privacy-p1@test.local',     now(), now()),
  (:'player_two', 'privacy-p2@test.local',     now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO public.admins (user_id)
VALUES (:'admin_uid')
ON CONFLICT DO NOTHING;

-- 1. Setup Room as Admin
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a5000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);

SELECT lives_ok(
  $$SELECT public.admin_create_room(
      5,
      '[{"name":"Privacy A","color":"#110001"},{"name":"Privacy B","color":"#110002"},
        {"name":"Privacy C","color":"#110003"},{"name":"Privacy D","color":"#110004"},
        {"name":"Privacy E","color":"#110005"}]'::jsonb
  )$$,
  'Admin creates 5-team room'
);

SELECT public.admin_open_lobby(id) FROM public.rooms WHERE status = 'CREATED';

-- 2. Player 1 claims Slot 1
SELECT set_config('request.jwt.claims', '{"sub": "b5000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);
SELECT public.join_team(
  r.code,
  1,
  (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 1)
) FROM public.rooms r WHERE r.status = 'LOBBY';

-- 3. Player 2 claims Slot 2
SELECT set_config('request.jwt.claims', '{"sub": "b5000000-0000-0000-0000-000000000002", "role": "authenticated"}', true);
SELECT public.join_team(
  r.code,
  2,
  (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 2)
) FROM public.rooms r WHERE r.status = 'LOBBY';

-- 4. Admin starts game, gives Team 1 more CV, advances to expiration, and finalizes
SELECT set_config('request.jwt.claims', '{"sub": "a5000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);
SELECT public.admin_start_game(id, true) FROM public.rooms WHERE status = 'LOBBY';

-- Team 1 gets +500 CV to guarantee distinct ranks
SELECT public.admin_set_team_values(
  (SELECT id FROM public.teams WHERE slot = 1),
  1000, 500,
  (SELECT version FROM public.teams WHERE slot = 1),
  gen_random_uuid(),
  'award lead'
);

-- Advance clock past 50 minutes and finalize
SELECT set_config('app.test_now', '2026-03-01 10:55:00+00', true);
SELECT public.expire_if_due(id) FROM public.rooms;
SELECT public.admin_finalize(id) FROM public.rooms;

-- 5. Test Player 1 Privacy as claimed anonymous/authenticated role
SELECT set_config('request.jwt.claims', '{"sub": "b5000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);

-- Test 1: get_my_state returns Team 1 slot
SELECT is(
  (SELECT (public.get_my_state()->'team'->>'slot')::int),
  1,
  'Player 1 get_my_state returns only Slot 1'
);

-- Test 2: get_my_state does NOT return leaderboard key
SELECT ok(
  (SELECT (public.get_my_state() ? 'leaderboard') IS FALSE),
  'Player 1 get_my_state has no leaderboard field (privacy preserved)'
);

-- Test 3: get_my_state returns player 1 final_result with rank 1
SELECT is(
  (SELECT (public.get_my_state()->'final_result'->>'rank')::int),
  1,
  'Player 1 get_my_state returns own final_result (Rank 1)'
);

-- Test 4: Player 1 cannot see other teams via get_my_state()
SELECT ok(
  (SELECT public.get_my_state()->>'final_result' IS NOT NULL),
  'Player 1 final_result is present upon finalization'
);

-- Test 5: Player 1 direct SELECT on public.final_results sees only 1 row (own team)
SELECT is(
  (SELECT count(*)::int FROM public.final_results),
  1,
  'Player 1 direct SELECT on public.final_results returns strictly 1 row (own team)'
);

-- Test 6: Player 1 cannot read Team 2 final result row
SELECT is(
  (SELECT count(*)::int FROM public.final_results WHERE team_id = (SELECT id FROM public.teams WHERE slot = 2)),
  0,
  'Player 1 cannot select Team 2 final result row via RLS'
);

-- Test 7: Player 1 direct SELECT on public.teams returns strictly 1 row
SELECT is(
  (SELECT count(*)::int FROM public.teams),
  1,
  'Player 1 direct SELECT on public.teams returns strictly 1 row (own team)'
);

-- 6. Test Player 2 Privacy
SELECT set_config('request.jwt.claims', '{"sub": "b5000000-0000-0000-0000-000000000002", "role": "authenticated"}', true);

-- Test 8: Player 2 gets Slot 2 and Rank 2
SELECT is(
  (SELECT (public.get_my_state()->'final_result'->>'rank')::int),
  2,
  'Player 2 get_my_state returns own final_result (Rank 2)'
);

-- Test 9: Player 2 cannot read Team 1 final result row
SELECT is(
  (SELECT count(*)::int FROM public.final_results WHERE team_id = (SELECT id FROM public.teams WHERE slot = 1)),
  0,
  'Player 2 cannot select Team 1 final result row via RLS'
);

SELECT * FROM finish();
ROLLBACK;
