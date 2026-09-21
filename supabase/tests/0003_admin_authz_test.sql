-- pgTAP Regression Suite: Admin RPC Authorization
-- Proves every admin_* RPC rejects non-admin and anonymous callers,
-- and that concurrent optimistic-lock conflicts are detected correctly.
-- Run via `supabase test db`

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

-- ─── Plan ────────────────────────────────────────────────────────────────────
--
--  Part A: authenticated-but-not-admin caller (14 RPCs × 1 = 14 tests)
--  Part B: anonymous / no session caller      (14 RPCs × 1 = 14 tests)
--  Part C: optimistic-lock concurrent admin session collision (3 tests)
--
--  Total: 31
-- ─────────────────────────────────────────────────────────────────────────────
SELECT plan(31);

SELECT set_config('app.env',      'test',                    true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

-- ─── Test identity UUIDs ─────────────────────────────────────────────────────
\set admin_uid     'a1000000-0000-0000-0000-000000000001'
\set nonadmin_uid  'd0000000-0000-0000-0000-000000000001'
\set dummy_room    'e0000000-0000-0000-0000-000000000001'
\set dummy_team    'f0000000-0000-0000-0000-000000000001'
\set dummy_req_id  '99000000-0000-0000-0000-000000000001'

-- Seed an admin user row (auth.users entry required for FK)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (:'admin_uid', 'authz-admin@test.local', now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO public.admins (user_id)
VALUES (:'admin_uid')
ON CONFLICT DO NOTHING;

-- Seed a non-admin authenticated user (auth.users row, NOT in public.admins)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (:'nonadmin_uid', 'authz-nonadmin@test.local', now(), now())
ON CONFLICT DO NOTHING;

-- ─── Part A: Authenticated non-admin caller ───────────────────────────────────
-- Impersonate the non-admin user exactly as 0002_functions_test.sql does for its
-- non-admin caller tests: SET LOCAL ROLE authenticated + set_config jwt claims.
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub": "d0000000-0000-0000-0000-000000000001", "role": "authenticated"}',
  true
);

-- A-01  admin_create_room
SELECT throws_ok(
  $$SELECT public.admin_create_room(5,
      '[{"name":"T1","color":"#FF0000"},{"name":"T2","color":"#00FF00"},
        {"name":"T3","color":"#0000FF"},{"name":"T4","color":"#FFFF00"},
        {"name":"T5","color":"#FF00FF"}]'::jsonb)$$,
  'P0001', 'NOT_ADMIN',
  'A-01: non-admin: admin_create_room raises NOT_ADMIN'
);

-- A-02  admin_update_team_config
SELECT throws_ok(
  $$SELECT public.admin_update_team_config(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      'NewName', '#AABBCC')$$,
  'P0001', 'NOT_ADMIN',
  'A-02: non-admin: admin_update_team_config raises NOT_ADMIN'
);

-- A-03  admin_open_lobby
SELECT throws_ok(
  $$SELECT public.admin_open_lobby(
      'e0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'A-03: non-admin: admin_open_lobby raises NOT_ADMIN'
);

-- A-04  admin_release_team
SELECT throws_ok(
  $$SELECT public.admin_release_team(
      'f0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'A-04: non-admin: admin_release_team raises NOT_ADMIN'
);

-- A-05  admin_start_game
SELECT throws_ok(
  $$SELECT public.admin_start_game(
      'e0000000-0000-0000-0000-000000000001'::uuid, false)$$,
  'P0001', 'NOT_ADMIN',
  'A-05: non-admin: admin_start_game raises NOT_ADMIN'
);

-- A-06  admin_set_team_values
SELECT throws_ok(
  $$SELECT public.admin_set_team_values(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      1000, 0, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test note')$$,
  'P0001', 'NOT_ADMIN',
  'A-06: non-admin: admin_set_team_values raises NOT_ADMIN'
);

-- A-07  admin_adjust  (changes array must be well-formed; NOT_ADMIN fires before parsing)
SELECT throws_ok(
  $$SELECT public.admin_adjust(
      jsonb_build_array(
        jsonb_build_object(
          'team_id',         'f0000000-0000-0000-0000-000000000001',
          'cash_delta',      100,
          'cv_delta',        0,
          'expected_version', 0
        )
      ),
      'RENT', 'authz test',
      '99000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'A-07: non-admin: admin_adjust raises NOT_ADMIN'
);

-- A-08  admin_add_business
SELECT throws_ok(
  $$SELECT public.admin_add_business(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      'saas', true, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'A-08: non-admin: admin_add_business raises NOT_ADMIN'
);

-- A-09  admin_set_business_level
SELECT throws_ok(
  $$SELECT public.admin_set_business_level(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      'saas', 1::smallint, true, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'A-09: non-admin: admin_set_business_level raises NOT_ADMIN'
);

-- A-10  admin_remove_business
SELECT throws_ok(
  $$SELECT public.admin_remove_business(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      'saas', 'FORCED_SALE', true, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'A-10: non-admin: admin_remove_business raises NOT_ADMIN'
);

-- A-11  admin_set_bankrupt
SELECT throws_ok(
  $$SELECT public.admin_set_bankrupt(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      true, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'A-11: non-admin: admin_set_bankrupt raises NOT_ADMIN'
);

-- A-12  admin_set_tiebreak
SELECT throws_ok(
  $$SELECT public.admin_set_tiebreak(
      'e0000000-0000-0000-0000-000000000001'::uuid,
      ARRAY['f0000000-0000-0000-0000-000000000001'::uuid],
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'A-12: non-admin: admin_set_tiebreak raises NOT_ADMIN'
);

-- A-13  get_admin_snapshot
SELECT throws_ok(
  $$SELECT public.get_admin_snapshot(
      'e0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'A-13: non-admin: get_admin_snapshot raises NOT_ADMIN'
);

-- A-14  admin_finalize
SELECT throws_ok(
  $$SELECT public.admin_finalize(
      'e0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'A-14: non-admin: admin_finalize raises NOT_ADMIN'
);


-- ─── Part B: Anonymous / unauthenticated session ─────────────────────────────
-- is_admin() returns false when auth.uid() is NULL (anon role has no sub claim).
-- Every admin RPC reaches the `IF NOT public.is_admin()` guard before touching
-- any data and raises NOT_ADMIN, identical to the authenticated-non-admin path.
SET LOCAL ROLE anon;
SELECT set_config(
  'request.jwt.claims',
  '{"role": "anon"}',
  true
);

-- B-01  admin_create_room
SELECT throws_ok(
  $$SELECT public.admin_create_room(5,
      '[{"name":"T1","color":"#FF0000"},{"name":"T2","color":"#00FF00"},
        {"name":"T3","color":"#0000FF"},{"name":"T4","color":"#FFFF00"},
        {"name":"T5","color":"#FF00FF"}]'::jsonb)$$,
  'P0001', 'NOT_ADMIN',
  'B-01: anon: admin_create_room raises NOT_ADMIN'
);

-- B-02  admin_update_team_config
SELECT throws_ok(
  $$SELECT public.admin_update_team_config(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      'NewName', '#AABBCC')$$,
  'P0001', 'NOT_ADMIN',
  'B-02: anon: admin_update_team_config raises NOT_ADMIN'
);

-- B-03  admin_open_lobby
SELECT throws_ok(
  $$SELECT public.admin_open_lobby(
      'e0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'B-03: anon: admin_open_lobby raises NOT_ADMIN'
);

-- B-04  admin_release_team
SELECT throws_ok(
  $$SELECT public.admin_release_team(
      'f0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'B-04: anon: admin_release_team raises NOT_ADMIN'
);

-- B-05  admin_start_game
SELECT throws_ok(
  $$SELECT public.admin_start_game(
      'e0000000-0000-0000-0000-000000000001'::uuid, false)$$,
  'P0001', 'NOT_ADMIN',
  'B-05: anon: admin_start_game raises NOT_ADMIN'
);

-- B-06  admin_set_team_values
SELECT throws_ok(
  $$SELECT public.admin_set_team_values(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      1000, 0, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test note')$$,
  'P0001', 'NOT_ADMIN',
  'B-06: anon: admin_set_team_values raises NOT_ADMIN'
);

-- B-07  admin_adjust
SELECT throws_ok(
  $$SELECT public.admin_adjust(
      jsonb_build_array(
        jsonb_build_object(
          'team_id',          'f0000000-0000-0000-0000-000000000001',
          'cash_delta',       100,
          'cv_delta',         0,
          'expected_version', 0
        )
      ),
      'RENT', 'authz test',
      '99000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'B-07: anon: admin_adjust raises NOT_ADMIN'
);

-- B-08  admin_add_business
SELECT throws_ok(
  $$SELECT public.admin_add_business(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      'saas', true, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'B-08: anon: admin_add_business raises NOT_ADMIN'
);

-- B-09  admin_set_business_level
SELECT throws_ok(
  $$SELECT public.admin_set_business_level(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      'saas', 1::smallint, true, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'B-09: anon: admin_set_business_level raises NOT_ADMIN'
);

-- B-10  admin_remove_business
SELECT throws_ok(
  $$SELECT public.admin_remove_business(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      'saas', 'FORCED_SALE', true, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'B-10: anon: admin_remove_business raises NOT_ADMIN'
);

-- B-11  admin_set_bankrupt
SELECT throws_ok(
  $$SELECT public.admin_set_bankrupt(
      'f0000000-0000-0000-0000-000000000001'::uuid,
      true, 0,
      '99000000-0000-0000-0000-000000000001'::uuid,
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'B-11: anon: admin_set_bankrupt raises NOT_ADMIN'
);

-- B-12  admin_set_tiebreak
SELECT throws_ok(
  $$SELECT public.admin_set_tiebreak(
      'e0000000-0000-0000-0000-000000000001'::uuid,
      ARRAY['f0000000-0000-0000-0000-000000000001'::uuid],
      'test')$$,
  'P0001', 'NOT_ADMIN',
  'B-12: anon: admin_set_tiebreak raises NOT_ADMIN'
);

-- B-13  get_admin_snapshot
SELECT throws_ok(
  $$SELECT public.get_admin_snapshot(
      'e0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'B-13: anon: get_admin_snapshot raises NOT_ADMIN'
);

-- B-14  admin_finalize
SELECT throws_ok(
  $$SELECT public.admin_finalize(
      'e0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'B-14: anon: admin_finalize raises NOT_ADMIN'
);


-- ─── Part C: Optimistic-lock collision between two concurrent admin sessions ──
-- Scenario: Two admin sessions read the same team at version V, both attempt to
-- write.  The first write increments version to V+1.  The second write presents
-- stale expected_version = V and must be rejected with VERSION_CONFLICT.
--
-- We simulate this within a single transaction by:
--   1. Creating a real room + team as admin A.
--   2. Capturing the initial version as V.
--   3. Performing a valid admin_set_team_values(expected_version = V) → succeeds.
--      Team version is now V+1.
--   4. Attempting admin_set_team_values again with the original V (stale) →
--      must raise VERSION_CONFLICT.
--
-- This exercises the same code path that two simultaneous browser sessions hit
-- when both read the snapshot, both see version = V, and the slower one loses.

-- Switch back to admin session for Part C
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub": "a1000000-0000-0000-0000-000000000001", "role": "authenticated"}',
  true
);

-- C-setup: create a fresh room as admin
DO $$
DECLARE
  v_room_id uuid;
BEGIN
  -- Create room; pick up its id for subsequent steps
  SELECT (public.admin_create_room(5,
    '[{"name":"ConcA","color":"#111111"},{"name":"ConcB","color":"#222222"},
      {"name":"ConcC","color":"#333333"},{"name":"ConcD","color":"#444444"},
      {"name":"ConcE","color":"#555555"}]'::jsonb))->>'id'
  INTO v_room_id;

  -- Store for the remaining Part-C assertions (GUC scoped to this transaction)
  PERFORM set_config('test.conc_room_id', v_room_id::text, true);
END;
$$;

-- Advance to ACTIVE so admin_set_team_values is permitted
SELECT public.admin_open_lobby(current_setting('test.conc_room_id')::uuid);
SELECT public.admin_start_game(current_setting('test.conc_room_id')::uuid, true);

-- C-01: First admin session write at version 0 succeeds
SELECT lives_ok(
  $$SELECT public.admin_set_team_values(
      t.id, 1200, NULL, t.version,
      gen_random_uuid(),
      NULL
  )
  FROM public.teams t
  WHERE t.room_id = current_setting('test.conc_room_id')::uuid
    AND t.slot = 1$$,
  'C-01: first concurrent admin write (version 0) succeeds'
);

-- C-02: Second admin session presents the same stale version → VERSION_CONFLICT
-- (version is now 1 after C-01; presenting 0 simulates the collision)
SELECT throws_ok(
  $$SELECT public.admin_set_team_values(
      t.id, 1300, NULL,
      0,            -- stale: first session already bumped this to 1
      gen_random_uuid(),
      NULL
  )
  FROM public.teams t
  WHERE t.room_id = current_setting('test.conc_room_id')::uuid
    AND t.slot = 1$$,
  'P0001', 'VERSION_CONFLICT',
  'C-02: stale concurrent write raises VERSION_CONFLICT'
);

-- C-03: After the collision the team''s cash is unchanged (rollback integrity)
SELECT is(
  (SELECT cash
   FROM public.teams
   WHERE room_id = current_setting('test.conc_room_id')::uuid
     AND slot = 1),
  1200,
  'C-03: rejected concurrent write leaves team cash unchanged at 1200'
);

SELECT * FROM finish();
ROLLBACK;
