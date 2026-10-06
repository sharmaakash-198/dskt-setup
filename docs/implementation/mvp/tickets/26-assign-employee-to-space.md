# 26: Assign an Employee to a space

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 24 Search the Employee directory; 25 Preview and confirm batch labels  
**Status:** ready-for-agent

## What to build

Allow a Workplace Planner to choose an Employee and an Assignable Space on the Published map and create a time-bounded Assignment.

## Acceptance criteria

- [ ] The workflow shows the selected Employee’s existing Assignments beside candidate-space context.
- [ ] Only active, assignable placement identities in the applicable Published revision can receive an Assignment.
- [ ] Starts and optional ends are validated, with end later than start.
- [ ] Periods for one Assignable Space cannot overlap, enforced in domain logic and a PostgreSQL constraint.
- [ ] An Employee may hold overlapping Assignments to different spaces.
- [ ] Creation is transactional, idempotent, authorized, audited, and immediately reflected in map/details state.

## Verification

- Integration-test boundary-touching periods, true overlap, concurrent creation, employee multi-assignment, retry, and role denial against PostgreSQL.
- Component-test Employee/space selection and conflict states.
- Browser-test a successful Assignment and rejected occupied-space Assignment.
