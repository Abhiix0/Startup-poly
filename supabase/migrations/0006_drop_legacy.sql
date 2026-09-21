-- Migration 0006: Drop legacy prototype tables
-- STARTUPOLY Live Scoreboard & Game Management System
--
-- CAUTION: DESTRUCTIVE MIGRATION
-- This migration permanently drops the legacy prototype tables `matches` and `match_events`.
-- It must only be run after the project owner has confirmed that no old JSON-blob match data
-- or event logs are needed.

DROP TABLE IF EXISTS public.match_events CASCADE;
DROP TABLE IF EXISTS public.matches CASCADE;
