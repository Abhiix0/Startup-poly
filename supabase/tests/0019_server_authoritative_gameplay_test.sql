-- Migration 0030: START credit inside admin_move_team, purchases tied to the board space, server-computed rent.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(34);

SELECT set_config('app.env', 'test', true);
SELECT set_config('app.test_now', '2026-03-01 10:00:00+00', true);

\set admin_uid 'a0000000-0000-0000-0000-000000000030'
INSERT INTO auth.users (id, email, created_at, updated_at) VALUES
  (:'admin_uid', 'rules30-admin@test.local', now(), now()) ON CONFLICT DO NOTHING;
INSERT INTO public.admins (user_id) VALUES (:'admin_uid') ON CONFLICT DO NOTHING;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claims', '{"sub": "a0000000-0000-0000-0000-000000000030", "role": "authenticated"}', true);
SELECT public.admin_create_room(5, '[{"name":"Alpha","color":"#FF0000"},{"name":"Beta","color":"#00FF00"},{"name":"Gamma","color":"#0000FF"},{"name":"Delta","color":"#FFFF00"},{"name":"Epsilon","color":"#FF00FF"}]'::jsonb);
SELECT public.admin_open_lobby((SELECT id FROM public.rooms));
SELECT public.admin_start_game((SELECT id FROM public.rooms), true);

-- ---------------------------------------------------------------- START credit
SELECT is((SELECT board_position FROM public.business_catalog WHERE key = 'edtech'), 10::smallint, 'catalog stores the board space of each business');

-- A move that does not reach START pays nothing.
SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 4::smallint, 0, gen_random_uuid());
SELECT is((SELECT cash FROM public.teams WHERE slot = 1), 1000, 'no START credit when the move stays short of START');

-- Passing START pays 200 once.
RESET ROLE; UPDATE public.teams SET board_position = 22 WHERE slot = 1; SET LOCAL ROLE authenticated;
SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 4::smallint, 1, '00000000-0000-0000-0000-0000000000a1'::uuid);
SELECT is((SELECT cash FROM public.teams WHERE slot = 1), 1200, 'passing START credits 200');
SELECT is((SELECT board_position FROM public.teams WHERE slot = 1), 2::smallint, 'token moved past START');
SELECT is((SELECT version FROM public.teams WHERE slot = 1), 2, 'move and credit are one version bump');
SELECT is((SELECT (new->>'start_reward')::int FROM public.activity_events WHERE request_id = '00000000-0000-0000-0000-0000000000a1'), 200, 'the move event records the START reward');

-- A retried request neither moves nor pays again.
SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 1), 4::smallint, 1, '00000000-0000-0000-0000-0000000000a1'::uuid);
SELECT is((SELECT cash FROM public.teams WHERE slot = 1), 1200, 'replayed move pays START only once');
SELECT is((SELECT count(*)::int FROM public.activity_events WHERE type = 'TEAM_MOVED' AND (new->>'start_reward')::int = 200), 1, 'replay wrote no second event');

-- Landing exactly on START counts as a crossing.
RESET ROLE; UPDATE public.teams SET board_position = 20 WHERE slot = 2; SET LOCAL ROLE authenticated;
SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 2), 4::smallint, 0, gen_random_uuid());
SELECT is((SELECT board_position FROM public.teams WHERE slot = 2), 0::smallint, 'token landed exactly on START');
SELECT is((SELECT cash FROM public.teams WHERE slot = 2), 1200, 'landing exactly on START credits 200');

-- Moving away from START pays nothing; the next lap pays again.
SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 2), 6::smallint, 1, gen_random_uuid());
SELECT is((SELECT cash FROM public.teams WHERE slot = 2), 1200, 'moving away from START pays nothing');
RESET ROLE; UPDATE public.teams SET board_position = 21 WHERE slot = 2; SET LOCAL ROLE authenticated;
SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 2), 5::smallint, 2, gen_random_uuid());
SELECT is((SELECT cash FROM public.teams WHERE slot = 2), 1400, 'each later crossing pays 200 again');

-- Eliminated teams neither move nor earn.
RESET ROLE; UPDATE public.teams SET is_bankrupt = true, cash = 0 WHERE slot = 5; SET LOCAL ROLE authenticated;
SELECT throws_ok($$SELECT public.admin_move_team((SELECT id FROM public.teams WHERE slot = 5), 3::smallint, 0, gen_random_uuid())$$, 'P0001', 'TEAM_BANKRUPT', 'an eliminated team cannot move');
RESET ROLE; UPDATE public.teams SET is_bankrupt = false, cash = 1000 WHERE slot = 5; SET LOCAL ROLE authenticated;

-- ------------------------------------------------------- purchases need the space
SELECT throws_ok(
  $$SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 3), 'saas', true, 0, gen_random_uuid(), NULL)$$,
  'P0001', 'NOT_ON_BUSINESS_SPACE', 'a purchase away from the business space is refused');
SELECT is((SELECT cash FROM public.teams WHERE slot = 3), 1000, 'a refused purchase charges nothing');
RESET ROLE; UPDATE public.teams SET board_position = 3 WHERE slot = 3; SET LOCAL ROLE authenticated;
SELECT lives_ok(
  $$SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 3), 'saas', true, 0, gen_random_uuid(), NULL)$$,
  'a purchase on the business space succeeds');
SELECT is((SELECT cash FROM public.teams WHERE slot = 3), 700, 'the purchase charges the catalog cost');

-- Free manual entry needs a note and is audited as a correction.
SELECT throws_ok(
  $$SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 3), 'edtech', false, 1, gen_random_uuid(), NULL)$$,
  'P0001', 'NOTE_REQUIRED', 'a free business entry without a note is refused');
SELECT public.admin_add_business((SELECT id FROM public.teams WHERE slot = 3), 'edtech', false, 1, gen_random_uuid(), 'physical board dispute');
SELECT is((SELECT is_correction FROM public.activity_events WHERE type = 'BUSINESS_ADDED' AND business_key = 'edtech'), true, 'a free business entry is recorded as a correction');
SELECT is((SELECT cash FROM public.teams WHERE slot = 3), 700, 'a free business entry charges nothing');

-- Manual level changes are corrections too.
SELECT public.admin_set_business_level((SELECT id FROM public.teams WHERE slot = 3), 'edtech', 2::smallint, false, 2, gen_random_uuid(), 'fix physical state');
SELECT is((SELECT is_correction FROM public.activity_events WHERE type = 'BUSINESS_LEVEL_SET' AND business_key = 'edtech'), true, 'a manual level change is recorded as a correction');

-- -------------------------------------------------------------------- rent (server computed)
-- Slot 3 owns saas (L0) and edtech (L2). Slot 4 pays; the server derives the owner and the amount.
RESET ROLE; UPDATE public.teams SET board_position = 3, cash = 1000 WHERE slot = 4; SET LOCAL ROLE authenticated;
SELECT public.admin_charge_rent((SELECT id FROM public.teams WHERE slot = 4), 'saas',
  (SELECT version FROM public.teams WHERE slot = 4), (SELECT version FROM public.teams WHERE slot = 3), '00000000-0000-0000-0000-0000000000b1'::uuid, NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot = 4), 850, 'level-0 SaaS (cost 300) charges 150');
SELECT is((SELECT cash FROM public.teams WHERE slot = 3), 850, 'the owner receives the same rent');

SELECT public.admin_charge_rent((SELECT id FROM public.teams WHERE slot = 4), 'saas',
  (SELECT version FROM public.teams WHERE slot = 4), (SELECT version FROM public.teams WHERE slot = 3), '00000000-0000-0000-0000-0000000000b1'::uuid, NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot = 4), 850, 'a retried rent request charges once');

RESET ROLE; UPDATE public.team_businesses SET level = 1 WHERE business_key = 'saas'; UPDATE public.teams SET cash = 1000 WHERE slot IN (3, 4); SET LOCAL ROLE authenticated;
SELECT public.admin_charge_rent((SELECT id FROM public.teams WHERE slot = 4), 'saas',
  (SELECT version FROM public.teams WHERE slot = 4), (SELECT version FROM public.teams WHERE slot = 3), gen_random_uuid(), NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot = 4), 775, 'level-1 SaaS charges 225');

RESET ROLE; UPDATE public.teams SET board_position = 10, cash = 1000 WHERE slot = 4; UPDATE public.teams SET cash = 700 WHERE slot = 3; SET LOCAL ROLE authenticated;
SELECT public.admin_charge_rent((SELECT id FROM public.teams WHERE slot = 4), 'edtech',
  (SELECT version FROM public.teams WHERE slot = 4), (SELECT version FROM public.teams WHERE slot = 3), gen_random_uuid(), NULL);
SELECT is((SELECT cash FROM public.teams WHERE slot = 4), 800, 'level-2 EdTech (cost 200) charges 200');

SELECT throws_ok(
  $$SELECT public.admin_charge_rent((SELECT id FROM public.teams WHERE slot = 4), 'saas',
    (SELECT version FROM public.teams WHERE slot = 4), (SELECT version FROM public.teams WHERE slot = 3), gen_random_uuid(), NULL)$$,
  'P0001', 'NOT_ON_BUSINESS_SPACE', 'rent is only charged on the business space');
SELECT throws_ok(
  $$SELECT public.admin_charge_rent((SELECT id FROM public.teams WHERE slot = 3), 'saas',
    (SELECT version FROM public.teams WHERE slot = 3), (SELECT version FROM public.teams WHERE slot = 3), gen_random_uuid(), NULL)$$,
  'P0001', 'INVALID_VALUE', 'no rent on your own business');
SELECT throws_ok(
  $$SELECT public.admin_charge_rent((SELECT id FROM public.teams WHERE slot = 4), 'fintech',
    (SELECT version FROM public.teams WHERE slot = 4), 0, gen_random_uuid(), NULL)$$,
  'P0001', 'BUSINESS_NOT_OWNED', 'no rent on an unowned business');

RESET ROLE; UPDATE public.teams SET board_position = 3, cash = 50 WHERE slot = 4; UPDATE public.teams SET cash = 1000 WHERE slot = 3; SET LOCAL ROLE authenticated;
-- Slot 4 owns no business, so the unpaid part of the rent becomes debt instead of being refused.
SELECT lives_ok(
  $$SELECT public.admin_charge_rent((SELECT id FROM public.teams WHERE slot = 4), 'saas',
    (SELECT version FROM public.teams WHERE slot = 4), (SELECT version FROM public.teams WHERE slot = 3), gen_random_uuid(), NULL)$$,
  'a payer with nothing left to sell goes into debt for the unpaid rent');
SELECT is((SELECT cash || '/' || debt FROM public.teams WHERE slot = 4), '0/175', 'the payer pays what it has and owes the rest (225 - 50)');
SELECT is((SELECT cash FROM public.teams WHERE slot = 3), 1225, 'the owner still receives the full rent');

-- A forced sale pays half the original purchase cost of a business the seller owns.
SELECT public.admin_remove_business((SELECT id FROM public.teams WHERE slot = 3), 'saas', 'FORCED_SALE', true, (SELECT version FROM public.teams WHERE slot = 3), gen_random_uuid(), 'sold');
SELECT is((SELECT cash FROM public.teams WHERE slot = 3), 1375, 'forced sale pays 50% of the original cost (150), not the upgraded value');
SELECT throws_ok(
  $$SELECT public.admin_remove_business((SELECT id FROM public.teams WHERE slot = 3), 'saas', 'FORCED_SALE', true, (SELECT version FROM public.teams WHERE slot = 3), gen_random_uuid(), 'again')$$,
  'P0001', 'BUSINESS_NOT_OWNED', 'a forced sale needs a business the seller owns');

SELECT * FROM finish();
ROLLBACK;
