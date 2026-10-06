# 24: Search the Employee directory

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 23 Confirm an Employee import  
**Status:** ready-for-agent

## What to build

Allow authorized users to search imported Employees and inspect only the fields and relationship details permitted by their role.

## Acceptance criteria

- [ ] Search supports Employee ID, approved name fields, and other documented directory criteria with bounded pagination.
- [ ] Viewer receives only approved active-Employee directory fields.
- [ ] Workplace Planner can inspect manager relationships, employment state, and data needed for allocation.
- [ ] Facilities Admin receives only Employee summary data needed for map context.
- [ ] Empty, no-result, loading, unavailable, and permission-denied states are accessible.
- [ ] Search inputs are bounded and rate-limit ready without logging unrestricted query or result data.

## Verification

- Test search matching, pagination, inactive visibility, field-level role projections, and authorization through HTTP/PostgreSQL.
- Component-test search state and keyboard navigation.
- Browser-test finding a synthetic Employee after import.
