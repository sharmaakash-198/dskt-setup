# Skills across coding tools

Skills in this repo live in **one committed folder**: `.agents/skills/`.

Harness-specific paths (`.claude/skills/`, etc.) are created **locally** when needed and are **gitignored** so Cursor always resolves skills from `.agents/skills/`.

## Folder layout

| Path | In repo? | Purpose |
|------|----------|---------|
| `.agents/skills/` | Yes — commit | Canonical skill files |
| `skills-lock.json` | Yes — commit | Pinned versions for reinstall |
| `.claude/skills/` | No — gitignored | Local symlinks for Claude Code |
| `.cursor/skills/` | No — gitignored | Not used |
| `agent/skills/` | No — gitignored | Stale copies — delete after install |

**Why not commit `.claude/skills/`?** [Cursor loads both paths](https://cursor.com/docs/context/skills) for compatibility. When both exist, pins open `.claude/skills/teach` instead of `.agents/skills/teach` even though the content is identical.

## Setup by tool

### Cursor (default)

No extra setup beyond the [quick start checklist](README.md#quick-start-checklist).

- Reads `.agents/skills/` from the repo
- Invoke: type `/` in Agent chat (e.g. `/teach`, `/grill-with-docs`)
- After skill install or path changes: reload the Cursor window

### Antigravity

No extra setup. Reads `.agents/skills/` directly — same as Cursor.

After clone, run the standard install steps only if skills are missing:

```bash
npx skills experimental_install
rm -rf agent/skills .claude/skills .cursor/skills
```

### Codex

No extra setup. Reads `.agents/skills/` directly.

Optional explicit install:

```bash
npx skills add mattpocock/skills --agent codex -y --all
rm -rf agent/skills
```

### Claude Code

Requires **one local command per machine** after clone:

```bash
npx skills add mattpocock/skills --agent claude-code -y --all
```

This creates `.claude/skills/` → `.agents/skills/` symlinks locally. Do **not** commit `.claude/skills/`.

**Do not** also run `claude plugins install mattpocock-skills` — that duplicates skills.

For agent instructions, use `AGENTS.md` or add a one-line pointer in `CLAUDE.md`.

## ActiveGraph MCP by harness

Skills and `AGENTS.md` are **shared**. ActiveGraph **MCP client config is per harness** — each tool reads its own file.

| Harness | `.env` identifier | Client MCP config | Committed example |
|---------|-------------------|-------------------|-------------------|
| Cursor | `cursor` | `.cursor/mcp.json` | `.cursor/mcp.json.example` |
| Claude Code | `claude-code` | `.mcp.json` (repo root) | `.mcp.json.example` |
| Antigravity | `antigravity` | `.agents/mcp_config.json` | `.agents/mcp_config.json.example` |
| Codex | `codex` | tool-specific | — |

**Server config (shared):** `.activegraph/.env` + `./.activegraph/start.sh`.

**Auth rule:** if `ACTIVEGRAPH_OWNER` is set, it must include the identifier from `ACTIVEGRAPH_MCP_TOKENS` (the part after the colon). Mismatch → MCP `invalid token`. Restart the stack after any `.env` change:

```bash
lsof -ti :3000,:8088,:7788 | xargs kill
./.activegraph/start.sh
```

Full setup: [tools/activegraph](../tools/activegraph/README.md).

## `/setup-matt-pocock-skills` — when to run

| Situation | Run it? |
|-----------|---------|
| First time adopting skills in this repo | Yes — **already done** |
| Switching from Cursor to Claude Code | **No** |
| Switching from Cursor to Antigravity | **No** |
| Fresh clone | **No** — config is committed in `docs/agents/` |
| Changing issue tracker (e.g. GitLab → local) | Yes |
| Changing triage label names | Yes |
| Skills upgrade changed tracker templates | Yes (or edit `docs/agents/*.md` by hand) |

Repo config lives in committed files, not in the harness:

```
AGENTS.md
docs/agents/issue-tracker.md
docs/agents/triage-labels.md
docs/agents/domain.md
```

## Switching harnesses (summary)

| Action | Required when switching? |
|--------|--------------------------|
| `/setup-matt-pocock-skills` | No |
| Reinstall skills (`experimental_install`) | Only if `.agents/skills/` is empty |
| `remove-global-skill-overlap.sh` | Once per machine (any harness) |
| Claude Code symlink command | Once per machine, only for Claude Code |
| Reload IDE / new chat | After skill path changes |
| ActiveGraph stack | Same `./.activegraph/start.sh` for all harnesses |
| ActiveGraph MCP client file | **Different per harness** — see table above |
| `.activegraph/.env` identifier | Match the harness you use (`cursor`, `claude-code`, `antigravity`, …) or register all |

## What to commit

```
.agents/skills/
.agents/mcp_config.json.example
.cursor/mcp.json.example
.mcp.json.example
skills-lock.json
scripts/remove-global-skill-overlap.sh
docs/agents/
docs/setup/
docs/tools/
AGENTS.md
GLOSSARY.md
docs/adr/
.gitignore               # ignores agent/skills/, .claude/skills/, .cursor/skills/
                          # .activegraph/.env and .activegraph/data/ are gitignored
```

Local harness MCP configs (may contain bearer tokens): `.cursor/mcp.json`, `.mcp.json`, `.agents/mcp_config.json` — copy from the `*.example` files.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Skill opens `.claude/skills/...` in Cursor | `rm -rf .claude/skills` then reload Cursor |
| `/teach` not in slash menu | Verify `.agents/skills/teach/SKILL.md` exists; reinstall skills |
| `.agents/skills/` empty | `npx skills add mattpocock/skills -y --all` |
| Global skill shadows project | `./scripts/remove-global-skill-overlap.sh` |
| `agent/skills/` reappeared | `rm -rf agent/skills` — do not use `--agent cursor` on install |
| ActiveGraph MCP `invalid token` | Identifier in `.env` must match `ACTIVEGRAPH_OWNER`; restart stack after `.env` edits — [tools/activegraph](../tools/activegraph/README.md) |
| Port 3000 / 8088 in use | `lsof -ti :3000,:8088,:7788 \| xargs kill` then `./.activegraph/start.sh` |

## See also

- [Setup checklist](README.md)
- [How skills work](skills.md)
- [ActiveGraph setup](../tools/activegraph/README.md)
- [mattpocock/skills on GitHub](https://github.com/mattpocock/skills)
- [Setup skill reference](https://www.aihero.dev/skills-setup-matt-pocock-skills)
