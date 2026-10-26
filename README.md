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

## Local execution

Start the local spine with Docker Compose from the repository root:

```bash
docker compose up --build
```

- Frontend: <http://localhost:8082> (override with `DSKT_FRONTEND_HOST_PORT`)
- Backend liveness: <http://localhost:3001/health/live> (`DSKT_BACKEND_HOST_PORT`)
- PostgreSQL on host: `localhost:5436` (`DSKT_POSTGRES_HOST_PORT`; optional for host-side tools)
- Database readiness: <http://localhost:3001/health/ready>

## Status

Ticket 01 (Run DSKT locally) is completed. The runnable spine starts frontend, backend, and PostgreSQL with health and readiness separation via the generated OpenAPI client.
