# 11: Create a Draft Floor Plan

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 06 Manage Buildings and Floors  
**Status:** completed

## What to build

Allow a Facilities Admin to create the stable Floor Plan identity for a Floor and its first Draft revision.

## Acceptance criteria

- [x] A Floor can have at most one Floor Plan identity.
- [x] Creation produces revision 1 in Draft state with a permitted `2ⁿ` Editing Scale and non-negative concurrency version.
- [x] The revision list clearly distinguishes Draft, Published, and Archived states and handles an empty Floor.
- [x] Only Facilities Admin can create or read Draft Floor Plan details.
- [x] Repeated retry with the same idempotency key does not create duplicate plans or revisions.
- [x] No geometry is encoded in viewport or screen coordinates.

## Verification

- Test uniqueness, initial lifecycle state, Editing Scale domain, idempotency, and authorization through HTTP against PostgreSQL.
- Browser-test creating the first Draft from an empty Floor.
