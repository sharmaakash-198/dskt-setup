# 07: Create a Template identity

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 03 Enter a role-authorized workspace  
**Status:** completed

## What to build

Allow a Facilities Admin to create an Element Category and stable Element Template identity before any immutable geometry revision exists.

## Acceptance criteria

- [x] Facilities Admin can create and order Element Categories used by the Template catalog.
- [x] Facilities Admin can create an Element Template with category-scoped unique code, name, and description.
- [x] A newly created Template has no current revision and cannot yet be placed.
- [x] Template identity creation is atomic and never creates a partial or mutable revision.
- [x] The catalog presents loading, empty, validation, archived, and permission-denied states.
- [x] Workplace Planner and Viewer may read permitted Template metadata but cannot mutate it.

## Verification

- Test category ordering, Template identity, uniqueness, empty-current-revision state, and authorization through HTTP against PostgreSQL.
- Component-test catalog creation and validation states.
- Browser-test creating a Template identity from an empty catalog.
