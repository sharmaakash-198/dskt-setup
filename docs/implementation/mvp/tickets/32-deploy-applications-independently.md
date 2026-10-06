# 32: Deploy application repositories independently

**Repositories:** DSKT-setup, dskt-frontend, dskt-backend  
**Blocked by:** 31 Reach an AWS DEV readiness page  
**Status:** ready-for-agent

## What to build

Allow frontend and backend repositories to test, build, publish, deploy, and roll back their own immutable DEV artifacts without synchronized release numbers.

## Acceptance criteria

- [ ] Backend CI runs quality gates, builds an immutable image, scans it, publishes it to ECR, and rolls out ECS with health-based failure detection.
- [ ] Frontend CI runs quality gates, verifies its pinned OpenAPI compatibility, publishes immutable assets to S3, and invalidates or versions CloudFront safely.
- [ ] A compatible backend can deploy without a frontend deployment and vice versa.
- [ ] Backend contract changes remain backward compatible through the frontend rollout window.
- [ ] Each repository has a documented rollback to a known artifact without rebuilding.
- [ ] Deployment credentials use least-privilege workload identity rather than long-lived committed keys.

## Verification

- Deploy backend-only and frontend-only changes independently and smoke-test each.
- Demonstrate a failed rollout stops or rolls back safely.
- Verify artifact provenance, OpenAPI drift checks, and least-privilege deployment access.
