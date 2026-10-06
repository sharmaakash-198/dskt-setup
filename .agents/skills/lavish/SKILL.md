---
name: lavish
description: >-
  Interactive human-agent alignment via local HTML review artifacts.
  Use for planning, brainstorming, requirements, architecture, comparisons,
  reviews/explanations needing feedback, approval checkpoints, or material
  direction changes before implementation. Also use when the user types /lavish
  or asks for an iterative annotation/review loop over HTML.
---

# Lavish (DSKT)

Local HTML collaboration surface. The human annotates; feedback returns to **this agent turn** via an attached poll — not to an arbitrary IDE session.

Setup: [docs/tools/lavish/](../../../docs/tools/lavish/README.md).

## Authoritative CLI guidance

Before creating or revising artifacts, read current behavior from the CLI:

```bash
npx -y lavish-axi --help
npx -y lavish-axi design
npx -y lavish-axi playbook
```

The bare `playbook` command is only an index. Before creating HTML, run
`npx -y lavish-axi playbook <playbook_id>` for **every** playbook matching the task.

Do not copy large upstream workflows into this skill — installed instructions can become stale.

## Session contract

The originating agent owns the review loop:

1. If currently in Cursor Plan mode, request a switch to Agent mode before the checkpoint. Plan mode is read-only and cannot write or open Lavish artifacts. If switching is unavailable or rejected, report the limitation and continue alignment in chat.
2. Create a focused HTML artifact at `.lavish/<descriptive-name>.html`.
3. Open it: `npx -y lavish-axi <artifact-path>`.
4. Attach a **foreground, no-timeout poll by default**: `npx -y lavish-axi poll <artifact-path>`. A harness-native tracked background job is allowed only when its completion reliably resumes or notifies this same turn. Never use `nohup`, shell `&`, `disown`, or a detached/untracked terminal for polling.
5. When the human selects **Send To Agent**, consume the **entire** poll stdout (prompts, snapshot, failures).
6. Revise the artifact or respond with `--agent-reply "..."`, then poll again while alignment remains open.
7. Stop when the human selects **Send & End**, or after an explicit conclusion. To end it as the agent, run `npx -y lavish-axi end <file>`.

**Send To Agent** delivers feedback to the poll attached to this turn. It does not inject into or resume an arbitrary Cursor, Antigravity, or Claude chat.

If a poll is interrupted, rerun it against the same canonical artifact path. Queued feedback persists until consumed.

Agent-ended sessions can reopen normally. User-ended sessions may reopen only after an explicit human request and with `--reopen`.

## Do not

- Install Lavish's global plugin (`lavish-axi setup plugin`) or global hooks (`lavish-axi setup hooks`).
- Run `lavish-axi share` unless the human explicitly requests publishing (external disclosure to ht-ml.app).
- Drive normal Lavish reviews with chrome-agent — Lavish opens the review URL in the default browser. For Lavish testing/debugging only, start it with `--no-open`, navigate chrome-agent to the returned URL, and never run two control loops on one review tab.
- Place secrets, credentials, production employee data, or sensitive source payloads in artifacts.

## Tool boundaries

| Tool | Role |
|------|------|
| **Lavish** | Temporary interactive alignment; artifact may be deleted after conclusion |
| **Plan mode / planning skills** | Reasoning and decomposition; switch to Agent mode before writing/opening Lavish, or continue in chat if switching is unavailable |
| **Excalidraw** | Durable version-controlled diagrams under `docs/diagrams/` |
| **Cursor Canvas** | Standalone analytical artifacts with no review loop; Lavish takes precedence for iterative feedback, annotation, or approval |
| **chrome-agent** | Browser automation and UI smoke tests — not normal Lavish operation |
| **ActiveGraph** | Final decisions and work memory — log only after alignment concludes |

## Failure behavior

- If `npx` or Lavish cannot run, report the blocker and continue in chat unless the human requests another path.
- If browser opening fails, use the printed local URL.
- Antigravity can use the generic CLI/poll workflow only when the harness permits shell commands and tracked completion routing.
- If the human ends the session, stop polling; reopen only after an explicit request and with `--reopen`.

## When the user types `/lavish`

Treat as an explicit request: read live CLI guidance, create an artifact, open it, and attach the poll for the described alignment task.
