# 03: Enter a role-authorized workspace

**Repositories:** dskt-frontend, dskt-backend  
**Blocked by:** 02 Sign in locally  
**Status:** completed

## What to build

After sign-in, present the Facilities, Workplace, or Viewer workspace permitted by the user’s active PostgreSQL roles, while enforcing the same permissions on every protected backend operation.

## Acceptance criteria

- [x] Effective permissions are the union of all active role grants for the authenticated application user.
- [x] Facilities Admin, Workplace Planner, and Viewer see distinct role-appropriate navigation and empty workspace states.
- [x] A user with multiple roles can reach every capability granted by those roles.
- [x] Missing or revoked roles produce clear access-denied behavior without exposing protected data.
- [x] Backend authorization remains authoritative when a caller bypasses or manipulates frontend guards.
- [x] The request principal is provider-neutral and domain modules do not branch on local versus Entra identity.

## Verification

- Test every workspace-entry operation for all roles, no role, inactive user, and unauthenticated caller at the HTTP/PostgreSQL seam.
- Component-test role-aware navigation and denied states.
- Browser-test one permitted and one denied journey.
