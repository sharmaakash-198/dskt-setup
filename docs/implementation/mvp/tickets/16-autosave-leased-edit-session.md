# 16: Autosave a leased edit session

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 14 Transform placed spaces; 15 Place Zones and Obstacles  
**Status:** ready-for-agent

## What to build

Give a Facilities Admin a renewable single-editor lease and visible autosave for semantic Draft commands.

## Acceptance criteria

- [ ] Opening an editable Draft acquires a time-limited lease and clearly shows owner and expiry state.
- [ ] Only the current lease holder can commit Draft mutations; another user receives a read-only conflict state.
- [ ] Debounced semantic commands autosave with lease token, concurrency version, and client command ID.
- [ ] Retrying an identical command returns the original result without duplicate mutation; reusing an ID with another payload is rejected.
- [ ] Lease renewal, expiry, release, and audited takeover behave predictably.
- [ ] Autosave status distinguishes saving, saved, validation failure, conflict, and unavailable states.

## Verification

- Test lease races, renewal, expiry, takeover, idempotency, and concurrency through HTTP against PostgreSQL.
- Interaction-test autosave status and the second-editor read-only experience.
- Browser-test takeover after the original editor is deactivated or expired.
