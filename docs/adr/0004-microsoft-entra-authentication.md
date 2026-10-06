---
status: superseded
superseded-by: 0008-stage-local-and-entra-authentication.md
---

# Authenticate directly with Microsoft Entra ID

DSKT uses the Arrise Microsoft Entra application as its identity provider. The frontend signs users in through MSAL, the API validates Entra JWTs, and application roles remain in PostgreSQL; Supabase provides PostgreSQL only and is not an authentication intermediary.

This decision is superseded by ADR 0008. Microsoft Entra remains the deployed-environment identity provider, while local development begins with an isolated database-backed identity adapter.
