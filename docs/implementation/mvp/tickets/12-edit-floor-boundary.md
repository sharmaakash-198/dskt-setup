# 12: Edit a Floor Boundary

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 11 Create a Draft Floor Plan  
**Status:** ready-for-agent

## What to build

Allow a Facilities Admin to draw and edit the Draft Floor Boundary in integer world coordinates while selecting an Editing Scale independently from Zoom.

## Acceptance criteria

- [ ] The boundary uses normalized ordered integer vertices in 10-centimetre world units and implicit closure.
- [ ] Editing Scale accepts only `1,2,4,8,16,32,64,128,256`.
- [ ] Changing Editing Scale changes editing granularity but never stored physical geometry.
- [ ] Zoom and pan change only the viewport and cannot mutate domain coordinates.
- [ ] Orthogonality guidance, dimensions, coordinate feedback, and an accessible HTML summary are available.
- [ ] Backend commands reject edits to non-Draft revisions and stale concurrency versions.

## Verification

- Property-test scale/zoom independence, integer transforms, orthogonality, and persistence round trips.
- Test boundary commands through HTTP against PostgreSQL.
- Interaction-test drawing, changing Editing Scale, zooming, and reloading unchanged geometry.
