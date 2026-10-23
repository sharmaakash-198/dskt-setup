# 18: Preview publication validation

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 17 Undo, redo, and recover conflicts  
**Status:** completed

## What to build

Allow a Facilities Admin to run full authoritative publication validation and navigate actionable blockers without changing revision lifecycle state.

## Acceptance criteria

- [x] Validation covers Floor Boundary structure, all transformed placement geometry, containment/intersection rules, Template references, labels, and lifecycle preconditions.
- [x] Results use stable error codes tied to affected entities and include user-safe corrective context.
- [x] Running validation does not publish, archive, or otherwise mutate the revision.
- [x] The UI groups errors accessibly and can focus the affected map object or properties panel.
- [x] A valid Draft receives an explicit publication-ready result tied to its current concurrency version.
- [x] Non-Facilities roles cannot validate Drafts or infer Draft geometry.

## Verification

- Test valid and representative invalid Floor Plans through HTTP against PostgreSQL.
- Verify validation has no domain mutation and rejects stale/unauthorized requests.
- Interaction-test error-list navigation and ready state.
