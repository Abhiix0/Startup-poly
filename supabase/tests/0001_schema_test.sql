-- pgTAP Test Suite for STARTUPOLY Phase 2 Database Schema, Constraints, Triggers & RLS
-- Run via `supabase test db`

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

SELECT plan(22);

-- 1. Catalog Seed Test
SELECT results_eq(
  'SELECT count(*)::int FROM public.business_catalog',
  ARRAY[10],
  'Business catalog contains exactly 10 seeded businesses'
);

SELECT results_eq(
  'SELECT count(*)::int FROM public.business_catalog WHERE is_provisional = true',
  ARRAY[4],
  'Business catalog contains exactly 4 provisional businesses'
);

-- 2. Room Constraints
-- Bad code format (contains invalid char or wrong length)
SELECT throws_ok(
  $$INSERT INTO public.rooms (code, team_count) VALUES ('INV01!', 6)$$,
  '23514',
  NULL,
  'Room code with invalid characters or format is rejected'
);

-- Bad team count (< 5 or > 6)
SELECT throws_ok(
  $$INSERT INTO public.rooms (code, team_count) VALUES ('ROOM04', 4)$$,
  '23514',
  NULL,
  'Room with team_count 4 is rejected'
);

SELECT throws_ok(
  $$INSERT INTO public.rooms (code, team_count) VALUES ('ROOM07', 7)$$,
  '23514',
  NULL,
  'Room with team_count 7 is rejected'
);

-- Setup test data: Create first active room
INSERT INTO public.rooms (id, code, status, team_count)
VALUES ('11111111-1111-1111-1111-111111111111', 'ABC234', 'CREATED', 6);

-- Second active room rejected (only one non-finalized room allowed)
SELECT throws_ok(
  $$INSERT INTO public.rooms (code, team_count) VALUES ('XYZ567', 6)$$,
  '23505',
  NULL,
  'Second active/non-finalized room is rejected by partial unique index'
);

-- 3. Team Constraints
-- Slot 7 rejected
SELECT throws_ok(
  $$INSERT INTO public.teams (room_id, slot, name, color) VALUES ('11111111-1111-1111-1111-111111111111', 7, 'Team 7', '#FF0000')$$,
  '23514',
  NULL,
  'Team slot 7 is rejected'
);

-- Invalid color format
SELECT throws_ok(
  $$INSERT INTO public.teams (room_id, slot, name, color) VALUES ('11111111-1111-1111-1111-111111111111', 1, 'Team 1', 'invalid')$$,
  '23514',
  NULL,
  'Team color with invalid hex format is rejected'
);

-- Negative cash/cv
SELECT throws_ok(
  $$INSERT INTO public.teams (room_id, slot, name, color, cash) VALUES ('11111111-1111-1111-1111-111111111111', 1, 'Team 1', '#FF0000', -100)$$,
  '23514',
  NULL,
  'Negative cash is rejected'
);

SELECT throws_ok(
  $$INSERT INTO public.teams (room_id, slot, name, color, cv) VALUES ('11111111-1111-1111-1111-111111111111', 1, 'Team 1', '#FF0000', -50)$$,
  '23514',
  NULL,
  'Negative CV is rejected'
);

-- Insert valid teams
INSERT INTO public.teams (id, room_id, slot, name, color, cash, cv)
VALUES 
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 1, 'Team Alpha', '#FF0000', 1000, 0),
  ('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 2, 'Team Beta', '#00FF00', 1000, 0);

-- 4. Business Constraints & Cap Trigger
-- Level 3 rejected
SELECT throws_ok(
  $$INSERT INTO public.team_businesses (room_id, team_id, business_key, level) VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'saas', 3)$$,
  '23514',
  NULL,
  'Business level 3 is rejected'
);

-- Add businesses for Team Alpha
INSERT INTO public.team_businesses (room_id, team_id, business_key, level)
VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'saas', 0);

-- Duplicate business in the same room rejected
SELECT throws_ok(
  $$INSERT INTO public.team_businesses (room_id, team_id, business_key, level) VALUES ('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'saas', 0)$$,
  '23505',
  NULL,
  'Duplicate business ownership in the same room is rejected'
);

-- Add 2nd and 3rd business for Team Alpha
INSERT INTO public.team_businesses (room_id, team_id, business_key, level)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'edtech', 0),
  ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'fintech', 0);

-- 4th business for team rejected by trigger
SELECT throws_ok(
  $$INSERT INTO public.team_businesses (room_id, team_id, business_key, level) VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'ecommerce', 0)$$,
  'P0001',
  'BUSINESS_CAP',
  'Trigger blocks 4th business for a team with BUSINESS_CAP'
);

-- 5. Lifecycle Transitions & Room Immutability
-- Valid forward transition CREATED -> LOBBY
UPDATE public.rooms SET status = 'LOBBY' WHERE id = '11111111-1111-1111-1111-111111111111';

-- Invalid backward transition LOBBY -> CREATED
SELECT throws_ok(
  $$UPDATE public.rooms SET status = 'CREATED' WHERE id = '11111111-1111-1111-1111-111111111111'$$,
  'P0001',
  'INVALID_TRANSITION',
  'Backward status transition is rejected with INVALID_TRANSITION'
);

-- Progress to FINALIZED: LOBBY -> ACTIVE -> TIME_EXPIRED -> FINALIZED
UPDATE public.rooms SET status = 'ACTIVE', started_at = now() WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.rooms SET status = 'TIME_EXPIRED', ends_at = now() WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.rooms SET status = 'FINALIZED', finalized_at = now() WHERE id = '11111111-1111-1111-1111-111111111111';

-- Modifications to teams in FINALIZED room rejected
SELECT throws_ok(
  $$UPDATE public.teams SET cash = 2000 WHERE id = '22222222-2222-2222-2222-222222222222'$$,
  'P0001',
  'ROOM_FINALIZED',
  'Updates to teams in a FINALIZED room are rejected with ROOM_FINALIZED'
);

-- Updates to room after FINALIZED rejected
SELECT throws_ok(
  $$UPDATE public.rooms SET tiebreak_note = 'late note' WHERE id = '11111111-1111-1111-1111-111111111111'$$,
  'P0001',
  'ROOM_FINALIZED',
  'Updates to a room after status FINALIZED are rejected with ROOM_FINALIZED'
);

-- 6. Append-Only Immutability on activity_events & final_results
INSERT INTO public.activity_events (room_id, type)
VALUES ('11111111-1111-1111-1111-111111111111', 'GAME_FINALIZED');

SELECT throws_ok(
  $$DELETE FROM public.activity_events WHERE room_id = '11111111-1111-1111-1111-111111111111'$$,
  'P0001',
  'IMMUTABLE',
  'Deleting activity_events is rejected with IMMUTABLE'
);

INSERT INTO public.final_results (room_id, team_id, rank, cv, cash, business_count, is_bankrupt)
VALUES ('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1, 0, 1000, 3, false);

SELECT throws_ok(
  $$UPDATE public.final_results SET rank = 2 WHERE room_id = '11111111-1111-1111-1111-111111111111'$$,
  'P0001',
  'IMMUTABLE',
  'Updating final_results is rejected with IMMUTABLE'
);

-- 7. RLS & Permissions Tests
-- Unclaimed anonymous user sees 0 teams
SET LOCAL ROLE anon;
SET LOCAL "request.jwt.claims" = '{"sub": "00000000-0000-0000-0000-000000000001", "role": "anon"}';

SELECT results_eq(
  'SELECT count(*)::int FROM public.teams',
  ARRAY[0],
  'Unclaimed anonymous user sees 0 teams'
);

-- Direct client INSERT rejected for anonymous user
SELECT throws_ok(
  $$INSERT INTO public.teams (room_id, slot, name, color) VALUES ('11111111-1111-1111-1111-111111111111', 5, 'Hacker', '#000000')$$,
  '42501',
  NULL,
  'Direct INSERT on teams is denied for anonymous user'
);

-- Unclaimed anonymous user can read business catalog
SELECT results_eq(
  'SELECT count(*)::int FROM public.business_catalog',
  ARRAY[10],
  'Anonymous user can read business catalog'
);

SELECT * FROM finish();
ROLLBACK;
