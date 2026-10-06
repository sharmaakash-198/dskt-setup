# Low-Level Design

## Design principles

- The backend is authoritative for domain invariants.
- Published business records are immutable or archived, not destructively edited.
- Commands express intent; read models are shaped for screens.
- Identifiers are opaque UUIDs except imported employee IDs and human-facing labels.
- Time values use UTC instants; physical coordinates use integers.
- No domain state is stored in JSONB.

## Backend modules

### Identity

Defines an authentication-provider interface with local-session and Entra-token adapters. It resolves provider subjects to application users and loads roles. Authentication middleware attaches an immutable request principal containing application user ID, provider, provider subject, and role set. Domain modules do not branch on provider type.

### Locations

Implements organization, site, building, floor, and floor-plan administration. Archival is rejected when active descendants would become unreachable unless the operation explicitly archives the whole subtree.

### Templates

Creates template identities and immutable revisions. Publishing a template revision makes it the default for new placements; existing placements retain their original revision.

### Geometry

Provides integer-only operations for:

- polygon normalization and signed area;
- orthogonality and non-zero edge checks;
- self-intersection detection;
- point and polygon containment;
- polygon intersection and edge-touch classification;
- quarter-turn rotation and translation;
- bounding-box calculation.

Geometry functions must be deterministic, independently tested, and unaware of persistence.

### Floor plans

Creates drafts, acquires editor leases, applies editor commands, runs validation, and publishes revisions. Supported placement transformations are translation and quarter-turn rotation only.

### Workforce

Parses and validates Excel imports, applies employee upserts, resolves manager references, and maintains import history. An employee omitted from a subsequent file remains unchanged.

### Allocation

Generates labels and manages time-bounded assignments. It validates assignment capability against the placed element’s pinned Template Revision.

### Audit

Records actor, action, target, time, correlation ID, and a safe textual summary. Audit recording participates in the business transaction where practical.

## Frontend feature areas

### Application shell

Provides environment-selected local or Entra session handling, primary navigation, role-aware routes, error boundaries, notifications, and unsaved-work warnings.

### Facilities editor

Uses a Konva Stage with separate layers for grid, zones, elements, labels, selection, and transient previews. HTML panels provide the template catalog, revision status, properties, and validation results.

Editor state is divided into:

- **server state**: loaded resources, mutations, and cache invalidation;
- **document state**: current draft projection and concurrency version;
- **interaction state**: tool, selection, hover, pan, zoom, drag preview;
- **history state**: reversible local commands not yet invalidated by server reconciliation.

### Workplace map

Uses the same geometry renderer with editing disabled. It adds employee search, assignable-space selection, assignment status, batch labeling, and an accessible details panel.

### Imports

Provides upload, column expectations, validation preview, row errors, confirmation, and import history. It never claims completion until the backend transaction succeeds.

## Draft editor command model

The frontend sends explicit commands rather than replacing an entire floor document:

- update boundary;
- create, move, rotate, relabel, or remove a Placed Element of any spatial class;
- update editing scale.

Each command includes:

- draft revision ID;
- expected concurrency version;
- command-specific payload;
- client command ID for safe retry.

The backend returns the new concurrency version and affected resource projection. Duplicate client command IDs return the original result.

## Draft lock

- One active editor lease exists per Draft.
- A lease identifies the application user and expires unless renewed.
- The editor renews while active and releases on clean exit.
- Another Facilities Admin may view the draft but cannot mutate it.
- An authorized Facilities Admin may take over an expired lease.
- A lease is coordination, not security; every mutation still checks authorization and concurrency.

## Autosave and undo

- Valid editor commands are debounced and saved automatically.
- The UI shows `Saving`, `Saved`, `Offline`, or `Conflict`.
- Undo and redo operate on semantic commands, not serialized document snapshots.
- A command rejected by the backend is removed or compensated locally and surfaced to the user.
- Closing with unsent changes triggers a warning.

## Revision publication

Publication performs these checks:

1. A boundary exists and is valid.
2. Every polygon is orthogonal, simple, and non-degenerate.
3. Every required object lies within the boundary.
4. Illegal overlaps do not exist.
5. Every placement references an active Template Revision.
6. Labels satisfy uniqueness rules.
7. Carried-forward assignments still point to surviving assignable placements.

The transaction:

1. locks the Floor Plan and relevant revisions;
2. verifies the draft concurrency version;
3. archives the prior Published revision;
4. marks the draft Published;
5. creates the next editable draft only when requested;
6. commits an audit event.

## Stable placement identity

A logical placement has a stable identity independent of a revision. Revision-specific state points to that identity. Copying a plan to a new draft carries the identity forward. Deleting and recreating an element produces a new identity, even if its geometry and label match.

This identity determines whether labels and assignments can safely carry across publication.

## Label generation

The request contains selected placement IDs, prefix, starting integer, width, separator, and ordering strategy. Supported ordering begins with explicit selection order and geometric row-major or column-major order.

The backend generates and validates the entire preview. Confirmation includes a preview token or content hash so changed selections cannot receive stale labels.

## Assignment rules

- A placement is assignable only when its pinned Template Revision says so.
- One Assignable Space may not have overlapping assignment periods.
- An Employee may have overlapping assignments to multiple spaces.
- Ending an assignment preserves history.
- An assignment to a placement removed from a future revision requires resolution before publication.
- Archiving or deactivating an Employee does not erase assignment history and blocks new assignments.

## Error model

API errors contain a stable machine code, user-safe message, correlation ID, and optional field/entity references. Stack traces, SQL details, token contents, and imported personal data are never returned.

Error families include authentication, authorization, validation, conflict, not found, rate limit, and internal failure.

## Testing boundaries

- Geometry: property and example-based unit tests.
- Domain services: transactional integration tests against PostgreSQL.
- API: contract and authorization tests.
- Frontend: component tests for panels and state transitions; interaction tests for editor commands.
- End-to-end: publish floor, import employees, label spaces, assign employee, and locate employee.
