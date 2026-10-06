---
status: accepted
---

# Use Docker locally and AWS for deployed environments

## Context

DSKT should reach a complete, reproducible local product milestone before third-party hosting is introduced. The earlier delivery guidance named Vercel and Supabase, but those services would add deployment-specific behavior before core workflows and operational requirements are proven.

Frontend and backend remain independent repositories with independent build artifacts and releases.

## Decision

Local development uses Docker Compose to run:

- the frontend development or preview server;
- the Fastify backend;
- PostgreSQL;
- no required cloud service.

The first deployed environment is `dev` on AWS:

- Vite static assets in a private S3 bucket behind CloudFront;
- Fastify container images in ECR and services on ECS Fargate behind an Application Load Balancer;
- PostgreSQL on private Amazon RDS;
- secrets in AWS Secrets Manager;
- logs, metrics, health alarms, and dashboards in CloudWatch;
- managed DNS and TLS through Route 53 and ACM where project DNS is available.

Terraform defines the shared DEV infrastructure in the setup repository. Application repositories independently build and publish their own artifacts; deployment workflows consume stable Terraform outputs and do not require synchronized release numbers.

AWS work begins only after the local release gate passes. Production is a later promotion decision, not an automatic copy of DEV.

## Consequences

- Vercel and Supabase are no longer initial deployment dependencies.
- The backend remains twelve-factor and portable, but AWS DEV is the concrete operational target.
- Terraform state requires an approved remote backend and locking before collaborative DEV changes.
- RDS migration, backup, restore, private networking, and cost controls become explicit DEV acceptance criteria.
- A local developer can run all product workflows without AWS credentials or internet-hosted services.
