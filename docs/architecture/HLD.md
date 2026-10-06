# High-Level Design

## System context

DSKT is an internal Arrise web application. A browser communicates with a separately runnable HTTP API. The API owns all domain rules and persists normalized relational data in PostgreSQL. Authentication is provider-adapted: database-backed identity is isolated to local development, while deployed environments authenticate through Microsoft Entra ID.

```text
Arrise user
    |
    v
DSKT frontend ---- local DB identity (local only)
    |          \--- Microsoft Entra ID (deployed)
    |
    | HTTPS REST + bearer token
    v
DSKT backend
    |
    +---- PostgreSQL
    |
    +---- generated OpenAPI document
```

PostgreSQL is the system of record and application-role authority. Clients never access domain tables directly.

## Deployment units

### Frontend repository

`dskt-frontend` will contain a React and Vite single-page application. It is independently versioned and consumes a generated client based on the backend’s published OpenAPI contract. It uses a local session client in Docker and MSAL in deployed environments. DEV static assets are deployed to S3 behind CloudFront.

### Backend repository

`dskt-backend` will contain a Fastify TypeScript API, Drizzle schema and migrations, OpenAPI generation, authentication adapters, background-safe import processing, and domain services. It is independently versioned, runs in Docker locally, and deploys as an ECS Fargate service in DEV.

### Database

PostgreSQL stores normalized domain state. Docker provides local PostgreSQL; Amazon RDS provides DEV PostgreSQL. Geometry uses polygon and ordered-vertex tables; JSONB and PostGIS are excluded from the initial design. Transactions protect publication, imports, labels, and assignments.

## Logical components

### Identity and access

- Select exactly one authentication provider at startup.
- Resolve a local database identity or Entra object identifier to a provider-neutral application user.
- Validate local opaque sessions or Entra access tokens according to the configured provider.
- Combine all active application roles held by that user.
- Apply authorization in API services, never only in frontend controls.

### Location catalog

Owns Organization, Site, Building, Floor, and Floor Plan identities and archival status.

### Template catalog

Owns Element Categories, Element Templates, immutable Template Revisions, template geometry, colors, and assignment capability.

### Floor planning

Owns Floor Plan Revisions, Floor Boundaries, Placed Elements across all spatial classes, labels, transforms, validation, draft locks, and publication.

### Workforce

Owns imported Employee records, manager relationships, teams, departments, employment status, and import history.

### Allocation

Owns time-bounded Assignments and enforces exclusive occupancy of an Assignable Space.

### Contract publication

The backend emits OpenAPI as the cross-repository contract. The frontend generates types and request functions from a pinned backend contract version.

## Principal data flows

### Authentication

1. The frontend invokes the configured local or Entra session adapter.
2. Local authentication verifies an Argon2id hash and issues an opaque HttpOnly session; Entra authentication obtains an API access token through MSAL and PKCE.
3. The backend validates the configured credential form and resolves a provider-neutral application user.
4. The backend loads application roles from PostgreSQL.

### Draft editing

1. The frontend acquires a time-limited edit lease.
2. It loads a complete draft projection required by the editor.
3. Local commands update the immediate UI and enter the undo history.
4. Debounced commands are sent with the revision’s concurrency version.
5. The backend validates and commits the mutation, or rejects stale/invalid state.

### Publication

1. The backend performs full structural and geometric validation.
2. Any error blocks publication and returns stable error codes tied to entities.
3. In one transaction, the current publication is archived, the draft is published, and carried-forward assignments are reconciled.

### Employee import

1. The backend stores import metadata and parses the workbook.
2. A validation preview is persisted relationally.
3. Confirmation applies all valid changes in one transaction.
4. The source workbook must not be retained longer than operationally required.

## Availability and consistency

- The MVP favors strong consistency over offline availability.
- PostgreSQL is the system of record.
- Writes that affect multiple rows are transactional.
- Published plans and active assignments must never expose partially updated states.
- Optimistic concurrency protects ordinary edits; an editor lease reduces concurrent draft conflicts.

## Observability

Every request receives a correlation identifier. The backend emits structured logs without employee spreadsheet contents or access tokens. Audit events record security- and business-significant changes. Health endpoints distinguish process liveness from database readiness.

## Evolution boundaries

- Local and Entra authentication adapters are isolated from domain authorization.
- Database access is isolated behind repositories and transactions.
- Renderer state is isolated from API resource shapes through frontend adapters.
- Attendance and HRMS integrations will enter through explicit integration modules rather than adding source-specific fields to core assignment tables.
- Team optimization will consume published geometry and workforce projections without owning either.

## Environment progression

1. `local`: Docker Compose runs frontend, backend, and PostgreSQL with no required third-party runtime.
2. `dev`: Terraform provisions CloudFront/S3, ALB/ECS Fargate, RDS, Secrets Manager, and CloudWatch; Entra authentication is enabled.
3. `production`: deferred until DEV evidence, security review, retention approval, and operational ownership are complete.
