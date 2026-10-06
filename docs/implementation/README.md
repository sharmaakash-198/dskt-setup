# DSKT implementation plans

This directory is the durable local implementation tracker for DSKT. Plans here translate settled product documentation and ADRs into agent-ready work; they do not override those sources.

## Structure

Each feature uses:

```text
<feature-slug>/
├── spec.md
├── plan.md
└── tickets/
    └── <NN>-<slug>.md
```

- `spec.md` states scope, behavior, constraints, and agreed verification seams.
- `plan.md` presents dependency-derived implementation waves and the current frontier.
- `tickets/` contains one independently claimable tracer-bullet ticket per file.

## Rules

1. Base behavior on existing documentation and ADRs. Resolve contradictions before planning implementation.
2. Prefer narrow, end-to-end tickets spanning the necessary schema, API, UI, and tests.
3. Record genuine blocking edges; ticket numbering does not by itself create a dependency.
4. Keep each ticket small enough for one fresh agent context and independently demoable or verifiable.
5. Name every repository touched. Cross-repository tickets produce separate focused commits in each repository.
6. Verify business behavior primarily at the backend HTTP/OpenAPI boundary against PostgreSQL, geometry through pure deterministic tests, and critical completed journeys in the browser.
7. Never include production employee data in plans, fixtures, or tests.
8. Change settled architecture through an ADR, not through an implementation ticket.

See `docs/agents/issue-tracker.md` for statuses and tracker operations.
