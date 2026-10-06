# 34: Administer DEV users and roles

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 33 Sign in to DEV with Microsoft Entra  
**Status:** ready-for-agent

## What to build

Allow authenticated System Administrators to map Entra identities to DEV application users and grant, revoke, or deactivate PostgreSQL application access.

## Acceptance criteria

- [ ] Environment bootstrap maps the first approved Entra object ID to a System Administrator without granting domain-data access.
- [ ] An authenticated System Administrator maps an immutable Entra object ID to one application user without using email as the identity key.
- [ ] Existing application users may retain provider-neutral history when a DEV Entra identity is attached.
- [ ] Role grants and revocations take effect on the next protected request.
- [ ] User deactivation blocks new requests and permits active editor leases to be reclaimed.
- [ ] Duplicate provider subjects and duplicate active grants are prevented.
- [ ] Mapping, grant, revoke, and deactivation actions require `SYSTEM_ADMIN` and emit audit events.

## Verification

- Test mapping uniqueness, role changes, deactivation, authorization, and auditing through the DEV API against RDS.
- Browser-test a role grant and revocation taking effect without changing Entra configuration.
