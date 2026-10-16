-- Phase 1 reproducers. Each was a confirmed defect in docs/BACKEND_AUDIT.md; every one is now fixed and
-- points at the test that holds it (this file stays as the index).
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap;
SELECT plan(4);

-- L2: fixed in P3, asserted by 0008_lifecycle_hardening_test.sql ('abort after deadline raises ROOM_ALREADY_EXPIRED').
SELECT pass('L2 covered by 0008 (fixed in P3)');

-- L8: fixed in P4, asserted by 0009_money_rpc_hardening_test.sql ('adjust past the cap is INVALID_VALUE, not 22003').
SELECT pass('L8 covered by 0009 (fixed in P4)');

-- L10: anon must not hold EXECUTE on expire_if_due (fixed in P3).
SELECT ok(NOT has_function_privilege('anon', 'public.expire_if_due(uuid)', 'EXECUTE'), 'L10 anon cannot EXECUTE expire_if_due');

-- N2: fixed in P6, asserted cell by cell in 0011_security_matrix_test.sql.
SELECT pass('N2 covered by 0011 (fixed in P6)');

SELECT * FROM finish();
ROLLBACK;
