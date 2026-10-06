# Lavish (interactive alignment)

Lavish is the default interactive alignment surface for human–agent collaboration in **DSKT**. Agents create local HTML artifacts; you annotate and send feedback; the **same agent turn** that opened the artifact receives it via an attached poll.

Lavish is not project memory, a durable diagram format, browser automation, or an execution engine.

## Prerequisites

- **Node 22+** on `PATH` (`node --version`).
- **Zero-install CLI:** run `npx -y lavish-axi …` from the repo root. No global `npm install -g lavish-axi` is required for the basic workflow.
- The basic workflow uses the repo-owned `.agents/skills/lavish/SKILL.md` and `.cursor/rules/lavish.mdc`; **do not install global plugins or hooks automatically**. They are optional, explicit per-user enhancements only. The Cursor plugin duplicates this project skill, and session hooks do not route feedback to an active chat, so neither is recommended for the normal `DSKT` workflow.

### Existing global installations

An older global `lavish-axi` binary or previously installed session hooks can silently take precedence over the zero-install path. Check before relying on `npx -y`:

```bash
type -a lavish-axi
lavish-axi --version 2>/dev/null || true
```

Global hooks may exist in `~/.claude/settings.json`, `~/.codex/hooks.json`, or `~/.copilot/hooks/lavish-axi.json`. Inspect them before removal; they are user-level configuration and this repo does not modify them automatically.

## When agents use Lavish

### Explicit trigger

- **`/lavish`** — always starts the Lavish workflow for the described alignment task.

### Automatic triggers

Agents use Lavish (or read `.agents/skills/lavish/SKILL.md`) for:

- planning and brainstorming;
- requirements and scope alignment;
- architecture and design decisions;
- comparisons between viable approaches;
- reviews and explanations that need human feedback;
- approval checkpoints within other skills;
- material changes in assumptions or direction before implementation.

### Exemptions (skip Lavish)

- short factual answers;
- routine progress and status updates;
- urgent blocker or error reporting;
- mechanical actions the human already approved;
- explicit user opt-out.

## Session workflow

The originating agent owns the review loop:

1. **Leave Cursor Plan mode before the checkpoint.** Plan mode is read-only and cannot write or open Lavish artifacts. The agent requests a switch to Agent mode; if switching is unavailable or rejected, it reports the limitation and continues alignment in chat.
2. **Create** a focused HTML artifact at `.lavish/<descriptive-name>.html`.
3. **Open** it: `npx -y lavish-axi <artifact-path>`.
4. **Attach a foreground, no-timeout poll by default:** `npx -y lavish-axi poll <artifact-path>`. A harness-native tracked background job is allowed only when completion reliably resumes or notifies the same turn. Never use `nohup`, shell `&`, `disown`, or a detached/untracked terminal for polling.
5. You annotate the artifact or write feedback and select **Send To Agent**.
6. Lavish delivers the feedback batch to the poll attached to **that agent turn**.
7. The agent revises the artifact or responds with `--agent-reply "..."`, then **polls again** while alignment remains open.
8. You select **Send & End**, or the agent ends the session after an explicit conclusion:

```bash
npx -y lavish-axi end <file>
```

**Send To Agent** means delivery to the agent process polling that artifact. It does **not** inject feedback into an arbitrary currently focused Cursor, Antigravity, or Claude chat. If a poll is interrupted, the agent reruns it against the same canonical artifact path; queued feedback persists until consumed.

Agent-ended sessions can reopen normally. User-ended sessions require an explicit request to reopen and the `--reopen` flag.

Before creating or revising artifacts, agents read live CLI guidance:

```bash
npx -y lavish-axi --help
npx -y lavish-axi design
npx -y lavish-axi playbook
```

The bare `playbook` output is an index. Before creating HTML, agents must run
`npx -y lavish-axi playbook <playbook_id>` for every playbook matching the task.

## Tool boundaries

- **Lavish** — temporary interactive alignment; artifacts may be deleted after conclusion unless you ask to keep them.
- **Plan mode / planning skills** — reasoning and decomposition; switch to Agent mode before writing or opening the Lavish human-review surface.
- **Excalidraw** — durable, version-controlled diagrams under `docs/diagrams/`.
- **Cursor Canvas** — standalone analytical deliverables with no review loop. Lavish takes precedence when iterative feedback, annotation, or approval is the purpose.
- **chrome-agent** — browser automation and UI smoke tests only; do not drive normal Lavish reviews (Lavish opens its own browser). For sanctioned Lavish debugging, start Lavish with `--no-open`, then navigate chrome-agent to the returned URL. Never run two competing control loops on one review tab.
- **ActiveGraph** — agreed decisions, rationale, and work logs — log only after alignment concludes, not tentative discussion.

Cursor can use a harness-native tracked background poll only when completion reliably resumes or notifies the same turn. Antigravity's generic CLI/poll workflow works only when that harness permits shell commands and tracked completion routing.

## Artifacts and git

Generated collaboration HTML lives under `.lavish/` (gitignored). Treat it as ephemeral unless you explicitly want to preserve an outcome elsewhere (docs, ADR, ActiveGraph).

## Security and data boundaries

- **Local by default.** The review server and feedback queue run on your machine. Use `npx -y lavish-axi export <artifact-path>` for a safe, local portable copy. Do not run `lavish-axi share` unless you explicitly request publishing — `share` uploads to third-party `ht-ml.app` and is public by default.
- **Never place** secrets, credentials, production employee data, or sensitive source payloads in an artifact.
- **Global state boundary.** Lavish stores session state under `~/.lavish-axi/` by default (override with `LAVISH_AXI_STATE_DIR`). The local server has no user authentication; loopback/host checks are the principal boundary. Do not bind the server to unrestricted interfaces or expose it broadly.
- Browser feedback attachments are local files — handle as potentially sensitive input.

## Failure behavior

- If `npx` or Lavish cannot run, the agent reports the blocker and continues in chat unless you request another path.
- If browser opening fails, use the printed local URL from the CLI.
- If you end the session, the agent stops polling and reopens only after an explicit request, using `--reopen`.

## Related config

- Project skill: `.agents/skills/lavish/SKILL.md`
- Cursor rule (always applied): `.cursor/rules/lavish.mdc`
- Design spec: [`design.md`](design.md)
- Implementation plan: [`plan.md`](plan.md)
- Primary-source research: [`research.md`](research.md)
