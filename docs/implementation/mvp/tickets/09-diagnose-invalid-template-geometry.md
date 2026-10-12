# 09: Diagnose invalid Template geometry

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 08 Create an immutable Template Revision  
**Status:** completed

## What to build

Give a Facilities Admin authoritative, entity-linked diagnostics when proposed Template Revision geometry violates DSKT’s polygon invariants, without creating a partial revision.

## Acceptance criteria

- [x] Validation covers 4–100 vertices, integer coordinates, orthogonality, simplicity, anticlockwise orientation, implicit closure, and repeated vertices.
- [x] The backend returns stable error codes and identifies the relevant vertex or edge where practical.
- [x] Frontend advisory validation appears during editing but never replaces backend validation.
- [x] Errors are listed in accessible HTML and selecting an error focuses or highlights the affected geometry without relying on color alone.
- [x] Invalid input creates no Template Revision or vertex rows.
- [x] Valid geometry produces a clear ready state without silently changing submitted coordinates beyond documented normalization.

## Verification

- Use example and property tests for valid and invalid polygons, including degenerate and self-intersecting cases.
- Contract-test stable validation errors.
- Interaction-test navigating between the error list and affected canvas geometry.
