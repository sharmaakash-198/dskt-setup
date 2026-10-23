# 19: Publish a Floor Plan

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 18 Preview publication validation  
**Status:** completed

## What to build

Allow a Facilities Admin to confirm publication of the currently valid Draft as the immutable Published Floor Plan revision.

## Acceptance criteria

- [x] Publication re-runs authoritative validation against the submitted concurrency version.
- [x] In one transaction, the previous Published revision is archived when present and the Draft becomes Published.
- [x] At most one Draft and one Published revision exist for a Floor Plan.
- [x] Published and Archived revisions reject every geometry and metadata mutation.
- [x] A failed validation or database operation rolls back the entire lifecycle transition.
- [x] Publication is idempotent for safe retry and emits an audit event.

## Verification

- Integration-test success, rollback, concurrent publication, idempotency, immutability, and audit persistence against PostgreSQL.
- Contract-test stable publication errors.
- Browser-test confirmation and transition to the read-only Published view.
