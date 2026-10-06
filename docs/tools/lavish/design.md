# Lavish alignment workflow

**Status:** Implemented and verified  
**Date:** 2026-09-04  
**Scope:** Human-agent collaboration in the `DSKT` repository

## Purpose

Lavish is the default interactive alignment surface for collaboration between a human and an agent. It turns plans, choices, reviews, and explanations into local HTML artifacts that the human can annotate. Feedback returns to the same agent turn that opened the artifact.

Lavish is not the project memory, a durable architecture drawing format, a browser automation tool, or an execution engine.

## Required trigger

Agents use Lavish for:

- planning and brainstorming;
- requirements and scope alignment;
- architecture and design decisions;
- comparisons between viable approaches;
- reviews and explanations that need human feedback;
- approval checkpoints within other skills;
- material changes in assumptions or direction before implementation.

Agents may skip Lavish only for:

- short factual answers;
- routine progress and status updates;
- urgent blocker or error reporting;
- mechanical actions that the human already approved;
- interactions where the human explicitly says not to use Lavish.

The explicit `/lavish` invocation always triggers Lavish.

## Session contract

The originating agent owns the review loop:

1. If currently in Cursor Plan mode, the agent requests a switch to Agent mode before the checkpoint. If switching is unavailable or rejected, it reports the limitation and continues alignment in chat.
2. The agent creates a focused HTML artifact.
3. It opens the artifact with `npx -y lavish-axi <artifact-path>`.
4. It runs `npx -y lavish-axi poll <artifact-path>` in the foreground without a timeout by default. A harness-native tracked background job is allowed only when completion reliably resumes or notifies the same turn. Polling must never use `nohup`, shell `&`, `disown`, or a detached/untracked terminal.
5. The human annotates the artifact or writes feedback and selects **Send To Agent**.
6. Lavish queues and delivers that feedback to the originating poll.
7. The agent revises the artifact or responds using `--agent-reply`, then polls again while alignment remains open.
8. The human selects **Send & End** or the agent ends the session after an explicit conclusion with `npx -y lavish-axi end <file>`.

“Send To Agent” means delivery to the agent turn polling that artifact. It does not promise injection into an arbitrary currently focused Cursor, Antigravity, or Claude chat.

Queued feedback remains available if a poll is interrupted. A later session may resume an artifact where supported, but later-session discovery is a fallback and not the primary routing guarantee.

Agent-ended sessions can reopen normally. User-ended sessions require an explicit human request and `--reopen`.

## Tool boundaries

### Lavish

Temporary, interactive collaboration artifacts. The artifact exists to reach alignment and may be deleted after the conclusion unless the human asks to preserve it.

### Plan mode and planning skills

Plan mode and skills still provide reasoning, decomposition, and workflow control. Cursor Plan mode is read-only and cannot write or open Lavish artifacts. Before a Lavish checkpoint, the agent requests a switch to Agent mode. If switching is unavailable or rejected, it reports the limitation and continues alignment in chat. Lavish does not replace the agent’s planning logic or permission boundaries.

### Excalidraw

Durable, version-controlled diagrams under `docs/diagrams/`. Use Excalidraw when the diagram itself is a maintained project artifact. Lavish may contain a temporary Mermaid or SVG representation during alignment; an approved durable diagram is recreated or exported through the Excalidraw workflow.

### Cursor Canvas

Standalone analytical artifacts that belong beside Cursor chat. In `DSKT`, Lavish takes precedence when the purpose is iterative human feedback, annotation, or approval. Canvas remains appropriate when analysis is the durable deliverable and no Lavish review loop is needed.

### chrome-agent

Browser automation, UI smoke tests, network inspection, and web debugging. Lavish owns its local review UI and browser opening. Do not drive Lavish with chrome-agent during normal collaboration. To test or debug Lavish itself, start Lavish with `--no-open`, then navigate chrome-agent to the returned URL. Never run two competing control loops on one review tab.

### ActiveGraph

The authoritative store for agreed decisions, rationale, work logs, and bugs. Do not log tentative Lavish discussion as final memory. After the session reaches a conclusion, log the decision or meaningful work to ActiveGraph.

### Repository documentation and ADRs

Durable, reviewable human documentation. Export an agreed outcome into docs or an ADR only when the project convention or human request calls for it.

## Repository integration

The implementation should add:

- a project skill at `.agents/skills/lavish/SKILL.md`;
- an always-applied Cursor rule at `.cursor/rules/lavish.mdc`;
- setup and usage documentation at `docs/tools/lavish/README.md`;
- references from `AGENTS.md`, `docs/tools/README.md`, and `docs/setup/README.md`;
- a gitignored workspace such as `.lavish/` for generated collaboration artifacts.

The project skill should remain small and direct agents to current CLI guidance:

```bash
npx -y lavish-axi --help
npx -y lavish-axi design
npx -y lavish-axi playbook
```

The bare `playbook` command is an index. Before creating HTML, the agent must run
`npx -y lavish-axi playbook <playbook_id>` for every playbook matching the task.

The implementation must not copy a large upstream workflow into the skill because installed instructions can become stale.

## Harness behavior

- **Cursor:** project skill and always-applied rule provide discovery and enforcement. The active turn uses the CLI poll contract.
- **Antigravity:** shared `.agents/skills/` provides discovery. The generic CLI/poll workflow works only if the harness permits shell commands and tracked completion routing.
- **Claude Code:** shared skill provides discovery. Optional upstream session hooks may expose open sessions after explicit setup, but polling remains the primary delivery contract.

Agent Plugin registration and session hooks are optional enhancements. They must not be required for the basic review loop, and their installation must not create duplicate project skill trees.

## Data and security

- Keep the core review local; do not invoke `lavish-axi share` unless the human explicitly requests publishing.
- Treat `share` as external disclosure to `ht-ml.app`; public sharing is not an implicit default.
- Never place secrets, credentials, production employee data, or sensitive source payloads in an artifact.
- Keep Lavish state local and gitignore generated artifacts.
- Do not weaken host/origin protections or bind the server to unrestricted interfaces.
- Browser feedback attachments are local files and must be handled as potentially sensitive input.

## Failure behavior

- If `npx` or Lavish cannot run, report the blocker and continue in chat unless the human requests a different path.
- If browser opening fails, use the printed local URL; chrome-agent is not the automatic workaround.
- If a poll is interrupted, rerun it against the same canonical artifact path.
- If the human ends the session, stop polling; reopen only after an explicit request and with `--reopen`.
- If an artifact is no longer useful, end the session rather than keeping an idle collaboration loop alive.

## Verification

Implementation is complete when:

1. `/lavish` is discoverable from the project skill catalog after reload.
2. Any prompt covered by the broad/default approved trigger automatically selects the Lavish skill, subject only to the exact narrow exemptions above.
3. An agent can create and open a local artifact from the repo.
4. **Send To Agent** returns feedback to the same polling turn.
5. The agent can send a reply and continue the same review loop.
6. **Send & End** terminates polling cleanly.
7. The generated artifact directory is ignored by git.
8. Documentation clearly distinguishes Lavish, Excalidraw, Canvas, chrome-agent, ActiveGraph, and planning skills.

