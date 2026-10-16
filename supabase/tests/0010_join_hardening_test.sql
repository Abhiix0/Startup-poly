-- Phase 5: failed join attempts persist and throttle per user / team / unknown code; legit joins pass.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(13);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid 'a0000000-0000-0000-0000-00000000000b'
INSERT INTO auth.users (id, email, created_at, updated_at)
VALUES (:'admin_uid', 'join-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;
-- Players c0…001 .. c0…060
INSERT INTO auth.users (id, email, created_at, updated_at)
SELECT ('c0000000-0000-0000-0000-' || lpad(i::text, 12, '0'))::uuid, 'join-p' || i || '@test.local', now(), now()
FROM generate_series(1, 60) i ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-00000000000b", "role": "authenticated"}', true);

SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));

SELECT r.code AS code,
       (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 1) AS pin1,
       (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 2) AS pin2,
       (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 3) AS pin3,
       (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 4) AS pin4,
       (SELECT ts.join_pin FROM public.team_secrets ts JOIN public.teams t ON t.id = ts.team_id WHERE t.room_id = r.id AND t.slot = 5) AS pin5
FROM public.rooms r WHERE r.status = 'LOBBY' \gset
SELECT set_config('app.t_code', :'code', true);

-- Legit: slots 2..5 each claimed by a different phone with the right PIN, all within the same instant
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000022", "role": "authenticated"}', true);
SELECT public.join_team(:'code', 2, :'pin2');
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000023", "role": "authenticated"}', true);
SELECT public.join_team(:'code', 3, :'pin3');
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000024", "role": "authenticated"}', true);
SELECT public.join_team(:'code', 4, :'pin4');
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000025", "role": "authenticated"}', true);
SELECT is(public.join_team(:'code', 5, :'pin5')->>'team_id' IS NOT NULL, true, 'legit phones join with the right PIN');
RESET ROLE;
SELECT is((SELECT count(*)::int FROM public.team_claims), 4, 'four legit claims were created');
SET LOCAL ROLE authenticated;

-- N1: a wrong PIN is now recorded and counted per user (it used to be rolled back by the RAISE)
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000001", "role": "authenticated"}', true);
SELECT is((SELECT count(*)::int FROM (SELECT public.join_team(:'code', 1, '0000')->>'error' AS e FROM generate_series(1, 5)) x WHERE e = 'BAD_CODE_OR_PIN'), 5, 'five wrong PINs return BAD_CODE_OR_PIN');
RESET ROLE;
SELECT is((SELECT count(*)::int FROM public.join_attempts WHERE user_id = 'c0000000-0000-0000-0000-000000000001' AND success = false), 5, 'all five failures were persisted');
SET LOCAL ROLE authenticated;
SELECT throws_ok(format('SELECT public.join_team(%L, 1, %L)', :'code', :'pin1'), 'P0001', 'TOO_MANY_ATTEMPTS', 'sixth attempt is throttled even with the right PIN');

-- Target throttle: ten different sessions guess slot 1; the next session is locked out with the correct PIN
DO $$
DECLARE i int;
BEGIN
  FOR i IN 11..19 LOOP
    PERFORM set_config('request.jwt.claims', json_build_object('sub', 'c0000000-0000-0000-0000-' || lpad(i::text, 12, '0'), 'role', 'authenticated')::text, true);
    BEGIN
      PERFORM public.join_team(current_setting('app.t_code'), 1, '1111');
    EXCEPTION WHEN OTHERS THEN NULL; -- sessions past the team limit are rejected: that is the point
    END;
  END LOOP;
END $$;
RESET ROLE;
SELECT is((SELECT count(*)::int FROM public.join_attempts ja JOIN public.teams t ON t.id = ja.team_id WHERE t.slot = 1 AND ja.success = false), 10, 'team 1 stops recording at the 10-failure limit');
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000041", "role": "authenticated"}', true);
SELECT throws_ok(format('SELECT public.join_team(%L, 1, %L)', :'code', :'pin1'), 'P0001', 'TOO_MANY_ATTEMPTS', 'a team under attack rejects even the correct PIN');

-- Unknown room codes are logged against a hash
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000042", "role": "authenticated"}', true);
SELECT is(public.join_team('ZZZZZZ', 1, '0000')->>'error', 'BAD_CODE_OR_PIN', 'unknown room code returns BAD_CODE_OR_PIN');
RESET ROLE;
SELECT is((SELECT count(*)::int FROM public.join_attempts WHERE room_id IS NULL AND code_hash IS NOT NULL), 1, 'unknown code attempt stored with a hash, not the code');
SET LOCAL ROLE authenticated;

-- Release: old phone loses access, cannot come back with a wrong PIN, and the right PIN still works
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-00000000000b", "role": "authenticated"}', true);
SELECT public.admin_release_team((SELECT id FROM public.teams WHERE slot = 2));
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000022", "role": "authenticated"}', true);
SELECT ok(public.get_my_state() IS NULL, 'released phone can no longer read team state');
SELECT is(public.join_team(:'code', 2, '0000')->>'error', 'BAD_CODE_OR_PIN', 'released phone cannot rejoin without the PIN');
SELECT is(public.join_team(:'code', 2, :'pin2')->>'team_id' IS NOT NULL, true, 'released phone rejoins with the PIN');

-- Retention: old attempts are pruned in bounded batches
RESET ROLE;
INSERT INTO public.join_attempts (user_id, team_id, success, attempted_at)
SELECT 'c0000000-0000-0000-0000-000000000050', NULL, false, '2026-03-01 08:00:00+00' FROM generate_series(1, 150);
SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "c0000000-0000-0000-0000-000000000051", "role": "authenticated"}', true);
SELECT public.join_team('ZZZZZZ', 1, '0000');
RESET ROLE;
SELECT is((SELECT count(*)::int FROM public.join_attempts WHERE attempted_at < '2026-03-01 09:00:00+00'), 50, 'one join prunes at most 100 stale attempts');

SELECT * FROM finish();
ROLLBACK;
