-- Phase 7: ranking rules (docs/SCORING_RULES.md), final snapshot, and immutability after FINALIZED.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(32);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid 'a0000000-0000-0000-0000-00000000000d'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES (:'admin_uid', 'final-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-00000000000d", "role": "authenticated"}', true);

SELECT public.admin_create_room(5, '[{"name":"A","color":"#FF0000"},{"name":"B","color":"#00FF00"},{"name":"C","color":"#0000FF"},{"name":"D","color":"#FFFF00"},{"name":"E","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);
-- Two businesses for team 1 so the snapshot has content
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 1), 'saas', true, 0, gen_random_uuid(), NULL);
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 1), 'edtech', true, 1, gen_random_uuid(), NULL);

-- Ranking is evaluated as the table owner on controlled team values (the live RPCs are tested elsewhere).
RESET ROLE;
CREATE TEMP TABLE scen (n int, slot int, cv int, cash int, bankrupt bool, ord int) ON COMMIT DROP;

CREATE OR REPLACE FUNCTION pg_temp.apply(p_n int) RETURNS void LANGUAGE sql AS $$
  UPDATE public.teams t SET cv = s.cv, cash = s.cash, is_bankrupt = s.bankrupt, tiebreak_order = s.ord
  FROM scen s WHERE s.n = p_n AND s.slot = t.slot;
$$;
CREATE OR REPLACE FUNCTION pg_temp.order_of(p_slots int[]) RETURNS int[] LANGUAGE sql AS $$
  SELECT array_agg(t.slot ORDER BY s.rank) FROM public.room_standings((SELECT id FROM public.rooms)) s JOIN public.teams t ON t.id = s.team_id
$$;
CREATE OR REPLACE FUNCTION pg_temp.unresolved() RETURNS int[] LANGUAGE sql AS $$
  SELECT coalesce(array_agg(t.slot ORDER BY t.slot), '{}') FROM public.room_standings((SELECT id FROM public.rooms)) s JOIN public.teams t ON t.id = s.team_id WHERE s.tie_unresolved
$$;

-- S1 distinct CV
INSERT INTO scen VALUES (1,1,500,0,false,NULL),(1,2,900,0,false,NULL),(1,3,100,0,false,NULL),(1,4,700,0,false,NULL),(1,5,300,0,false,NULL);
SELECT pg_temp.apply(1);
SELECT is(pg_temp.order_of(NULL), ARRAY[2,4,1,5,3], 'CV: higher company value ranks first');
-- S2 CV tie, cash decides
INSERT INTO scen VALUES (2,1,500,300,false,NULL),(2,2,500,900,false,NULL),(2,3,100,0,false,NULL),(2,4,100,0,false,NULL),(2,5,50,0,false,NULL);
SELECT pg_temp.apply(2);
SELECT is((pg_temp.order_of(NULL))[1:2], ARRAY[2,1], 'cash breaks a CV tie');
-- S3 CV and cash tie, business count decides (team 1 owns 2 businesses, team 2 none) -- set values equal
INSERT INTO scen VALUES (3,1,500,300,false,NULL),(3,2,500,300,false,NULL),(3,3,100,0,false,NULL),(3,4,90,0,false,NULL),(3,5,50,0,false,NULL);
SELECT pg_temp.apply(3);
SELECT is((pg_temp.order_of(NULL))[1:2], ARRAY[1,2], 'business count breaks a CV and cash tie (team 1 holds two)');
SELECT is(pg_temp.unresolved(), '{}'::int[], 'no tie remains once business count separates them');
-- S4 three-way full tie (no businesses involved: slots 3,4,5 own none)
INSERT INTO scen VALUES (4,1,900,0,false,NULL),(4,2,800,0,false,NULL),(4,3,100,50,false,NULL),(4,4,100,50,false,NULL),(4,5,100,50,false,NULL);
SELECT pg_temp.apply(4);
SELECT is(pg_temp.unresolved(), ARRAY[3,4,5], 'three-way tie is unresolved without a judged order');
-- S5 partial order
INSERT INTO scen VALUES (5,1,900,0,false,NULL),(5,2,800,0,false,NULL),(5,3,100,50,false,1),(5,4,100,50,false,2),(5,5,100,50,false,NULL);
SELECT pg_temp.apply(5);
SELECT is(pg_temp.unresolved(), ARRAY[3,4,5], 'a partial tiebreak order leaves the whole group unresolved');
-- S6 duplicate order values
INSERT INTO scen VALUES (6,1,900,0,false,NULL),(6,2,800,0,false,NULL),(6,3,100,50,false,1),(6,4,100,50,false,1),(6,5,100,50,false,2);
SELECT pg_temp.apply(6);
SELECT is(pg_temp.unresolved(), ARRAY[3,4,5], 'duplicate tiebreak orders leave the group unresolved');
-- S7 full distinct order
INSERT INTO scen VALUES (7,1,900,0,false,NULL),(7,2,800,0,false,NULL),(7,3,100,50,false,3),(7,4,100,50,false,1),(7,5,100,50,false,2);
SELECT pg_temp.apply(7);
SELECT is(pg_temp.unresolved(), '{}'::int[], 'a full distinct order resolves the tie');
SELECT is(pg_temp.order_of(NULL), ARRAY[1,2,4,5,3], 'ranks follow the judged order');
-- S8 bankrupt team with the best CV ranks last and cannot win
INSERT INTO scen VALUES (8,1,2000,0,true,NULL),(8,2,800,0,false,NULL),(8,3,700,0,false,NULL),(8,4,600,0,false,NULL),(8,5,500,0,false,NULL);
SELECT pg_temp.apply(8);
SELECT is((pg_temp.order_of(NULL))[5], 1, 'bankrupt team ranks last despite the highest CV');
SELECT is((SELECT t.slot::int FROM public.room_standings((SELECT id FROM public.rooms)) s JOIN public.teams t ON t.id = s.team_id WHERE s.rank = 1), 2, 'rank 1 is the best non-bankrupt team');

-- Move to the finishing position: real values, deadline passed, tie resolved
UPDATE public.teams SET cv = 100 * slot, cash = 100 * slot, is_bankrupt = false, tiebreak_order = NULL;
SELECT set_config('app.test_now', '2026-03-01 11:00:00+00', true);
SET LOCAL ROLE authenticated;
SELECT public.get_admin_snapshot((SELECT id FROM public.rooms));
SELECT throws_ok($$SELECT public.admin_abort_game((SELECT id FROM public.rooms), 'late')$$, 'P0001', 'ROOM_ALREADY_EXPIRED', 'expired room cannot be aborted');

-- All-bankrupt room: eliminated teams still need a judged order, and there is no winner
RESET ROLE;
UPDATE public.teams SET cv = 0, cash = 0, is_bankrupt = true, tiebreak_order = NULL;
SET LOCAL ROLE authenticated;
SELECT throws_ok($$SELECT public.admin_finalize((SELECT id FROM public.rooms))$$, 'P0001', 'UNRESOLVED_TIE', 'tied eliminated teams still need a judged order');
RESET ROLE;
UPDATE public.teams SET tiebreak_order = slot;
SELECT is(pg_temp.unresolved(), '{}'::int[], 'all-bankrupt: a judged order resolves the ranking');
SELECT is((SELECT count(*)::int FROM public.room_standings((SELECT id FROM public.rooms)) s WHERE s.rank = 1 AND NOT s.is_bankrupt), 0, 'all-bankrupt: nobody qualifies as winner (winner_team_id would be NULL)');
-- restore real, distinct values for the snapshot test (team 1 keeps its businesses)
UPDATE public.teams SET cv = 1000 - 100 * slot, cash = 500 + slot, is_bankrupt = false, tiebreak_order = NULL;
SET LOCAL ROLE authenticated;

-- Finalize once and capture the digest of everything a history page shows
SELECT lives_ok($$SELECT public.admin_finalize((SELECT id FROM public.rooms), gen_random_uuid())$$, 'finalize succeeds');
RESET ROLE;
SELECT id AS old_room FROM public.rooms WHERE status = 'FINALIZED' \gset
SET LOCAL ROLE authenticated;
SELECT md5(public.get_history_detail(:'old_room'::uuid)::text) AS digest_before \gset
SELECT md5(string_agg(to_jsonb(r)::text, '|' ORDER BY r.team_id)) AS fr_before FROM public.final_results r WHERE r.room_id = :'old_room'::uuid \gset

SELECT is((SELECT count(*)::int FROM public.final_result_businesses WHERE room_id = :'old_room'::uuid), 2, 'snapshot stores both businesses of team 1');
SELECT is(public.get_history_detail(:'old_room'::uuid)->>'snapshot_available', 'true', 'history reports the snapshot as available');
SELECT is((SELECT count(*)::int FROM jsonb_array_elements(public.get_history_detail(:'old_room'::uuid)->'businesses')), 2, 'history detail lists the snapshotted businesses');

-- Catalog edit after the fact must not change history
RESET ROLE;
UPDATE public.business_catalog SET cost = cost + 1000, initial_cv = initial_cv + 1000;
SET LOCAL ROLE authenticated;
SELECT is(md5(public.get_history_detail(:'old_room'::uuid)::text), :'digest_before', 'history detail is unchanged after a catalog edit');
SELECT is((SELECT cost FROM public.final_result_businesses WHERE business_key = 'saas' AND room_id = :'old_room'::uuid), 300, 'snapshot keeps the catalog cost from finalization time');

-- Nothing can reopen or edit a finalized match
SELECT throws_ok($$SELECT public.admin_abort_game((SELECT id FROM public.rooms WHERE status = 'FINALIZED'), 'x')$$, 'P0001', 'INVALID_TRANSITION', 'FINALIZED: abort refused');
SELECT throws_ok($$SELECT public.admin_release_team((SELECT id FROM public.teams WHERE slot = 1))$$, 'P0001', 'ROOM_NOT_EDITABLE', 'FINALIZED: release refused');
SELECT throws_ok($$SELECT public.admin_set_tiebreak((SELECT id FROM public.rooms WHERE status = 'FINALIZED'), ARRAY(SELECT id FROM public.teams), 'x')$$, 'P0001', 'ROOM_NOT_EDITABLE', 'FINALIZED: tiebreak refused');
RESET ROLE;
SELECT throws_ok($$UPDATE public.teams SET cash = 1$$, 'P0001', NULL, 'FINALIZED: teams rows are immutable');
SELECT throws_ok($$UPDATE public.rooms SET winner_team_id = NULL$$, 'P0001', NULL, 'FINALIZED: rooms row is immutable');
SELECT throws_ok($$DELETE FROM public.team_businesses$$, 'P0001', NULL, 'FINALIZED: team_businesses are immutable');
SELECT throws_ok($$DELETE FROM public.final_results$$, 'P0001', 'IMMUTABLE', 'final_results is append-only');
SELECT throws_ok($$UPDATE public.activity_events SET note = 'x'$$, 'P0001', 'IMMUTABLE', 'activity_events is append-only');
SELECT throws_ok($$UPDATE public.final_result_businesses SET level = 0$$, 'P0001', 'IMMUTABLE', 'final_result_businesses is append-only');

-- Next match: create, play, and the old match stays byte-identical
SET LOCAL ROLE authenticated;
SELECT public.admin_create_room(5, '[{"name":"N1","color":"#111111"},{"name":"N2","color":"#222222"},{"name":"N3","color":"#333333"},{"name":"N4","color":"#444444"},{"name":"N5","color":"#555555"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms WHERE status = 'CREATED'));
SELECT public.admin_start_game((SELECT id FROM public.rooms WHERE status = 'LOBBY'), true);
SELECT public.admin_set_team_values((SELECT t.id FROM public.teams t JOIN public.rooms r ON r.id = t.room_id WHERE r.status = 'ACTIVE' AND t.slot = 1), 4000, 100, 0, gen_random_uuid(), NULL);
SELECT is(md5(public.get_history_detail(:'old_room'::uuid)::text), :'digest_before', 'old match history is identical after the next match is created and played');
RESET ROLE;
SELECT is((SELECT md5(string_agg(to_jsonb(r)::text, '|' ORDER BY r.team_id)) FROM public.final_results r WHERE r.room_id = :'old_room'::uuid), :'fr_before', 'old final_results are identical after the next match');

SELECT * FROM finish();
ROLLBACK;
