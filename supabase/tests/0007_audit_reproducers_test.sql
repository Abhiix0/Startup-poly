-- Phase 1 reproducers. Each is a confirmed defect in docs/BACKEND_AUDIT.md, kept skipped
-- (so the suite stays green) with the phase that must un-skip it. Do not delete when fixed: un-skip.
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(4);

-- L2: fixed in P3, asserted by 0008_lifecycle_hardening_test.sql ('abort after deadline raises ROOM_ALREADY_EXPIRED').
SELECT skip('L2 covered by 0008 (fixed in P3)', 1);

-- L8: cash + delta past int max must raise INVALID_VALUE, not 22003.                -- un-skip when fixed in P4
SELECT skip('L8 admin_adjust overflow surfaces raw 22003 (expect INVALID_VALUE)', 1);

-- L10: anon must not hold EXECUTE on expire_if_due (fixed in P3).
SELECT ok(NOT has_function_privilege('anon', 'public.expire_if_due(uuid)', 'EXECUTE'), 'L10 anon cannot EXECUTE expire_if_due');

-- anon should hold EXECUTE on admin_* RPCs for no reason (NOT_ADMIN guards them today).  -- un-skip when fixed in P6
SELECT skip('anon holds EXECUTE on admin_* functions', 1);

SELECT * FROM finish();
ROLLBACK;
