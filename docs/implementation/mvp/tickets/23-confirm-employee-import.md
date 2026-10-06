# 23: Confirm an Employee import

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 22 Diagnose an invalid workbook  
**Status:** ready-for-agent

## What to build

Allow a Workplace Planner to confirm a ready preview and apply all proposed Employee changes atomically.

## Acceptance criteria

- [ ] Confirmation applies the exact ready preview and rejects changed, stale, invalid, already-applied, or unauthorized imports.
- [ ] Creates, updates, manager relationships, teams, departments, and supported employment state changes occur in one transaction.
- [ ] Any failure rolls back every Employee change and leaves a diagnosable import state.
- [ ] Employees omitted from the workbook remain active and unchanged.
- [ ] Retry with the same idempotency key cannot apply an import twice.
- [ ] Confirmation emits an audit event and never logs workbook rows.

## Verification

- Integration-test success, rollback, omission behavior, stale preview, duplicate retry, and manager relationships against PostgreSQL.
- Browser-test preview confirmation and resulting summary with synthetic data.
