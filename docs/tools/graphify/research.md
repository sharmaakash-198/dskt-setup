# ActiveGraph vs Graphify

_Researched 2026-09-04. Claims below are tied to first-party sources (official READMEs, docs sites, and in-repo paths). Secondary blog posts were not used as evidence._

## Identity of each project

| Project | Canonical identity | Primary repos / docs |
|---------|-------------------|----------------------|
| **ActiveGraph** | Event-sourced reactive graph **runtime** for durable, auditable agentic systems (Yohei Nakajima), plus an official **pack library** for assistant capabilities | Runtime: [yoheinakajima/activegraph](https://github.com/yoheinakajima/activegraph), [docs.activegraph.ai](https://docs.activegraph.ai/), [activegraph.ai](https://activegraph.ai/). Packs/UI: [yoheinakajima/activegraph-packs](https://github.com/yoheinakajima/activegraph-packs). DSKT usage: [`docs/tools/activegraph/README.md`](../activegraph/README.md), [`.activegraph/pack/dskt/`](../../../.activegraph/pack/dskt/) |
| **Graphify** | On-device **code (and multimodal corpus) knowledge graph** for AI coding assistants — AST extract → NetworkX graph → query/path/explain; skill + CLI + optional MCP | OSS: [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) (Apache 2.0; primary maintainer `safishamsi` per GitHub contributors). Docs: [graphify.com/docs](https://graphify.com/docs), [graphify.com/concepts](https://graphify.com/concepts). PyPI CLI package name is temporarily `graphifyy` ([README](https://github.com/Graphify-Labs/graphify)). Related earlier skill framing also appears under [safishamsi/graphify](https://github.com/safishamsi/graphify); treat **Graphify-Labs/graphify + graphify.com** as the current primary product surface. |

---

## 1. ActiveGraph

### Problem it solves

ActiveGraph addresses **long-running, stateful, auditable agent systems**: agents that must share durable world-state, react to mutations, resume/replay runs, and prove what happened from an append-only log — rather than ephemeral chat threads that forget between sessions. ([activegraph README](https://github.com/yoheinakajima/activegraph); [docs.activegraph.ai](https://docs.activegraph.ai/); paper linked from the repo: [arXiv:2605.21997](https://arxiv.org/abs/2605.21997))

The **activegraph-packs** layer adds a reference **assistant chassis**: memory lifecycle, identity, tool governance, channels, MCP in/out, and domain packs (research, codebase workflow, meetings, etc.) composed through shared graph events — no central orchestrator. ([activegraph-packs README](https://github.com/yoheinakajima/activegraph-packs/blob/main/README.md))

In DSKT, ActiveGraph is supplemental project memory for discussions, session/work notes, bugs, and draft decision notes. Accepted ADR files and `GLOSSARY.md` remain authoritative. ([`docs/tools/activegraph/README.md`](../activegraph/README.md); [`AGENTS.md`](../../../AGENTS.md))

### Core data model / what gets stored

**Runtime model**

- **Event log** is source of truth; the **graph** (objects + typed relations) is a projection rebuilt by replay. ([docs.activegraph.ai](https://docs.activegraph.ai/); [concepts/graph](https://docs.activegraph.ai/concepts/graph/); FalkorDB guide distinguishing EventStore vs GraphStore: [using-falkordb.md](https://github.com/yoheinakajima/activegraph/blob/main/docs/guides/using-falkordb.md))
- Primitives include objects, events, behaviors, relations, patches, forking/diff. ([activegraph README — Concepts](https://github.com/yoheinakajima/activegraph))
- Persistence: SQLite/Postgres event stores (and optional projected stores). ([activegraph README Install/What you get](https://github.com/yoheinakajima/activegraph); packs demo: `ACTIVEGRAPH_DB` / `ACTIVEGRAPH_MEMORY_DB` under `data/` — [activegraph-packs README](https://github.com/yoheinakajima/activegraph-packs/blob/main/README.md))

**Core pack primitives** (universal substrate)

- Object types: `source`, `observation`, `task`, `action`, `artifact`, `memory_candidate`, `evaluation` (+ matching relation types). ([packs/README.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/README.md); [activegraph-packs README](https://github.com/yoheinakajima/activegraph-packs/blob/main/README.md))

**Memory gateway**

- Candidates → evaluation → durable `memory_item` (SQLite or pluggable backends such as `mem0://`). Retrieval is keyword/hybrid ranked; forgetting is reliability weighting, not silent delete. ([packs/memory_gateway/README.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/memory_gateway/README.md))

**Codebase pack** (workflow / engineering ontology — not AST call-graph mining)

- Types include `repo`, `code_file`, `code_function`, `dependency`, `issue`, `pull_request`, `architecture_decision`, `code_change`, `test_result`, typically fed by manifests, webhooks, ADR file paths, issue sources. ([packs/codebase/README.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/codebase/README.md))

**DSKT pack** (this repo)

- `project`, `work_log`, `decision_note`, `bug` + relations (`belongs_to_project`, …). Tools: `log_work`, `log_decision`, `register_bug`, `fetch_gitlab_issue`. ([`.activegraph/pack/dskt/object_types.py`](../../../.activegraph/pack/dskt/object_types.py); [`.activegraph/pack/dskt/tools.py`](../../../.activegraph/pack/dskt/tools.py); [`.activegraph/pack/dskt/README.md`](../../../.activegraph/pack/dskt/README.md))
- Local data under `.activegraph/data/` (gitignored). ([`docs/tools/activegraph/README.md`](../activegraph/README.md))

### How agents interact

| Surface | Role |
|---------|------|
| **MCP (inbound)** | Demo/runtime exposes `POST /mcp`; tools include `chat`, `memory_search`, `catalog_search`, plus exposed capabilities under token auth and role-scoped exposure. ([docs/mcp.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/docs/mcp.md)) |
| **MCP (outbound)** | Connect to other MCP servers; tools become Tool Gateway capabilities (approval/risk gated). ([docs/mcp.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/docs/mcp.md)) |
| **HTTP demo + Inspector UI** | Packs demo: Python runtime + API + React Inspector. ([activegraph-packs README](https://github.com/yoheinakajima/activegraph-packs/blob/main/README.md)) |
| **CLI / Python API** | `pip install activegraph`, `activegraph quickstart`, `Runtime` + pack loading. ([activegraph README](https://github.com/yoheinakajima/activegraph)) |
| **DSKT wiring** | `./.activegraph/start.sh`; Cursor/Claude/Antigravity MCP clients point at `http://127.0.0.1:7788/mcp` with bearer token; agents use `dskt.log_*` / `memory_search`. ([`docs/tools/activegraph/README.md`](../activegraph/README.md); [`.cursor/mcp.json.example`](../../../.cursor/mcp.json.example) pattern in that doc) |

### Session/decision memory vs structural code understanding

**Primarily session / project / agent memory and workflow state.**

- Design center: event-sourced agent world, memory candidates, chat, approvals, meetings, issues, ADRs as **tracked objects**. ([activegraph README](https://github.com/yoheinakajima/activegraph); [memory_gateway](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/memory_gateway/README.md); [codebase pack](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/codebase/README.md))
- The source EMP repository used ActiveGraph as its primary decision store. DSKT deliberately differs: accepted ADR files are authoritative, while ActiveGraph provides supplemental work logs and searchable notes. ([`docs/tools/activegraph/README.md`](../activegraph/README.md))
- The codebase pack can hold file/function/ADR **metadata** from ingestion events, but it does **not** position itself as tree-sitter AST mapping of a whole repo into a queryable call/import graph. ([packs/codebase/README.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/codebase/README.md))

### Typical workflow

1. Start a local runtime (or DSKT’s `./.activegraph/start.sh`). ([`docs/tools/activegraph/README.md`](../activegraph/README.md); [activegraph-packs Path 2](https://github.com/yoheinakajima/activegraph-packs/blob/main/README.md))
2. Connect an IDE agent via MCP with a bearer token. ([docs/mcp.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/docs/mcp.md); DSKT MCP section in [`docs/tools/activegraph/README.md`](../activegraph/README.md))
3. During work: write work logs and draft decision notes (`log_work` / `log_decision`); recall with `memory_search`. Accepted decisions remain in ADR files. ([DSKT tools](../../../.activegraph/pack/dskt/tools.py); [AGENTS.md](../../../AGENTS.md))
4. Behaviors cascade on graph writes (candidate → evaluation → memory item, etc.). ([memory_gateway README](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/memory_gateway/README.md))
5. Optionally inspect objects/relations/trace in the UI; reset/re-seed when needed. ([`docs/tools/activegraph/README.md`](../activegraph/README.md))
6. Advanced: fork runs, diff, promote — framework differentiator. ([activegraph README](https://github.com/yoheinakajima/activegraph))

---

## 2. Graphify

### Problem it solves

Graphify addresses **structural (and multimodal) understanding of a codebase/corpus for coding assistants**: map code, docs, PDFs, schemas, etc. into a **persistent, traversable knowledge graph** so the assistant can **query / path / explain** instead of re-grepping or stuffing raw files into context. ([Graphify-Labs README](https://github.com/Graphify-Labs/graphify); [graphify.com/docs](https://graphify.com/docs); [graphify.com/concepts](https://graphify.com/concepts))

Explicit contrast to RAG: graph persists and is walkable with file:line citations; not an embedding vector store for the core model. ([graphify.com/concepts](https://graphify.com/concepts); README “Not a vector index” claim on [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify))

### Core data model / what gets stored

**Pipeline** (library modules): `detect → extract → build → cluster → analyze → report → export`. ([ARCHITECTURE.md](https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/ARCHITECTURE.md))

**Extraction schema**

```json
{
  "nodes": [{"id": "...", "label": "...", "source_file": "...", "source_location": "L42"}],
  "edges": [{"source": "...", "target": "...", "relation": "calls|imports|uses|...", "confidence": "EXTRACTED|INFERRED|AMBIGUOUS"}]
}
```

([ARCHITECTURE.md — Extraction output schema](https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/ARCHITECTURE.md))

**Confidence tags**

| Tag | Meaning (first-party) |
|-----|------------------------|
| `EXTRACTED` | Explicit in source / AST (e.g. import, direct call) |
| `INFERRED` | Model or resolution-derived link |
| `AMBIGUOUS` | Uncertain; flagged for review |

([ARCHITECTURE.md](https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/ARCHITECTURE.md); [graphify.com/concepts](https://graphify.com/concepts))

**On-disk artifacts** (typical `graphify-out/`)

- `graph.json` — machine-readable graph  
- `GRAPH_REPORT.md` — god nodes, surprising connections, suggested questions  
- `graph.html` — interactive visualization  
- Optional: Obsidian vault, wiki, GraphML, Cypher, cache  

([graphify.com/docs](https://graphify.com/docs); [Graphify-Labs README](https://github.com/Graphify-Labs/graphify); [safishamsi/graphify README](https://raw.githubusercontent.com/safishamsi/graphify/v1/README.md) for overlapping artifact list)

**Code path:** tree-sitter AST, local/deterministic, no LLM for code parse. **Docs/media:** model-assisted semantic pass, tagged `INFERRED`. ([graphify.com/concepts](https://graphify.com/concepts); [graphify.com/docs](https://graphify.com/docs))

**Clustering:** Leiden communities; god-node / surprising-connection analysis. ([ARCHITECTURE.md](https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/ARCHITECTURE.md); README capability table on [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify))

### How agents interact

| Surface | Role |
|---------|------|
| **Assistant skill** | `/graphify` (or `$graphify` on Codex) after `graphify install` for many assistants including Cursor. ([graphify.com/docs](https://graphify.com/docs); [Graphify-Labs README install table](https://github.com/Graphify-Labs/graphify)) |
| **CLI** | `graphify query`, `path`, `explain`, `prs`, `--update`, `--watch`, `hook install`, etc. ([graphify.com/docs](https://graphify.com/docs); README Usage) |
| **Files in repo** | Agents read `GRAPH_REPORT.md` / `graph.json` / wiki `index.md` without a server. ([README](https://github.com/Graphify-Labs/graphify); [ARCHITECTURE.md wiki](https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/ARCHITECTURE.md)) |
| **MCP** | `python -m graphify.serve graphify-out/graph.json` (stdio or HTTP); tools include `query_graph`, `get_node`, `get_neighbors`, `shortest_path`, `get_community`, `god_nodes`, `graph_stats`, `list_prs`, `get_pr_impact`, `triage_prs`. ([graphify.com/docs](https://graphify.com/docs); `serve.py` in [ARCHITECTURE.md](https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/ARCHITECTURE.md)) |
| **Hooks** | Optional strict “use graph before raw reads”; post-commit rebuild. ([Graphify-Labs README](https://github.com/Graphify-Labs/graphify)) |

Requires a **running long-lived assistant runtime?** No for the OSS path: graph is files; MCP is optional. ([graphify.com/concepts](https://graphify.com/concepts))

### Session/decision memory vs structural code understanding

**Primarily structural code (and corpus) understanding.**

- Official mental model: “code knowledge graph … query it instead of grepping.” ([graphify.com/concepts](https://graphify.com/concepts); [graphify.com/docs](https://graphify.com/docs))
- WHY/NOTE comments and ADR/RFC citations become nodes linked to code — **documentation-derived structure**, not a live decision log with auth/audit for agent writes. ([Graphify-Labs README capability table](https://github.com/Graphify-Labs/graphify))
- Product also ships LOCOMO / LongMemEval-style **benchmarks** in the README (recall/QA tables). That measures retrieval quality on memory-style evals; it does **not** redefine the product as a session-decision memory system with write tools like `log_decision`. Interpret as evidence of graph retrieval strength, not as parity with ActiveGraph’s memory lifecycle. ([BENCHMARKS.md linked from Graphify-Labs README](https://github.com/Graphify-Labs/graphify))

### Typical workflow

1. `uv tool install graphifyy` then `graphify install` (register skill). ([graphify.com/docs](https://graphify.com/docs))
2. In the project: `/graphify .` (or `--update` / `--mode deep`). ([graphify.com/docs](https://graphify.com/docs))
3. Inspect `graphify-out/GRAPH_REPORT.md` / `graph.html`. ([graphify.com/docs](https://graphify.com/docs))
4. Ask structural questions via CLI or MCP: query / path / explain / PR impact. ([graphify.com/docs](https://graphify.com/docs))
5. Optionally `--watch` or `graphify hook install` to keep the graph current. ([Graphify-Labs README](https://github.com/Graphify-Labs/graphify))

---

## 3. Comparison

### Overlap

| Overlap | Notes |
|---------|--------|
| Both are **graphs for AI agents** | Shared vocabulary; different sources of truth and write paths. |
| Both can expose **MCP** | ActiveGraph: living runtime + memory/chat/tools ([docs/mcp.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/docs/mcp.md)). Graphify: serve a static/built `graph.json` ([graphify.com/docs](https://graphify.com/docs)). |
| Both may touch **ADRs / architecture rationale** | ActiveGraph: `architecture_decision` / DSKT `decision_note` as first-class memory objects ([codebase pack](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/codebase/README.md); [DSKT object_types](../../../.activegraph/pack/dskt/object_types.py)). Graphify: extracts ADR/RFC citations and `# WHY:` into the code graph ([Graphify-Labs README](https://github.com/Graphify-Labs/graphify)). |
| ActiveGraph **codebase pack** vs Graphify **code nodes** | Superficial type overlap (`code_file`, `code_function`) but different ingestion: event/webhook/manifest vs tree-sitter whole-repo extract. ([codebase pack](https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/codebase/README.md); [ARCHITECTURE.md](https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/ARCHITECTURE.md)) |
| Both claim **local / controllable data planes** | ActiveGraph: self-hosted SQLite/event log. Graphify OSS: on-device AST + files under `graphify-out/` (model calls only for non-code INFERRED pass). ([activegraph docs](https://docs.activegraph.ai/); [graphify.com/concepts](https://graphify.com/concepts)) |

### Complementary (not substitutes)

```text
                    ┌─────────────────────────────┐
   Accepted intent  │  WHAT is authoritative      │  ADRs + GLOSSARY.md
                    └──────────────┬──────────────┘
                                   │ indexed / referenced
                    ┌──────────────▼──────────────┐
   Work sessions    │ tried / blocked / draft     │  ActiveGraph
                    └──────────────┬──────────────┘
                                   │ alongside
                    ┌──────────────▼──────────────┐
   Repo snapshot    │ calls, imports, communities │  Graphify
                    └─────────────────────────────┘
```

| Need | Prefer |
|------|--------|
| Persist accepted decisions | **ADR files** |
| Persist work logs, draft notes, and bugs across agent sessions | **ActiveGraph** |
| “What calls `X`?”, communities, god nodes, PR blast radius on structure | **Graphify** |
| Build a custom reactive multi-pack assistant | **ActiveGraph** runtime + packs |
| Cheap structural map without running a long-lived agent runtime | **Graphify** files (+ optional MCP) |
| Fork/diff agent runs / event replay | **ActiveGraph** only |

### When to use one, both, or neither

**ActiveGraph alone** — Strong fit when the pain is **forgetting project context** (what was tried last session, open bugs, and draft notes) and you already accept a local stack (runtime + MCP). DSKT uses it as a supplemental memory layer. ([`docs/tools/activegraph/README.md`](../activegraph/README.md))

**Graphify alone** — Strong fit when the pain is **navigating a large/multi-language codebase** (or mixed code+docs corpus) and you want assistants to query structure before dumping files into context. No need for decision memory store. ([graphify.com/concepts](https://graphify.com/concepts))

**Both** — Sensible when you want **orthogonal context layers**:

1. Graphify answers “where is auth wired?” from AST.  
2. ActiveGraph answers “what did the previous session try before geometry validation failed?” from work logs.  

Keep write authority clear: **accepted decisions → ADR files**, **supplemental work memory → ActiveGraph**, and **structural facts → Graphify rebuild**. Link `decision_note.adr_path` to markdown that Graphify also indexes—one authoritative narrative, two derived indexes. ([DSKT `DecisionNote.adr_path`](../../../.activegraph/pack/dskt/object_types.py); Graphify ADR/WHY extraction in [README](https://github.com/Graphify-Labs/graphify))

**Neither** — Fine for small repos, short tasks, or when IDE search + ADRs in git + chat history are enough. Graphify’s own worked examples note limited token-reduction value on tiny corpora. ([safishamsi/graphify README worked examples](https://raw.githubusercontent.com/safishamsi/graphify/v1/README.md); Graphify-Labs README similar framing)

### Risks of using both

| Risk | Detail | Mitigation |
|------|--------|------------|
| **Conceptual duplication** | Agents may log a decision in ActiveGraph *and* rely on Graphify’s extracted ADR node as if it were authoritative. | Keep accepted decisions in ADR files; use ActiveGraph only for supplemental notes and ADR pointers. ([`docs/tools/activegraph/README.md`](../activegraph/README.md)) |
| **Two MCP surfaces** | Tool catalogs collide (`memory_search` vs `query_graph`); agents may pick the wrong tool. | Name servers distinctly; teach skills which tool class to use; avoid exposing both as generic “search memory.” ([docs/mcp.md](https://github.com/yoheinakajima/activegraph-packs/blob/main/docs/mcp.md); [graphify.com/docs MCP tools](https://graphify.com/docs)) |
| **Maintenance cost** | ActiveGraph: keep stack running, tokens, packs. Graphify: rebuilds on change (`--watch` / hooks), `graphify-out/` size, optional LLM cost for doc pass. ([`docs/tools/activegraph/README.md`](../activegraph/README.md); [Graphify README watch/hooks](https://github.com/Graphify-Labs/graphify)) | Automate Graphify rebuild; treat ActiveGraph as always-on only when memory is needed. |
| **Divergent “code” ontologies** | ActiveGraph codebase pack objects vs Graphify AST nodes will not auto-sync. | Do not enable both as competing code indexes unless you define sync; prefer Graphify for structure, ActiveGraph codebase pack for issue/PR/ADR **workflow** if used at all. |
| **Git noise** | Committing large `graphify-out/` or ActiveGraph DBs. | Gitignore graphs/DBs; commit only reports you intentionally share (same pattern as DSKT’s gitignored `.activegraph/data/`). ([`docs/tools/activegraph/README.md`](../activegraph/README.md)) |
| **False equivalence from benchmarks** | Graphify LOCOMO numbers may tempt treating it as session memory. | Keep product intent from [graphify.com/concepts](https://graphify.com/concepts); use ActiveGraph for writeable project memory. |

---

## 4. DSKT-specific takeaway

| Layer | DSKT today | Graphify? |
|-------|-----------|-----------|
| Accepted project decisions | Authoritative `docs/adr/` files | Can index those files but never replace them |
| Work logs, draft notes, and bugs | ActiveGraph DSKT pack + MCP | Not a replacement |
| Structural codebase map for agents | Not provided by ActiveGraph DSKT pack | Would be additive if large-repo navigation becomes a bottleneck |

**Recommendation for DSKT:** keep accepted decisions in ADR files and use **ActiveGraph** for supplemental work memory. Evaluate **Graphify** only if agents routinely fail at cross-module structural questions that AST graphs solve well—and if adopted, treat it as a **read-mostly structural index**, not a decision log.

---

## Source index

| Source | URL / path |
|--------|------------|
| ActiveGraph runtime README | https://github.com/yoheinakajima/activegraph |
| ActiveGraph docs | https://docs.activegraph.ai/ |
| ActiveGraph packs README | https://github.com/yoheinakajima/activegraph-packs |
| ActiveGraph packs index | https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/README.md |
| ActiveGraph MCP | https://github.com/yoheinakajima/activegraph-packs/blob/main/docs/mcp.md |
| Memory gateway | https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/memory_gateway/README.md |
| Codebase pack | https://github.com/yoheinakajima/activegraph-packs/blob/main/packs/codebase/README.md |
| DSKT ActiveGraph setup | `docs/tools/activegraph/README.md` |
| DSKT pack types/tools | `.activegraph/pack/dskt/` |
| Graphify-Labs repo | https://github.com/Graphify-Labs/graphify |
| Graphify docs / concepts | https://graphify.com/docs · https://graphify.com/concepts |
| Graphify architecture | https://raw.githubusercontent.com/Graphify-Labs/graphify/v8/ARCHITECTURE.md |
| safishamsi/graphify (related skill README) | https://github.com/safishamsi/graphify |
