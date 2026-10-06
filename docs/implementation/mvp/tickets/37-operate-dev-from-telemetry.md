# 37: Operate DEV from telemetry

**Repositories:** DSKT-setup, dskt-backend  
**Blocked by:** 36 Secure the DEV edge  
**Status:** ready-for-agent

## What to build

Make a synthetic DEV incident diagnosable through correlated CloudWatch logs, metrics, health signals, alarms, and DSKT audit records.

## Acceptance criteria

- [ ] Requests propagate or create a correlation ID visible in responses, structured logs, and relevant audit events.
- [ ] CloudWatch captures service version, environment, route, status, duration, and safe error context without tokens or Employee rows.
- [ ] Metrics cover latency, error rates, task health, database pool pressure, imports, publication failures, and Assignment conflicts.
- [ ] Alarms distinguish process failure, database unready state, elevated errors, and resource exhaustion.
- [ ] Dashboards and runbooks identify the owning service, immediate checks, and escalation path.
- [ ] A controlled synthetic failure can be traced from browser-visible correlation ID to cause and recovery.

## Verification

- Trigger a safe database-readiness or synthetic application failure and follow the runbook.
- Confirm expected alarm, logs, metrics, audit linkage, and recovery.
- Inspect telemetry for prohibited sensitive values.
