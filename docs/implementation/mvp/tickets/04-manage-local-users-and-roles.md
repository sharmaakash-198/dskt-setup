# 04: Manage local users and roles

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 03 Enter a role-authorized workspace  
**Status:** completed

## What to build

Provide an operational local-only flow for an authenticated System Administrator to create or deactivate synthetic users and grant or revoke application roles.

## Acceptance criteria

- [x] An explicit one-time bootstrap command creates the first local System Administrator with an out-of-band password and no committed plaintext credential.
- [x] An authenticated System Administrator can create a provider-neutral application user and local identity with an out-of-band initial password.
- [x] The administrator can grant and revoke Facilities Admin, Workplace Planner, and Viewer independently.
- [x] At most one active grant exists for a user-role pair, while historical grant records are retained.
- [x] Deactivation blocks the user’s next request and permits their active editor lease to be reclaimed.
- [x] Role and activation changes are transactional and emit safe audit events with actor, target, timestamp, and correlation ID.
- [x] System Administrator has no domain-data access by itself, and Facilities Admin, Workplace Planner, and Viewer cannot administer access.

## Verification

- Test grant, duplicate grant, revoke, deactivation, authorization denial, and audit persistence through the backend API with PostgreSQL.
- Verify the local operational UI or documented local operator surface without exposing password hashes or session tokens.
