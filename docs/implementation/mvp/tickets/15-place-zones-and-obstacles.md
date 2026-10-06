# 15: Place Zones and Obstacles

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 10 Activate and revise a Template; 12 Edit a Floor Boundary  
**Status:** ready-for-agent

## What to build

Complete Floor geometry editing by placing, transforming, inspecting, and removing Zone and Obstacle Template Revisions through the shared renderer.

## Acceptance criteria

- [ ] Facilities Admin can place Templates with `ZONE` and `OBSTACLE` spatial classes.
- [ ] Zone and Obstacle placements use the same immutable Template pinning, integer translation, and quarter-turn rules as Physical placements.
- [ ] Layer order keeps boundaries, Zones, Obstacles, Physical elements, labels, and selection affordances predictable.
- [ ] Spatial-class-specific containment and intersection rules follow the geometry specification.
- [ ] Accessible details identify spatial class and do not rely on visual styling alone.
- [ ] Workplace Planner and Viewer cannot mutate these placements.

## Verification

- Example/property-test containment and intersection rules for all spatial-class combinations.
- Test persistence and authorization through HTTP against PostgreSQL.
- Interaction-test placing and selecting each class in the shared renderer.
