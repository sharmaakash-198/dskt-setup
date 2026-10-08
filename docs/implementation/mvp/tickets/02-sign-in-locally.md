# 02: Sign in locally

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 01 Run DSKT locally  
**Status:** completed

## What to build

Allow a synthetic, database-backed local user to sign in, restore their session, see their identity, and sign out without any external identity provider.

## Acceptance criteria

- [x] Local bootstrap creates an active synthetic application user, local identity, and Argon2id credential without committing a plaintext password.
- [x] Valid credentials create an opaque session whose token is held in an HttpOnly, SameSite cookie and stored only as a hash.
- [x] Invalid credentials return a stable generic error without revealing whether a username exists.
- [x] Refreshing the browser restores a valid unexpired session; sign-out revokes it.
- [x] Expired, revoked, inactive-user, and malformed sessions are rejected.
- [x] The local provider refuses to start when the environment is not explicitly local.

## Verification

- Exercise login, restoration, rejection, expiry, deactivation, and logout at the HTTP boundary against PostgreSQL.
- Browser-test the successful sign-in and sign-out journey.
- Confirm credential and cookie values are absent from logs.

### Verification Notes

- **Database migration:** `drizzle/0001_identity.sql` establishes `organizations`, `app_users`, `app_user_identities`, `local_auth_credentials`, `local_auth_sessions`, `roles`, and `app_user_roles`.
- **Local bootstrap:** `npm run bootstrap-local -- --username admin --password <password>` seeds Arrise org, synthetic user, Argon2id hash, and SYSTEM_ADMIN role. Tested and verified idempotent.
- **Contract & routes:** `POST /auth/local/sign-in`, `GET /auth/session`, and `POST /auth/sign-out` added to Fastify OpenAPI contract and mirrored in frontend types.
- **Security & log hygiene:** Cookie is `HttpOnly`, `SameSite=Lax`. Passwords and session cookies are redacted in logs. Identical 401 `{"error":"invalid_credentials"}` response on wrong password and unknown username.
- **Tests & CI:**
  - `dskt-backend`: all 14 unit and integration tests passing (`npm test`, `npm run lint`, `npm run typecheck`, `npm run openapi:check`, `npm run build`).
  - `dskt-frontend`: all 8 tests passing (`npm test`, `npm run lint`, `npm run typecheck`, `npm run openapi:check`, `npm run build`).
- **Live containers:** Stack successfully rebuilt and validated via `compose.yaml`.

