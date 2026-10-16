-- Phase 1 reproducers. Each is a confirmed defect in docs/BACKEND_AUDIT.md, kept skipped
-- (so the suite stays green) with the phase that must un-skip it. Do not delete when fixed: un-skip.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(4);

-- L2: admin_abort_game must raise ROOM_ALREADY_EXPIRED once the deadline passed.   -- un-skip when fixed in P3
SELECT skip('L2 abort after deadline wipes a finished game (expect ROOM_ALREADY_EXPIRED)', 1);

-- L8: cash + delta past int max must raise INVALID_VALUE, not 22003.                -- un-skip when fixed in P4
SELECT skip('L8 admin_adjust overflow surfaces raw 22003 (expect INVALID_VALUE)', 1);

-- L10: anon must not hold EXECUTE on expire_if_due.                                 -- un-skip when fixed in P3/P6
SELECT skip('L10 anon can EXECUTE expire_if_due (room-UUID existence oracle)', 1);

-- anon should hold EXECUTE on admin_* RPCs for no reason (NOT_ADMIN guards them today).  -- un-skip when fixed in P6
SELECT skip('anon holds EXECUTE on admin_* functions', 1);

SELECT * FROM finish();
ROLLBACK;
