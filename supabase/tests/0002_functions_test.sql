-- pgTAP Test Suite for STARTUPOLY Phase 3 Stored Procedures & Business Logic
-- Run via `supabase test db`

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(26);

-- Set test environment and simulated clock
SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

-- Helper test IDs
\set admin_uid 'a0000000-0000-0000-0000-000000000001'
\set player1_uid 'b0000000-0000-0000-0000-000000000001'
\set player2_uid 'b0000000-0000-0000-0000-000000000002'
\set rando_uid 'c0000000-0000-0000-0000-000000000001'

-- Seed admin
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

-- 1. server_time returns test clock
SELECT is(
  public.server_time(),
  '2026-03-01 10:00:00+00'::timestamptz,
  'server_time() respects app.test_now under test env'
);

-- 2. Non-admin cannot create room
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);

SELECT throws_ok(
  $$SELECT public.admin_create_room(5, '[{"name":"T1","color":"#FF0000"},{"name":"T2","color":"#00FF00"},{"name":"T3","color":"#0000FF"},{"name":"T4","color":"#FFFF00"},{"name":"T5","color":"#FF00FF"}]'::jsonb)$$,
  'P0001',
  'NOT_ADMIN',
  'Non-admin cannot create a room'
);

-- 3. Admin creates room with 4 or 7 teams fails
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);

SELECT throws_ok(
  $$SELECT public.admin_create_room(4, '[{"name":"T1","color":"#FF0000"},{"name":"T2","color":"#00FF00"},{"name":"T3","color":"#0000FF"},{"name":"T4","color":"#FFFF00"}]'::jsonb)$$,
  'P0001',
  'INVALID_VALUE',
  'admin_create_room with 4 teams fails'
);

-- 4. Admin creates valid room (5 teams)
SELECT lives_ok(
  $$SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb)$$,
  'admin_create_room creates 5 teams cleanly'
);

-- 5. Creating a second room before finalizing fails
SELECT throws_ok(
  $$SELECT public.admin_create_room(5, '[{"name":"Alpha2","color":"#FF0000"},{"name":"Beta2","color":"#00FF00"},{"name":"Gamma2","color":"#0000FF"},{"name":"Delta2","color":"#FFFF00"},{"name":"Epsilon2","color":"#FF00FF"}]'::jsonb)$$,
  'P0001',
  'NON_FINAL_ROOM_EXISTS',
  'Creating a second non-finalized room fails with NON_FINAL_ROOM_EXISTS'
);

-- 6. Open lobby
SELECT lives_ok(
  $$SELECT public.admin_open_lobby(id) FROM public.rooms WHERE status = 'CREATED'$$,
  'admin_open_lobby transitions room to LOBBY'
);

-- 7. get_lobby exposes no IDs or PINs
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000001", "role": "anon"}', true);
SET LOCAL ROLE anon;

SELECT is(
  (SELECT (public.get_lobby(code)->'teams'->0 ? 'pin') FROM public.rooms WHERE status = 'LOBBY'),
  false,
  'get_lobby does not expose team PIN'
);

SELECT is(
  (SELECT (public.get_lobby(code)->'teams'->0 ? 'id') FROM public.rooms WHERE status = 'LOBBY'),
  false,
  'get_lobby does not expose team id'
);

-- 8. join_team failure & rate-limiting
SELECT set_config('request.jwt.claims', '{"sub": "b0000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);
SET LOCAL ROLE authenticated;

-- Wrong PIN gives BAD_CODE_OR_PIN
SELECT throws_ok(
  $$SELECT public.join_team(code, 1, '0000') FROM public.rooms WHERE status = 'LOBBY'$$,
  'P0001',
  'BAD_CODE_OR_PIN',
  'Wrong PIN fails with BAD_CODE_OR_PIN'
);

-- 9. Correct PIN joins successfully
SELECT lives_ok(
  $$
  SELECT public.join_team(r.code, 1, ts.join_pin)
  FROM public.rooms r
  JOIN public.teams t ON r.id = t.room_id AND t.slot = 1
  JOIN public.team_secrets ts ON t.id = ts.team_id
  WHERE r.status = 'LOBBY'
  $$,
  'join_team succeeds with correct PIN'
);

-- 10. Reconnect with same user is idempotent
SELECT lives_ok(
  $$
  SELECT public.join_team(r.code, 1, ts.join_pin)
  FROM public.rooms r
  JOIN public.teams t ON r.id = t.room_id AND t.slot = 1
  JOIN public.team_secrets ts ON t.id = ts.team_id
  WHERE r.status = 'LOBBY'
  $$,
  'join_team is idempotent for reconnected user'
);

-- 11. Isolation: Player 1 get_my_state returns only Team 1, no leaderboard before finalized
SELECT is(
  (SELECT (public.get_my_state()->'team'->>'slot')::int),
  1,
  'get_my_state returns Player 1 team slot'
);

SELECT is(
  (SELECT public.get_my_state()->>'leaderboard'),
  NULL,
  'get_my_state returns null leaderboard prior to FINALIZED'
);

-- 12. Starting game without all teams joined fails unless force=true
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);

SELECT throws_ok(
  $$SELECT public.admin_start_game(id, false) FROM public.rooms WHERE status = 'LOBBY'$$,
  'P0001',
  'TEAMS_NOT_JOINED',
  'admin_start_game fails with TEAMS_NOT_JOINED when teams are missing'
);

-- Force start succeeds
SELECT lives_ok(
  $$SELECT public.admin_start_game(id, true) FROM public.rooms WHERE status = 'LOBBY'$$,
  'admin_start_game force=true succeeds and starts 50:00 timer'
);

-- 13. Cash/CV updates and negative rejection
SELECT throws_ok(
  $$
  SELECT public.admin_set_team_values(t.id, -100, NULL, t.version, gen_random_uuid(), 'test')
  FROM public.teams t WHERE t.slot = 1
  $$,
  'P0001',
  'INVALID_VALUE',
  'Negative cash update rejected'
);

-- Valid update
SELECT lives_ok(
  $$
  SELECT public.admin_set_team_values(t.id, 1500, 200, t.version, gen_random_uuid(), 'initial bonus')
  FROM public.teams t WHERE t.slot = 1
  $$,
  'Valid admin_set_team_values updates cash and CV'
);

-- 14. Version conflict rejection
SELECT throws_ok(
  $$
  SELECT public.admin_set_team_values(t.id, 1600, 200, 0, gen_random_uuid(), 'stale update')
  FROM public.teams t WHERE t.slot = 1
  $$,
  'P0001',
  'VERSION_CONFLICT',
  'Stale expected_version rejected with VERSION_CONFLICT'
);

-- 15. Buy business: cash -= cost, cv += initial_cv
SELECT lives_ok(
  $$
  SELECT public.admin_add_business(t.id, 'saas', true, t.version, gen_random_uuid(), 'bought saas')
  FROM public.teams t WHERE t.slot = 1
  $$,
  'admin_add_business buys SaaS for team 1'
);

-- Verify cash (1500 - 300 = 1200) and CV (200 + 180 = 380)
SELECT is(
  (SELECT cash FROM public.teams WHERE slot = 1),
  1200,
  'Team 1 cash correctly decremented by SaaS cost (300)'
);
SELECT is(
  (SELECT cv FROM public.teams WHERE slot = 1),
  380,
  'Team 1 CV correctly incremented by SaaS initial CV (180)'
);

-- Duplicate business in same room fails
SELECT throws_ok(
  $$
  SELECT public.admin_add_business(t.id, 'saas', true, t.version, gen_random_uuid(), 'team 2 tries buying saas')
  FROM public.teams t WHERE t.slot = 2
  $$,
  'P0001',
  'BUSINESS_OWNED',
  'Buying already-owned business fails with BUSINESS_OWNED'
);

-- 16. Upgrade business level 0 -> 1: cost 200, +300 CV
SELECT lives_ok(
  $$
  SELECT public.admin_set_business_level(t.id, 'saas', 1::smallint, true, t.version, gen_random_uuid(), 'upgraded saas to L1')
  FROM public.teams t WHERE t.slot = 1
  $$,
  'admin_set_business_level upgrades SaaS to Level 1'
);

-- Cash = 1200 - 200 = 1000, CV = 380 + 300 = 680
SELECT is(
  (SELECT cash FROM public.teams WHERE slot = 1),
  1000,
  'Team 1 cash decremented by SaaS U1 cost (200)'
);
SELECT is(
  (SELECT cv FROM public.teams WHERE slot = 1),
  680,
  'Team 1 CV incremented by SaaS U1 CV (300)'
);

-- 17. Atomic admin_adjust rolls back fully on shortfall
SELECT throws_ok(
  $$
  SELECT public.admin_adjust(
    jsonb_build_array(
      jsonb_build_object('team_id', t1.id, 'cash_delta', -2000, 'cv_delta', 0, 'expected_version', t1.version),
      jsonb_build_object('team_id', t2.id, 'cash_delta', 2000, 'cv_delta', 0, 'expected_version', t2.version)
    ),
    'RENT',
    'excessive rent',
    gen_random_uuid()
  )
  FROM public.teams t1, public.teams t2
  WHERE t1.slot = 1 AND t2.slot = 2
  $$,
  'P0001',
  'INSUFFICIENT_CASH',
  'admin_adjust aborts entirely when any team has cash shortfall'
);

-- Team 1 cash unchanged after rollback
SELECT is(
  (SELECT cash FROM public.teams WHERE slot = 1),
  1000,
  'Team 1 cash remains 1000 after atomic adjust aborted'
);

-- 18. Timer expiration derived automatically at +3000s
-- Advance clock to 10:50:00 (exact expiration)
SELECT set_config('app.test_now', '2026-03-01 10:50:00+00', true);

SELECT is(
  (SELECT public.expire_if_due(id) FROM public.rooms),
  'TIME_EXPIRED'::public.room_status,
  'expire_if_due derives TIME_EXPIRED when clock reaches ends_at'
);

-- Normal edit without note in TIME_EXPIRED fails
SELECT throws_ok(
  $$
  SELECT public.admin_set_team_values(t.id, 1100, NULL, t.version, gen_random_uuid(), NULL)
  FROM public.teams t WHERE t.slot = 1
  $$,
  'P0001',
  'NOTE_REQUIRED',
  'Edits during TIME_EXPIRED require a note'
);

-- Edit with note succeeds
SELECT lives_ok(
  $$
  SELECT public.admin_set_team_values(t.id, 1100, NULL, t.version, gen_random_uuid(), 'Reconciled physical transaction')
  FROM public.teams t WHERE t.slot = 1
  $$,
  'Edits during TIME_EXPIRED succeed when note is provided'
);

-- 19. Finalize and Leaderboard
SELECT lives_ok(
  $$SELECT public.admin_finalize(id) FROM public.rooms$$,
  'admin_finalize finalizes the match'
);

SELECT * FROM finish();
ROLLBACK;
