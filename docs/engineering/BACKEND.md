# Backend Architecture and Guidelines

## Foundation

The backend will be an independent Fastify TypeScript service. It owns domain policy, Drizzle migrations, PostgreSQL access, OpenAPI generation, local-session and Entra-token adapters, and audit recording.

The service is organized by domain capability rather than generic controller/service/repository folders.

## Module boundaries

Recommended top-level modules:

- identity;
- locations;
- templates;
- geometry;
- floor-plans;
- workforce;
- allocation;
- audit;
- platform.

Each domain module may contain transport handlers, application services, domain logic, and persistence adapters. Imports between modules follow declared service interfaces; handlers never query another module’s tables directly.

## Layer rules

- HTTP handlers parse transport input, call one application operation, and map its result.
- Application services own transaction boundaries and authorization decisions.
- Domain functions own invariants and contain no HTTP or database dependencies.
- Repositories perform persistence without deciding business policy.
- Geometry is a pure deterministic library.
- Configuration is validated once at startup.

## Database rules

- All schema changes use reviewed forward migrations.
- Production schema changes are never applied through ORM auto-sync.
- Transactions are explicit for multi-row business operations.
- Queries select required columns rather than unrestricted rows.
- Foreign keys and unique/check constraints backstop domain validation.
- Raw SQL is acceptable when it is clearer or required for PostgreSQL constraints, but remains parameterized and tested.
- JSONB is not used for domain data.
- PostGIS is not introduced in the MVP.

## API rules

- OpenAPI is generated from the actual route contract.
- Inputs and outputs receive runtime validation.
- Stable domain error codes are mapped centrally.
- Authorization is declared and enforced per operation.
- Collection endpoints are paginated.
- Mutation retries use idempotency where duplicate execution would be harmful.
- Request and response logs exclude sensitive payloads.

## Authentication rules

- Select exactly one authentication adapter from validated startup configuration.
- In local development, verify Argon2id password hashes, issue opaque HttpOnly sessions, store only token hashes, and refuse to enable this adapter elsewhere.
- In deployed environments, validate Entra tokens locally against cached JWKS and pin tenant, issuer, and API audience.
- Use provider plus provider subject as the external identity key.
- Look up active application user and roles on protected requests.
- Never trust role claims supplied by the frontend.

## Domain rules

- Published and Archived Floor Plan Revisions are immutable.
- Existing Placed Elements retain their pinned Template Revision.
- Placement transforms are translation and quarter-turn rotation only.
- Backend geometry validation is authoritative.
- Assignment periods for one space cannot overlap.
- Employee omission from an import does not imply deactivation.
- Archival preserves history.

## Background work

The initial import may run synchronously within bounded file and row limits. If measured execution exceeds request-host limits, move parsing/application to a worker while preserving the same import state machine. Do not add a queue speculatively.

## Logging and observability

- Emit structured logs with timestamp, severity, service version, environment, correlation ID, route, status, and duration.
- Propagate or create a correlation ID at the HTTP boundary.
- Record metrics for latency, errors, database pool usage, imports, publications, and assignment conflicts.
- Never log bearer tokens, database URLs, workbook rows, or unrestricted request bodies.

## Failure handling

- Unexpected failures produce generic client messages and detailed internal logs.
- Database transient failures may be retried only when operation semantics are safe.
- Transaction serialization or concurrency failures become explicit conflicts where appropriate.
- Process-level unhandled failures trigger graceful shutdown after readiness is removed.

## Backend testing

- Unit tests cover pure domain and geometry logic.
- Integration tests use a real PostgreSQL instance with migrations.
- Authorization tests exercise every protected operation against all roles.
- Contract tests verify OpenAPI behavior and examples.
- Migration tests apply from an empty database and upgrade from the prior release.
- End-to-end tests cover atomic rollback for publication and imports.

## Definition of done

A backend change is incomplete until its domain behavior, authorization, migration impact, OpenAPI contract, tests, audit implications, and observability have been considered.
