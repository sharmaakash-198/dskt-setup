---
status: accepted
supersedes: 0004-microsoft-entra-authentication.md
---

# Stage local and Microsoft Entra authentication behind one identity boundary

## Context

DSKT must be fully implementable and testable on a developer machine before Microsoft Entra or any cloud service is configured. Direct Entra authentication in every environment would make local product work depend on an external application registration, tenant configuration, redirect URIs, and network access.

Authentication and domain authorization are separate concerns. PostgreSQL application roles already determine what an authenticated user may do.

## Decision

The backend exposes one normalized authenticated principal to application services regardless of identity provider.

- `local` uses database-backed credentials and sessions.
- deployed `dev` and `production` environments use Microsoft Entra ID.
- The configured provider is selected at startup; providers cannot be combined within one running environment.
- The local provider refuses to start outside the explicitly named local environment.
- Application roles always come from PostgreSQL and every protected operation authorizes in the backend.

Local credentials use a unique username, an Argon2id password hash, and a server-generated opaque session token. The browser receives only an `HttpOnly`, `Secure` when applicable, `SameSite` cookie. The database stores a hash of the session token, its expiry, and revocation state. Seed/bootstrap tooling creates synthetic local users; plaintext passwords are never committed.

The Entra adapter uses MSAL authorization-code flow with PKCE in the frontend. The backend validates API access tokens by signature, issuer, tenant, audience, expiry, and not-before time, then resolves the immutable Entra object ID to an application user.

Application users are provider-neutral. External identities are stored separately and are unique by provider and provider subject. Email remains mutable display/contact data, not an identity key.

## Consequences

- Tickets 01–30 require only Docker, the application repositories, and PostgreSQL.
- Entra integration begins only after the local product release gate.
- Authentication adapters and frontend session handling need explicit contract tests.
- Local authentication is development infrastructure, not a production fallback or emergency bypass.
- Production-like authorization can be tested locally because the same application users and role grants are used by both providers.
