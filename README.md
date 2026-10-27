# DSKT

DSKT (pronounced “desk it”) is an internal workplace-mapping and seat-allocation system for Arrise. It lets Facilities model office floors and lets Workplace Planners assign employees to desks or private offices.

This repository is the documentation and setup workspace. It intentionally contains no application code.

## Repository layout

- `dskt-frontend/` — reserved for the independent frontend repository; kept empty until implementation begins.
- `dskt-backend/` — reserved for the independent backend repository; kept empty until implementation begins.
- `.agents/skills/` — canonical project-local agent workflows.
- `.activegraph/` — optional DSKT project-memory runtime and pack; secrets and databases stay local.
- `docs/` — product, architecture, data, security, integration, and engineering documentation.
- `design/` — static HTML mockups of every MVP screen plus the design mood board. Open `design/index.html`; serve the folder (for example `python3 -m http.server --directory design`) so shared assets load.
- `GLOSSARY.md` — canonical DSKT domain language.
- `AGENTS.md` — rules for future implementation agents.
- `introduction.md` — original product narrative; retained as source context, not as the normative specification.

## Document map

1. [Concise product definition](PRODUCT.md)
2. [MVP scope](docs/product/MVP.md)
3. [High-level architecture](docs/architecture/HLD.md)
4. [Low-level design](docs/architecture/LLD.md)
5. [Geometry model](docs/architecture/GEOMETRY.md)
6. [Concise data model](DATA_MODEL.md)
7. [Detailed database schema](docs/data/DATABASE_SCHEMA.md)
8. [API contract](docs/integrations/API_CONTRACT.md)
9. [Employee imports](docs/integrations/EMPLOYEE_IMPORT.md)
10. [RBAC and security](docs/security/RBAC.md)
11. [Frontend guidelines](docs/engineering/FRONTEND.md)
12. [Backend guidelines](docs/engineering/BACKEND.md)
13. [Delivery and operations](docs/engineering/DELIVERY.md)
14. [Architectural decisions](docs/adr/)
15. [Cognee and ActiveGraph research](docs/research/COGNEE_AND_ACTIVEGRAPH.md)
16. [Fresh-machine and agent setup](docs/setup/README.md)
17. [Agent tool index](docs/tools/README.md)
18. [MVP implementation specification and ticket plan](docs/implementation/mvp/plan.md)

## Current scope boundary

The MVP includes floor-plan editing, reusable element templates, versioned floor plans, employee import, employee-to-space assignment, and a Workplace Planner map/search experience. Attendance integrations, live presence, team-layout optimization, manager views, employee self-service, and real-time collaborative editing are deferred.

## Local execution & Clean Start

Start the complete product locally with a single command from `dskt-setup`:

```bash
# Clean start: resets volumes, creates database, applies migrations,
# bootstraps synthetic users, and starts all services
./scripts/clean-start.sh

# Or standard Docker Compose:
docker compose up --build
```

- Frontend: <http://localhost:8082> (override with `DSKT_FRONTEND_HOST_PORT`)
- Backend liveness: <http://localhost:3001/health/live> (`DSKT_BACKEND_HOST_PORT`)
- PostgreSQL on host: `localhost:5436` (`DSKT_POSTGRES_HOST_PORT`)
- Database readiness: <http://localhost:3001/health/ready>

### Synthetic Users (Local Development Personas)

Clean start automatically provisions the four core personas with Argon2id-hashed credentials:

| Username | Role | Password | Description |
|---|---|---|---|
| `admin` | `SYSTEM_ADMIN` | `dskt-local-admin` | Access administration, user role assignments, lease reclamation |
| `facilities` | `FACILITIES_ADMIN` | `dskt-local-facilities` | Sites, buildings, floors, boundary editing, templates, publications |
| `planner` | `WORKPLACE_PLANNER` | `dskt-local-planner` | Workforce import, batch space labeling, space assignments |
| `viewer` | `VIEWER` | `dskt-local-viewer` | Read-only directory and published map browsing, employee locating |

## Local Release Gate Verification

Run the full clean-room release gate verification script to validate dependencies, containers, OpenAPI drift, migrations from empty, synthetic data, full test suites, and performance budgets:

```bash
./scripts/verify-local-release-gate.sh
```

## Status

Ticket 30 (Pass local release gate) is completed. The product runs locally via Docker with all critical user journeys, comprehensive authorization coverage against real PostgreSQL, accessibility alternatives, and verified 2,000-element performance budgets.
