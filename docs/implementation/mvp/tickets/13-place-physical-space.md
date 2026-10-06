# 13: Place a Physical Space

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 10 Activate and revise a Template; 12 Edit a Floor Boundary  
**Status:** ready-for-agent

## What to build

Allow a Facilities Admin to drag a current immutable Physical Template Revision from the catalog and place it within a Draft Floor Plan.

## Acceptance criteria

- [ ] The catalog offers only permitted immutable Template Revisions for placement.
- [ ] Dragging shows a snapped preview and clearly distinguishes invalid positions without relying on color alone.
- [ ] Commit creates a stable Placement Identity and a revision-specific Placed Element pinned to the selected Template Revision.
- [ ] Translation is stored as integer world coordinates and initial rotation is a quarter turn.
- [ ] Backend validation rejects placement outside the Floor Boundary or any other documented invalid condition.
- [ ] Reloading reconstructs the same geometry through the shared renderer.

## Verification

- Unit-test template-local to world-coordinate transforms.
- Test placement, Template pinning, rejection, and authorization through HTTP against PostgreSQL.
- Browser-test catalog drag, preview, commit, and reload.
