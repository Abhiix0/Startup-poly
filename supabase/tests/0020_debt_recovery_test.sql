-- Migration 0031: persistent Debt Recovery, half-price forced sales, debt-first incoming cash, ineligible-in-debt ranking.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(20);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid 'a0000000-0000-0000-0000-000000000031'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'debt-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000031", "role": "authenticated"}', true);
SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

-- Slot 2 owns EdTech (cost 200); slot 1 owns nothing.
RESET ROLE;
INSERT INTO public.team_businesses (room_id, team_id, business_key, level)
SELECT t.room_id, t.id, 'edtech', 0 FROM public.teams t WHERE t.slot = 2;
UPDATE public.teams SET cash = 100 WHERE slot IN (1, 2);
SET LOCAL ROLE authenticated;

-- ------------------------------------------------------------ payments and debt
SELECT public.admin_adjust(jsonb_build_array(jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot = 1), 'cash_delta', -300, 'expected_version', 0)), 'CRISIS', 'tax', gen_random_uuid());
SELECT is((SELECT cash || '/' || debt FROM public.teams WHERE slot = 1), '0/200', 'a team with nothing to sell pays what it has and owes the rest');
SELECT is((SELECT (new->>'debt')::int FROM public.activity_events WHERE type = 'ADJUSTMENT' ORDER BY id DESC LIMIT 1), 200, 'the audit event records the debt');

SELECT throws_ok(
  $$SELECT public.admin_adjust(jsonb_build_array(jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot = 2), 'cash_delta', -300, 'expected_version', 0)), 'CRISIS', 'tax', gen_random_uuid())$$,
  'P0001', 'INSUFFICIENT_CASH', 'a team that still owns a business must force-sell before an unaffordable payment');
SELECT is((SELECT cash || '/' || debt FROM public.teams WHERE slot = 2), '100/0', 'a refused payment changes nothing and creates no debt');

-- --------------------------------------------------- incoming money clears debt first
SELECT public.admin_adjust(jsonb_build_array(jsonb_build_object('team_id', (SELECT id FROM public.teams WHERE slot = 1), 'cash_delta', 50, 'expected_version', 1)), 'BONUS', 'small win', gen_random_uuid());
SELECT is((SELECT cash || '/' || debt FROM public.teams WHERE slot = 1), '0/150', 'a small credit goes entirely to debt');

RESET ROLE; UPDATE public.teams SET board_position = 22 WHERE slot = 1; SET LOCAL ROLE authenticated;
SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 4::smallint, (SELECT version FROM public.teams WHERE slot = 1), gen_random_uuid());
SELECT is((SELECT cash || '/' || debt FROM public.teams WHERE slot = 1), '50/0', 'START (200) clears 150 of debt first and the remainder is cash');

RESET ROLE; UPDATE public.teams SET board_position = 22, cash = 0, debt = 500 WHERE slot = 1; SET LOCAL ROLE authenticated;
SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 4::smallint, (SELECT version FROM public.teams WHERE slot = 1), gen_random_uuid());
SELECT is((SELECT cash || '/' || debt FROM public.teams WHERE slot = 1), '0/300', 'START smaller than the debt leaves the rest owed and no cash');

-- ------------------------------------------------------ restrictions while in debt
SELECT throws_ok(
  $$SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 1), 'ai_deeptech', true, (SELECT version FROM public.teams WHERE slot = 1), gen_random_uuid(), NULL)$$,
  'P0001', 'IN_DEBT', 'a team in debt cannot buy a business');
RESET ROLE; UPDATE public.teams SET debt = 10 WHERE slot = 2; SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$SELECT public.admin_set_business_level((SELECT id FROM public.teams WHERE slot = 2), 'edtech', 1::smallint, true, 0, gen_random_uuid(), NULL)$$,
  'P0001', 'IN_DEBT', 'a team in debt cannot upgrade');
RESET ROLE; UPDATE public.teams SET debt = 0 WHERE slot = 2; SET LOCAL ROLE authenticated;

-- An unaffordable optional purchase is refused and never creates debt.
RESET ROLE; UPDATE public.teams SET board_position = 3, cash = 100 WHERE slot = 3; SET LOCAL ROLE authenticated;
SELECT throws_ok(
  $$SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 3), 'saas', true, 0, gen_random_uuid(), NULL)$$,
  'P0001', 'INSUFFICIENT_CASH', 'an unaffordable optional purchase is refused');
SELECT is((SELECT cash || '/' || debt FROM public.teams WHERE slot = 3), '100/0', 'declining or failing an optional purchase never creates debt');

-- ------------------------------------------------------------ forced sale rules
RESET ROLE; UPDATE public.teams SET cash = 0, debt = 60 WHERE slot = 2; SET LOCAL ROLE authenticated;
SELECT public.admin_remove_business((SELECT id FROM public.teams WHERE slot = 2), 'edtech', 'FORCED_SALE', true, (SELECT version FROM public.teams WHERE slot = 2), gen_random_uuid(), 'sold to cover debt');
SELECT is((SELECT cash || '/' || debt FROM public.teams WHERE slot = 2), '40/0', 'a forced sale pays 50% of cost (100 for EdTech) and clears debt first');
SELECT is((SELECT count(*)::int FROM public.team_businesses tb JOIN public.teams t ON t.id = tb.team_id WHERE t.slot = 2), 0, 'the sold business returns to the bank');

-- ------------------------------------------------------------- ranking and finalize
-- Slot 4 has the most cash but is still in debt: ineligible, so last and not the winner.
RESET ROLE; UPDATE public.teams SET cash = 5000, debt = 10 WHERE slot = 4; UPDATE public.teams SET cash = 1500, debt = 0 WHERE slot = 5; UPDATE public.teams SET cash = 700, debt = 0 WHERE slot = 3; UPDATE public.teams SET cash = 600, debt = 0 WHERE slot = 2; UPDATE public.teams SET cash = 500, debt = 0 WHERE slot = 1;
SELECT is((SELECT array_agg(slot ORDER BY rank, slot) FROM public.room_standings((SELECT id FROM public.rooms))), ARRAY[5,3,2,1,4]::smallint[], 'a team in debt ranks below every eligible team despite the most cash');
SELECT is((SELECT rank FROM public.room_standings((SELECT id FROM public.rooms)) WHERE slot = 4), 5, 'the in-debt team is last');

SET LOCAL ROLE authenticated;
SELECT set_config('app.test_now', '2026-03-01 10:55:00+00', true);
SELECT public.expire_if_due(id) FROM public.rooms;
SELECT lives_ok($$SELECT public.admin_finalize(id) FROM public.rooms$$, 'finalize works with a team in debt');
SELECT is((SELECT winner_team_id FROM public.rooms), (SELECT id FROM public.teams WHERE slot = 5), 'the winner is the richest eligible team, not the team in debt');
SELECT is((SELECT fr.is_bankrupt FROM public.final_results fr JOIN public.teams t ON t.id = fr.team_id WHERE t.slot = 4), true, 'a team still in debt at the end is recorded as bankrupt (scores nothing, cannot win)');
SELECT is((SELECT fr.is_bankrupt FROM public.final_results fr JOIN public.teams t ON t.id = fr.team_id WHERE t.slot = 5), false, 'eligible teams are not flagged');
SELECT ok(public.get_history_detail((SELECT id FROM public.rooms))::text !~* '"[a-z_]*cv[a-z_]*"', 'history detail still has no cv key');

SELECT * FROM finish();
ROLLBACK;
