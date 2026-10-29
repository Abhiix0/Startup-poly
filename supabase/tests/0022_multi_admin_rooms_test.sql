-- Admins create rooms independently (migration 0032).
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(6);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  ('a0000000-0000-0000-0000-000000000041', 'multi-a@test.local', now(), now()),
  ('a0000000-0000-0000-0000-000000000042', 'multi-b@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES
  ('a0000000-0000-0000-0000-000000000041'), ('a0000000-0000-0000-0000-000000000042') ON CONFLICT DO NOTHING;

SELECT is((SELECT count(*)::int FROM pg_indexes WHERE indexname = 'idx_rooms_single_active'), 0, 'global single-active index is gone');
SELECT is((SELECT count(*)::int FROM pg_indexes WHERE indexname = 'idx_rooms_unique_active_code'), 1, 'per-code uniqueness index is kept');

-- (d) legacy non-final room with created_by NULL does not block an admin
INSERT INTO public.rooms (code, status, team_count, created_by) VALUES ('KLMNPQ', 'CREATED', 5, NULL);

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000041", "role": "authenticated"}', true);
SELECT lives_ok($$SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb)$$, 'admin A creates despite a created_by NULL room');

-- (b) same admin blocked
SELECT throws_ok($$SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb)$$,
  'P0001', 'NON_FINAL_ROOM_EXISTS', 'admin A second create still refused');

-- (a) other admin allowed
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000042", "role": "authenticated"}', true);
SELECT lives_ok($$SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb)$$, 'admin B creates while A has a non-final room');
RESET ROLE;
SELECT is((SELECT count(DISTINCT code)::int FROM public.rooms WHERE created_by IN ('a0000000-0000-0000-0000-000000000041','a0000000-0000-0000-0000-000000000042')), 2, 'two rooms, distinct codes');

SELECT * FROM finish();
ROLLBACK;
