# DSKT MVP

## Product outcome

The MVP enables Arrise to model office floors and allocate employees to desks or private offices through two purpose-built experiences:

- Facilities can create accurate, versioned floor plans from reusable orthogonal elements.
- Workplace Planners can import employees, label assignable spaces, make assignments, and inspect the resulting floor.

The primary value is workplace modeling and seat allocation. Employee discovery is a consumer experience built on the same data.

## Users

### Facilities Admin

- Manage sites, buildings, and floors.
- Create and revise Floor Boundaries and place templates representing physical elements, Zones, and Obstacles.
- Create and revise element templates.
- Place, move, rotate, and remove elements in draft plans.
- Validate and publish floor-plan revisions.

### Workplace Planner

- Import employee spreadsheets.
- Search and inspect employees.
- Generate labels for batches of placed elements.
- Assign and unassign employees.
- View published maps with assignment information.

### Viewer

- Browse published maps.
- Search for an employee.
- View a space, its occupant, and basic employee information.

A user may hold more than one role.

## Required screens

1. Environment-appropriate sign-in and access-denied states: local database authentication for local development and Microsoft Entra for deployed environments.
2. Site, building, and floor navigation.
3. Floor-plan revision list with Draft, Published, and Archived states.
4. Facilities map editor with catalog, canvas, properties, validation, and publishing.
5. Element template catalog and orthogonal template editor.
6. Employee import with preview, validation errors, and import history.
7. Workplace assignment map with batch labeling and employee assignment.
8. Employee search and employee detail.

Both Facilities and Workplace experiences must be intentionally designed. The Workplace view is not a disabled copy of the editor: it prioritizes search, assignment status, occupant information, clear selection states, and efficient batch operations.

## Core journeys

### Publish a floor

1. A Facilities Admin creates or opens a draft copied from the published revision.
2. The Facilities Admin edits the Floor Boundary and Placed Elements, including physical elements, Zones, and Obstacles.
3. Autosave persists valid incremental changes.
4. The Facilities Admin runs validation and resolves blocking errors.
5. Publishing archives the previous published revision and makes the draft current atomically.

### Import employees

1. A Workplace Planner uploads an Excel workbook.
2. DSKT parses and validates the workbook without changing employee data.
3. DSKT presents row-level errors and an update/create/deactivate summary.
4. The planner confirms a valid import.
5. DSKT applies the import atomically and retains an audit record.

### Label spaces

1. A Workplace Planner selects multiple assignable spaces.
2. The planner enters a prefix, starting number, width, and ordering direction.
3. DSKT previews every generated label.
4. Duplicate or occupied labels block confirmation.
5. Confirmation applies the labels atomically.

### Assign an employee

1. A Workplace Planner selects an assignable space or finds an employee.
2. DSKT shows current and future assignments for both.
3. The planner chooses an effective start and optional end.
4. DSKT prevents overlapping assignments for the same space.
5. DSKT saves the assignment and records the actor and time.

## Explicitly deferred

- Attendance, leave, work-from-home, and live-presence integrations.
- Team capacity planning and AI-assisted layout optimization.
- Manager-specific and employee self-service applications.
- Real-time multi-user editing.
- Curved or diagonal geometry.
- Arbitrary rotation or per-placement resizing.
- Custom illustration requirements for every element.
- Multiple customer organizations or tenant administration.
- Offline-first editing.

## Quality targets

- Support 2,000 placed elements on one floor.
- Support up to 100 vertices in one polygon.
- Preserve interactive pan, zoom, selection, and dragging on a normal office laptop.
- Never publish geometrically invalid floor plans.
- Never partially apply an employee import, revision publication, batch label, or assignment change.
- Meet keyboard and contrast requirements for all non-canvas controls; provide accessible alternatives for map information.

## Success criteria

The MVP is successful when Facilities can reproduce a representative Arrise floor, a Workplace Planner can import employees and assign them to labeled spaces, and a Viewer can locate an employee without direct database assistance.
