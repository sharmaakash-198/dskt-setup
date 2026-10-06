# DSKT Implementation Rules

These rules govern future work derived from this documentation.

## Scope and authority

1. Read `GLOSSARY.md`, the relevant architecture documents, and accepted ADRs before changing behavior.
2. `introduction.md` is source context. The structured documents and ADRs are normative where they clarify or supersede it.
3. Do not silently change a settled domain term or invariant. Update the affected document and add or supersede an ADR when the decision qualifies.
4. Keep frontend and backend as independent repositories with independent dependencies and deployments.

## Agent and tool setup

1. Canonical project skills live under `.agents/skills/`; do not commit duplicate `.claude/skills/`, `.cursor/skills/`, or `agent/skills/` trees.
2. Read `docs/agents/domain.md` for domain-document authority and `docs/agents/issue-tracker.md` before issue operations.
3. Follow `docs/tools/<tool>/README.md` before using ActiveGraph, Graphify, chrome-agent, or Lavish.
4. ActiveGraph is supplemental memory for work logs, draft notes, and bugs. `GLOSSARY.md` and accepted ADRs remain authoritative.
5. Graphify is a generated structural index, never a source of domain truth; run it independently in each application repository after code exists.
6. Lavish artifacts and Graphify output are disposable and gitignored. Never place secrets, credentials, employee records, or floor data in them.
7. Do not copy or commit `.activegraph/.env`, ActiveGraph databases, harness MCP client files, local virtual environments, generated tool output, or production data.
8. Cognee is deferred. Do not introduce it without a measured retrieval need, a synthetic-data spike, and a new accepted ADR.

## Domain invariants

1. One world unit is 10 centimetres.
2. Editing Scale is `2ⁿ` for `n = 0..8`; changing it never changes physical geometry.
3. Zoom is visual only.
4. Persist floor geometry as integer world coordinates and template geometry as integer template-local coordinates using the same 10-centimetre unit.
5. Polygons are orthogonal, anticlockwise, simple, and implicitly closed; do not store the first vertex twice.
6. Placements can translate and rotate only by quarter turns; they cannot resize.
7. Existing placements pin an immutable Template Revision.
8. Published and Archived Floor Plan Revisions are read-only.
9. One Assignable Space cannot have overlapping Assignment periods.
10. An Employee may hold multiple Assignments.
11. Omitting an Employee from an import does not deactivate them.

## Data rules

1. PostgreSQL is authoritative.
2. Normalize domain data; do not use JSONB for domain persistence.
3. Do not introduce PostGIS without a new architectural decision.
4. Enforce critical invariants in both domain logic and database constraints where practical.
5. Use transactions for publication, import application, batch labeling, and assignment changes.
6. Archive historically referenced records instead of deleting them.
7. Never place database credentials or direct domain-table access in the frontend.

## Security rules

1. Local development uses the isolated database identity adapter; deployed environments use Microsoft Entra ID. Database roles authorize application actions in every environment.
2. Validate authorization in the backend for every protected operation.
3. Treat provider subject, including Entra object ID, as external identity; do not key identity by email.
4. Never log access tokens, secrets, spreadsheet rows, or unrestricted personal data.
5. Use synthetic employee data in development and tests.
6. Audit floor publication, imports, labels, Assignments, role changes, and draft takeovers.

## API rules

1. Backend OpenAPI is the cross-repository contract.
2. Frontend API types are generated, not manually duplicated.
3. Use stable error codes and optimistic concurrency.
4. Make retry-sensitive commands idempotent.
5. Preserve backward compatibility during independent deployments.

## UI rules

1. Use the shared Konva renderer for Facilities and Workplace maps.
2. Keep domain geometry separate from viewport state.
3. Provide accessible HTML search and detail alternatives to canvas-only information.
4. Do not encode status through color alone.
5. Treat Facilities and Workplace as distinct workflows, not editable and disabled copies of one page.

## Engineering rules

1. Use conventional commits.
2. Keep changes small and focused.
3. Add tests at the lowest useful layer and include authorization tests for protected behavior.
4. Do not add infrastructure, queues, caches, or spatial extensions without demonstrated need.
5. Do not copy Arcada Planner wholesale. Reuse only intentionally reviewed MIT-licensed ideas or portions, preserve required notices, and adapt them to DSKT’s model.
6. Verify documentation links, migrations, generated contracts, linting, types, tests, and builds before declaring work complete.
7. Complete and verify the Docker-based local product milestone before introducing Entra or AWS dependencies.
8. Define AWS DEV infrastructure in Terraform; keep frontend and backend artifacts independently deployable.
