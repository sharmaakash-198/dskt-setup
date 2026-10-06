# 35: Migrate and recover the DEV database

**Repositories:** DSKT-setup, dskt-backend  
**Blocked by:** 32 Deploy application repositories independently  
**Status:** ready-for-agent

## What to build

Prove that DEV database schema changes can be applied safely and that RDS can be restored into a usable environment.

## Acceptance criteria

- [ ] Backend deployment coordinates forward-only migrations before code depends on them.
- [ ] Migration execution is mutually exclusive, observable, and fails the deployment without exposing credentials.
- [ ] Terraform configures the approved RDS backup, retention, encryption, and deletion-protection posture.
- [ ] A backup is restored to an isolated database and the backend becomes ready against it.
- [ ] Restored schema, reference data, and synthetic domain records pass integrity checks.
- [ ] The procedure documents recovery point, recovery time, ownership, and cleanup.

## Verification

- Apply migrations from empty and from the prior supported schema in DEV-like conditions.
- Perform and record one synthetic-data backup restore drill.
- Verify application readiness and representative reads after restore.
