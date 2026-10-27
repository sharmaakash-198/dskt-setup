# 28: Carry Assignments into a replacement revision

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 19 Publish a Floor Plan; 26 Assign an Employee to a space  
**Status:** completed

## What to build

When a newer Floor Plan revision is published, preserve Assignments whose stable placement identities remain valid and block publication when active or future occupancy cannot be reconciled safely.

## Acceptance criteria

- [x] A new Draft can be based on the current Published revision without changing its immutable source.
- [x] Stable Placement Identities connect corresponding placements across revisions.
- [x] Publication preserves valid active and future Assignments when the target remains assignable.
- [x] Removed, duplicated, changed-to-nonassignable, or otherwise invalid Assignment targets produce actionable pre-publication errors.
- [x] Publication, prior-revision archival, and Assignment reconciliation occur in one transaction.
- [x] Failure rolls back every lifecycle and Assignment change.

## Verification

- Integration-test unchanged, moved, removed, nonassignable, and conflicting targets plus complete rollback against PostgreSQL.
- Browser-test a successful carried Assignment and a blocked replacement publication.
