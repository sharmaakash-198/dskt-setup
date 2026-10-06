# 14: Transform placed spaces

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 13 Place a Physical Space  
**Status:** ready-for-agent

## What to build

Allow a Facilities Admin to select, translate, quarter-turn, inspect, and remove Physical placements without resizing them.

## Acceptance criteria

- [ ] Selection exposes an accessible details panel with Template Revision, coordinates, rotation, assignability, and validation state.
- [ ] Translation snaps to permitted integer world coordinates.
- [ ] Rotation permits only `0`, `90`, `180`, and `270` degrees.
- [ ] No UI or API operation can resize a placement.
- [ ] Transform previews are responsive while committed commands remain backend-validated and concurrency-safe.
- [ ] Removing a placement from the Draft does not delete its stable identity or historical revision records.

## Verification

- Property-test all quarter-turn transforms and inverse/round-trip behavior.
- Test invalid rotation, resize attempts, translation, removal, and history preservation through HTTP against PostgreSQL.
- Interaction-test selection, movement, rotation, details, and deletion.
