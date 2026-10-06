# 38: Pass the DEV release gate

**Repositories:** DSKT-setup, dskt-frontend, dskt-backend  
**Blocked by:** 34 Administer DEV users and roles; 37 Operate DEV from telemetry  
**Status:** ready-for-agent

## What to build

Produce objective evidence that the independently deployed AWS DEV system preserves the complete local product behavior, security, accessibility, recoverability, and representative performance.

## Acceptance criteria

- [ ] Synthetic-data browser journeys pass for Entra sign-in, Floor publication, Employee import, labels, Assignment lifecycle, revision carry-forward, and Employee location.
- [ ] Role allow/deny coverage passes through the deployed API for Facilities Admin, Workplace Planner, Viewer, and no-role users.
- [ ] Frontend and backend independent deployment and rollback are re-demonstrated with compatible versions.
- [ ] Migration, backup restore, TLS/CORS/secrets, alarm, and incident-diagnosis evidence from tickets 35–37 is current.
- [ ] Automated accessibility and targeted keyboard journeys pass against DEV.
- [ ] Representative 2,000-element Floor and expected synthetic Employee volume meet documented budgets without unsafe request duration or database pressure.
- [ ] No production Employee data is present and completion does not authorize production deployment.

## Verification

- Run the documented DEV release suite from clean synthetic fixtures and retain normal CI/operational evidence.
- Review Terraform plan, security scans, OpenAPI compatibility, CloudWatch signals, and restore results.
- Record remaining production prerequisites as future decisions rather than expanding this ticket.
