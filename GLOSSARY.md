# DSKT Domain

DSKT models physical office layouts and the allocation of employees to assignable spaces within those layouts. These terms are canonical across product, design, database, and API discussions.

## Organization and locations

**Organization**:
The company whose workplaces and users are represented in DSKT. The initial and only organization is Arrise.
_Avoid_: Tenant, customer, account

**Site**:
A geographic office location, such as Noida or Hyderabad.
_Avoid_: Office, workspace, location

**Building**:
A physical building at a Site.
_Avoid_: Office

**Floor**:
A physical level within a Building whose layout can be modeled.
_Avoid_: Workspace, map

## Floor planning

**Floor Plan**:
The continuously identified plan belonging to one Floor.
_Avoid_: Workspace, diagram

**Floor Plan Revision**:
An immutable published or archived representation, or an editable draft representation, of a Floor Plan at a point in time.
_Avoid_: Map version, workspace version

**Floor Boundary**:
The outer orthogonal polygon inside which all floor content must lie.
_Avoid_: Exterior wall, canvas

**Zone**:
A Placed Element whose spatial class defines a labeled area that may contain other elements, such as a room, walking area, or team area.
_Avoid_: Unusable area, shape

**Obstacle**:
A Placed Element whose spatial class defines a non-occupiable physical area that prevents placement, such as a pillar.
_Avoid_: Unusable point, blocked square

## Elements

**Element Category**:
A classification such as Desk, Private Office, Plant, Room, or Obstacle.
_Avoid_: Element type, folder

**Element Template**:
The stable identity of a reusable physical or spatial element design.
_Avoid_: Shape, catalog item

**Element Template Revision**:
An immutable geometry and capability definition for an Element Template.
_Avoid_: Template edit, element dimension

**Placed Element**:
One occurrence of an Element Template Revision in a Floor Plan Revision.
_Avoid_: Floor-map row, instance shape

**Assignable Space**:
A Placed Element whose template revision permits one active employee assignment.
_Avoid_: Seat when the space may be a private office

## Geometry

**World Coordinate**:
An integer coordinate in the floor’s canonical coordinate system, where one unit represents 10 centimetres.
_Avoid_: Pixel, cell coordinate

**Editing Scale**:
A power-of-two grid interval, `2ⁿ` for `n` from 0 through 8, used to represent and snap editing coordinates without changing physical geometry.
_Avoid_: Zoom

**Zoom**:
A visual transformation between world coordinates and screen pixels that does not alter geometry or editing precision.
_Avoid_: Scale

**Orthogonal Polygon**:
A closed polygon whose edges are exclusively horizontal or vertical. Closure is implicit between its last and first stored vertices.
_Avoid_: Right-angled circle, closed circle

## People and allocation

**Employee**:
An imported Arrise worker who may receive assignments.
_Avoid_: Candidate, occupant

**Assignment**:
A time-bounded allocation of one Employee to one Assignable Space.
_Avoid_: Booking, mapping

**Facilities Admin**:
A user role responsible for location structure, floor geometry, plan revisions, and element templates.
_Avoid_: Admin when the narrower role is intended

**Workplace Planner**:
A user role responsible for employee imports, placement labels, and employee assignments.
_Avoid_: HR Admin

**Viewer**:
A read-only user role that can search employees and inspect published floor plans.
_Avoid_: Employee role

## Lifecycle

**Draft**:
An editable Floor Plan Revision that is not visible as the current operational plan.

**Published**:
The single Floor Plan Revision currently used for a Floor’s operational views and assignments.
_Avoid_: Active when referring to a revision

**Archived**:
A retained, read-only record that is no longer current.
_Avoid_: Deleted
