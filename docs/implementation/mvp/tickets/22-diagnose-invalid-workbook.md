# 22: Diagnose an invalid workbook

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 21 Preview an Employee workbook  
**Status:** ready-for-agent

## What to build

Give a Workplace Planner retained, row-specific diagnostics for unsafe or invalid workbook content before import confirmation.

## Acceptance criteria

- [ ] Formula cells and macro-enabled or otherwise unsupported workbook content are rejected and never executed.
- [ ] Validation detects missing required fields, duplicate Employee IDs, invalid values, unresolved manager references, and manager cycles.
- [ ] Errors persist relationally with source row, optional column, stable code, and user-safe message.
- [ ] Preview filters and summaries make invalid rows discoverable without exposing data to unauthorized roles.
- [ ] An import with any blocking error cannot be confirmed.
- [ ] Upload artifacts are removed after the documented operational retention window while safe metadata and diagnostics remain.

## Verification

- Test representative malformed, cyclic, duplicate, formula, macro, oversized, and valid synthetic workbooks.
- Verify retained errors, confirmation denial, redacted logs, and role restrictions through HTTP/PostgreSQL.
- Component-test accessible error filtering and row navigation.
