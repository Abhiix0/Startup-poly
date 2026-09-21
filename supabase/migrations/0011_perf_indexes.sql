-- Migration 0011: Performance Indexes and Realtime Optimization
-- STARTUPOLY Live Scoreboard & Game Management System

-- 1. Explicit index for room_id filtering on team_businesses
CREATE INDEX IF NOT EXISTS idx_team_businesses_room_id ON public.team_businesses(room_id);

-- 2. Index for status queries on rooms
CREATE INDEX IF NOT EXISTS idx_rooms_status ON public.rooms(status);

-- 3. Index on final_results for room queries
CREATE INDEX IF NOT EXISTS idx_final_results_room_id ON public.final_results(room_id);

-- 4. Verification comment: All RLS and Realtime filter paths are btree-indexed
-- - rooms: id (PK), code (unique index), status (idx_rooms_status)
-- - teams: id (PK), room_id (idx_teams_room_id)
-- - team_businesses: room_id (idx_team_businesses_room_id), team_id (idx_team_businesses_team_id)
-- - activity_events: room_id + id DESC (idx_activity_events_room_id_id)
-- - team_claims: user_id + team_id (PK), team_id (idx_team_claims_team_id)
