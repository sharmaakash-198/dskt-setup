# Authentication, Authorization, and RBAC

## Authentication

Authentication is selected by environment behind one backend identity boundary.

Local development:

- Database-backed local users authenticate with Argon2id password hashes.
- The backend issues an opaque `HttpOnly`, `SameSite` cookie and stores only the session-token hash.
- Local bootstrap uses synthetic users and out-of-band passwords; no plaintext credential is committed.
- The local provider is rejected outside the explicit local environment.

Deployed environments:

- Microsoft Entra ID is the identity provider.
- The frontend uses MSAL and authorization code flow with PKCE.
- The backend accepts access tokens issued for the DSKT API audience, not frontend ID tokens.
- The backend validates signature through Entra JWKS, issuer, tenant, audience, expiry, and not-before time.
- Access is limited to the configured Arrise Entra tenant.

Provider subject is the stable external identity; email is display/contact data and may change.

## Authorization model

The configured provider proves identity. DSKT’s database grants application roles. This separation allows Arrise to change application access without encoding domain policy into credentials or Entra groups.

A user’s effective permissions are the union of all active roles. Every protected API operation checks permissions server-side. Frontend route guards and hidden controls are usability features, not security controls.

## Roles

### System Administrator

This is an operational access-administration role, not a product persona.

Allowed:

- Create or map application users to the configured authentication provider.
- Activate or deactivate application users.
- Grant and revoke application roles.
- Inspect access-administration audit records.

Not allowed by this role alone:

- View Employee, Assignment, Template, or Floor Plan domain data.
- Perform Facilities or Workplace operations.

The first local System Administrator is created by an explicit one-time bootstrap command using an out-of-band password. The first DEV System Administrator is mapped to an approved Entra object ID during environment bootstrap. Every later access change uses the authenticated administration flow.

### Facilities Admin

Allowed:

- Create and archive sites, buildings, and floors.
- Create Floor Plans and Draft revisions.
- Acquire and manage draft editor leases.
- Create Template identities and Template Revisions.
- Edit Floor Boundaries and Placed Elements across physical, Zone, and Obstacle spatial classes.
- Validate and publish Floor Plan Revisions.
- Read published assignment and employee summary data needed for map context.

Not allowed by this role alone:

- Import employee records.
- Create, end, or modify Assignments.
- Grant roles.

### Workplace Planner

Allowed:

- Read location hierarchy and Published floor geometry.
- Read template and placement metadata.
- Import and update Employees through the controlled Excel process.
- Generate and apply placement labels.
- Create and end Assignments.
- Search Employees and inspect assignment history.

Not allowed by this role alone:

- Change boundaries, geometry, Template Revisions, or Floor Plan lifecycle.
- Grant roles.

### Viewer

Allowed:

- Read active location hierarchy.
- Read Published floor geometry.
- Search active Employees.
- Read current space/occupant information and permitted employee details.

Not allowed:

- Access Draft or Archived geometry.
- Read import staging/errors.
- Mutate domain records.

## Permission matrix

| Capability | System Administrator | Facilities Admin | Workplace Planner | Viewer |
|---|---:|---:|---:|---:|
| View published map | No | Yes | Yes | Yes |
| View drafts | No | Yes | No | No |
| Edit floor geometry | No | Yes | No | No |
| Manage templates | No | Yes | No | No |
| Publish revision | No | Yes | No | No |
| Import employees | No | No | Yes | No |
| Batch-label spaces | No | No | Yes | No |
| Manage assignments | No | No | Yes | No |
| Search employees | No | Yes | Yes | Yes |
| View assignment history | No | Read | Yes | No |
| Manage application roles | Yes | No | No | No |

System Administrator may be combined with another role, but it must never be inferred from Facilities Admin or cloud account access.

## Data exposure

- Viewer responses expose only employee fields approved for internal directory use.
- Manager relationships, assignment history, import errors, and inactive employees require elevated permission.
- Spreadsheet contents are never logged.
- API responses do not expose provider credentials or Entra token claims beyond what the UI needs.
- Database credentials are backend-only; browser access to domain tables is forbidden.

## Security controls

- HTTPS is mandatory outside local development.
- Local password and session endpoints are disabled in deployed environments.
- CORS explicitly allows configured frontend origins.
- State-changing endpoints reject unsupported content types and enforce request size limits.
- Employee uploads accept only supported Excel formats and bounded file sizes.
- Formula cells are treated as data or rejected; formulas are never executed.
- Rate limits protect authentication-sensitive, search, and upload endpoints.
- Secrets are supplied through deployment environments and never committed.
- Logs redact authorization headers, cookies, and personal import data.
- Dependency and container scanning run in CI.

## Audit requirements

Audit these actions:

- role grants and revocations;
- location and template archival;
- draft takeover;
- floor publication;
- employee import confirmation;
- batch label application;
- assignment creation or ending.

Each event includes actor, action, target, timestamp, and correlation ID. Audit summaries must remain useful without duplicating sensitive records.

## Access revocation

Deactivating an application user immediately blocks new API requests after credential validation and user lookup. Revoking an application role takes effect on the next request. Local sessions may additionally be revoked. Existing Floor editor leases owned by a deactivated user may be reclaimed.

## Production prerequisites

Before production:

- register separate Entra applications for DEV and production;
- establish approved redirect URIs and API scopes;
- identify operational role administrators;
- confirm employee-field visibility with HR and security;
- complete threat modeling and retention review;
- document incident response and access-review cadence.
