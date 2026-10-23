# Summary of Changes — Ticket 03: Role-authorized workspace

**Ticket Reference:** `docs/implementation/mvp/tickets/03-role-authorized-workspace.md`  
**Status:** Completed  
**Repositories Involved:** `dskt-backend`, `dskt-frontend`, `DSKT-setup`

---

## 1. Objective

After local sign-in, present the Facilities, Workplace, Viewer, or Access Admin workspace permitted by the user’s active PostgreSQL roles, while enforcing the same permissions on every protected backend workspace-entry operation through a provider-neutral request principal.

---

## 2. Acceptance Criteria Verification

| Acceptance Criterion                                             | Status   | Verification Detail                                                                                                                                                             |
| ---------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Effective permissions are the union of all active role grants.   | Verified | Session `roles` / `navigation` and workspace entry checks load `app_user_roles` where `revoked_at IS NULL`. Multi-role users receive the union (e.g. Facilities + Viewer).      |
| Distinct role-appropriate navigation and empty workspace states. | Verified | Frontend `WorkspaceShell` renders nav from session navigation; each workspace entry returns a role-specific empty state. Component tests cover Facilities / Workplace / Viewer. |
| Multi-role users can reach every granted capability.             | Verified | Integration matrix case `combo` and frontend multi-role nav test.                                                                                                               |
| Missing or revoked roles produce clear access-denied behavior.   | Verified | No-role session shows access-denied UI; revoked role returns `403 { error: "forbidden" }` on next request with no workspace payload.                                            |
| Backend authorization is authoritative.                          | Verified | Workspace routes use `requirePrincipal` + `requireAnyRole`; denied callers get 403 without empty-state data.                                                                    |
| Provider-neutral principal; no LOCAL/ENTRA branching in domain.  | Verified | `RequestPrincipal` carries `appUserId`, `provider`, `providerSubject`, and `roles`. Workspace module only checks roles.                                                         |

---

## 3. Backend Changes (`dskt-backend`)

### 3.1 Principal and permissions

- **`src/auth/principal.ts`**: `RequestPrincipal`, `RoleCode`, `NavigationKey`, `navigationForRoles`.
- **`src/auth/permissions.ts`**: `requirePrincipal`, `requireAnyRole`, session cookie constant; attaches `request.principal`.
- **`src/auth/local-provider.ts`**: `signIn` / `fromToken` resolve a principal including active roles and identity (`LOCAL` preferred for local sessions).

### 3.2 Session contract

- **`src/auth/routes.ts`**: Sign-in and session responses now return `{ user, roles, navigation }`.

### 3.3 Workspace entry operations

- **`src/workspace/routes.ts`**: Protected GETs:
    - `/workspace/facilities` → `FACILITIES_ADMIN`
    - `/workspace/workplace` → `WORKPLACE_PLANNER`
    - `/workspace/viewer` → `VIEWER`
    - `/workspace/access-admin` → `SYSTEM_ADMIN`
- Each returns `{ workspace, title, emptyState }` or `401` / `403`.

### 3.4 Tests

- **`test/principal.test.ts`**: navigation union unit tests.
- **`test/authorization.integration.test.ts`**: role matrix, no-role, unauthenticated, inactive, revoked-role.
- **`test/auth.integration.test.ts`**: updated for roles/navigation in session payload.
- **Results:** 27/27 backend tests pass.

---

## 4. Frontend Changes (`dskt-frontend`)

### 4.1 Contract

- Pinned OpenAPI updated; `npm run openapi:generate` refreshed `src/api/schema.ts`.

### 4.2 Auth + workspace shell

- **`src/auth/auth.ts`**: `Session` with roles/navigation; `enterWorkspace` helper.
- **`src/workspace/WorkspaceShell.tsx`**: role-aware nav, empty states, access-denied.
- **`src/auth/SignInPage.tsx`**: authenticated users enter the workspace shell.
- Styles for nav items, empty workspace, and denied state.

### 4.3 Tests

- Sign-in / workspace component tests for permitted nav, multi-role switching, and denied states.
- **Results:** 12/12 frontend tests pass; lint / typecheck / openapi:check / build green.

---

## 5. How to verify

Backend:

```bash
cd dskt-backend
DATABASE_URL="postgres://dskt:dskt-local-only@localhost:5433/dskt" npm test
npm run lint && npm run typecheck && npm run openapi:check && npm run build
```

Frontend:

```bash
cd dskt-frontend
npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build
```

Live HTTP (against a backend running this ticket’s code):

```bash
# Sign in a FACILITIES_ADMIN user, then:
curl -b /tmp/dskt.jar http://localhost:3001/workspace/facilities   # 200 empty Facilities
curl -b /tmp/dskt.jar http://localhost:3001/workspace/workplace    # 403 forbidden
curl http://localhost:3001/workspace/viewer                        # 401 unauthorized
```

---

## 6. Context for Next Agent / Ticket

- **Next tickets (Wave 4, blocked by 03):** 04 Manage local users and roles; 05 Manage Sites; 07 Create Template identity; 21 Preview Employee workbook.
- **Authorization pattern:** protect domain routes with `requirePrincipal(provider)` then `requireAnyRole(...)`. Never trust frontend role claims.
- **Principal shape:** `{ appUserId, provider, providerSubject, roles, email, displayName }`.
- **Bootstrap note:** `bootstrap-local` still grants only `SYSTEM_ADMIN`. Product personas need additional grants (Ticket 04) or direct SQL for local demos.
- **Docker:** rebuild compose `backend`/`frontend` images to pick up Ticket 03 before browser demos on `:8080` / `:3000`.

**Previous ticket summary:** Ticket 02 (sign in locally) remains the auth foundation underneath this authorization shell.

---

# Summary of Changes — Ticket 04: Manage local users and roles

**Ticket Reference:** `docs/implementation/mvp/tickets/04-manage-local-users-and-roles.md`  
**Status:** Completed  
**Repositories Involved:** `dskt-backend`, `dskt-frontend`, `dskt-setup`

---

## 1. Objective

Provide an operational local-only flow for an authenticated System Administrator to create or deactivate synthetic users and grant or revoke application roles, with transactional safe audit events.

---

## 2. Acceptance Criteria Verification

| Acceptance Criterion                                                           | Status   | Verification Detail                                                                                                          |
| ------------------------------------------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| One-time bootstrap creates first local System Admin with OOB password.         | Verified | `bootstrap-local` refuses when an active SYSTEM_ADMIN already exists; creates/completes first admin with Argon2id hash only. |
| System Admin creates provider-neutral user + local identity with OOB password. | Verified | `POST /access-admin/users` creates `app_users` + LOCAL identity + credential; password never returned.                       |
| Grant/revoke Facilities Admin, Workplace Planner, Viewer independently.        | Verified | Integration tests grant all three and revoke Workplace Planner.                                                              |
| At most one active grant; history retained.                                    | Verified | Partial unique index + 409 on duplicate; revoked rows kept.                                                                  |
| Deactivation blocks next request; permits lease reclaim.                       | Verified | Inactive session gets 401; leases marked reclaimable; `POST .../editor-leases/reclaim`.                                      |
| Role/activation changes transactional with safe audit.                         | Verified | Service uses DB transactions; audit rows include actor, target, timestamp, correlation ID.                                   |
| System Admin has no domain access alone; product roles cannot administer.      | Verified | Sysadmin denied facilities/workplace/viewer; FA/WP/Viewer get 403 on access-admin routes.                                    |

---

## 3. Backend Changes (`dskt-backend`)

- **Migration `drizzle/0002_access_admin.sql`:** `audit_events`, minimal `editor_leases`.
- **`src/access-admin/service.ts` + `routes.ts`:** list/create users, grant/revoke roles, deactivate, reclaim leases.
- **`src/bootstrap-local.ts`:** one-time first System Admin (refuses when admin exists).
- **`src/app.ts`:** registers access-admin routes.
- **Tests:** `test/access-admin.integration.test.ts` — **Results:** 33/33 backend tests pass.

---

## 4. Frontend Changes (`dskt-frontend`)

- **`src/access-admin/`:** Access Admin panel (create, grant/revoke, deactivate, reclaim) with no hash/token exposure.
- **`WorkspaceShell`:** mounts panel for `access_admin` workspace.
- OpenAPI client regenerated from backend contract.
- **Results:** 14/14 frontend tests pass; lint / typecheck / openapi:check / build green.

---

## 5. How to verify

Backend:

```bash
cd dskt-backend
DATABASE_URL="postgres://dskt:dskt-local-only@localhost:5433/dskt" npm test
npm run lint && npm run typecheck && npm run openapi:check && npm run build
```

Frontend:

```bash
cd dskt-frontend
npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build
```

Bootstrap (empty DB, once):

```bash
cd dskt-backend
DATABASE_URL="postgres://dskt:dskt-local-only@localhost:5433/dskt" \
  npm run bootstrap-local -- --username admin --password '<out-of-band>'
```

---

## 6. Context for Next Agent / Ticket

- **Next tickets (Wave 4, also unblocked by 03):** 05 Manage Sites; 07 Create Template identity; 21 Preview Employee workbook.
- **Access admin API:** protect with `requirePrincipal` + `requireAnyRole('SYSTEM_ADMIN')`.
- **Grantable roles via API:** only `FACILITIES_ADMIN`, `WORKPLACE_PLANNER`, `VIEWER` (not SYSTEM_ADMIN).
- **`editor_leases`:** temporary reclaim table until Floor Plan leases (ticket 16).
- **Docker:** rebuild compose images before browser demos.

**Previous ticket summary:** Ticket 03 remains the authorization shell; Ticket 04 adds the access-administration operator surface on top.

---

# Summary of Changes — Ticket 05: Manage Sites

**Ticket Reference:** `docs/implementation/mvp/tickets/05-manage-sites.md`  
**Status:** Completed  
**Repositories Involved:** `dskt-backend`, `dskt-frontend`, `dskt-setup`

---

## 1. Objective

Allow a Facilities Admin to create, browse, update, and archive Arrise Sites, with Workplace Planner and Viewer read access to active Sites.

---

## 2. Acceptance Criteria Verification

| Acceptance Criterion                                          | Status   | Verification Detail                                                                                        |
| ------------------------------------------------------------- | -------- | ---------------------------------------------------------------------------------------------------------- |
| FA creates Site with validated code, name, time zone, address | Verified | Zod + service validation; codes normalized uppercase; IANA time zones via `Intl`; optional address fields. |
| Location view: order + loading/empty/validation/unavailable   | Verified | Active sites ordered by code; `SitesPanel` covers loading, empty, conflict messages, unavailable.          |
| Unique codes with stable actionable errors                    | Verified | Org-scoped unique constraint; `409 { error: "site_code_taken" }`; UI maps to readable copy.                |
| Archive soft-deletes; blocks active buildings; no cascade     | Verified | Sets `archived_at`; rejects with `site_has_active_buildings`; historical row retained.                     |
| WP/Viewer read-only; FA mutates                               | Verified | Role matrix integration test including PATCH denial.                                                       |
| Site archival audited                                         | Verified | `audit_events` action `site.archived` with actor, target, correlation ID.                                  |

---

## 3. Backend Changes (`dskt-backend`)

- **Migration `drizzle/0003_sites.sql`:** `sites` and `buildings` (buildings for archive guard ahead of ticket 06).
- **`src/sites/service.ts` + `routes.ts`:** `GET/POST /sites`, `PATCH /sites/:siteId`, `POST /sites/:siteId/archive`.
- **`src/app.ts`:** registers site routes.
- **Tests:** `test/sites.integration.test.ts` — full suite **36/36** pass.

---

## 4. Frontend Changes (`dskt-frontend`)

- **`src/sites/`:** API wrappers + `SitesPanel` (create/list/edit/archive) with loading/empty/error states.
- **`WorkspaceShell`:** mounts Sites panel for Facilities workspace.
- OpenAPI client regenerated from backend contract.
- **Results:** 18/18 frontend tests pass; lint / typecheck / openapi:check / build green.

---

## 5. How to verify

Backend:

```bash
cd dskt-backend
DATABASE_URL="postgres://dskt:dskt-local-only@localhost:5433/dskt" npm test
npm run lint && npm run typecheck && npm run openapi:check && npm run build
```

Frontend:

```bash
cd dskt-frontend
npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build
```

Migrate local DB before browser demo:

```bash
cd dskt-backend
DATABASE_URL="postgres://dskt:dskt-local-only@localhost:5433/dskt" npm run migrate
```

---

## 6. Context for Next Agent / Ticket

- **Next:** 06 Manage Buildings and Floors (blocked by 05).
- **Sites API:** FA mutate; WP/Viewer list; SysAdmin alone denied.
- **Archive rule:** reject while active buildings remain; no cascading archive.
- **Buildings table:** exists for guards; full building CRUD belongs to ticket 06.
- **Docker:** rebuild compose images before browser demos on `:8080` / `:3000`.

**Previous ticket summary:** Ticket 04 remains the access-admin surface; Ticket 05 starts the location hierarchy under Facilities.

---

# Summary of Changes — Ticket 06: Manage Buildings and Floors

**Ticket Reference:** `docs/implementation/mvp/tickets/06-manage-buildings-and-floors.md`  
**Status:** Completed  
**Repositories Involved:** `dskt-backend`, `dskt-frontend`, `dskt-setup`

---

## 1. Objective

Allow a Facilities Admin to complete the location hierarchy by managing Buildings under Sites and Floors under Buildings, with Workplace Planner and Viewer read-only navigation to an empty Floor workspace.

---

## 2. Acceptance Criteria Verification

| Acceptance Criterion                                                                           | Status   | Verification Detail                                                                               |
| ---------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------- |
| FA create/update/browse/archive Buildings under active Site                                    | Verified | HTTP CRUD under `/sites/:siteId/buildings` and `/buildings/:id`; UI BuildingsPanel.               |
| FA create/update/browse/archive Floors under active Building                                   | Verified | HTTP CRUD under `/buildings/:buildingId/floors` and `/floors/:id`; UI FloorsPanel.                |
| Codes unique in parent scope with stable errors                                                | Verified | Unique `(site_id, code)` / `(building_id, code)`; `409 building_code_taken` / `floor_code_taken`. |
| Archived parents reject children; building archive blocked by active floors; no cascade delete | Verified | `site_archived` / `building_archived` / `building_has_active_floors`; soft archive retains rows.  |
| WP/Viewer navigate but cannot mutate                                                           | Verified | Role matrix integration test; UI `canMutate` only in Facilities workspace for FA.                 |
| Building and Floor archival audited                                                            | Verified | `audit_events` actions `building.archived` and `floor.archived`.                                  |

---

## 3. Backend Changes (`dskt-backend`)

- **Migration `drizzle/0004_floors.sql`:** `floors` table with unique code per building.
- **`src/buildings/service.ts` + `routes.ts`:** list/create/update/archive buildings.
- **`src/floors/service.ts` + `routes.ts`:** list/create/update/archive floors.
- **`src/app.ts`:** registers building and floor routes.
- **Tests:** `test/buildings-floors.integration.test.ts` — suite included in **39/39** backend tests pass.

---

## 4. Frontend Changes (`dskt-frontend`)

- **`src/buildings/`** and **`src/floors/`:** API wrappers, BuildingsPanel, FloorsPanel, FloorWorkspace (empty floor state).
- **`SitesPanel`:** Site → Building → Floor drill-down navigation.
- **`WorkspaceShell`:** location hierarchy for facilities/workplace/viewer; mutate only in Facilities for FA.
- OpenAPI client regenerated from backend contract.
- **Results:** 36/36 frontend tests pass; lint / typecheck / openapi:check / build green.

---

## 5. How to verify

Backend:

```bash
cd dskt-backend
DATABASE_URL="postgres://dskt:dskt-local-only@localhost:5433/dskt" npm test
npm run lint && npm run typecheck && npm run openapi:check && npm run build
```

Frontend:

```bash
cd dskt-frontend
npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build
```

Migrate local DB before browser demo:

```bash
cd dskt-backend
DATABASE_URL="postgres://dskt:dskt-local-only@localhost:5433/dskt" npm run migrate
```

Browser: Facilities Admin → open buildings on a Site → create Building → open floors → create Floor → Open floor → empty Floor workspace.

---

## 6. Context for Next Agent / Ticket

- **Next:** check plan/tickets for remaining Wave 4 items (e.g. 07 Create Template identity; 21 Preview Employee workbook) or other unblocked tickets.
- **API shape:** nested list/create under parent; PATCH/archive on resource id.
- **Archive rule:** reject building archive while active floors remain; no cascading archive.
- **UI:** FloorWorkspace is intentionally empty until floor-plan tickets.
- **Docker:** rebuild compose images before browser demos on `:8080` / `:3000`.

**Previous ticket summary:** Ticket 05 delivered Sites; Ticket 06 completes Site → Building → Floor hierarchy management.

---

# Ticket 07 — Create a Template identity

**Ticket:** `docs/implementation/mvp/tickets/07-create-template-identity.md` — completed

- **Backend:** migration `0005_element_templates.sql`; `src/templates/` categories + template identity (`currentRevisionId: null`, `placeable: false`); HTTP tests in `test/templates.integration.test.ts` (41 backend tests pass).
- **Frontend:** `src/templates/TemplatesCatalog` (create/order/archive categories, create templates; read-only for WP/Viewer); OpenAPI client regenerated (40 frontend tests pass).
- **Verify:** `DATABASE_URL=... npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in each app repo; `npm run migrate` before browser demo.
- **Next:** e.g. 21 Preview Employee workbook, or geometry-revision tickets once unblocked.

---

# Ticket 08 — Create an immutable Template Revision

**Ticket:** `docs/implementation/mvp/tickets/08-create-immutable-template-revision.md` — completed

- **Backend:** `0006_template_revisions.sql`; `src/geometry/orthogonal.ts`; create/list revisions under `/element-templates/:id/revisions` (not set current); 48 backend tests pass.
- **Frontend:** `RevisionComposer` with snap/scale, dimensions, accessible summary; catalog lists revisions as not current.
- **Verify:** migrate + test/lint/typecheck/openapi/build in both apps.
- **Next:** 09 diagnose invalid geometry; 11 draft floor plan; 21 employee workbook.

---

# Ticket 09 — Diagnose invalid Template geometry

**Ticket:** `docs/implementation/mvp/tickets/09-diagnose-invalid-template-geometry.md` — completed

- **Backend:** `diagnoseOrthogonalPolygon` in `src/geometry/orthogonal.ts` returns stable codes + vertex/edge indexes; create revision responds `400 invalid_geometry` with `diagnostics[]` and creates no rows (50 backend tests).
- **Frontend:** advisory diagnose in `geometry.ts`; `RevisionComposer` lists diagnostics, focuses affected vertex (`aria-current`), still trusts server on submit; OpenAPI client updated (45 frontend tests).
- **Verify:** migrate + test/lint/typecheck/openapi/build in both apps.
- **Next:** 10 activate and revise template; 11 draft floor plan; 21 employee workbook.

---

# Ticket 10 — Activate and revise a Template

**Ticket:** `docs/implementation/mvp/tickets/10-activate-and-revise-template.md` — completed

- **Backend:** `PUT /element-templates/:id/current-revision` (via `setTemplateCurrentRevision` in `src/templates/service.ts`, routes in `src/templates/routes.ts`); transactional activation validating template ownership, serializes concurrent activations, keeps existing placement pinning, denies activation to unauthorized roles; 55 backend tests pass.
- **Frontend:** `TemplatesCatalog.tsx` distinguishes current revisions with badge, allows Facilities Admins to activate revisions as current via `activateTemplateRevision` API, supports read-only revision history view; OpenAPI client updated; 47 frontend tests pass.
- **Verify:** `DATABASE_URL=... npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-backend`; `npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-frontend`.
- **Next:** 11 create draft floor plan; 21 employee workbook.

---

# Ticket 11 — Create a Draft Floor Plan

**Ticket:** `docs/implementation/mvp/tickets/11-create-draft-floor-plan.md` — completed

- **Backend:** migration `0007_floor_plans.sql`; `src/floor-plans/service.ts`, `src/floor-plans/routes.ts`; unique floor plan identity per floor, revision 1 in Draft state with permitted `2ⁿ` editing scale (1..256) and non-negative concurrency version, idempotent retry with matching key, empty floor handling, Facilities Admin authorization guard; HTTP tests in `test/floor-plans.integration.test.ts` (59 backend tests pass).
- **Frontend:** `src/floors/floor-plan-api.ts`, `src/floors/FloorWorkspace.tsx` (create draft floor plan from empty floor with scale selector, revision history distinguishing Draft, Published, and Archived states, read-only guard for non-facilities); OpenAPI client regenerated; 50 frontend tests pass.
- **Verify:** `DATABASE_URL=... npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-backend`; `npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-frontend`.
- **Next:** 12 edit floor boundary; 21 employee workbook.

---

# Ticket 12 — Edit a Floor Boundary

**Ticket:** `docs/implementation/mvp/tickets/12-edit-floor-boundary.md` — completed

- **Backend:** migration `0008_floor_boundaries.sql` (`floor_plan_revision_boundary_vertices`); `src/floor-plans/service.ts`, `src/floor-plans/routes.ts` (`PUT /floors/:floorId/floor-plan/revisions/:revisionId/boundary`, `PATCH /floors/:floorId/floor-plan/revisions/:revisionId/scale`); orthogonal polygon boundary validation in integer world units (1 unit = 10 cm), implicit closure, permitted `2ⁿ` editing scale (1..256), scale update preserving stored physical geometry, state check (Draft only), optimistic concurrency check (`concurrencyVersion` increment), Facilities Admin authorization guard; HTTP tests in `test/floor-boundaries.integration.test.ts` (63 backend tests pass).
- **Frontend:** `src/floors/BoundaryEditor.tsx`, `src/floors/FloorWorkspace.tsx`, `src/floors/floor-plan-api.ts`; interactive boundary canvas with scale-zoom separation (zoom/pan change only viewport, preserving domain world coordinates), live dimensions and coordinate feedback, accessible HTML summary, orthogonality guidance diagnostics, vertex editing with grid snapping, and boundary saving with concurrency version tracking; OpenAPI client regenerated; 55 frontend tests pass.
- **Verify:** `DATABASE_URL=... npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-backend`; `npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-frontend`.
- **Next:** 13 place physical space; 21 employee workbook.

---

# Ticket 13 — Place a Physical Space

**Ticket:** `docs/implementation/mvp/tickets/13-place-physical-space.md` — completed

- **Backend:**
    - Migration `0009_placed_elements.sql`: created `placement_identities` (stable identity per floor plan) and `placed_elements` (revision-specific placement records pinned to `element_template_revisions`, with rotation degrees 0/90/180/270 and integer world coordinates).
    - Geometry Seam: Added orthogonal spatial predicates in `src/geometry/orthogonal.ts` (`transformVertices`, `isPointInsideOrOnPolygon`, `isPointStrictlyInsidePolygon`, `segmentsCrossProperly`, `isPolygonInsideBoundary`, `doPolygonsOverlap`).
    - Service & API: Implemented `placeElement` and `listPlacements` in `src/floor-plans/service.ts`, exposed routes `POST /floors/:floorId/floor-plan/revisions/:revisionId/placements` and `GET /floors/:floorId/floor-plan/revisions/:revisionId/placements` in `src/floor-plans/routes.ts`.
    - Validation: Validates caller permission (Facilities Admin), floor plan draft lifecycle state, physical template spatial class (`PHYSICAL`), active current template revision, floor boundary containment, and non-overlapping collision against physical/obstacle spaces. Collinear adjacent boundary contacts are cleanly permitted while interior overlaps and out-of-boundary positions are rejected.
    - Tests: Added comprehensive unit tests in `test/geometry.orthogonal.test.ts` and integration tests in `test/placements.integration.test.ts` (68 backend tests pass).
- **Frontend:**
    - OpenAPI: Regenerated TypeScript client schemas (`src/api/schema.ts`).
    - API Client: Added `createPlacedElement` and `listPlacedElements` in `src/floors/floor-plan-api.ts`.
    - Geometry Helpers: Implemented transform, containment, and collision checking in `src/templates/geometry.ts` with unit tests in `src/templates/geometry.test.ts`.
    - Boundary Editor:
        - Added catalog palette displaying only active, unarchived physical templates with current revisions.
        - Drag & drop over floor plan canvas with editing-scale grid snapping.
        - Real-time snapped preview distinguishing invalid positions without relying on color alone (diagonal hatch pattern `url(#invalid-hatch)`, warning badge/symbol, and accessible `role="status"` live region).
        - Commit placement creates stable identity and revision-pinned placed space.
        - Shared SVG renderer displays placed spaces using polygon vertices and labels.
        - Accessible manual placement form and placed spaces summary list.
    - Tests: Added unit and interaction tests in `src/floors/BoundaryEditor.test.tsx` (61 frontend tests pass).
- **Verify:**
    - `DATABASE_URL=... npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-backend` (all clean).
    - `npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-frontend` (all clean).
- **Next:** 14 transform placed spaces; 15 place zones and obstacles; 21 employee workbook.

---

# Ticket 14 — Transform Placed Spaces

**Ticket:** `docs/implementation/mvp/tickets/14-transform-placed-spaces.md` — completed

- **Backend:**
    - Placed element projection: Added `templateRevisionNumber` and `assignable` to `PlacedElementView` and OpenAPI schema.
    - Transformation & Removal API:
        - Implemented `updatePlacement` and `deletePlacement` in `src/floor-plans/service.ts`.
        - Added `PATCH /floors/:floorId/floor-plan/revisions/:revisionId/placements/:placementId` (validating draft lifecycle state, integer world coordinates, quarter-turn rotation `0 | 90 | 180 | 270`, boundary containment, collision prevention, and optimistic concurrency). Strict schema validation forbids any resize parameters (width, height, vertices, scale).
        - Added `DELETE /floors/:floorId/floor-plan/revisions/:revisionId/placements/:placementId` (deletes from draft `placed_elements` revision while strictly preserving the stable `placement_identities` record and historical revisions, with optimistic concurrency check).
    - Verification & Tests:
        - Added 5 quarter-turn property tests in `test/geometry.orthogonal.test.ts` (4 consecutive 90° rotations identity, inverse angle round-trip, arbitrary integer translation + rotation round-trip, segment length preservation, and shoelace area invariance).
        - Added HTTP integration tests in `test/placements.integration.test.ts` covering translation, quarter-turns, invalid rotation rejection (400), resize attempt rejection (400), concurrency conflicts (409), draft deletion, and database identity preservation (74 backend tests pass).
- **Frontend:**
    - OpenAPI: Synced backend OpenAPI spec to `openapi/dskt-backend.openapi.json` and generated `src/api/schema.ts`.
    - Client API: Added `updatePlacedElement` and `deletePlacedElement` in `src/floors/floor-plan-api.ts`.
    - Boundary Editor (`src/floors/BoundaryEditor.tsx`):
        - Selection: Clicking on an SVG placed space or choosing from the Placed Spaces list selects the space with visual dashed highlight and opens the accessible Details Panel.
        - Details Panel: Displays Template Revision, spatial class, coordinates (world units and cm), quarter-turn rotation, assignability, and validation state.
        - Translation & Rotation Controls: Inputs for integer world coordinates snapping to active editing scale, and `↺ 90° CCW` / `↻ 90° CW` quarter-turn rotation buttons.
        - Transform Preview: Real-time responsive preview distinguishing invalid coordinates using diagonal SVG hatch pattern (`url(#invalid-hatch)`), warning symbol (`⚠ Invalid`), and live region alert without relying on color alone, disabling "Save Transform" until valid.
        - Removal: "Remove from Draft" button deletes placement from current draft revision and increments revision concurrency version.
    - Tests: Added interaction tests in `src/floors/BoundaryEditor.test.tsx` verifying selection details, live transform previews, quarter-turn rotation, removal, and concurrency version updates (65 frontend tests pass).
- **Verify:**
    - `DATABASE_URL=... npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-backend` (all clean).
    - `npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-frontend` (all clean).
- **Next:** 15 place zones and obstacles; 16 autosave leased edit session; 21 employee workbook.

---

# Ticket 15 — Place Zones and Obstacles

**Ticket:** `docs/implementation/mvp/tickets/15-place-zones-and-obstacles.md` — completed

- **Backend:**
    - Geometry Seam: Added `SpatialClass`, `doSpatialClassesCollide`, and `checkSpatialCollision` in `src/geometry/orthogonal.ts`. Enforces `GEOMETRY.md` rules: Zones are semantic regions and do not collide with anything (Zones can overlap other Zones, Zones can contain Physical elements and Obstacles); Physical elements and Obstacles mutually collide and cannot overlap interiors, while collinear edge touching without interior intersection is permitted; all spatial classes (`PHYSICAL`, `ZONE`, `OBSTACLE`) must be strictly contained within Floor Boundary.
    - Service: Updated `placeElement` and `updatePlacement` in `src/floor-plans/service.ts` to allow `ZONE` and `OBSTACLE` template placements alongside `PHYSICAL`, applying spatial-class-aware collision checking (`checkSpatialCollision`) while enforcing floor boundary containment for all classes.
    - Tests:
        - Added property and unit tests in `test/geometry.orthogonal.test.ts` for all spatial class combinations and boundary containment.
        - Added comprehensive integration tests in `test/placements.integration.test.ts`: placing `ZONE` and `OBSTACLE` templates, zones overlapping zones (valid), physical elements inside zones (valid), obstacles inside zones (valid), physical-obstacle mutual collision (400 `placement_collision`), boundary containment rejection for zones and obstacles (400 `outside_boundary`), quarter-turn transforms and translations on zones and obstacles, and role-based authorization ensuring Workplace Planner and Viewer are denied placement, update, and deletion mutations (403 `forbidden`) while being permitted to list placements (78 backend tests pass).
- **Frontend:**
    - Geometry Helpers: Added `SpatialClass`, `doSpatialClassesCollide`, and `checkSpatialCollision` in `src/templates/geometry.ts` with unit tests in `src/templates/geometry.test.ts`.
    - Boundary Editor (`src/floors/BoundaryEditor.tsx`):
        - Catalog Palette: Loads active `ZONE`, `OBSTACLE`, and `PHYSICAL` templates with current revisions, displaying spatial class badges (`ZONE`, `OBSTACLE`, `PHYSICAL`).
        - Placement & Transform Preview: Enforces spatial collision rules using `checkSpatialCollision` so that dragging or transforming physical elements/obstacles into zones shows "✓ Valid Position", while physical/obstacle overlaps display the diagonal hatch pattern and "⚠ Invalid Position: Overlaps existing space".
        - Predictable Layer Ordering: Shared SVG renderer organizes layers: 1) Floor Boundary polygon, 2) Zone spaces (rendered at bottom with 50% opacity and dashed border), 3) Obstacle spaces, 4) Physical spaces, 5) Selection affordance outline, 6) Labels layer (rendered above polygons so text is never obscured), and 7) Drag / Transform preview.
        - Accessible Details Panel: Displays spatial class badge and semantic explanation text (identifying Zone semantic regions, Obstacle structural barriers, or Physical spaces) without relying on visual styling alone.
    - Styling: Added CSS badges in `src/styles.css` for `.spatial-badge` and `.spatial-class-badge` (`.badge-zone`, `.badge-obstacle`, `.badge-physical`).
    - Tests: Added interaction tests in `src/floors/BoundaryEditor.test.tsx` verifying palette loading for all classes, layer ordering in SVG DOM, details panel accessibility descriptions, and selection affordance (66 frontend tests pass).
- **Verify:**
    - `DATABASE_URL=... npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-backend` (all 15 test files, 78 tests pass clean).
    - `npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-frontend` (all 12 test files, 66 tests pass clean).
- **Next:** 16 autosave leased edit session; 17 publish floor plan; 21 employee workbook.

---

# Ticket 16 — Autosave a leased edit session

**Ticket:** `docs/implementation/mvp/tickets/16-autosave-leased-edit-session.md` — completed

- **Backend:**
    - Migration `0010_editor_leases_commands.sql`: created `floor_plan_editor_leases` (tracking `revision_id`, `held_by`, `token`, `acquired_at`, `expires_at`, `released_at`) and `processed_commands` (idempotent command journal storing `revision_id`, `command_id`, `payload_hash`, `status_code`, `response_payload`, and `created_at`).
    - Schema & Service:
        - Added tables `floorPlanEditorLeases` and `processedCommands` to `src/db/schema.ts`.
        - Implemented lease lifecycle methods in `src/floor-plans/service.ts`: `acquireLease`, `getLease`, `renewLease`, `releaseLease`, and `takeoverLease`.
        - Integrated `audit_events` with `correlationId: revision.id` for `ACQUIRE_LEASE`, `RELEASE_LEASE`, and `TAKEOVER_LEASE`.
        - Added lease enforcement & command idempotency via helper `checkLeaseAndCommand`: requires valid active lease token (`x-lease-token` / `leaseToken`) matching the caller; verifies idempotent commands via `x-client-command-id` / `clientCommandId` returning cached responses on identical hash retry or returning `409 Conflict` (`command_id_payload_mismatch`) when an ID is reused with a different payload.
        - Wrapped mutation methods (`updateRevisionBoundary`, `updateRevisionScale`, `placeElement`, `updatePlacement`, `deletePlacement`) with lease and command checking.
    - Routes & Errors: Added `GET`, `POST`, `POST /renew`, `POST /release`, and `POST /takeover` endpoints under `/floors/:floorId/floor-plan/revisions/:revisionId/lease` with standard error mappings (`lease_conflict`, `lease_invalid_token`, `lease_expired`, `command_id_payload_mismatch`).
    - Tests: Added comprehensive HTTP integration tests in `test/editor-leases.integration.test.ts` verifying lease acquisition, conflict rejection (`409 lease_conflict`), renewal, release, takeover after expiry/release, mutation authorization with lease token, command deduplication and payload mismatch rejection (83 backend tests pass).
- **Frontend:**
    - OpenAPI: Synced backend OpenAPI spec to `openapi/dskt-backend.openapi.json` and generated `src/api/schema.ts`.
    - Client API: Added `getFloorPlanLease`, `acquireFloorPlanLease`, `renewFloorPlanLease`, `releaseFloorPlanLease`, and `takeoverFloorPlanLease` in `src/floors/floor-plan-api.ts`, and updated mutation APIs to pass `leaseToken` and `clientCommandId`.
    - Boundary Editor (`src/floors/BoundaryEditor.tsx`):
        - Lease Lifecycle: Automatically acquires a 60-second lease on mount for draft revisions, cleanly releases on unmount, and heartbeats every 25 seconds to renew the lease.
        - Lease Status & Takeover: Displays active lease holder and live seconds-remaining countdown badge. When leased by another user, switches to read-only conflict state, disables editing controls, and exposes an audited Takeover button if the lease is expired.
        - Debounced Autosave: Autosaves boundary edits with a 500ms debounce, generating stable client command IDs and attaching lease tokens.
        - Autosave Indicator: Distinguishes `Saving...`, `✓ Saved`, `Validation Error`, `⚠ Conflict`, `⚠ Offline / Unavailable`, and `✓ Ready` without relying on color alone.
    - Tests: Updated `src/floors/BoundaryEditor.test.tsx` verifying lease acquisition, conflict handling, takeover, and debounced autosave (69 frontend tests pass).
- **Verify:**
    - `DATABASE_URL=... npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-backend` (all 16 test files, 83 tests pass clean).
    - `npm test && npm run lint && npm run typecheck && npm run openapi:check && npm run build` in `dskt-frontend` (all 12 test files, 69 tests pass clean).
- **Next:** 17 publish floor plan; 18 floor plan revision history; 21 employee workbook.




