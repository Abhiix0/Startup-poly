-- Phase 7: ranking rules (cash, then owned purchase cost, then upgrades; ties share a rank; docs/SCORING_RULES.md), final snapshot, and immutability after FINALIZED.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(27);

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
RESET ROLE; UPDATE public.teams SET board_position = 3 WHERE slot = 1; SET LOCAL ROLE authenticated;
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 1), 'saas', true, 0, gen_random_uuid(), NULL);
RESET ROLE; UPDATE public.teams SET board_position = 10 WHERE slot = 1; SET LOCAL ROLE authenticated;
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 1), 'edtech', true, 1, gen_random_uuid(), NULL);

-- Ranking is evaluated as the table owner on controlled team values (the live RPCs are tested elsewhere).
-- Team 1 owns saas (300) + edtech (200) from above; every other team starts with no business.
RESET ROLE;
CREATE TEMP TABLE scen (n int, slot int, cash int, bankrupt bool) ON COMMIT DROP;

CREATE OR REPLACE FUNCTION pg_temp.apply(p_n int) RETURNS void LANGUAGE sql AS $$
  UPDATE public.teams t SET cash = s.cash, is_bankrupt = s.bankrupt
  FROM scen s WHERE s.n = p_n AND s.slot = t.slot;
$$;
CREATE OR REPLACE FUNCTION pg_temp.order_of() RETURNS int[] LANGUAGE sql AS $$
  SELECT array_agg(t.slot ORDER BY s.rank, t.slot) FROM public.room_standings((SELECT id FROM public.rooms)) s JOIN public.teams t ON t.id = s.team_id
$$;
CREATE OR REPLACE FUNCTION pg_temp.ranks_by_slot() RETURNS int[] LANGUAGE sql AS $$
  SELECT array_agg(s.rank ORDER BY t.slot) FROM public.room_standings((SELECT id FROM public.rooms)) s JOIN public.teams t ON t.id = s.team_id
$$;

-- S1 distinct cash decides
INSERT INTO scen VALUES (1,1,500,false),(1,2,900,false),(1,3,100,false),(1,4,700,false),(1,5,300,false);
SELECT pg_temp.apply(1);
SELECT is(pg_temp.order_of(), ARRAY[2,4,1,5,3], 'cash: higher cash ranks first');
-- S2 cash tie: higher total original purchase cost of owned businesses decides (team 1 owns 500 worth)
INSERT INTO scen VALUES (2,1,500,false),(2,2,500,false),(2,3,100,false),(2,4,90,false),(2,5,50,false);
SELECT pg_temp.apply(2);
SELECT is((pg_temp.order_of())[1:2], ARRAY[1,2], 'owned purchase cost breaks a cash tie');
SELECT is(pg_temp.ranks_by_slot(), ARRAY[1,2,3,4,5], 'no shared rank once the criteria separate the teams');
-- S3 cash and purchase cost tie: more upgrades decide (slots 3 and 4 each own one 300 business, slot 4 upgraded once)
INSERT INTO public.team_businesses (room_id, team_id, business_key, level)
SELECT t.room_id, t.id, CASE t.slot WHEN 3 THEN 'devtools' ELSE 'ecommerce' END, CASE t.slot WHEN 3 THEN 0 ELSE 1 END
FROM public.teams t WHERE t.slot IN (3, 4);
INSERT INTO scen VALUES (3,1,900,false),(3,2,800,false),(3,3,100,false),(3,4,100,false),(3,5,50,false);
SELECT pg_temp.apply(3);
SELECT is(pg_temp.order_of(), ARRAY[1,2,4,3,5], 'upgrade count breaks a cash and purchase-cost tie');
DELETE FROM public.team_businesses WHERE team_id IN (SELECT id FROM public.teams WHERE slot IN (3, 4));
-- S4 full tie shares a rank (no pitch, no judged order)
INSERT INTO scen VALUES (4,1,900,false),(4,2,800,false),(4,3,100,false),(4,4,100,false),(4,5,100,false);
SELECT pg_temp.apply(4);
SELECT is(pg_temp.ranks_by_slot(), ARRAY[1,2,3,3,3], 'teams equal on all three criteria share a rank');
-- S5 more upgrades never outrank more cash
INSERT INTO scen VALUES (5,1,100,false),(5,2,800,false),(5,3,700,false),(5,4,600,false),(5,5,500,false);
SELECT pg_temp.apply(5);
SELECT is((pg_temp.order_of())[5], 1, 'owning businesses does not beat more cash');
-- S6 bankrupt team with the best cash ranks last and cannot win
INSERT INTO scen VALUES (6,1,2000,true),(6,2,800,false),(6,3,700,false),(6,4,600,false),(6,5,500,false);
SELECT pg_temp.apply(6);
SELECT is((pg_temp.order_of())[5], 1, 'bankrupt team ranks last despite the highest cash');
SELECT is((SELECT t.slot::int FROM public.room_standings((SELECT id FROM public.rooms)) s JOIN public.teams t ON t.id = s.team_id WHERE s.rank = 1), 2, 'rank 1 is the best non-bankrupt team');

-- Move to the finishing position: real values, deadline passed
UPDATE public.teams SET cash = 100 * slot, is_bankrupt = false;
SELECT set_config('app.test_now', '2026-03-01 11:00:00+00', true);
SET LOCAL ROLE authenticated;
SELECT public.get_admin_snapshot((SELECT id FROM public.rooms));
SELECT throws_ok($$SELECT public.admin_abort_game((SELECT id FROM public.rooms), 'late')$$, 'P0001', 'ROOM_ALREADY_EXPIRED', 'expired room cannot be aborted');

-- All-bankrupt room: nobody can win, and finalize needs no judged order
RESET ROLE;
UPDATE public.teams SET cash = 0, is_bankrupt = true;
SELECT is(pg_temp.ranks_by_slot(), ARRAY[1,2,2,2,2], 'all-bankrupt: eliminated teams with equal cash and no businesses share a rank');
SELECT is((SELECT count(*)::int FROM public.room_standings((SELECT id FROM public.rooms)) s WHERE s.rank = 1 AND NOT s.is_bankrupt), 0, 'all-bankrupt: nobody qualifies as winner (winner_team_id would be NULL)');
-- restore real, distinct values for the snapshot test (team 1 keeps its businesses)
UPDATE public.teams SET cash = 500 + slot, is_bankrupt = false;
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
UPDATE public.business_catalog SET cost = cost + 1000;
SET LOCAL ROLE authenticated;
SELECT is(md5(public.get_history_detail(:'old_room'::uuid)::text), :'digest_before', 'history detail is unchanged after a catalog edit');
SELECT is((SELECT cost FROM public.final_result_businesses WHERE business_key = 'saas' AND room_id = :'old_room'::uuid), 300, 'snapshot keeps the catalog cost from finalization time');

-- Nothing can reopen or edit a finalized match
SELECT throws_ok($$SELECT public.admin_abort_game((SELECT id FROM public.rooms WHERE status = 'FINALIZED'), 'x')$$, 'P0001', 'INVALID_TRANSITION', 'FINALIZED: abort refused');
SELECT throws_ok($$SELECT public.admin_release_team((SELECT id FROM public.teams WHERE slot = 1))$$, 'P0001', 'ROOM_NOT_EDITABLE', 'FINALIZED: release refused');
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
SELECT public.admin_set_team_values((SELECT t.id FROM public.teams t JOIN public.rooms r ON r.id = t.room_id WHERE r.status = 'ACTIVE' AND t.slot = 1), 4000, 0, gen_random_uuid(), NULL);
SELECT is(md5(public.get_history_detail(:'old_room'::uuid)::text), :'digest_before', 'old match history is identical after the next match is created and played');
RESET ROLE;
SELECT is((SELECT md5(string_agg(to_jsonb(r)::text, '|' ORDER BY r.team_id)) FROM public.final_results r WHERE r.room_id = :'old_room'::uuid), :'fr_before', 'old final_results are identical after the next match');

SELECT * FROM finish();
ROLLBACK;
