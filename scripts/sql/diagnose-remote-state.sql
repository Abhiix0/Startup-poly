-- READ-ONLY diagnostic: which of migrations 0016..0032 are already applied to THIS database.
-- Paste each of the two statements separately into the Supabase SQL editor (the editor shows only the last result).
-- Every check below was taken from the migration file named in its label. A migration is
--   applied      = every check passes
--   not applied  = no check passes
--   PARTIAL      = some pass, some fail  -> STOP, do not run `migration repair`, see docs/PROD_MIGRATION_RECONCILIATION.md
-- Limit: 0016, 0022 and 0023 only redefine functions that later migrations redefine again. Where the original text
-- survives it is checked directly; room_standings (0023) is only checked for existence, so 0023 is "implied".

-- ===== STATEMENT 1: one row per migration =====
WITH
fn AS (  -- every public function with its definition and argument list
  SELECT p.proname, pg_get_functiondef(p.oid) AS def, pg_get_function_arguments(p.oid) AS args
  FROM pg_proc p WHERE p.pronamespace = 'public'::regnamespace AND p.prokind = 'f'
),
col(t, c) AS (SELECT table_name, column_name FROM information_schema.columns WHERE table_schema = 'public'),
checks(mig, what, ok) AS (VALUES
  -- 0016_lock_order: admin_release_team locks the room row first
  ('0016', 'admin_release_team locks rooms row',
     EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_release_team' AND strpos(def, 'FROM public.rooms WHERE id = v_room_id FOR UPDATE') > 0)),
  -- 0017_lifecycle_hardening
  ('0017', 'lifecycle_replay_check exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'lifecycle_replay_check')),
  ('0017', 'admin_open_lobby takes request_id', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_open_lobby' AND args LIKE '%request_id%')),
  ('0017', 'admin_finalize takes request_id', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_finalize' AND args LIKE '%request_id%')),
  -- 0018_money_rpc_hardening
  ('0018', 'max_money() exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'max_money')),
  ('0018', 'money_replay_check exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'money_replay_check')),
  ('0018', 'teams_cash_cap validated', EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teams_cash_cap' AND convalidated)),
  -- 0019_join_hardening
  ('0019', 'join_attempts.room_id', EXISTS (SELECT 1 FROM col WHERE t = 'join_attempts' AND c = 'room_id')),
  ('0019', 'join_attempts.code_hash', EXISTS (SELECT 1 FROM col WHERE t = 'join_attempts' AND c = 'code_hash')),
  ('0019', 'idx_join_attempts_unknown_code', EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_join_attempts_unknown_code')),
  -- 0020_security_lockdown
  ('0020', 'app_now checks session_user', EXISTS (SELECT 1 FROM fn WHERE proname = 'app_now' AND strpos(def, 'session_user') > 0)),
  -- 0021_final_snapshot
  ('0021', 'rooms.businesses_snapshotted', EXISTS (SELECT 1 FROM col WHERE t = 'rooms' AND c = 'businesses_snapshotted')),
  ('0021', 'final_result_businesses table', to_regclass('public.final_result_businesses') IS NOT NULL),
  ('0021', 'trg_final_result_businesses_immutable', EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_final_result_businesses_immutable')),
  -- 0022_game_accounting_cv_and_bankruptcy: admin_set_bankrupt zeroes cash (no later migration redefines it)
  ('0022', 'admin_set_bankrupt sets cash = 0', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_set_bankrupt' AND strpos(def, 'SET cash = 0') > 0)),
  -- 0023_total_company_value_ranking (implied: room_standings is redefined by 0029 and 0031)
  ('0023', 'room_standings exists (implied)', EXISTS (SELECT 1 FROM fn WHERE proname = 'room_standings')),
  -- 0024_admin_extend_game
  ('0024', 'admin_extend_game exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_extend_game')),
  ('0024', 'event type GAME_EXTENDED allowed', EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activity_events_type_check' AND strpos(pg_get_constraintdef(oid), 'GAME_EXTENDED') > 0)),
  -- 0025_admin_cancel_room
  ('0025', 'admin_cancel_room exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_cancel_room')),
  ('0025', 'leave_team exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'leave_team')),
  ('0025', 'status transition allows cancel', EXISTS (SELECT 1 FROM fn WHERE proname = 'fn_check_room_status_transition' AND strpos(def, 'Cancel during lobby') > 0)),
  -- 0026_admin_spaces_and_session_persistence
  ('0026', 'list_history exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'list_history')),
  ('0026', 'admin_create_room is per-admin', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_create_room' AND strpos(def, 'created_by = auth.uid()') > 0)),
  -- 0027_admin_live_board
  ('0027', 'teams.board_position', EXISTS (SELECT 1 FROM col WHERE t = 'teams' AND c = 'board_position')),
  ('0027', 'event type TEAM_MOVED allowed', EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'activity_events_type_check' AND strpos(pg_get_constraintdef(oid), 'TEAM_MOVED') > 0)),
  ('0027', 'reset_board_positions_after_abort trigger', EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'reset_board_positions_after_abort')),
  ('0027', 'admin_move_team exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_move_team')),
  -- 0028_rulebook_economy_alignment
  ('0028', 'edtech upgrade costs 100 / 150', coalesce((SELECT bool_and(u1_cost = 100 AND u2_cost = 150) FROM public.business_catalog WHERE key = 'edtech'), false)),
  ('0028', 'business cap is 2', EXISTS (SELECT 1 FROM fn WHERE proname = 'fn_check_business_cap' AND strpos(def, '>= 2') > 0)),
  -- 0029_remove_company_value
  ('0029', 'teams.cv dropped', NOT EXISTS (SELECT 1 FROM col WHERE t = 'teams' AND c = 'cv')),
  ('0029', 'final_results.cv dropped', NOT EXISTS (SELECT 1 FROM col WHERE t = 'final_results' AND c = 'cv')),
  ('0029', 'business_catalog CV columns dropped', NOT EXISTS (SELECT 1 FROM col WHERE t = 'business_catalog' AND c IN ('initial_cv', 'u1_cv', 'u2_cv'))),
  ('0029', 'final_result_businesses CV columns dropped', NOT EXISTS (SELECT 1 FROM col WHERE t = 'final_result_businesses' AND c IN ('initial_cv', 'u1_cv', 'u2_cv'))),
  ('0029', 'admin_set_tiebreak dropped', NOT EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_set_tiebreak')),
  ('0029', 'admin_set_team_values has no cv argument',
     EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_set_team_values') AND NOT EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_set_team_values' AND args ~ '\mcv\M')),
  -- 0030_server_authoritative_gameplay
  ('0030', 'business_catalog.board_position', EXISTS (SELECT 1 FROM col WHERE t = 'business_catalog' AND c = 'board_position')),
  ('0030', 'business_catalog_board_position_key', EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'business_catalog_board_position_key')),
  ('0030', 'admin_charge_rent exists', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_charge_rent')),
  -- 0031_debt_recovery
  ('0031', 'teams.debt', EXISTS (SELECT 1 FROM col WHERE t = 'teams' AND c = 'debt')),
  ('0031', 'teams_debt_check', EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teams_debt_check')),
  ('0031', 'teams_debt_cap', EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'teams_debt_cap')),
  ('0031', 'admin_adjust handles debt', EXISTS (SELECT 1 FROM fn WHERE proname = 'admin_adjust' AND strpos(def, 'debt') > 0)),
  -- 0032_multi_admin_rooms (a manual DROP INDEX counts: the migration is only that statement)
  ('0032', 'idx_rooms_single_active gone', NOT EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'idx_rooms_single_active'))
)
SELECT mig AS migration,
       CASE WHEN bool_and(ok) THEN 'applied' WHEN NOT bool_or(ok) THEN 'not applied' ELSE 'PARTIAL' END AS status,
       count(*) FILTER (WHERE ok) || '/' || count(*) AS checks_passed,
       coalesce(string_agg(what, '; ') FILTER (WHERE NOT ok), '') AS failing_checks
FROM checks GROUP BY mig ORDER BY mig;

-- ===== STATEMENT 2: what the migration history table currently says =====
SELECT version, name, statements IS NOT NULL AS has_statements
FROM supabase_migrations.schema_migrations ORDER BY version;
