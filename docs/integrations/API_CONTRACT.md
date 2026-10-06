# API Contract

## Contract ownership

The backend repository owns the REST API and generated OpenAPI document. The frontend repository consumes a pinned OpenAPI artifact and generates its client and TypeScript types. Domain types are not copied manually between repositories.

Breaking changes require a new API major version or a coordinated migration period.

## Protocol

- HTTPS and JSON for ordinary requests and responses.
- Multipart upload only for employee workbooks.
- Local development uses an HttpOnly opaque-session cookie; deployed environments use bearer access tokens issued by Microsoft Entra ID.
- API base path begins with `/api/v1`.
- UTC timestamps use ISO 8601.
- UUIDs are opaque strings.
- Floor coordinates are integer world coordinates. Template geometry uses integer template-local coordinates; both use the same 10-centimetre unit.
- JSON is a transport representation; the database prohibition on JSONB remains unchanged.

## Resource groups

### Session

- Resolve the current application user, roles, and permitted navigation.

### Locations

- Organizations are read-only in the MVP.
- Sites, buildings, floors, and Floor Plans support role-appropriate list, create, update, and archive operations.

### Floor Plan Revisions

- List revisions.
- Create a Draft from the Published revision.
- Read a revision projection.
- Acquire, renew, release, or reclaim an editor lease.
- Submit an idempotent editor command.
- Validate a Draft.
- Publish a valid Draft.

### Templates

- Browse Categories and Templates.
- Create or archive a Template.
- Create a new immutable Template Revision.
- Set the current revision for future placements.

### Employees and imports

- Search and read Employees.
- Upload an Excel workbook.
- Read validation summary and row errors.
- Confirm or abandon a ready import.
- Read import history.

### Labels and assignments

- Preview and confirm batch-generated labels.
- Read an Employee’s Assignments.
- Read current/future Assignments for a placement.
- Create or end an Assignment.

## Read projections

The editor may receive a floor projection containing the boundary and Placed Elements grouped by physical, Zone, and Obstacle spatial classes, plus referenced Template Revisions and validation metadata. This is a purpose-built read model, not an invitation to replace normalized server state wholesale.

The Workplace map projection omits Draft-only editing data and adds current occupant summaries appropriate to the caller.

## Mutation rules

- The API uses explicit command endpoints for multi-row domain operations.
- Draft editor commands include expected concurrency version and client command ID.
- Publication, import confirmation, batch labeling, and assignment changes are transactional.
- Retries with the same idempotency key and request hash return the original outcome.
- Reuse of an idempotency key with different input is a conflict.

## Concurrency

Responses for mutable resources expose a concurrency version or ETag. Mutations require the expected value. Stale writes return a conflict with the current version; clients must reconcile rather than overwrite silently.

An editor lease coordinates authorship but does not replace optimistic concurrency.

## Pagination and search

- Collection endpoints use cursor pagination.
- Page size has a documented default and maximum.
- Search input is trimmed, bounded, and normalized.
- Sorting uses an explicit allowlist and deterministic tie-breaker.
- Employee search supports employee ID, name, and email without exposing inactive records to Viewers.

## Error envelope

Every error response contains:

- stable machine-readable code;
- user-safe message;
- correlation ID;
- optional field errors;
- optional references to affected domain entities.

Standard HTTP semantics:

- `400` malformed request;
- `401` missing or invalid identity;
- `403` authenticated but unauthorized;
- `404` absent or intentionally hidden resource;
- `409` lifecycle, uniqueness, lease, or concurrency conflict;
- `422` structurally valid request violating domain rules;
- `429` rate limited;
- `500` unexpected failure.

## OpenAPI quality rules

- Every operation declares security, permissions, success, and error responses.
- Schemas do not use unconstrained free-form objects.
- Enums have stable wire values.
- Examples contain synthetic data only.
- Deprecated fields state replacement and removal policy.
- CI checks that generated OpenAPI matches committed contract output.
- Frontend CI generates against the pinned artifact and fails on incompatible usage.

## Compatibility

Compatible changes include adding optional response fields, new endpoints, and new enum values only when consumers are required to tolerate unknown values.

Breaking changes include removing or renaming fields, changing meaning or units, tightening accepted input without migration, changing authorization assumptions, and changing identifier semantics.

## Health endpoints

- Liveness reports whether the process can serve.
- Readiness verifies required dependencies such as PostgreSQL.
- Health responses expose no secrets, connection strings, or internal topology.
