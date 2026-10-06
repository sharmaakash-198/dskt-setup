# dskt pack

Project-specific ActiveGraph pack for the DSKT repo.

## Object types

| Type | Role |
|------|------|
| `project` | Repo anchor (name, path, GitLab project) |
| `work_log` | Short session / work notes |
| `decision_note` | Draft decision note or pointer to an authoritative ADR |
| `bug` | Tracked defects |

## Relation types

`belongs_to_project`, `blocks`, `implements`, `references`, `supersedes`, `relates_to`, `repo_for_project`

## Gateway tools

Registered as `dskt.*` capabilities:

- `dskt.log_work`
- `dskt.log_decision`
- `dskt.register_bug`
- `dskt.fetch_gitlab_issue` (requires `glab` + `DSKT_GITLAB_PROJECT`)

## Behaviors

- Link new work logs, decision notes, and bugs to the project
- Link decision notes to ADR pointer objects when `adr_path` matches
- Remove `blocks` edges when a blocking bug is marked fixed

Accepted decisions remain authoritative in `docs/adr/`; ActiveGraph is supplemental project memory.
