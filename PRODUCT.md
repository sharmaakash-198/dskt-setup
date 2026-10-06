# DSKT Product Definition

This is the concise product baseline. Detailed behavior and acceptance criteria live in [`docs/product/MVP.md`](docs/product/MVP.md).

DSKT ("desk it") helps Arrise model office floors and allocate employees to physical spaces.

## MVP outcome

The MVP supports an end-to-end workflow:

1. A Facilities Admin creates the location hierarchy and a draft floor-plan revision.
2. The Facilities Admin draws an orthogonal Floor Boundary.
3. The Facilities Admin creates or selects reusable templates and places physical elements, Zones, and Obstacles on the plan.
4. The Facilities Admin validates and publishes the revision.
5. A Workplace Planner imports employees from Excel, labels assignable spaces, and assigns employees.
6. Viewers search for employees and inspect their locations on the published plan.

Attendance, leave status, team-layout optimization, public employee views, and real-time collaboration are outside the MVP.

## Roles

- **Facilities Admin**: manages sites, buildings, floors, templates, and floor-plan revisions.
- **Workplace Planner**: imports employees, generates placement labels, and manages assignments.
- **Viewer**: searches employees and views published plans.

A user may hold more than one role.

## Location and revision rules

- The hierarchy is Organization → Site → Building → Floor → Floor Plan → Floor Plan Revision.
- Arrise is the only organization; tenant administration is not part of the product.
- A Floor may have many revisions but at most one Published revision.
- Editing a Published revision creates a Draft copy.
- Publishing a Draft archives the previously Published revision.
- A Draft has one active editor lease; concurrent real-time editing is excluded.
- Stable placement identities carry assignments into copied revisions.
- Removing an assigned placement produces a blocking publication warning.

## Geometry rules

- One world unit equals 10 centimetres.
- Editing Scale is `2ⁿ`, where `n` is from 0 through 8.
- `world coordinate = grid coordinate × Editing Scale`.
- Changing Editing Scale resamples grid coordinates while preserving world geometry.
- Zoom affects rendering only.
- Polygons contain ordered vertices without repeating the first vertex.
- Every polygon is closed implicitly and consists only of horizontal and vertical edges.
- Vertices are ordered anticlockwise.
- Placed Elements can be translated and rotated by 0°, 90°, 180°, or 270°.
- Placed Elements cannot be resized. Geometry changes create a new Element Template Revision.
- Every Placed Element, including physical elements, Zones, and Obstacles, must remain inside the Floor Boundary.
- Physical elements and obstacles cannot overlap; touching edges is allowed.
- Zones may contain physical elements and other zones.

## Template rules

- Templates are reusable across Arrise.
- Editing a template creates an immutable new revision.
- Existing placements continue referencing their original template revision.
- Assignment eligibility belongs to the template revision and cannot be overridden by a placement.
- Custom templates use their polygon, border color, white interior, centered label, and hover details in the Workplace Planner view.

## Employee import and assignments

- Employees are imported from `.xlsx` files.
- Employee ID is the stable reconciliation key.
- Existing employees are updated and new employees are created.
- Employees missing from a later import remain unchanged.
- Explicitly inactive employees are deactivated.
- Duplicate or invalid rows reject the import and produce an error report.
- Initial fields are employee ID, name, email, manager ID, team, department, location, employment status, and optional job title.
- An Assignable Space has at most one active employee assignment.
- An Employee may have multiple active assignments.
- Assignments have a start time and optional end time.
- Bulk label generation accepts a prefix, starting number, width, and ordered placement selection; collisions block confirmation.

## MVP screens

- Local database login during local development; Microsoft Entra ID login in deployed environments
- Sites, buildings, and floors
- Floor-plan revision list
- Facilities Admin map editor
- Element template library and editor
- Employee Excel import with validation results
- Workplace Planner assignment map
- Employee search and details

## Capacity and quality

- Support at least 2,000 placed elements per floor.
- Support up to 100 vertices per polygon.
- Use Konva for both interactive map views and HTML overlays for accessible controls and tooltips.
- Autosave Draft changes and provide undo/redo within an editing session.
- Use polished, role-appropriate interfaces for both geometry editing and employee assignment.
