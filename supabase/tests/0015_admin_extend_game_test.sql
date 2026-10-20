BEGIN;
SELECT plan(6);

-- 1. Create room and start it
SELECT throws_ok(
  $$ SELECT public.admin_extend_game('00000000-0000-0000-0000-000000000000'::uuid, 600) $$,
  'NOT_ADMIN',
  'admin_extend_game requires admin role'
);

-- Mock admin role
SELECT tests.authenticate_as_admin();

-- Create test room
SELECT tests.create_test_room('ROOMEX', 5) AS room_id \gset

-- Lobby room cannot be extended (must be active or expired)
SELECT throws_ok(
  format('SELECT public.admin_extend_game(%L::uuid, 600)', :'room_id'),
  'INVALID_TRANSITION',
  'Cannot extend a room that has not been started'
);

-- Start room
SELECT public.admin_start_game(:'room_id'::uuid);

-- Room is now ACTIVE
SELECT is(
  (SELECT status FROM public.rooms WHERE id = :'room_id'::uuid),
  'ACTIVE'::public.room_status,
  'Room is active'
);

-- Host extends active game by 10 minutes (600s)
SELECT lives_ok(
  format('SELECT public.admin_extend_game(%L::uuid, 600)', :'room_id'),
  'Host can extend active game by 600s'
);

-- Check activity event
SELECT is(
  (SELECT count(*)::int FROM public.activity_events WHERE room_id = :'room_id'::uuid AND type = 'GAME_EXTENDED'),
  1,
  'GAME_EXTENDED activity event recorded'
);

-- Test extending when TIME_EXPIRED: force room to TIME_EXPIRED
UPDATE public.rooms SET status = 'TIME_EXPIRED', ends_at = public.app_now() - interval '1 second' WHERE id = :'room_id'::uuid;

-- Host extends expired game by 10 minutes (600s)
SELECT lives_ok(
  format('SELECT public.admin_extend_game(%L::uuid, 600)', :'room_id'),
  'Host can extend TIME_EXPIRED game back to ACTIVE'
);

SELECT * FROM finish();
ROLLBACK;
