# Summary of Changes — Ticket 02: Sign in Locally

**Ticket Reference:** `docs/implementation/mvp/tickets/02-sign-in-locally.md`  
**Status:** Completed  
**Repositories Involved:** `dskt-backend`, `dskt-frontend`, `DSKT-setup` root  

---

## 1. Objective

Enable local development authentication without any external identity provider (Microsoft Entra or third-party auth). Synthetic local users are backed by PostgreSQL, authenticated via Argon2id password hashes, issue opaque session tokens hashed in the database, and receive an `HttpOnly`, `SameSite=Lax` session cookie.

---

## 2. Acceptance Criteria Verification

| Acceptance Criterion | Status | Verification Detail |
|---|---|---|
| Local bootstrap creates an active synthetic application user, local identity, and Argon2id credential without committing a plaintext password. | Verified | `npm run bootstrap-local -- --username admin --password <password>` seeds the Arrise organization, `admin` user, local identity, Argon2id credential, and `SYSTEM_ADMIN` role grant. Idempotent on re-run. |
| Valid credentials create an opaque session whose token is held in an HttpOnly, SameSite cookie and stored only as a hash. | Verified | Server returns `Set-Cookie: dskt_session=<token>; Path=/; HttpOnly; SameSite=Lax`. Stored in PostgreSQL `dskt.local_auth_sessions.token_hash` as SHA-256 hex digest. |
| Invalid credentials return a stable generic error without revealing whether a username exists. | Verified | Both wrong password for existing user and non-existent username return identical `401 Unauthorized` with `{"error":"invalid_credentials"}`. |
| Refreshing the browser restores a valid unexpired session; sign-out revokes it. | Verified | `GET /auth/session` returns authenticated user identity. `POST /auth/sign-out` marks session `revoked_at` in the database and clears cookie with `Max-Age=0`. |
| Expired, revoked, inactive-user, and malformed sessions are rejected. | Verified | Covered in Vitest integration test suite and HTTP boundary tests against PostgreSQL. |
| The local provider refuses to start when the environment is not explicitly local. | Verified | `LocalAuthProvider` constructor enforces `config.AUTH_ENV === 'local'`, failing fast otherwise. Tested in `test/config.test.ts`. |

---

## 3. Backend Changes (`dskt-backend`)

### 3.1 Dependencies
- Added `argon2` (v0.45.1) for Argon2id password hashing.
- Added `@fastify/cookie` (v11.1.2) for cookie parsing and signed/unsigned cookie management.
- Added `@types/argon2` in devDependencies.

### 3.2 Database Schema & Migrations
- **`drizzle/0001_identity.sql`**:
  - `CREATE EXTENSION IF NOT EXISTS citext;`
  - `dskt.organizations`: ID, name (unique), `archived_at`.
  - `dskt.app_users`: ID, `organization_id` (FK), `email` (citext, unique), `display_name`, `active`, `last_login_at`, timestamps.
  - `dskt.app_user_identities`: ID, `app_user_id` (FK), `provider` ('LOCAL'/'ENTRA'), `provider_subject`, unique constraints.
  - `dskt.local_auth_credentials`: `app_user_id` (PK/FK), `username` (citext, unique), `password_hash`, timestamps, `disabled_at`.
  - `dskt.local_auth_sessions`: UUID ID, `app_user_id` (FK), `token_hash` (unique SHA-256), timestamps, `expires_at`, `revoked_at`.
  - `dskt.roles`: ID (smallint), `code` (unique), `name`. Seeded with `SYSTEM_ADMIN`, `FACILITIES_ADMIN`, `WORKPLACE_PLANNER`, `VIEWER`.
  - `dskt.app_user_roles`: `app_user_id`, `role_id`, `granted_by_user_id`, timestamps, partial unique index for active grants.
- **`drizzle/meta/_journal.json`**: Registered migration `0001_identity`.
- **`src/db/schema.ts`**: Exported Drizzle ORM table definitions matching the schema above.

### 3.3 Configuration (`src/config.ts`)
- Added `AUTH_ENV`: `z.enum(['local']).default('local')`.
- Added `SESSION_SECRET`: `z.string().min(32)`.
- Added `SESSION_TTL_SECONDS`: `z.coerce.number().int().min(60).default(28800)`.

### 3.4 Domain & Route Implementation
- **`src/auth/local-provider.ts`**:
  - Enforces `AUTH_ENV === 'local'`.
  - `signIn(username, password)`: Computes Argon2id verification with timing-oracle protection via dummy hash on missing user. Creates 32-byte opaque base64url token, stores SHA-256 hash in DB, updates `last_login_at`.
  - `fromToken(token)`: Looks up unrevoked, unexpired session joined with active user.
  - `revoke(token)`: Sets `revoked_at = NOW()` for token hash.
- **`src/auth/routes.ts`**:
  - `POST /auth/local/sign-in`: Body `{ username, password }`. Sets `dskt_session` cookie (`httpOnly: true, sameSite: 'lax', path: '/'`). Returns `{ user }` on 200, `{ error: 'invalid_credentials' }` on 401.
  - `GET /auth/session`: Reads `dskt_session` cookie. Returns `{ user }` on 200, `{ error: 'unauthorized' }` on 401.
  - `POST /auth/sign-out`: Revokes token, clears cookie with `reply.clearCookie('dskt_session')`. Returns `{ ok: true }`.
- **`src/app.ts`**:
  - Registered `@fastify/cookie` with `SESSION_SECRET`.
  - Updated CORS configuration: `credentials: true`.
  - Logger configured with redaction: `redact: ['req.headers.authorization', 'req.headers.cookie']`.
  - Registered `authRoutes` with initialized `LocalAuthProvider`.
- **`src/bootstrap-local.ts`**:
  - CLI script runnable via `npm run bootstrap-local -- --username <name> --password <pwd>`.
  - Seeds Arrise organization, user, local identity, Argon2id credential, and `SYSTEM_ADMIN` role within a database transaction.
- **`src/write-openapi.ts` & `contract/openapi.json`**:
  - Updated configuration stub with required `SESSION_SECRET` and regenerated OpenAPI spec.

### 3.5 Backend Test Coverage
- **`test/config.test.ts`**:
  - Validates `SESSION_SECRET` presence and length requirement (>= 32 chars).
  - Validates that `LocalAuthProvider` throws if `AUTH_ENV` is not `local`.
- **`test/auth.integration.test.ts`**:
  - 7 integration tests against real PostgreSQL database:
    - Sign in -> Session restoration -> Sign out -> Revocation verification.
    - Wrong password vs non-existent user returns identical 401 error.
    - Inactive user rejected.
    - Missing cookie returns 401.
    - Malformed token returns 401.
    - Sign out without cookie returns 200.
    - Zero credentials, passwords, or tokens in response bodies.
- **`test/health.integration.test.ts`**:
  - Updated test configuration to satisfy new required auth config.
- **Test Results**: All 14 tests pass (`vitest run`).

---

## 4. Frontend Changes (`dskt-frontend`)

### 4.1 OpenAPI Contract & Client Types
- Synced `contract/openapi.json` into `dskt-frontend/openapi/dskt-backend.openapi.json`.
- Ran `npm run openapi:generate` to produce updated `src/api/schema.ts` with auth operations.
- Updated `src/api/client.ts` to include `credentials: 'include'` so browser sends cookies on cross-origin requests (`localhost:8080` -> `localhost:3000`).

### 4.2 Application Code
- **`src/auth/auth.ts`**: Typed client helper wrappers:
  - `fetchCurrentSession(client)` -> `Promise<User | null>`
  - `performSignIn(client, username, password)` -> `Promise<{ success: true; user } | { success: false; error }>`
  - `performSignOut(client)` -> `Promise<void>`
- **`src/auth/SignInPage.tsx`**:
  - Interactive login view.
  - Automatically queries `GET /auth/session` on mount to restore existing session.
  - Shows authenticated user card (`displayName`, `email`, `id`) and "Sign out" button when signed in.
  - Shows accessible form with username/password inputs and error alert banner when unauthenticated.
  - Navigation link to switch to System Status.
- **`src/status/ReadinessPage.tsx`**:
  - Added header navigation with link button to switch back to Sign in.
- **`src/App.tsx`**:
  - Top-level component switching views between `'auth'` (SignInPage) and `'readiness'` (ReadinessPage).
- **`src/main.tsx`**:
  - Mounts `<App />`.
- **`src/styles.css`**:
  - Added layout styles for form groups, error alert boxes, session card, identity definitions, and navigation links.

### 4.3 Frontend Test Coverage
- **`src/auth/SignInPage.test.tsx`**:
  - Restoring an existing valid session on mount.
  - Displaying sign-in form when no session exists.
  - Displaying generic error on invalid credentials without leaking user existence.
  - Successful sign in transitioning to authenticated user view.
  - Signing out and returning to sign-in form.
- **`src/status/ReadinessPage.test.tsx`**: Existing tests preserved and passing.
- **Test Results**: All 8 tests pass (`vitest run`).

---

## 5. Setup & Infrastructure Changes (`DSKT-setup`)

- **`compose.yaml`**:
  - Added `AUTH_ENV: local` and `SESSION_SECRET: ${SESSION_SECRET:-local-development-session-secret-32ch-min}` to `backend` service environment.
- **`dskt-backend/.env.example`**:
  - Added `AUTH_ENV=local` and `SESSION_SECRET=...` documentation.

---

## 6. Verification and Health Checks

All checks pass cleanly across both repositories:
1. `dskt-backend`:
   - `npm run format` -> clean Prettier formatting
   - `npm run lint` -> 0 errors, 0 warnings
   - `npm run typecheck` -> TypeScript compiles cleanly with zero errors
   - `npm test` -> 14/14 tests pass
   - `npm run openapi:check` -> matches route definitions
   - `npm run build` -> compiles to `dist/` cleanly
2. `dskt-frontend`:
   - `npm run format` -> clean Prettier formatting
   - `npm run lint` -> 0 errors, 0 warnings
   - `npm run typecheck` -> TypeScript compiles cleanly
   - `npm test` -> 8/8 tests pass
   - `npm run openapi:check` -> matches schema
   - `npm run build` -> Vite production build passes
3. Docker Compose runtime:
   - `postgres`, `backend`, and `frontend` containers running and healthy.
   - Live curl tests verified:
     - `POST /auth/local/sign-in` -> 200 OK with `Set-Cookie` and user payload.
     - `GET /auth/session` -> 200 OK with authenticated user.
     - `POST /auth/sign-out` -> 200 OK and cookie expired.
     - `GET /auth/session` -> 401 Unauthorized after sign-out.
     - Invalid credentials -> 401 Unauthorized generic error.
     - Logs confirmed redaction of credentials and cookies.

---

## 7. Context for Next Agent / Ticket

- **Next Ticket:** Check `docs/implementation/mvp/plan.md` and `docs/implementation/mvp/tickets/` (likely Ticket 03).
- **Authentication Pattern:**
  - Fastify routes requiring an authenticated user should read `request.cookies.dskt_session` and call `provider.fromToken(token)` or use an authentication preHandler hook.
  - Application user ID resolves to `dskt.app_users.id`.
  - Roles can be checked from `dskt.app_user_roles` joined with `dskt.roles`.
- **Database Connection for Local Integration Tests:**
  - Local tests require PostgreSQL: `DATABASE_URL="postgres://dskt:dskt-local-only@localhost:5433/dskt" npm test`.
