# 25: Preview and confirm batch labels

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 20 Browse Published maps and revision history  
**Status:** ready-for-agent

## What to build

Allow a Workplace Planner to generate a deterministic label proposal for selected Published Physical Spaces, review conflicts, and apply the accepted batch transactionally.

## Acceptance criteria

- [ ] Workplace Planner can select eligible Published Physical placements and configure the documented label sequence.
- [ ] Preview is deterministic and shows proposed labels without mutating placement records.
- [ ] Duplicate, collision, ineligible-space, and stale-revision conflicts are reported before confirmation.
- [ ] Confirmation applies the exact accepted preview in one transaction or applies nothing.
- [ ] Labels are visible in the shared map renderer and accessible HTML details.
- [ ] Application is idempotent, authorized, and audited.

## Verification

- Unit-test deterministic ordering and collision detection.
- Integration-test preview immutability, atomic confirmation, stale state, retry, role denial, and audit persistence.
- Browser-test selecting spaces, reviewing labels, confirming, and seeing the result.
