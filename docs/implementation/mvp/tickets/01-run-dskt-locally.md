# 01: Run DSKT locally

**Repositories:** DSKT-setup, dskt-frontend, dskt-backend  
**Blocked by:** None (can start immediately)  
**Status:** completed

## What to build

Provide a one-command Docker-based local DSKT spine in which the browser calls the generated API client, the backend checks PostgreSQL readiness, and a developer can distinguish process health from database health.

## Acceptance criteria

- [x] The frontend and backend are initialized as independent repositories with independent dependencies and documented commands.
- [x] Docker Compose starts frontend, backend, and PostgreSQL from a clean machine setup without AWS, Entra, Vercel, or Supabase.
- [x] The browser displays backend liveness and database-readiness results obtained through the generated OpenAPI client.
- [x] Backend migrations apply from an empty database and startup fails clearly when validated configuration is missing or invalid.
- [x] Each application repository has strict TypeScript, deterministic dependency installation, lint, typecheck, test, build, container, and CI baselines.
- [x] Example environment files contain no secrets, and runtime containers do not run as root where applicable.

## Verification

- Start from clean volumes and prove the readiness journey in a browser.
- Run each repository’s baseline checks and migration-from-empty check.
- Stop PostgreSQL and verify that liveness stays distinct from readiness.

## Notes

- Do not add product domain behavior beyond the readiness slice.
- Keep frontend and backend releases independent.
- Verified: `docker compose up --build` brings up `dskt-postgres`, `dskt-backend`, and `dskt-frontend`.
- Verified: Both application repos pass format, lint, typecheck, tests, openapi checks, build, and audits.
- Verified: Stopping PostgreSQL keeps the Fastify backend process live (200 OK with `{"status":"live"}`) while reporting database unreadiness (503 Service Unavailable with `{"status":"not_ready"}`), and restarts recover readiness automatically.
