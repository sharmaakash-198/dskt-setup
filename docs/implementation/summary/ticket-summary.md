# Summary of Changes — Ticket 03: Role-authorized workspace

**Ticket Reference:** `docs/implementation/mvp/tickets/03-role-authorized-workspace.md`  
**Status:** Completed  
**Repositories Involved:** `dskt-backend`, `dskt-frontend`, `DSKT-setup`  

---

## 1. Objective

After local sign-in, present the Facilities, Workplace, Viewer, or Access Admin workspace permitted by the user’s active PostgreSQL roles, while enforcing the same permissions on every protected backend workspace-entry operation through a provider-neutral request principal.

---

## 2. Acceptance Criteria Verification

| Acceptance Criterion | Status | Verification Detail |
|---|---|---|
| Effective permissions are the union of all active role grants. | Verified | Session `roles` / `navigation` and workspace entry checks load `app_user_roles` where `revoked_at IS NULL`. Multi-role users receive the union (e.g. Facilities + Viewer). |
| Distinct role-appropriate navigation and empty workspace states. | Verified | Frontend `WorkspaceShell` renders nav from session navigation; each workspace entry returns a role-specific empty state. Component tests cover Facilities / Workplace / Viewer. |
| Multi-role users can reach every granted capability. | Verified | Integration matrix case `combo` and frontend multi-role nav test. |
| Missing or revoked roles produce clear access-denied behavior. | Verified | No-role session shows access-denied UI; revoked role returns `403 { error: "forbidden" }` on next request with no workspace payload. |
| Backend authorization is authoritative. | Verified | Workspace routes use `requirePrincipal` + `requireAnyRole`; denied callers get 403 without empty-state data. |
| Provider-neutral principal; no LOCAL/ENTRA branching in domain. | Verified | `RequestPrincipal` carries `appUserId`, `provider`, `providerSubject`, and `roles`. Workspace module only checks roles. |

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

| Acceptance Criterion | Status | Verification Detail |
|---|---|---|
| One-time bootstrap creates first local System Admin with OOB password. | Verified | `bootstrap-local` refuses when an active SYSTEM_ADMIN already exists; creates/completes first admin with Argon2id hash only. |
| System Admin creates provider-neutral user + local identity with OOB password. | Verified | `POST /access-admin/users` creates `app_users` + LOCAL identity + credential; password never returned. |
| Grant/revoke Facilities Admin, Workplace Planner, Viewer independently. | Verified | Integration tests grant all three and revoke Workplace Planner. |
| At most one active grant; history retained. | Verified | Partial unique index + 409 on duplicate; revoked rows kept. |
| Deactivation blocks next request; permits lease reclaim. | Verified | Inactive session gets 401; leases marked reclaimable; `POST .../editor-leases/reclaim`. |
| Role/activation changes transactional with safe audit. | Verified | Service uses DB transactions; audit rows include actor, target, timestamp, correlation ID. |
| System Admin has no domain access alone; product roles cannot administer. | Verified | Sysadmin denied facilities/workplace/viewer; FA/WP/Viewer get 403 on access-admin routes. |

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

| Acceptance Criterion | Status | Verification Detail |
|---|---|---|
| FA creates Site with validated code, name, time zone, address | Verified | Zod + service validation; codes normalized uppercase; IANA time zones via `Intl`; optional address fields. |
| Location view: order + loading/empty/validation/unavailable | Verified | Active sites ordered by code; `SitesPanel` covers loading, empty, conflict messages, unavailable. |
| Unique codes with stable actionable errors | Verified | Org-scoped unique constraint; `409 { error: "site_code_taken" }`; UI maps to readable copy. |
| Archive soft-deletes; blocks active buildings; no cascade | Verified | Sets `archived_at`; rejects with `site_has_active_buildings`; historical row retained. |
| WP/Viewer read-only; FA mutates | Verified | Role matrix integration test including PATCH denial. |
| Site archival audited | Verified | `audit_events` action `site.archived` with actor, target, correlation ID. |

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

