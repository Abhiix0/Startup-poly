-- Test suite for Migration 0024: Admin Extend Game
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(6);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

-- 1. Unauthenticated call fails with NOT_ADMIN
SELECT throws_ok(
  $$SELECT public.admin_extend_game('00000000-0000-0000-0000-000000000000'::uuid, 600)$$,
  'P0001',
  'NOT_ADMIN',
  'admin_extend_game requires admin role'
);

-- Mock admin role
\set admin_uid 'a0000000-0000-0000-0000-000000000025'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'extend-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000025", "role": "authenticated"}', true);

-- Create test room
SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb);

-- Lobby room cannot be extended (must be active or expired)
SELECT throws_ok(
  $$SELECT public.admin_extend_game((SELECT id FROM public.rooms), 600)$$,
  'P0001',
  'INVALID_TRANSITION',
  'Cannot extend a room that has not been started'
);

-- Open lobby and start room
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

-- Room is now ACTIVE
SELECT is(
  (SELECT status FROM public.rooms),
  'ACTIVE'::public.room_status,
  'Room is active'
);

-- Host extends active game by 10 minutes (600s)
SELECT lives_ok(
  $$SELECT public.admin_extend_game((SELECT id FROM public.rooms), 600)$$,
  'Host can extend active game by 600s'
);

-- Check activity event
SELECT is(
  (SELECT count(*)::int FROM public.activity_events WHERE room_id = (SELECT id FROM public.rooms) AND type = 'GAME_EXTENDED'),
  1,
  'GAME_EXTENDED activity event recorded'
);

-- Test extending when TIME_EXPIRED: force room to TIME_EXPIRED
RESET ROLE;
UPDATE public.rooms SET status = 'TIME_EXPIRED', ends_at = public.app_now() - interval '1 second';
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000025", "role": "authenticated"}', true);

-- Host extends expired game by 10 minutes (600s)
SELECT lives_ok(
  $$SELECT public.admin_extend_game((SELECT id FROM public.rooms), 600)$$,
  'Host can extend TIME_EXPIRED game back to ACTIVE'
);

SELECT * FROM finish();
ROLLBACK;
