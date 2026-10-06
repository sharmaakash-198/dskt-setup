# 36: Secure the DEV edge

**Repositories:** DSKT-setup, dskt-frontend, dskt-backend  
**Blocked by:** 33 Sign in to DEV with Microsoft Entra; 35 Migrate and recover the DEV database  
**Status:** ready-for-agent

## What to build

Expose the AWS DEV application only through its intended HTTPS origins with environment secrets, browser policy, and abuse controls verified end to end.

## Acceptance criteria

- [ ] CloudFront and ALB use managed TLS; HTTP redirects or is rejected according to the documented policy.
- [ ] Route 53 and ACM are used when project DNS is available, with a documented temporary-hostname path otherwise.
- [ ] CORS permits only the configured DEV frontend origin and supported methods/headers.
- [ ] Runtime secrets come from Secrets Manager and are absent from Terraform state, images, logs, and frontend bundles.
- [ ] Employee uploads, authentication-sensitive routes, and search enforce documented size and rate limits.
- [ ] Security headers, private RDS access, least-privilege task roles, and network boundaries are verified.

## Verification

- Run positive and negative HTTPS, CORS, upload-limit, and rate-control checks.
- Inspect public reachability, IAM permissions, frontend bundles, logs, and Terraform outputs for unintended exposure.
- Run dependency and container vulnerability scans.
