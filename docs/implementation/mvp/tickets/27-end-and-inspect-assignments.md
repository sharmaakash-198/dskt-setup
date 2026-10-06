# 27: End and inspect Assignments

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 26 Assign an Employee to a space  
**Status:** ready-for-agent

## What to build

Allow a Workplace Planner to inspect current, future, and historical Assignment periods and end an active or future Assignment without deleting history.

## Acceptance criteria

- [ ] Employee and space details distinguish current, future, ended, and unassigned states.
- [ ] Workplace Planner can end an Assignment at a valid timestamp while preserving its original creation details.
- [ ] Ending cannot create an invalid period and cannot rewrite an already historical Assignment silently.
- [ ] Viewer sees only permitted current occupancy; Facilities Admin has documented read-only summary access.
- [ ] Assignment history is paginated and inaccessible to unauthorized roles.
- [ ] Ending is transactional, idempotent, and audited.

## Verification

- Test state classification, valid/invalid end times, retry, role projections, history preservation, and audit persistence through HTTP/PostgreSQL.
- Browser-test ending an Assignment and observing current and historical state updates.
