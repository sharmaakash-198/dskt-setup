# 29: Locate an Employee on the map

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 24 Search the Employee directory; 28 Carry Assignments into a replacement revision  
**Status:** completed

## What to build

Allow a Viewer to search an active Employee, choose an active Assignment when more than one exists, and open the corresponding space on the current Published map.

## Acceptance criteria

- [x] Search results communicate unassigned, one-active-space, and multiple-active-space states.
- [x] Selecting an Assignment navigates through Site, Building, Floor, and current Published revision to the stable placement identity.
- [x] The map focuses the space and opens accessible Employee and space details without relying on color alone.
- [x] A complete non-canvas search and details path exposes the same permitted location information.
- [x] Stale, ended, archived, or inaccessible locations produce a clear safe state rather than exposing Draft data.
- [x] Viewer receives only approved directory and current-occupancy fields.

## Verification

- Test resolution across multiple Assignments, replacement revisions, archived locations, and role projections through HTTP/PostgreSQL.
- Interaction-test focus and accessible-detail behavior.
- Browser-test import → Assignment → Viewer search → Published map location using synthetic data.
