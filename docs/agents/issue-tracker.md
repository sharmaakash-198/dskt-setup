# Issue tracker: durable local Markdown

Implementation specs and tickets live under `docs/implementation/`. They are version-controlled project artifacts, not disposable `.scratch/` files.

## Layout

```text
docs/implementation/<feature-slug>/
├── spec.md
├── plan.md
└── tickets/
    ├── 01-<slug>.md
    └── 02-<slug>.md
```

- `spec.md` defines the complete behavior and scope.
- `plan.md` groups tickets into dependency-derived implementation waves.
- `tickets/` contains one tracer-bullet ticket per file, numbered in dependency order.
- Phases do not replace tickets; a phase is a view of tickets whose blockers permit them to run together.

## Ticket conventions

Every ticket records:

- `Repositories`: `dskt-frontend`, `dskt-backend`, `DSKT-setup`, or a comma-separated combination;
- `Blocked by`: ticket numbers/titles, or `None`;
- `Status`: `ready-for-agent`, `claimed`, `completed`, or `blocked`;
- end-to-end acceptance criteria;
- verification expectations at the agreed testing seams.

A cross-repository ticket may touch both application repositories and must produce a focused commit in each touched repository. The OpenAPI artifact is the contract between them.

## Skill operations

- “Publish a spec” means write `docs/implementation/<feature-slug>/spec.md`.
- “Publish tickets” means write one file per ticket under `docs/implementation/<feature-slug>/tickets/` and update `plan.md`.
- “Fetch a ticket” means read the referenced ticket file and its blockers.
- `/implement` claims a ready ticket by changing its status to `claimed`, implements it, verifies it, commits each touched repository, then changes the status to `completed`.
- The current frontier is every `ready-for-agent` ticket whose blockers are all `completed`.

## Comments and changes

Append material implementation discoveries under `## Notes`. If a discovery changes settled architecture, stop and update or supersede the relevant ADR before continuing.
