# 30: Pass the local release gate

**Repositories:** DSKT-setup, dskt-frontend, dskt-backend  
**Blocked by:** 27 End and inspect Assignments; 29 Locate an Employee on the map  
**Status:** ready-for-agent

## What to build

Turn the completed functionality into a reproducible Docker-only local release candidate with objective quality evidence and no hosted runtime dependency.

## Acceptance criteria

- [ ] A documented clean start creates the database, applies migrations, bootstraps synthetic users, and starts the complete product with one command.
- [ ] Critical browser journeys pass: publish Floor, import Employees, label spaces, create/end Assignment, carry Assignment forward, and locate Employee.
- [ ] Every protected operation has representative allow/deny authorization coverage against real PostgreSQL.
- [ ] Automated accessibility checks and targeted keyboard journeys pass, including non-canvas map alternatives.
- [ ] A representative Floor with 2,000 Placed Elements meets documented interaction and loading budgets on the agreed development profile.
- [ ] Logs, audit records, correlation IDs, health checks, and failure states are demonstrably useful without leaking credentials or Employee rows.
- [ ] No AWS credentials, Entra configuration, Vercel, Supabase, production data, or internet-hosted runtime is required.

## Verification

- Run the full clean-room local verification script and save command-level evidence in the repositories’ normal CI/test outputs.
- Perform dependency, container, OpenAPI drift, migration-from-empty, and synthetic-data checks.
- Do not begin ticket 31 until this ticket is completed.
