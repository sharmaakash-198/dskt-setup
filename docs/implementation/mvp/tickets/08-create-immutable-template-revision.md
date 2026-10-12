# 08: Create an immutable Template Revision

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 07 Create a Template identity  
**Status:** completed

## What to build

Allow a Facilities Admin to compose valid Template geometry and create a new immutable Template Revision in one atomic operation.

## Acceptance criteria

- [x] The creation form captures spatial class, assignability, validated colors, and integer template-local geometry in 10-centimetre world units.
- [x] Only `PHYSICAL` revisions may be assignable.
- [x] Edges remain horizontal or vertical and the first vertex is not duplicated for closure.
- [x] The interface shows dimensions, coordinate feedback, snapping, and a non-canvas accessible geometry summary.
- [x] One transaction creates the next revision number and its normalized ordered vertices; failure creates neither.
- [x] The new Template Revision is immutable immediately and is not available for placement until selected as the Template’s current revision.
- [x] Geometry is stored relationally, not as JSONB.
- [x] Editing works without coupling domain geometry to Zoom or viewport state.

## Verification

- Unit/property-test integer coordinate handling, orthogonal composition, normalization, and implicit closure.
- Test atomic revision creation, numbering, immutability, and authorization through HTTP against PostgreSQL.
- Interaction-test composing and submitting valid geometry.
