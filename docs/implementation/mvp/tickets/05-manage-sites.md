# 05: Manage Sites

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 03 Enter a role-authorized workspace  
**Status:** completed

## What to build

Allow a Facilities Admin to create, browse, update, and archive Arrise Sites.

## Acceptance criteria

- [x] Facilities Admin can create a Site with validated stable code, name, time zone, and supported address fields.
- [x] The location view shows active Sites in a predictable order and handles loading, empty, validation, and unavailable states.
- [x] Site codes are unique within Arrise and conflicts return stable actionable errors.
- [x] Archival removes a Site from active selection without deleting historical identity and is rejected while active Buildings remain; there is no implicit cascading archive.
- [x] Workplace Planner and Viewer can read active Sites but cannot mutate them.
- [x] Site archival is audited.



## Verification

- Test persistence, uniqueness, archival, role matrix, errors, and audit events through HTTP against PostgreSQL.
- Component-test creation and empty/error states.
- Browser-test creating a Site and seeing it in navigation.

