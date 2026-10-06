# DSKT Relational Data Model

PostgreSQL is the system of record. Domain data is normalized; geometry is not stored in JSONB.

This is the concise logical model. Column-level design, constraints, indexes, and retention rules live in [`docs/data/DATABASE_SCHEMA.md`](docs/data/DATABASE_SCHEMA.md).

## Location and access

- `organizations`: the single Arrise organization record.
- `sites`: geographic office locations belonging to the organization.
- `buildings`: physical buildings belonging to a site.
- `floors`: named or numbered levels belonging to a building.
- `app_users`: provider-neutral application users.
- `app_user_identities`: local or Entra external subjects linked to application users.
- `local_auth_credentials` and `local_auth_sessions`: development-only password hashes and opaque-session records.
- `roles`: operational System Administrator plus Facilities Admin, Workplace Planner, and Viewer.
- `app_user_roles`: many-to-many user role membership.

Only top-level records that require organizational ownership reference `organizations`. Geometry descendants inherit ownership through their floor.

## Templates

- `element_categories`: named template groupings with display order.
- `element_templates`: stable template identities belonging to a category.
- `element_template_revisions`: immutable versions containing name, color, assignability, and revision number.
- `element_template_revision_vertices`: ordered integer coordinates relative to a template origin.

Published placements always reference a specific template revision. Updating a template never mutates an existing revision.

## Floor plans

- `floor_plan_revisions`: versioned Draft, Published, or Archived plans with Editing Scale and editor-lease metadata.
- `floor_boundaries`: one boundary polygon per plan revision.
- `floor_boundary_vertices`: ordered boundary vertices.
- `placement_identities`: stable logical identities used to track a placement across plan revisions.
- `placed_elements`: revision-specific placement position, rotation, label, and referenced template revision. The template revision’s spatial class distinguishes physical elements, Zones, and Obstacles.

Template and boundary vertex tables use `(parent_id, sequence)` uniqueness. Template vertices use local integer coordinates; boundary vertices use integer world coordinates. Polygon closure is implicit.

## Employees and assignments

- `employees`: current imported employee profile keyed by the Arrise employee ID.
- `employee_imports`: one upload attempt with status and aggregate counts.
- `employee_import_rows`: relational staging rows for a pending import.
- `employee_import_row_errors`: row-level validation failures for a rejected import.
- `assignments`: time-bounded employee allocation to a stable placed-element identity.

An exclusion constraint or transaction-level validation prevents overlapping active assignments for the same assignable space. Employees may have simultaneous assignments to different spaces.

## Publication invariants

Publishing is transactional and requires:

- exactly one valid floor boundary;
- orthogonal, non-self-intersecting polygons;
- all Placed Elements, including physical elements, Zones, and Obstacles, inside the boundary;
- no prohibited overlaps;
- rotations limited to 0°, 90°, 180°, or 270°;
- every assigned placement to reference an assignable template revision;
- no unresolved deletion of an assigned placement;
- at most one Published revision for the floor.
