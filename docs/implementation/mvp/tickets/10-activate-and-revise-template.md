# 10: Activate and revise a Template

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 09 Diagnose invalid Template geometry  
**Status:** ready-for-agent

## What to build

Allow a Facilities Admin to select an immutable Template Revision as current for future placements and later create and activate another immutable revision without changing existing placements.

## Acceptance criteria

- [ ] Only a valid immutable revision belonging to the Template can become its current revision.
- [ ] Changing `current_revision_id` is transactional and fails without changing the prior current revision.
- [ ] Current revision selection never mutates revision metadata, geometry, or ordered vertices.
- [ ] A later revision receives the next revision number and is created through the same atomic validated flow.
- [ ] Activating the later revision affects only future placements.
- [ ] Existing Placed Elements remain pinned to the Template Revision they originally used.
- [ ] The catalog distinguishes the current revision and supports read-only revision history.

## Verification

- Test current-revision ownership, transactional switching, revision numbering, immutability, concurrent selection, and authorization through HTTP against PostgreSQL.
- Browser-test activating a first revision, creating another revision, activating it, and inspecting unchanged history.
