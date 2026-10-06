# Geometry Model

## Coordinate systems

### World coordinates

World coordinates are canonical and persisted as signed integers. One world unit represents 10 centimetres. Physical geometry never changes merely because the editor’s scale or zoom changes.

The Floor Boundary establishes the useful extent; the renderer is not limited to a fixed pixel canvas.

### Grid coordinates and Editing Scale

Editing Scale is `f = 2ⁿ`, where `n` is an integer from 0 through 8. A grid coordinate is converted to a world coordinate by:

```text
world_x = f × grid_x
world_y = f × grid_y
```

At scale 16, a `4 × 3` grid rectangle spans `64 × 48` world units. If scale changes to 4, the same physical rectangle spans `16 × 12` grid cells while its persisted world coordinates remain `64 × 48`.

Changing Editing Scale:

- does not resize or move existing geometry;
- changes the grid interval and snapping of future edits;
- is allowed only when `f` is one of 1, 2, 4, 8, 16, 32, 64, 128, or 256;
- defaults to 16 for a new draft.

### Screen coordinates and Zoom

Zoom and pan are frontend viewport transforms. They are never persisted as floor geometry and never affect snapping or physical size.

## Polygon representation

Every polygon has one polygon record and an ordered list of vertices. Vertices are stored once; closure from the last vertex to the first is implicit.

Canonical polygon rules:

- at least four vertices;
- at most 100 vertices;
- integer coordinates only: world coordinates for floor geometry and template-local coordinates for Template Revisions;
- anticlockwise order;
- every edge is horizontal or vertical;
- no zero-length edges;
- no consecutive collinear edges after normalization;
- no self-intersection;
- non-zero enclosed area;
- no repeated closing vertex.

The API accepts only canonical polygons. A client may submit a non-canonical anticlockwise polygon with redundant collinear vertices only if the endpoint explicitly documents normalization; canonical persisted output remains authoritative.

## Element template geometry

Template Revision geometry is local to an origin. Its canonical bounding box starts at `(0, 0)` unless the shape requires an explicitly documented anchor. Geometry is immutable after the revision is used.

Template dimensions are derived from vertices, not stored as competing authoritative values.

## Placement transform

A Placed Element references one Template Revision and stores:

- world-coordinate translation `(x, y)`;
- rotation of 0, 90, 180, or 270 degrees;
- stable placement identity;
- revision-specific label and display properties.

Placement geometry is derived by rotating local vertices around the template origin and applying translation. Placements cannot scale or resize template geometry.

## Spatial classes

Every non-boundary floor polygon is a Placed Element. Its pinned Template Revision declares whether it is physical, a Zone, or an Obstacle.

### Boundary

Exactly one Floor Boundary belongs to a Floor Plan Revision. Anything outside it is unavailable.

### Physical element

Desks, private offices, plants, furniture, and similar elements occupy space. Two physical elements may touch edges but may not overlap interiors.

### Obstacle

Pillars and other blocked structures occupy space. Obstacles may touch but not overlap physical elements.

### Zone

Rooms, walking areas, common areas, and team areas are semantic regions. Zones may contain physical elements and may overlap other Zones. A walking area is a Zone, not an Obstacle.

## Containment and intersection

- Boundary containment includes edge contact.
- Physical element and obstacle interior overlap is invalid.
- Merely touching at an edge or vertex is valid.
- Every required placement, obstacle, and zone vertex must lie inside or on the boundary.
- A polygon crossing the boundary is invalid even when all sampled points appear inside.
- Zones intended as containers do not make their contents part of the same geometry record.

## Placement validation timing

The frontend performs immediate advisory validation for interaction quality. The backend repeats authoritative validation on every mutation and performs complete floor validation before publication.

Invalid drag previews may be displayed distinctly, but an invalid final position is not persisted.

## Integer arithmetic

Geometry algorithms should use integer orientation and segment operations wherever possible. Division is avoided for topology decisions. Derived screen values may be floating point, but persisted coordinates and domain comparisons remain integer-based.

## Display labels

The label anchor is derived from the polygon using a point-on-surface strategy. A bounding-box center is acceptable only when it lies inside the polygon. Font size may adapt to available screen area, but labels must remain available through the accessible details UI when they cannot be rendered legibly.

## Examples

An axis-aligned template rectangle:

```text
(0,0), (4,0), (4,3), (0,3)
```

Placed at grid coordinate `(10,5)` with Editing Scale 16, its world translation is `(160,80)` and its world extent is `64 × 48`.

After changing Editing Scale to 4, the stored translation and extent remain unchanged. The translation now corresponds to grid coordinate `(40,20)` and the extent to `16 × 12` grid cells.
