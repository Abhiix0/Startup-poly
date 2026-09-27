-- pgTAP Test Suite for STARTUPOLY admin_abort_game Reset Behavior
-- Run via `supabase test db`

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(15);

-- Set test environment and simulated clock
SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

-- Helper test IDs
\set admin_uid 'a0000000-0000-0000-0000-000000000001'
\set player1_uid 'b0000000-0000-0000-0000-000000000001'

-- Seed admin
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

-- Authenticate as admin
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);

-- 1. Create a 5-team room
SELECT lives_ok(
  $$SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb)$$,
  'Admin creates 5-team tournament room'
);

-- Open lobby
SELECT lives_ok(
  $$SELECT public.admin_open_lobby(id) FROM public.rooms WHERE status = 'CREATED'$$,
  'Admin opens lobby'
);

-- Force start the game
SELECT lives_ok(
  $$SELECT public.admin_start_game(id, true) FROM public.rooms WHERE status = 'LOBBY'$$,
  'Admin starts match (force=true)'
);

-- Confirm room is ACTIVE
SELECT is(
  (SELECT status FROM public.rooms LIMIT 1),
  'ACTIVE'::public.room_status,
  'Room status is ACTIVE'
);

-- 2. Mutate team 1: cash, CV, and business
SELECT lives_ok(
  $$
  SELECT public.admin_set_team_values(t.id, 1500, 300, t.version, gen_random_uuid(), NULL)
  FROM public.teams t WHERE t.slot = 1
  $$,
  'Update Team 1 cash to 1500 and CV to 300'
);

SELECT lives_ok(
  $$
  SELECT public.admin_add_business(t.id, 'food_truck', true, t.version, gen_random_uuid(), NULL)
  FROM public.teams t WHERE t.slot = 1
  $$,
  'Team 1 buys food_truck business'
);

-- Verify Team 1 has business and modified cash/CV
SELECT is(
  (SELECT count(*)::int FROM public.team_businesses tb JOIN public.teams t ON tb.team_id = t.id WHERE t.slot = 1),
  1,
  'Team 1 has 1 business before abort'
);

-- 3. Calling admin_abort_game with empty / NULL note throws NOTE_REQUIRED
SELECT throws_ok(
  $$SELECT public.admin_abort_game(id, NULL) FROM public.rooms$$,
  'P0001',
  'NOTE_REQUIRED',
  'admin_abort_game rejects NULL note with NOTE_REQUIRED'
);

SELECT throws_ok(
  $$SELECT public.admin_abort_game(id, '   ') FROM public.rooms$$,
  'P0001',
  'NOTE_REQUIRED',
  'admin_abort_game rejects whitespace-only note with NOTE_REQUIRED'
);

-- 4. Calling admin_abort_game with valid note succeeds
SELECT lives_ok(
  $$SELECT public.admin_abort_game(id, 'Accidental match start by organizer') FROM public.rooms$$,
  'admin_abort_game succeeds with valid note'
);

-- 5. Assert room state reverted to LOBBY with NULL timers
SELECT is(
  (SELECT status FROM public.rooms LIMIT 1),
  'LOBBY'::public.room_status,
  'Room status is reverted to LOBBY'
);

SELECT is(
  (SELECT started_at FROM public.rooms LIMIT 1),
  NULL::timestamptz,
  'started_at is NULL after abort'
);

SELECT is(
  (SELECT ends_at FROM public.rooms LIMIT 1),
  NULL::timestamptz,
  'ends_at is NULL after abort'
);

-- 6. Assert all teams are reset to starting baseline (cash=1000, cv=0, bankrupt=false, tiebreak=NULL, zero businesses)
SELECT is(
  (SELECT count(*)::int FROM public.teams WHERE cash = 1000 AND cv = 0 AND is_bankrupt = false AND tiebreak_order IS NULL),
  5,
  'All 5 teams reset to cash=1000, cv=0, is_bankrupt=false, tiebreak_order=NULL'
);

SELECT is(
  (SELECT count(*)::int FROM public.team_businesses),
  0,
  'All team_businesses removed after abort'
);

-- 7. Starting the game again works cleanly from the reset baseline
SELECT lives_ok(
  $$SELECT public.admin_start_game(id, true) FROM public.rooms WHERE status = 'LOBBY'$$,
  'Room can be started again cleanly after abort'
);

SELECT * FROM finish();
ROLLBACK;
