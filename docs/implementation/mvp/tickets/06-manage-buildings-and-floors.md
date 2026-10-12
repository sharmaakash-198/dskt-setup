# 06: Manage Buildings and Floors

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 05 Manage Sites  
**Status:** completed

## What to build

Allow a Facilities Admin to complete the location hierarchy by managing Buildings within Sites and Floors within Buildings.

## Acceptance criteria

- [x] Facilities Admin can create, update, browse, and archive Buildings under an active Site.
- [x] Facilities Admin can create, update, browse, and archive Floors under an active Building.
- [x] Codes are unique in their documented parent scope and conflicts return stable errors.
- [x] Archived parents cannot accept active children; archiving a Building with active Floors is rejected, and no archival operation deletes historical records or cascades implicitly.
- [x] Workplace Planner and Viewer can navigate active Buildings and Floors but cannot mutate them.
- [x] Building and Floor archival is audited.

## Verification

- Test hierarchy constraints, uniqueness, archival, role denial, and audit records through HTTP against PostgreSQL.
- Browser-test creating a Building and Floor and reaching the empty Floor workspace.
