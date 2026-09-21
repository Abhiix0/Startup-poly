-- pgTAP Regression Suite: Admin Authorization & Security Hardening
-- Proves:
--   1. Every admin RPC rejects non-admin and anonymous callers with NOT_ADMIN.
--   2. Direct SELECT on sensitive tables (admins, team_secrets, activity_events) blocks non-admins.
--   3. Direct DML (INSERT/UPDATE/DELETE) on public.admins is forbidden to client roles.
--   4. JWT claim spoofing (user_metadata/app_metadata: {"role":"admin"}) does NOT grant is_admin().
--   5. Concurrent optimistic-lock conflicts are rejected with VERSION_CONFLICT.
-- Run via `supabase test db` or `npm run db:test`

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgtap;

-- ─── Plan ────────────────────────────────────────────────────────────────────
--  Part A: Authenticated-but-not-admin caller (16 RPCs = 16 tests)
--  Part B: Anonymous caller                   (16 RPCs = 16 tests)
--  Part C: Metadata spoofing prevention       (2 tests)
--  Part D: Table SELECT authorization         (4 tests)
--  Part E: Table DML prevention               (3 tests)
--  Part F: Optimistic-lock concurrency        (3 tests)
--
--  Total: 44 tests
-- ─────────────────────────────────────────────────────────────────────────────
SELECT plan(44);

SELECT set_config('app.env',      'test',                    true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

-- ─── Test identity UUIDs ─────────────────────────────────────────────────────
\set admin_uid     'a1000000-0000-0000-0000-000000000001'
\set admin2_uid    'a2000000-0000-0000-0000-000000000002'
\set nonadmin_uid  'd0000000-0000-0000-0000-000000000001'
\set dummy_room    'e0000000-0000-0000-0000-000000000001'
\set dummy_team    'f0000000-0000-0000-0000-000000000001'
\set dummy_req_id  '99000000-0000-0000-0000-000000000001'

-- Seed admin user rows
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES 
  (:'admin_uid', 'authz-admin@test.local', now(), now()),
  (:'admin2_uid', 'authz-admin2@test.local', now(), now())
ON CONFLICT DO NOTHING;

INSERT INTO public.admins (user_id)
VALUES 
  (:'admin_uid'),
  (:'admin2_uid')
ON CONFLICT DO NOTHING;

-- Seed non-admin authenticated user (in auth.users, NOT in public.admins)
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (:'nonadmin_uid', 'authz-nonadmin@test.local', now(), now())
ON CONFLICT DO NOTHING;


-- ─── Part A: Authenticated non-admin caller ───────────────────────────────────
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

-- A-07  admin_adjust
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

-- A-15  list_history
SELECT throws_ok(
  $$SELECT public.list_history()$$,
  'P0001', 'NOT_ADMIN',
  'A-15: non-admin: list_history raises NOT_ADMIN'
);

-- A-16  get_history_detail
SELECT throws_ok(
  $$SELECT public.get_history_detail('e0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'A-16: non-admin: get_history_detail raises NOT_ADMIN'
);


-- ─── Part B: Anonymous caller ────────────────────────────────────────────────
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

-- B-15  list_history
SELECT throws_ok(
  $$SELECT public.list_history()$$,
  'P0001', 'NOT_ADMIN',
  'B-15: anon: list_history raises NOT_ADMIN'
);

-- B-16  get_history_detail
SELECT throws_ok(
  $$SELECT public.get_history_detail('e0000000-0000-0000-0000-000000000001'::uuid)$$,
  'P0001', 'NOT_ADMIN',
  'B-16: anon: get_history_detail raises NOT_ADMIN'
);


-- ─── Part C: Metadata Claim Spoofing Prevention ──────────────────────────────
-- User provides forged user_metadata / app_metadata claiming admin role,
-- but user_id is NOT in public.admins. is_admin() MUST return false.
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub": "d0000000-0000-0000-0000-000000000001", "role": "authenticated", "user_metadata": {"role": "admin"}, "app_metadata": {"role": "admin"}}',
  true
);

SELECT is(
  public.is_admin(),
  false,
  'C-01: JWT claiming user_metadata={"role":"admin"} yields is_admin() = false when not in public.admins'
);

SELECT throws_ok(
  $$SELECT public.list_history()$$,
  'P0001', 'NOT_ADMIN',
  'C-02: JWT metadata spoofing fails admin RPC execution'
);


-- ─── Part D: Direct Table SELECT Authorization ───────────────────────────────
-- Non-admin cannot view sensitive tables
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub": "d0000000-0000-0000-0000-000000000001", "role": "authenticated"}',
  true
);

SELECT is_empty(
  $$SELECT * FROM public.admins$$,
  'D-01: non-admin SELECT on public.admins returns 0 rows'
);

SELECT is_empty(
  $$SELECT * FROM public.team_secrets$$,
  'D-02: non-admin SELECT on public.team_secrets returns 0 rows'
);

SELECT is_empty(
  $$SELECT * FROM public.activity_events$$,
  'D-03: non-admin SELECT on public.activity_events returns 0 rows'
);

-- Admin can SELECT only their own row in public.admins
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub": "a1000000-0000-0000-0000-000000000001", "role": "authenticated"}',
  true
);

SELECT is(
  (SELECT count(*)::int FROM public.admins),
  1,
  'D-04: admin can SELECT only their own row in public.admins (RLS isolates admin rows)'
);


-- ─── Part E: Direct Table DML Prevention ─────────────────────────────────────
-- Direct INSERT/UPDATE/DELETE on public.admins must be denied by grants
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub": "a1000000-0000-0000-0000-000000000001", "role": "authenticated"}',
  true
);

SELECT throws_ok(
  $$INSERT INTO public.admins (user_id) VALUES ('d0000000-0000-0000-0000-000000000001')$$,
  '42501', NULL,
  'E-01: direct INSERT on public.admins raises permission denied'
);

SELECT throws_ok(
  $$UPDATE public.admins SET user_id = 'd0000000-0000-0000-0000-000000000001' WHERE user_id = 'a1000000-0000-0000-0000-000000000001'$$,
  '42501', NULL,
  'E-02: direct UPDATE on public.admins raises permission denied'
);

SELECT throws_ok(
  $$DELETE FROM public.admins WHERE user_id = 'a1000000-0000-0000-0000-000000000001'$$,
  '42501', NULL,
  'E-03: direct DELETE on public.admins raises permission denied'
);


-- ─── Part F: Optimistic Concurrency Locking ──────────────────────────────────
-- Setup room as admin
SET LOCAL ROLE authenticated;
SELECT set_config(
  'request.jwt.claims',
  '{"sub": "a1000000-0000-0000-0000-000000000001", "role": "authenticated"}',
  true
);

DO $$
DECLARE
  v_room_id uuid;
BEGIN
  SELECT (public.admin_create_room(5,
    '[{"name":"ConcA","color":"#111111"},{"name":"ConcB","color":"#222222"},
      {"name":"ConcC","color":"#333333"},{"name":"ConcD","color":"#444444"},
      {"name":"ConcE","color":"#555555"}]'::jsonb))->>'id'
  INTO v_room_id;

  PERFORM set_config('test.conc_room_id', v_room_id::text, true);
END;
$$;

SELECT public.admin_open_lobby(current_setting('test.conc_room_id')::uuid);
SELECT public.admin_start_game(current_setting('test.conc_room_id')::uuid, true);

-- F-01: First write succeeds at version 0
SELECT lives_ok(
  $$SELECT public.admin_set_team_values(
      t.id, 1200, NULL, t.version,
      gen_random_uuid(),
      NULL
  )
  FROM public.teams t
  WHERE t.room_id = current_setting('test.conc_room_id')::uuid
    AND t.slot = 1$$,
  'F-01: first concurrent admin write (version 0) succeeds'
);

-- F-02: Stale write (version 0 again) raises VERSION_CONFLICT
SELECT throws_ok(
  $$SELECT public.admin_set_team_values(
      t.id, 1300, NULL,
      0,
      gen_random_uuid(),
      NULL
  )
  FROM public.teams t
  WHERE t.room_id = current_setting('test.conc_room_id')::uuid
    AND t.slot = 1$$,
  'P0001', 'VERSION_CONFLICT',
  'F-02: stale concurrent write raises VERSION_CONFLICT'
);

-- F-03: Team cash preserved after conflict
SELECT is(
  (SELECT cash
   FROM public.teams
   WHERE room_id = current_setting('test.conc_room_id')::uuid
     AND slot = 1),
  1200,
  'F-03: rejected concurrent write leaves team cash unchanged at 1200'
);

SELECT * FROM finish();
ROLLBACK;
