# Lavish Alignment Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Lavish the default interactive alignment surface in `DSKT`, with explicit `/lavish` invocation and feedback routed to the originating polling agent turn.

**Architecture:** A small project-owned skill discovers current Lavish behavior from the CLI at runtime. An always-applied Cursor rule enforces the approved trigger and tool boundaries. Generated HTML stays in a gitignored `.lavish/` workspace, while docs explain the common workflow and harness limits.

**Tech Stack:** Agent Skills, Cursor workspace rules, `npx`, `lavish-axi` 0.1.x, local HTML.

## Global Constraints

- Project skills live only in `.agents/skills/`.
- Lavish is required for alignment work, subject to the narrow exemptions in the approved spec.
- **Send To Agent** means delivery to the originating `lavish-axi poll <artifact>` process.
- Do not install Lavish's global plugin or global hooks.
- Do not publish with `lavish-axi share` without explicit human approval.
- Excalidraw remains the durable diagram format; accepted ADRs remain authoritative; ActiveGraph provides supplemental work memory.
- Poll in the foreground without a timeout by default. A harness-native tracked background job is allowed only when completion reliably resumes or notifies the same turn. Never use `nohup`, shell `&`, `disown`, or detached/untracked terminals.
- Cursor Plan mode is read-only; switch to Agent mode before writing or opening a Lavish artifact. If switching is unavailable or rejected, report the limitation and continue alignment in chat.
- chrome-agent does not drive normal Lavish reviews. For debugging, start Lavish with `--no-open`, navigate chrome-agent to the returned URL, and never run two competing control loops on one review tab.
- Lavish takes precedence over Canvas for iterative feedback, annotation, or approval; Canvas remains for standalone analytical deliverables with no review loop.

---

### Task 1: Project Skill and Trigger Rule

**Files:**
- Create: `.agents/skills/lavish/SKILL.md`
- Create: `.cursor/rules/lavish.mdc`

**Interfaces:**
- Consumes: approved trigger and session contract from `docs/tools/lavish/design.md`
- Produces: `/lavish` discovery and automatic routing instructions

- [x] **Step 1: Create the project skill**

Write a thin skill whose frontmatter describes explicit and automatic triggers. Require agents to read live guidance using:

```bash
npx -y lavish-axi --help
npx -y lavish-axi design
npx -y lavish-axi playbook
```

Treat bare `playbook` as an index, then run `npx -y lavish-axi playbook <playbook_id>` for every matching playbook before creating HTML.

Its workflow must create `.lavish/<descriptive-name>.html`, open it, run an attached no-timeout poll, process the entire poll response, reply/revise, and poll again until the human ends the session.

- [x] **Step 2: Create the always-applied Cursor rule**

The rule must require Lavish for planning, brainstorming, requirements, architecture, comparisons, review, explanation needing feedback, and approval checkpoints. It must list the approved exemptions and boundaries with Excalidraw, Canvas, chrome-agent, and ActiveGraph.

- [x] **Step 3: Validate metadata and paths**

Run:

```bash
python3 - <<'PY'
from pathlib import Path
skill = Path(".agents/skills/lavish/SKILL.md").read_text()
rule = Path(".cursor/rules/lavish.mdc").read_text()
assert skill.startswith("---\nname: lavish\n")
assert "disable-model-invocation" not in skill
assert "lavish-axi poll" in skill
assert "alwaysApply: true" in rule
assert "Send To Agent" in rule
print("lavish routing config: OK")
PY
```

Expected: `lavish routing config: OK`.

### Task 2: Repository Documentation and Workspace

**Files:**
- Create: `docs/tools/lavish/README.md`
- Modify: `docs/tools/README.md`, `docs/setup/README.md`
- Modify: `AGENTS.md`
- Modify: `README.md`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: skill/rule paths from Task 1
- Produces: onboarding instructions and `.lavish/` artifact policy

- [x] **Step 1: Document installation and usage**

Document Node 22+, zero-install `npx -y lavish-axi`, `/lavish`, automatic triggers, the open/poll/revise/end loop, harness routing limitations, security boundaries, and tool ownership.

- [x] **Step 2: Add discoverability links**

Add Lavish to `docs/tools/README.md`, `docs/setup/README.md`, `AGENTS.md`, and the root layout/tooling notes in `README.md`.

- [x] **Step 3: Ignore generated artifacts**

Append:

```gitignore
# Lavish local collaboration artifacts/state
.lavish/
```

- [x] **Step 4: Verify references**

Run:

```bash
rg -n "lavish|Lavish" AGENTS.md README.md docs/setup/README.md docs/tools/README.md docs/tools/lavish/README.md .cursor/rules/lavish.mdc .agents/skills/lavish/SKILL.md
```

Expected: every integration surface contains a Lavish reference.

### Task 3: End-to-End Feedback Smoke Test

**Files:**
- Create temporarily: `.lavish/smoke-test.html`
- No committed output

**Interfaces:**
- Consumes: `npx` and the Task 1 workflow
- Produces: evidence that browser feedback reaches the originating poll

- [x] **Step 1: Verify prerequisites and current CLI**

Run:

```bash
node --version
npx -y lavish-axi --help
npx -y lavish-axi design
npx -y lavish-axi playbook
npx -y lavish-axi playbook input
```

Expected: Node is at least 22; each Lavish command succeeds; and every playbook matching the task is fetched by ID after reading the bare index.

- [x] **Step 2: Create a minimal interactive artifact**

Create `.lavish/smoke-test.html` with an explicit background, a heading, explanatory text, and one `data-lavish-question` choice that queues an answer.

- [x] **Step 3: Open the artifact and attach the poll**

Run from the repo root:

```bash
npx -y lavish-axi .lavish/smoke-test.html
npx -y lavish-axi poll .lavish/smoke-test.html
```

Leave the poll attached without a timeout.

The verified Cursor smoke test used a harness-native tracked background job whose completion routed back to the same turn. It was not a foreground poll and must not be described as one.

- [x] **Step 4: Verify Send To Agent**

In the Lavish browser, submit `Lavish smoke test approved`. Expected: the attached poll returns the complete feedback batch to this same agent turn.

- [x] **Step 5: Reply and end**

Run:

```bash
npx -y lavish-axi poll .lavish/smoke-test.html --agent-reply "Feedback received by the originating agent turn."
```

After confirming the reply appears, end the session:

```bash
npx -y lavish-axi end .lavish/smoke-test.html
```

Agent-ended sessions can reopen normally. User-ended sessions require an explicit request and `--reopen`.

- [x] **Step 6: Final verification**

Run:

```bash
git check-ignore .lavish/smoke-test.html 2>/dev/null || rg -n '^\.lavish/$' .gitignore
```

Expected: `.lavish/` is ignored. If this directory is not yet a Git repository, the `rg` fallback must match.

