# 02: Sign in locally

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 01 Run DSKT locally  
**Status:** ready-for-agent

## What to build

Allow a synthetic, database-backed local user to sign in, restore their session, see their identity, and sign out without any external identity provider.

## Acceptance criteria

- [ ] Local bootstrap creates an active synthetic application user, local identity, and Argon2id credential without committing a plaintext password.
- [ ] Valid credentials create an opaque session whose token is held in an HttpOnly, SameSite cookie and stored only as a hash.
- [ ] Invalid credentials return a stable generic error without revealing whether a username exists.
- [ ] Refreshing the browser restores a valid unexpired session; sign-out revokes it.
- [ ] Expired, revoked, inactive-user, and malformed sessions are rejected.
- [ ] The local provider refuses to start when the environment is not explicitly local.



## Verification

- Exercise login, restoration, rejection, expiry, deactivation, and logout at the HTTP boundary against PostgreSQL.
- Browser-test the successful sign-in and sign-out journey.
- Confirm credential and cookie values are absent from logs.

