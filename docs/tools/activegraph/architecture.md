# ActiveGraph DSKT integration

## Runtime architecture

```text
Cursor / MCP client
        │  POST /mcp (Bearer token)
        ▼
Python runtime :7788  ← ACTIVEGRAPH_DEMO_SCRIPT=.activegraph/demo_server.py
        │  DSKT pack + codebase pack + assistant bundle
        ▼
.activegraph/data/dskt.sqlite
.activegraph/data/dskt_memory.sqlite

Inspector UI :3000 → API :8088 → proxies to :7788
```

The repository-owned runtime integration lives under `.activegraph/` because the start/stop scripts and upstream runtime expect that project-root path:

| Path | Responsibility |
|------|----------------|
| `.activegraph/start.sh` / `stop.sh` | Runtime lifecycle |
| `.activegraph/.env.example` | Server configuration template |
| `.activegraph/demo_server.py` | Project runtime entry point |
| `.activegraph/hook.py` | Loads the DSKT pack without forking upstream |
| `.activegraph/pack/dskt/` | Object types, relations, behaviors, tools, seed, fixtures |
| `.activegraph/data/` | Local SQLite state; gitignored |

These executable files must not be moved into `docs/tools/activegraph/`. This folder documents the integration; `.activegraph/` implements it.

## DSKT pack tools

| Tool | Description |
|------|-------------|
| `log_work` | Record a session or work log |
| `log_decision` | Record a draft note or pointer to an authoritative ADR |
| `register_bug` | Track a bug in the graph |
| `fetch_gitlab_issue` | Read a GitLab issue through `glab` and ingest it as a source |

`fetch_gitlab_issue` requires `DSKT_GITLAB_PROJECT` and authenticated `glab`.

The detailed pack implementation inventory lives beside its code at [`.activegraph/pack/dskt/README.md`](../../../.activegraph/pack/dskt/README.md).

## Run pack fixtures

Fixtures test the pack without opening the Inspector UI:

```bash
ACTIVEGRAPH_PROJECT_ROOT="$PWD" \
PYTHONPATH="$PWD/.activegraph/pack:$HOME/Local/activegraph-packs" \
python .activegraph/pack/dskt/fixtures/run_fixtures.py
```

## Data ownership

ActiveGraph owns supplemental work logs, discussions, draft notes, and bugs. Accepted decisions remain authoritative in `docs/adr/`; canonical language remains in `GLOSSARY.md`.

The DSKT pack links to upstream `activegraph-packs` through `ACTIVEGRAPH_DEMO_SCRIPT`; it does not vendor or fork that project.
