# Setup

Fresh-machine onboarding for the DSKT documentation workspace and its two independent application repositories.

## Important repository state

This directory must be published as its own documentation/setup Git repository before another machine can clone it. Empty directories are not tracked by Git, so `dskt-frontend/` and `dskt-backend/` are created or cloned by the bootstrap process and are ignored by the setup repository.

## Prerequisites

- Git
- Node.js 22+ and `npx`
- Docker Desktop or a compatible Docker Engine with Compose
- Python 3.11+
- `uv` for optional Python CLI tools
- `pnpm` for the optional ActiveGraph Inspector
- Chrome or Chromium for browser automation

Application-specific versions will be pinned independently when the frontend and backend repositories are initialized.

Terraform, the AWS CLI, and AWS credentials are not required for tickets 01–30. Install and configure them only when beginning the AWS DEV milestone.

## First clone

```bash
git clone <dskt-setup-repo-url> DSKT-setup
cd DSKT-setup

# Creates local runtime directories and optionally clones the two app repos.
FRONTEND_REPO_URL=<frontend-url> \
BACKEND_REPO_URL=<backend-url> \
./scripts/bootstrap-workspace.sh
```

If application remotes do not exist yet, omit the URL variables; the bootstrap script creates empty placeholders.

## Skills

Canonical skills and their pinned provenance are committed under `.agents/skills/` and `skills-lock.json`.

```bash
# Only needed when committed skills are missing or intentionally refreshed.
npx skills experimental_install
rm -rf agent/skills .claude/skills .cursor/skills

# Once per machine: remove global copies that shadow this project.
./scripts/remove-global-skill-overlap.sh
```

Cursor, Codex, and Antigravity read `.agents/skills/` directly. Claude Code users additionally run:

```bash
npx skills add mattpocock/skills --agent claude-code -y --all
```

See [skills.md](skills.md) and [skills-by-tool.md](skills-by-tool.md).

## Optional ActiveGraph

ActiveGraph provides supplemental project memory. Git-tracked `GLOSSARY.md` and accepted ADRs remain authoritative.

```bash
git clone https://github.com/yoheinakajima/activegraph-packs ~/Local/activegraph-packs
cd ~/Local/activegraph-packs
pip install -e ".[dev]"
pnpm install

cd <path-to>/DSKT-setup
cp .activegraph/.env.example .activegraph/.env
# Generate a random token and replace every placeholder in .activegraph/.env
./.activegraph/start.sh
```

Then copy the MCP example for your harness and use the same bearer token. See [ActiveGraph setup](../tools/activegraph/README.md).

## Other optional tools

- [Lavish](../tools/lavish/README.md): available immediately for architecture and review alignment; generated `.lavish/` artifacts are local.
- [Excalidraw](../diagrams/README.md): durable architecture diagrams.
- [Graphify](../tools/graphify/README.md): install after application code exists.
- [chrome-agent](../tools/chrome-agent/README.md): install after a frontend or API can run locally.

## Implementation tracker

Implementation specs and tickets are version-controlled Markdown under `docs/implementation/`. No external ticketing account is required. See `docs/agents/issue-tracker.md`.

## Verification

```bash
test -f .agents/skills/teach/SKILL.md
test -f GLOSSARY.md
test -d dskt-frontend
test -d dskt-backend
test ! -f .activegraph/.env || grep -qv 'replace-with-random-token' .activegraph/.env
```

Read `GLOSSARY.md`, accepted ADRs, and the architecture documents before implementation.
