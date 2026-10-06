# 31: Reach an AWS DEV readiness page

**Repositories:** DSKT-setup, dskt-frontend, dskt-backend  
**Blocked by:** 30 Pass the local release gate  
**Status:** ready-for-agent

## What to build

Use Terraform to deploy the thinnest complete AWS DEV spine in which CloudFront-served frontend assets call an HTTPS Fargate backend that reports private RDS readiness.

## Acceptance criteria

- [ ] Terraform defines isolated DEV networking, private RDS PostgreSQL, ECR, ECS Fargate, ALB, private S3, CloudFront, Secrets Manager, and baseline CloudWatch resources.
- [ ] Terraform state uses an approved remote backend with locking and contains no application secret values.
- [ ] The frontend readiness page is reachable through CloudFront and calls the backend through the generated client.
- [ ] The backend runs a non-root container, reaches private RDS, and exposes distinct liveness/readiness health checks through the ALB.
- [ ] RDS and service networking are private except for the intended HTTPS entry points.
- [ ] Resource naming, environment tags, deletion protection policy, and cost-relevant defaults are documented.

## Verification

- Validate and plan Terraform, apply to the DEV account, and inspect outputs without exposing secrets.
- Prove browser → CloudFront → ALB/Fargate → RDS readiness.
- Verify RDS is not publicly reachable and failed database connectivity removes readiness.
