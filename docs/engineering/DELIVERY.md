# Delivery and Operations

## Repository strategy

The applications are separate repositories:

- `dskt-frontend`
- `dskt-backend`

They do not use a shared package or synchronized release number. This documentation/setup workspace should be published as a third repository so its architecture, skills, tool configuration, and bootstrap instructions can be cloned. The two application repositories are cloned into its gitignored `dskt-frontend/` and `dskt-backend/` directories for local work.

## Required baseline for each application repository

- concise README with local setup and architecture links;
- strict TypeScript configuration;
- deterministic lockfile;
- linting and formatting;
- unit and integration test commands;
- environment-variable example without secrets;
- Dockerfile with non-root runtime where applicable;
- CI workflow;
- ownership and contribution guidance;
- dependency update and vulnerability scanning;
- conventional commits.

No implementation repository should be initialized until the team explicitly begins coding.

## Environments

Implementation progresses through local, DEV, and later production environments.

- `local` runs the complete product through Docker Compose with frontend, backend, PostgreSQL, and database-backed local authentication. It requires no AWS or Entra configuration.
- `dev` runs on AWS, uses Microsoft Entra, and contains synthetic employee data only.
- `production` is deferred until DEV evidence and organizational approvals are complete.

Each deployed environment has distinct:

- Entra application configuration and redirect URIs;
- API audience and allowed frontend origins;
- database and credentials;
- deployment variables;
- observability labels.

Production employee data must not be copied into preview or developer environments.

## Deployment

### Frontend

Build the frontend repository independently. In DEV, publish immutable Vite assets to a private S3 bucket and serve them through CloudFront.

### Backend

Build a non-root backend container independently and publish it to ECR. In DEV, deploy it to ECS Fargate behind an HTTPS Application Load Balancer with private database access and enough request duration for bounded imports.

### Database

Use Docker PostgreSQL locally and private Amazon RDS PostgreSQL in DEV. The backend is the only application component with database credentials. Connection pooling must match ECS task concurrency and RDS limits.

### Infrastructure

Terraform in the setup repository defines shared DEV networking, S3, CloudFront, ECR, ECS, ALB, RDS, Secrets Manager, CloudWatch, DNS, and TLS resources. Configure a remote state backend with locking before collaborative DEV changes. Application deployments consume Terraform outputs without coupling frontend and backend release versions.

## CI gates

Frontend:

- dependency install from lockfile;
- format and lint checks;
- typecheck;
- unit/component tests;
- production build;
- generated client compatibility with pinned OpenAPI;
- accessibility smoke checks.

Backend:

- dependency install from lockfile;
- format and lint checks;
- typecheck;
- unit tests;
- PostgreSQL integration tests;
- migration-from-empty check;
- OpenAPI drift check;
- production build and container build;
- dependency/security scan.

## Database migration process

- Migrations are forward-only after merge.
- Every migration is reviewed for locking, data backfill, rollback strategy, and compatibility with the currently deployed application.
- Destructive changes use expand-and-contract releases.
- Backend deployment applies or coordinates migrations before code depends on them.
- A verified backup and restore procedure is required before production.

## Release compatibility

Because frontend and backend release independently:

- backend changes remain backward compatible through the frontend rollout window;
- frontend deploys only against a compatible published OpenAPI version;
- removed contract fields require measured migration and deprecation;
- database changes support at least the currently running backend version during rolling deployment.

## Secrets

Secrets live only in approved local secret stores and AWS Secrets Manager. `.env` files containing values are ignored. Rotation procedures cover local bootstrap credentials, Entra credentials, database credentials, and deployment tokens.

## Operational readiness

Before production:

- health checks and alerts are configured;
- logs and metrics are searchable;
- backup restoration is tested;
- access and role administration are documented;
- employee-data retention is approved;
- incident ownership is assigned;
- representative load tests cover a 2,000-element floor and expected employee volume.

## Environment gates

- AWS and Entra tickets do not begin until the Docker-based local release gate passes.
- DEV promotion requires migration, restore, security-edge, observability, accessibility, and representative-load evidence.
- Production design and rollout require a new explicit approval after DEV.
