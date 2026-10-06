# Tools

Every agent-facing utility in this repo gets **one folder here**: `docs/tools/<tool>/`.

That folder is the single home for the tool's install steps, usage, triggers, design notes, and research. Nothing tool-specific belongs in `docs/setup/`, `docs/research/`, or a generator-named folder.

## Installed tools

| Tool | Purpose | Install | Skill | Always-on rule |
|------|---------|---------|-------|----------------|
| [activegraph](activegraph/README.md) | Supplemental project memory — work logs, draft notes, bugs (MCP) | `./.activegraph/start.sh` + per-harness MCP config | — | — |
| [graphify](graphify/README.md) | Code structure graph — symbols, callers, dependents | `uv tool install graphifyy` | — | `.cursor/rules/graphify.mdc` |
| [chrome-agent](chrome-agent/README.md) | Browser automation over CDP (preferred over Playwright) | `uv tool install chrome-agent` | `.agents/skills/chrome-agent/` | `.cursor/rules/chrome-agent.mdc` |
| [lavish](lavish/README.md) | Interactive HTML alignment surface for human review | zero-install `npx -y lavish-axi` | `.agents/skills/lavish/` | `.cursor/rules/lavish.mdc` |

The ActiveGraph comparison that motivated Graphify's adoption now lives with Graphify's research: [graphify/research.md](graphify/research.md).

## Where each part of a tool lives

A tool integration is spread across four kinds of location. Only the first is free to organize; the other three are fixed by the harnesses.

| Part | Location | Why there |
|------|----------|-----------|
| Docs, design, research | `docs/tools/<tool>/` | This convention |
| Agent instructions | `.agents/skills/<tool>/SKILL.md` | Canonical skill path for all harnesses |
| Always-applied trigger | `.cursor/rules/<tool>.mdc` | Cursor only reads rules from here |
| Generated output | gitignored dir (`graphify-out/`, `.lavish/`) | Local, disposable, never committed |

No tool is vendored into the repo. Each one runs from a machine-level install (`uv tool install`) or a package cache (`npx -y`), so a clone contains configuration only — never tool source or `node_modules`.

## File naming inside a tool folder

| File | Contents |
|------|----------|
| `README.md` | Required — install, triggers, usage, boundaries |
| `design.md` | Approved design/spec, if the integration needed one |
| `plan.md` | Implementation plan, if one was written |
| `research.md` | Primary-source research behind the choice |
| `mcp.md` | MCP connection details when they are substantial |
| `architecture.md` | Repository-specific runtime wiring |

## Adding a tool

1. Create `docs/tools/<tool>/README.md` covering install, triggers, usage, and boundaries against existing tools.
2. Add the skill under `.agents/skills/<tool>/SKILL.md` if agents need instructions.
3. Add `.cursor/rules/<tool>.mdc` only if the tool must trigger automatically.
4. Gitignore any generated output directory.
5. Add a row to the table above and a pointer in `AGENTS.md`.

Specs and plans for a tool go in its folder — not in a folder named after the skill that generated them.
