# 05: Manage Sites

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 03 Enter a role-authorized workspace  
**Status:** ready-for-agent

## What to build

Allow a Facilities Admin to create, browse, update, and archive Arrise Sites.

## Acceptance criteria

- [ ] Facilities Admin can create a Site with validated stable code, name, time zone, and supported address fields.
- [ ] The location view shows active Sites in a predictable order and handles loading, empty, validation, and unavailable states.
- [ ] Site codes are unique within Arrise and conflicts return stable actionable errors.
- [ ] Archival removes a Site from active selection without deleting historical identity and is rejected while active Buildings remain; there is no implicit cascading archive.
- [ ] Workplace Planner and Viewer can read active Sites but cannot mutate them.
- [ ] Site archival is audited.

## Verification

- Test persistence, uniqueness, archival, role matrix, errors, and audit events through HTTP against PostgreSQL.
- Component-test creation and empty/error states.
- Browser-test creating a Site and seeing it in navigation.
