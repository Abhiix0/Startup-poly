-- Multi-admin rooms: 0026 scoped the NON_FINAL_ROOM_EXISTS check per admin, but the global
-- one-non-final-room index from 0001 still blocked every other admin. Drop it.
-- idx_rooms_unique_active_code stays: room codes remain unique among non-final rooms.
-- Audit: no other function assumes a single global active room (player lookups are per user/room).
DROP INDEX IF EXISTS public.idx_rooms_single_active;
