# 20: Browse Published maps and revision history

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 19 Publish a Floor Plan  
**Status:** completed

## What to build

Allow authorized users to browse the current Published Floor Plan and inspect permitted immutable revision history.

## Acceptance criteria

- [x] Facilities Admin, Workplace Planner, and Viewer can open the current Published map for an active Floor.
- [x] The shared renderer displays the immutable boundary and all Placed Element classes with accessible object details.
- [x] No editing controls or mutation endpoints are available in the Published experience.
- [x] Facilities Admin can inspect Draft and Archived revision metadata; Workplace Planner and Viewer cannot access Draft geometry.
- [x] Empty, unpublished, archived-location, loading, and unavailable states are explicit.
- [x] API projections avoid exposing unnecessary employee or historical data.

## Verification

- Test role-specific projections and Draft/Archived access denial through HTTP.
- Component-test read-only and no-publication states.
- Browser-test navigation from Site to Floor to Published map and accessible details.
