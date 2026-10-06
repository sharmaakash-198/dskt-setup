# 33: Sign in to DEV with Microsoft Entra

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 32 Deploy application repositories independently  
**Status:** ready-for-agent

## What to build

Replace the local login surface in AWS DEV with Microsoft Entra sign-in while preserving the same provider-neutral application principal and PostgreSQL authorization behavior.

## Acceptance criteria

- [ ] The DEV frontend uses MSAL authorization-code flow with PKCE and requests an access token for the DSKT API audience.
- [ ] The backend validates signature, issuer, Arrise tenant, audience, expiry, and not-before time using cached Entra JWKS.
- [ ] Immutable Entra object ID resolves through the external-identity table to a provider-neutral application user.
- [ ] Email changes do not create another application user or determine identity.
- [ ] Local password and session endpoints are disabled and the local provider cannot start in DEV.
- [ ] Missing mapping, inactive user, invalid token, and expired token produce stable safe access-denied behavior.

## Verification

- Contract-test token-validation outcomes and provider-neutral authorization.
- Browser-test sign-in, refresh, sign-out, access denial, and return navigation in DEV.
- Confirm tokens and authorization headers are absent from logs.
