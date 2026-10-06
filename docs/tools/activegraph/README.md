# ActiveGraph — project memory

Local supplemental agent memory for DSKT work logs, discussions, draft decision notes, and bugs. [`GLOSSARY.md`](../../../GLOSSARY.md) and accepted [`docs/adr/`](../../adr/) files remain authoritative.

## Responsibilities

| What | Where |
|------|-------|
| Work logs, discussions, draft decision notes, bugs | ActiveGraph |
| Canonical vocabulary | `GLOSSARY.md` |
| Accepted architecture and process decisions | `docs/adr/` |

Agents write with `dskt.log_decision` and `dskt.log_work`, and recall with `memory_search`. An accepted decision note must point to its authoritative ADR.

## What runs

| Layer | Purpose |
|-------|---------|
| Inspector UI | `http://localhost:3000` — browse objects, relations, and traces |
| DSKT pack | `project`, `work_log`, `decision_note`, `bug`, relations, and project tools |
| codebase pack | Optional repo, issue, PR, and ADR workflow objects |
| MCP | Cursor and other agents call memory and DSKT tools |

Data is stored under `.activegraph/data/` and is gitignored.

## Prerequisites

Clone and install [activegraph-packs](https://github.com/yoheinakajima/activegraph-packs):

```bash
git clone https://github.com/yoheinakajima/activegraph-packs ~/Local/activegraph-packs
cd ~/Local/activegraph-packs
pip install -e ".[dev]"
pnpm install
```

Python 3.11+ and Node/pnpm are required for the Inspector stack.

## First-time project setup

```bash
cp .activegraph/.env.example .activegraph/.env
# Set DSKT_GITLAB_PROJECT and ACTIVEGRAPH_MCP_TOKENS
chmod +x .activegraph/start.sh .activegraph/stop.sh
```

Configure the calling harness by following [mcp.md](mcp.md).

## Start and stop

From the repository root:

```bash
./.activegraph/start.sh
```

Default services:

| Service | URL |
|---------|-----|
| Inspector UI | http://localhost:3000 |
| API server | http://localhost:8088 |
| Python runtime and MCP | http://localhost:7788 |

Override ports in `.activegraph/.env`. Always restart after editing that file:

```bash
./.activegraph/stop.sh
./.activegraph/start.sh
```

`start.sh` also calls `stop.sh`, so starting again is normally sufficient. If a port remains occupied, stop explicitly first.

## Reset local memory

Use **Reset runtime** in the UI, or:

```bash
curl -X POST http://localhost:8088/api/activegraph/reset
```

This deletes local SQLite state and re-seeds the DSKT project graph.

## Files in this folder

| File | Contents |
|------|----------|
| `README.md` | Install, lifecycle, and everyday use |
| [mcp.md](mcp.md) | Authentication and per-harness MCP configuration |
| [architecture.md](architecture.md) | Runtime wiring, implementation paths, DSKT pack, and fixtures |

## Upstream references

- [ActiveGraph](https://github.com/yoheinakajima/activegraph)
- [activegraph-packs](https://github.com/yoheinakajima/activegraph-packs)
- [ActiveGraph MCP](https://github.com/yoheinakajima/activegraph-packs/blob/main/docs/mcp.md)
