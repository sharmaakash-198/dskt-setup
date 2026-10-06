# DSKT MVP implementation specification

**Status:** approved for ticketing  
**Plan shape:** 30 local vertical slices followed by 8 AWS DEV slices  
**Authority:** this specification derives from `GLOSSARY.md`, the structured product and architecture documents, and accepted ADRs. Those sources prevail if this summary omits detail.

## Goal

Deliver DSKT (“desk it”) as an internal Arrise application for:

- Facilities Admins to define locations, reusable Element Templates, and versioned Floor Plans;
- Workplace Planners to import Employees, label Assignable Spaces, and manage time-bounded Assignments;
- Viewers to search for an Employee and locate their active space on an accessible Published map.

The product must be complete and reproducible locally before any third-party runtime is required.

## Delivery sequence

### Milestone 1: complete local product

Tickets 01–30 run through Docker Compose and require only the two application repositories plus local PostgreSQL. The local system includes all MVP workflows, authorization, auditing, accessibility, and representative performance verification.

Local authentication uses database-backed synthetic users, Argon2id password hashes, and opaque HttpOnly sessions. It is an isolated adapter that cannot start outside the explicit local environment.

### Milestone 2: AWS DEV

Tickets 31–38 deploy the proven product to an isolated AWS DEV environment:

- private S3 plus CloudFront for frontend assets;
- ECR, ECS Fargate, and an Application Load Balancer for the backend;
- private RDS PostgreSQL;
- Secrets Manager and CloudWatch;
- Route 53 and ACM when project DNS is available;
- Terraform in the setup repository.

DEV replaces local authentication with Microsoft Entra while preserving the same provider-neutral application users, PostgreSQL role grants, authorization rules, and domain behavior.

Production rollout is outside this plan.

## Repository boundaries

DSKT has three independent repositories:

- the setup/documentation repository, which also owns cross-repository planning and Terraform;
- `dskt-frontend`, a React, Vite, and TypeScript application;
- `dskt-backend`, a Fastify, TypeScript, Drizzle, and PostgreSQL service.

A ticket is organized by user-visible functionality, not by repository or technical layer. A vertical ticket may touch both application repositories and the database. Each touched repository still receives an independent focused commit and remains independently deployable.

The backend’s OpenAPI document is the cross-repository contract. Frontend API types and clients are generated from a pinned backend contract.

## Identity and authorization

- Authentication providers resolve to one immutable request principal containing application user ID, provider, provider subject, and effective roles.
- Local development uses the database identity adapter; DEV uses Entra access tokens obtained through MSAL and PKCE.
- Application roles are held in PostgreSQL and checked by the backend on every protected operation.
- Facilities Admin owns location, Template, geometry, revision, and publication workflows.
- Workplace Planner owns Employee import, labels, and Assignments.
- Viewer reads Published maps and permitted Employee/location details.
- System Administrator is an audited operational role for identity mapping, activation, and role grants; it has no domain-data access by itself and is not implied by Facilities Admin.
- Frontend guards improve usability but never replace backend authorization.

## Location and Template behavior

- The hierarchy is Organization → Site → Building → Floor → Floor Plan.
- The MVP has one Organization named Arrise; organization identity is not a tenant-isolation key.
- Element Templates have stable identities and immutable Template Revisions.
- Template geometry uses integer template-local coordinates in 10-centimetre world units.
- A Template Revision is immutable from creation. A Template points to the current revision used for future placements.
- Changing a Template creates another immutable revision and then changes the current-revision pointer.
- Existing placements remain pinned to their original Template Revision.

## Geometry and editor behavior

- One world unit is 10 centimetres.
- Editing Scale is `2ⁿ` for `n = 0..8`; changing it never changes physical geometry.
- Zoom is visual only.
- Floor geometry uses integer world coordinates.
- Polygons are orthogonal, anticlockwise, simple, implicitly closed, and contain 4–100 vertices.
- Placements translate and rotate by quarter turns only; they cannot resize.
- Physical, Zone, and Obstacle are the supported Placed Element spatial classes.
- Backend validation is authoritative; frontend validation provides immediate guidance.
- Facilities and Workplace use the same React Konva renderer through different interaction policies.
- A Draft editor uses one renewable lease, optimistic concurrency, idempotent commands, autosave, and semantic undo/redo.

## Floor Plan lifecycle

- Floor Plan Revisions are Draft, Published, or Archived.
- One Floor Plan has at most one Draft and one Published revision.
- Published and Archived revisions are read-only.
- Publication performs full validation and lifecycle changes in one transaction.
- Publication errors use stable codes tied to affected entities.
- Placement identities remain stable across revisions so valid Assignments can be carried forward.
- Invalid Assignment carry-forward blocks publication with actionable diagnostics.

## Employee import

- Workplace Planner uploads bounded `.xlsx` workbooks.
- Employee ID is the stable Employee key.
- Preview persists normalized staging rows and row-level errors before application.
- Formula cells and macros are rejected; formulas are never executed.
- Duplicate IDs, invalid references, and manager cycles are reported.
- Confirmation applies valid changes atomically.
- Omitting an Employee from a later import does not deactivate them.
- Workbook contents and unrestricted rows are never logged.
- Development and DEV use synthetic Employee data only.

## Labels and Assignments

- Batch labeling has an explicit preview and confirmation step.
- Label collisions and conflicts are reported before transactional application.
- Assignments are time-bounded and reference stable placement identities.
- One Assignable Space cannot have overlapping Assignment periods.
- An Employee may hold multiple Assignments, including overlapping periods in different spaces.
- Users can create, end, and inspect current, future, and historical Assignments.

## Viewer and accessibility behavior

- Viewer can search active Employees and locate an active Assignment on the Published map.
- Selected map objects appear in an accessible HTML details panel.
- Search and detail flows provide a non-canvas route to the same information.
- Status is not communicated by color alone.
- Critical controls are keyboard accessible and expose visible focus.
- Mobile map editing is unsupported and receives a clear message; read-only search may adapt to tablet widths.

## Persistence and consistency

- PostgreSQL is authoritative and domain persistence is normalized.
- JSONB and PostGIS are excluded initially.
- Critical invariants are enforced in domain logic and database constraints where practical.
- Publication, import application, labels, role changes, and Assignment changes use transactions.
- Historically referenced records are archived rather than deleted.
- The frontend never receives database credentials or direct table access.

## Audit and observability

Audit role grants/revocations, archival, draft takeover, publication, import confirmation, label application, and Assignment creation/ending. Each event includes actor, action, target, timestamp, and correlation ID without duplicating sensitive data.

Every request has a correlation ID. Structured logs exclude credentials, access tokens, workbook rows, and unrestricted personal data. Liveness and database readiness are distinct.

## Verification seams

1. **Backend HTTP/OpenAPI with real PostgreSQL** is the primary business-behavior seam. It verifies authorization, transactions, stable errors, idempotency, and contract behavior.
2. **Pure geometry tests** use examples and properties for polygons, transforms, overlap, integer arithmetic, and scale invariants.
3. **Frontend interaction tests** cover generated-client adapters, semantic commands, permission states, previews, and conflict UX without testing Konva internals.
4. **Browser end-to-end tests** cover a small set of critical completed journeys using synthetic data.
5. **Environment gates** verify Docker-only local operation first, then AWS DEV deployment, recovery, security, observability, accessibility, and representative load.

## Quality gates

The local milestone is complete only when:

- all critical workflows pass in Docker from a documented clean start;
- protected operations have role and denial tests;
- migrations apply from an empty PostgreSQL database;
- OpenAPI generation and pinned-client compatibility pass;
- critical browser journeys pass with synthetic data;
- accessibility checks and targeted keyboard journeys pass;
- a representative Floor with 2,000 Placed Elements remains usable;
- no AWS or Entra configuration is required.

The DEV milestone is complete only when:

- frontend and backend deploy independently;
- Entra sign-in and database roles work end to end;
- database migration, backup, and restore are demonstrated;
- DNS/TLS, CORS, secrets, rate controls, and private database access are verified;
- logs, metrics, health alarms, and audit records diagnose a test incident;
- the critical functional, accessibility, authorization, and load journeys pass in AWS using synthetic data.

## Out of scope

- production rollout;
- attendance, badge, HRMS, or live occupancy integrations;
- optimization or automatic seating recommendations;
- mobile geometry editing;
- offline editing;
- PostGIS, queues, caches, or speculative infrastructure;
- Cognee;
- direct browser access to PostgreSQL;
- copying Arcada Planner wholesale.
