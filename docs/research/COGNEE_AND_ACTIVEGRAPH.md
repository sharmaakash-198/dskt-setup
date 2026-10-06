# Cognee and ActiveGraph for DSKT

**Status:** Research recommendation  
**Date:** 2026-10-05  
**Recommendation:** **Defer Cognee adoption.** Keep ActiveGraph for repository/agent memory, and keep PostgreSQL as DSKT's only authoritative domain store. Reconsider Cognee only for a defined semantic-retrieval use case, then run a synthetic-data, time-boxed spike before any employee or floor data is admitted.

## Executive summary

Cognee and the existing ActiveGraph integration overlap at the phrase “persistent agent memory,” but they solve materially different problems:

- **ActiveGraph in `emp` is a repository-owned, typed, event-sourced operational memory for agents.** It records explicit work logs, decisions, bugs, relations, tool calls, and audit traces. Its `emp` integration deliberately owns project memory, not Employee Service domain data.
- **Cognee is an AI knowledge-memory and retrieval layer.** It ingests text/files/URLs, uses an LLM and embedding model to extract entities and relationships, and serves semantic, graph, hybrid, session, and code retrieval. Its v1.0 lifecycle is `remember`, `recall`, `improve`, and `forget` ([official overview](https://docs.cognee.ai/core-concepts/overview)).

Cognee therefore does not replace ActiveGraph's typed project workflow, event reactions, governed capabilities, or trace. It could complement ActiveGraph with fuzzy retrieval across large unstructured corpora, but DSKT currently defines no such product or engineering requirement. DSKT instead requires normalized PostgreSQL, deterministic domain rules, server-side RBAC, auditability, and strict handling of employee and floor data. Putting operational DSKT records into Cognee would duplicate sensitive data across raw storage, relational metadata, embeddings, and an inferred graph, while introducing LLM/embedding processing and a second authorization model.

The current benefit does not justify that risk or operational load. Cognee should not be adopted now, should not become a DSKT domain store, and should not ingest production employee, Assignment, or Floor Plan data. If a concrete need later appears—such as semantic recall over architecture documentation too large for ActiveGraph's current keyword-oriented memory—the next step should be a bounded spike using public or synthetic documents only.

## Scope and source standard

This assessment uses:

- DSKT's [high-level design](../architecture/HLD.md), [low-level design](../architecture/LLD.md), [RBAC rules](../security/RBAC.md), and accepted [PostgreSQL ADR](../adr/0003-normalized-postgresql-model.md).
- The local `emp` integration under [`.activegraph`](../../../emp/.activegraph/) and [its documentation](../../../emp/docs/tools/activegraph/README.md), plus the locally installed ActiveGraph and `activegraph-packs` source/docs it executes.
- Cognee's official documentation and [`topoteretes/cognee`](https://github.com/topoteretes/cognee) repository only. Repository metadata was checked at commit [`b32d8af`](https://github.com/topoteretes/cognee/tree/b32d8afc59e1064d9291b9828a8a147be9cc8bab) (Cognee `1.6.2`).

Marketing claims were not treated as evidence unless the official docs or source described the concrete behavior.

## Current DSKT and ActiveGraph boundaries

### DSKT's settled architecture

DSKT's backend owns domain rules and persists normalized relational state in PostgreSQL. PostgreSQL is authoritative; JSONB domain persistence and PostGIS are excluded initially. Local development uses the isolated database identity adapter, deployed environments use Microsoft Entra ID, DSKT's database roles authorize operations, and every protected operation is checked in the backend. Employee imports, publication, labeling, Assignments, and role changes have explicit transaction and audit requirements.

This means any memory system added to DSKT must be **derived and non-authoritative**. It cannot become an alternate write path for Employee, Assignment, Floor Plan Revision, geometry, identity, or authorization state without contradicting accepted architecture.

### What the existing ActiveGraph approach is

The `emp` integration is intentionally local project memory:

- The project docs designate ActiveGraph as the primary store for decisions, discussions, session notes, and bugs; ADR files are optional shareable exports.
- The `emp` pack defines explicit Pydantic object types for `project`, `work_log`, `decision_note`, and `bug`, plus typed relations such as `belongs_to_project`, `blocks`, `implements`, `references`, and `supersedes`.
- Behaviors react to graph mutations—for example, linking new objects to the project and removing `blocks` edges when a bug is fixed.
- Project tools explicitly log work and decisions, register bugs, and ingest a GitLab issue.
- The loaded codebase pack adds repository/issue/PR/ADR workflow objects. The assistant bundle adds memory and chat capabilities.

The runtime is:

```text
MCP client
  -> Python runtime :7788
     -> ActiveGraph runtime + emp/codebase/assistant packs
     -> .activegraph/data/emp.sqlite
     -> .activegraph/data/emp_memory.sqlite

Inspector UI :3000 -> API :8088 -> Python runtime
```

The local implementation and runtime are described in [the `emp` architecture document](../../../emp/docs/tools/activegraph/architecture.md). The startup script requires Python 3.11+, Node, pnpm, a checkout of `activegraph-packs`, and three local processes. Its SQLite files are local and gitignored.

ActiveGraph is not being used as Employee Service's application database. That separation is important and should be preserved for DSKT.

## Capability comparison

| Area | Existing ActiveGraph approach | Cognee | DSKT consequence |
|---|---|---|---|
| Primary purpose | Typed, event-sourced assistant/project operations | AI memory and retrieval over ingested content | Different centers of gravity; not drop-in substitutes |
| Writes | Explicit typed objects, relations, and governed tools | Text/files/URLs transformed by LLM extraction and embeddings | Cognee's inferred facts need provenance and must remain non-authoritative |
| Recall | Local memory search plus graph/project tooling; current memory gateway uses keyword ranking | Semantic vector, graph, hybrid, session-aware, and code retrieval ([architecture](https://docs.cognee.ai/core-concepts/architecture), [MCP tools](https://docs.cognee.ai/cognee-mcp/mcp-tools)) | Cognee is stronger when fuzzy retrieval is the actual requirement |
| Domain workflow | Reactive behaviors, pack schemas, typed relations, capability policies | Custom DataPoints, Tasks, and Pipelines; memory lifecycle operations ([core concepts](https://docs.cognee.ai/core-concepts/overview)) | Recreating ActiveGraph workflows in Cognee would be bespoke work |
| Audit and provenance | Event log, frames/trace, typed capability call/result records, MCP access records | Relational provenance plus optional OpenTelemetry; graph/vector retrieval metadata | Neither automatically satisfies DSKT's business-audit schema |
| Agent interface | Bidirectional MCP plus project-specific `emp.*` tools | MCP memory tools, Python SDK, REST API, CLI | Both integrate with Cursor/agents |
| Deterministic no-model mode | Pack fixtures and current project logging work without an LLM; richer extraction is optional | Permanent memory requires both an LLM and embeddings; local models are supported ([LLM providers](https://docs.cognee.ai/setup-configuration/llm-providers), [local setup](https://docs.cognee.ai/guides/local-setup)) | ActiveGraph is simpler for explicit engineering memory |
| Deletion | Runtime reset wipes local SQLite; project objects can be explicitly managed | `forget` supports item, dataset, or user-owned memory deletion ([MCP tools](https://docs.cognee.ai/cognee-mcp/mcp-tools)) | Production deletion still needs backup/cache/telemetry verification |
| Product-domain fit | Deliberately outside app domain state | Could index domain projections, but would duplicate and infer from them | Poor fit until DSKT defines a retrieval feature |

### Capabilities Cognee adds

Cognee provides capabilities the current `emp` setup does not natively emphasize:

1. **Automated knowledge extraction.** Permanent `remember` normalizes content, chunks it, extracts entities/relationships, creates embeddings, builds a graph, and runs enrichment ([Remember](https://docs.cognee.ai/core-concepts/main-operations/remember)).
2. **Semantic and graph retrieval.** Vector similarity, structural graph queries, and hybrid retrieval can surface relationships not encoded manually ([architecture](https://docs.cognee.ai/core-concepts/architecture)).
3. **Session and permanent memory.** Session writes can return quickly, then optionally bridge into permanent graph memory ([Remember](https://docs.cognee.ai/core-concepts/main-operations/remember)).
4. **Code graph queries.** The current MCP surface includes deterministic operations such as dependency paths and impact analysis over indexed code ([MCP tools](https://docs.cognee.ai/cognee-mcp/mcp-tools)).
5. **Ontology-grounded extraction and customizable pipelines.** DataPoints, Tasks, Pipelines, and uploaded ontologies provide customization seams ([core concepts](https://docs.cognee.ai/core-concepts/overview), [MCP tools](https://docs.cognee.ai/cognee-mcp/mcp-tools)).

Those are real differentiators only when DSKT has enough unstructured information and retrieval demand to justify probabilistic extraction. They do not improve deterministic geometry validation, revision publication, assignment exclusion, import transactions, or RBAC.

### Capabilities ActiveGraph retains

ActiveGraph is stronger for the workflow already implemented in `emp`:

- Explicit, reviewable object and relation schemas.
- Event-driven behaviors after mutations.
- Project-specific tools rather than only generic memory verbs.
- A governed Tool Gateway with risk/action classifications, human approval for high-risk operations, sanitized outputs, prompt-injection flags, and full capability-call recording.
- Bidirectional MCP: outbound MCP tools become governed capabilities; inbound callers are authenticated, role-scoped, audited principals.
- Deterministic fixtures and useful operation without model credentials.

Replacing this with Cognee would require rebuilding typed project semantics, reactions, authorization, and tool governance around Cognee. Running both would retain these strengths but create two memories that can disagree.

## Architecture and data stores

### ActiveGraph

The existing `emp` stack uses:

- A Python ActiveGraph runtime with packs.
- One SQLite event/graph store.
- One SQLite memory store.
- A Node/Express API and React Inspector for the full local UI.
- Repository-owned hooks and pack code under `.activegraph`.

The graph is an operational object graph: objects and relations are written explicitly, mutations produce events, and behaviors consume those events. Persistence is local and easy to reset. The cost is a developer-oriented three-process stack and local-only durability unless the storage/runtime is deliberately productionized.

### Cognee

Cognee uses three complementary stores:

1. A relational store for documents, chunks, and provenance.
2. A vector store for embeddings and semantic retrieval.
3. A graph store for entities and relationships.

The default embedded stack is SQLite + LanceDB + embedded Kuzu. Production deployments can externalize the tiers—for example, PostgreSQL, pgvector/Qdrant, and Neo4j/FalkorDB ([deployment options](https://docs.cognee.ai/how-to-guides/cognee-sdk/deployment/deployment-options)). Data can be indexed in more than one tier, so the same source contributes multiple persisted representations ([architecture](https://docs.cognee.ai/core-concepts/architecture)).

Cognee can run:

- Embedded in a Python process.
- As a self-hosted FastAPI service.
- Through Docker Compose, Helm/Kubernetes, sidecar, queue/worker, snapshot-reader, or externalized-backend patterns ([deployment options](https://docs.cognee.ai/how-to-guides/cognee-sdk/deployment/deployment-options)).
- Through Cognee MCP in standalone mode, where each instance owns local stores, or API mode, where MCP instances share a central backend under one token/user identity ([MCP overview](https://docs.cognee.ai/cognee-mcp/mcp-overview)).

File-backed Kuzu remains single-writer even behind a shared service. Concurrent multi-agent writes require one writer/queue or external graph storage ([deployment options](https://docs.cognee.ai/how-to-guides/cognee-sdk/deployment/deployment-options)).

### Fit with DSKT's PostgreSQL decision

Using Cognee's relational metadata in PostgreSQL would not make Cognee part of DSKT's normalized domain model. Cognee would still own generated metadata, vectors, and graph state. The open-source “single Postgres” graph option is described by Cognee's repository as a demo, while its production-ready form is licensed separately ([official repository README](https://github.com/topoteretes/cognee/blob/b32d8afc59e1064d9291b9828a8a147be9cc8bab/README.md)). DSKT should not use that demo feature to collapse stores or reinterpret the PostgreSQL ADR.

If Cognee is ever added, it should use a separate schema/database and a one-way, permission-filtered projection from DSKT. It must never write back to domain tables or mediate domain invariants.

## Deployment and runtime requirements

### ActiveGraph today

The existing setup requires:

- Python 3.11+ and the `activegraph`/`activegraph-packs` packages.
- Node and pnpm for the Inspector/API stack.
- Ports 3000, 8088, and 7788.
- Two local SQLite files.
- Bearer-token MCP configuration.
- Optional OpenAI or Anthropic credentials; deterministic project memory and fixtures do not require them.

This is already operationally non-trivial, but it is developer-local and scoped to repository memory.

### Cognee

Cognee `1.6.2` requires Python `>=3.10,<3.15` in its [official package metadata](https://github.com/topoteretes/cognee/blob/b32d8afc59e1064d9291b9828a8a147be9cc8bab/pyproject.toml). A minimal local instance still needs:

- Cognee/Python.
- Relational, vector, and graph files.
- An LLM and embedding model/provider.
- Model downloads and compute if fully local, or approved outbound provider access and credentials if hosted.
- Backup/reset/versioning procedures spanning all stores.

Cognee can run entirely locally with Ollama plus Ollama embeddings or Fastembed, but both the LLM and embedding provider must be configured; otherwise the unconfigured half falls back to OpenAI ([local setup](https://docs.cognee.ai/guides/local-setup)). Changing embedding models or dimensions requires reprocessing and may require pruning old vector collections ([LLM providers](https://docs.cognee.ai/setup-configuration/llm-providers)).

A production shared instance adds authentication secrets, API lifecycle, migrations, dataset isolation, ingestion workers or write serialization, store backups, observability, and potentially separate PostgreSQL/vector/graph services. This is materially more operational surface than DSKT's planned frontend + backend + PostgreSQL deployment.

## MCP and agent integration

### ActiveGraph

The local runtime exposes streamable HTTP at `POST /mcp` with bearer tokens mapped to caller identifiers. Its inbound design adds three controls:

1. Token-to-principal authentication and roles.
2. Fail-closed exposure rules by surface and role.
3. Tool Gateway policy, including approval of high-risk calls.

It exposes chat, caller-scoped memory search, scoped capability discovery, and selected project tools. Calls and denials create audit objects. Outbound MCP tools are treated as untrusted/high risk by default and their output is sanitized, injection-scanned, and fenced before model use. See the local [`activegraph-packs` MCP design](../../../../activegraph-packs/docs/mcp.md) and [security posture](../../../../activegraph-packs/docs/security.md).

### Cognee

Cognee MCP supports Cursor and other MCP clients. Its current primary tools are:

- `remember`
- `recall`
- `forget`
- `code_search`
- background-ingestion status and tool discovery helpers

The exact surface and parameters are documented in the official [MCP tools reference](https://docs.cognee.ai/cognee-mcp/mcp-tools). Standalone mode keeps each instance separate. API mode shares a backend, but each MCP instance authenticates with one token and all writes belong to that Cognee user ([MCP overview](https://docs.cognee.ai/cognee-mcp/mcp-overview)).

This is convenient memory integration, but it is not equivalent to ActiveGraph's governed capability runtime. In particular:

- A generic memory tool does not encode DSKT roles or field-level employee visibility.
- An MCP caller can request new dataset names; instructions help but are not an authorization boundary ([default dataset resolution](https://docs.cognee.ai/cognee-mcp/mcp-tools#default-dataset-resolution)).
- `forget` is a destructive memory operation and needs exposure controls appropriate to the client.
- The model-generated extraction graph remains probabilistic even when MCP authentication is correct.

For DSKT, MCP access would need to sit behind an approved identity gateway and a narrow adapter. Direct exposure of generic `remember`/`recall` over operational data would bypass DSKT's API-shaped authorization.

## Licensing

- Cognee's open-source repository and package metadata use **Apache License 2.0** ([official introduction](https://docs.cognee.ai/getting-started/introduction), [repository metadata](https://github.com/topoteretes/cognee)).
- The locally installed ActiveGraph runtime and `activegraph-packs` are also Apache-2.0; see the local installed license and `activegraph-packs/pyproject.toml`.
- Cognee Cloud and separately licensed production features are not implied by the Apache license. In particular, the repository warns that its Postgres graph-store path is a demo and the production-ready feature is licensed ([official README](https://github.com/topoteretes/cognee/blob/b32d8afc59e1064d9291b9828a8a147be9cc8bab/README.md)).

License compatibility is therefore not the blocker for a normal self-hosted, multi-store proof of concept. Procurement and architecture review would still be required for Cognee Cloud, commercial Postgres graph functionality, hosted model providers, or managed graph/vector services.

## Privacy and security implications

### Data classification and duplication

DSKT Employee data is personal data. Assignment history links people to physical locations over time. Floor geometry and labels can reveal internal layouts and occupancy. Cognee would create derived copies in:

- Ingestion/raw-file storage.
- Relational metadata and chunks.
- Vector embeddings.
- Extracted graph nodes and edges.
- Session caches.
- Logs, traces, and backups, depending on configuration.

An embedding is not an anonymization guarantee, and an extracted graph may create incorrect or over-broad relationships. Neither should be used to decide access, employment status, assignment eligibility, emergency response, or floor-plan validity.

### Model-provider egress

Cognee always uses an LLM and an embedding model for permanent memory. Hosted providers therefore receive content or derived chunks unless both providers are configured locally or through approved private endpoints. Configuring only one local provider can cause the other to fall back to OpenAI ([local setup](https://docs.cognee.ai/guides/local-setup), [LLM providers](https://docs.cognee.ai/setup-configuration/llm-providers)).

No production DSKT data should enter Cognee until data protection, retention, regional processing, contractual terms, and provider logging/training controls are approved. Local models reduce third-party egress but add model hosting, patching, capacity, and output-quality responsibilities.

### Authentication and authorization mismatch

Cognee provides authenticated, per-user/dataset isolation when backend access control is enabled ([security](https://docs.cognee.ai/setup-configuration/security), [permissions](https://docs.cognee.ai/setup-configuration/permissions)). That does not automatically implement DSKT's Entra identity mapping, Facilities Admin/Workplace Planner/Viewer permissions, Draft/Archived visibility, or employee-field restrictions.

Cognee's own production guide recommends putting its API behind a customer gateway and terminating OIDC or mTLS there ([deployment options](https://docs.cognee.ai/how-to-guides/cognee-sdk/deployment/deployment-options)). A DSKT integration would additionally need:

- Entra-backed service/user identity propagation.
- Authorization before data is projected into Cognee.
- Authorization again before retrieved content is returned.
- Datasets partitioned by real policy boundaries, not merely by agent/client.
- A way to revoke or rebuild derived memory when source permissions or records change.

### Security defaults that require review

Cognee's official security guide identifies permissive development defaults that must be hardened:

- API keys are stored plaintext unless `HASH_API_KEY=true`.
- Local path ingestion is enabled by default and can read files available to the process unless disabled or root-restricted.
- Raw Cypher and natural-language-to-Cypher are enabled by default.
- Outbound HTTP ingestion is enabled by default, though Cognee applies SSRF validation.
- Some Neo4j multi-user handlers default to an insecure example encryption key that must be replaced.

See [Security & Privacy](https://docs.cognee.ai/setup-configuration/security) for the current controls and production settings. For any future spike, disable HTTP ingestion, local path ingestion, and raw Cypher unless the test explicitly needs them.

### Telemetry and observability

Cognee's anonymous product telemetry is enabled unless `TELEMETRY_DISABLED=true` ([configuration overview](https://docs.cognee.ai/setup-configuration/overview)). It should be disabled for a DSKT evaluation until the emitted schema and approval posture are reviewed.

OpenTelemetry tracing is opt-in, but when enabled it can export the first 500 characters of a search query verbatim; the docs explicitly state this is truncation, not redaction ([OpenTelemetry tracing](https://docs.cognee.ai/integrations/opentelemetry-tracing)). Search queries can contain names, employee IDs, assignment details, or floor labels, so traces must be treated as personal/sensitive data with bounded retention and access.

### Deletion and retention

Cognee supports item-, dataset-, and user-level deletion through `forget` ([MCP tools](https://docs.cognee.ai/cognee-mcp/mcp-tools)). A production claim of deletion would still need tests covering all three stores, raw files, session caches, cloned repositories, background jobs, snapshots, backups, logs, traces, and model-provider retention. DSKT should not assume one API response proves complete erasure.

## Operational complexity

### ActiveGraph-only

Advantages:

- Already integrated and tailored to project workflows.
- Explicit source-controlled schemas and tools.
- Local SQLite keeps data placement understandable.
- No mandatory LLM or embedding dependency for current use.
- Strong tool-governance and trace model.

Costs:

- Three local processes for the full Inspector stack.
- Python plus Node/pnpm toolchains.
- Local storage and manual lifecycle scripts.
- Current recall is less capable for large, semantically varied corpora.

### Adding Cognee beside ActiveGraph

Additional costs:

- A second memory ontology and write path.
- Three logical storage tiers and coordinated backup/restore.
- LLM and embedding provider/runtime management.
- Model/version drift and re-indexing.
- Dataset/user authorization mapping.
- Ingestion queues or writer serialization as usage grows.
- Monitoring for extraction failures, stale indexes, and contradictory memories.
- Duplicate MCP tools and agent instructions about which memory is authoritative.
- Reconciliation when Cognee's inferred memory disagrees with typed ActiveGraph objects or source documents.

The likely failure mode is not that Cognee cannot work; it is that two plausible “memory” systems accumulate overlapping decisions and documents with different semantics, freshness, and deletion behavior.

## Overlap and complementarity

### Direct overlap

Both systems can:

- Persist information across agent sessions.
- Represent entities/objects and relationships.
- Expose memory through MCP.
- Support local/self-hosted use.
- Scope or isolate callers.

This overlap is greatest for unstructured project notes and code knowledge. Writing the same meeting decision or ADR into both creates unnecessary ambiguity.

### Complementary boundary

A defensible future boundary would be:

- **PostgreSQL:** authoritative DSKT domain data and audit.
- **ActiveGraph:** explicit agent/project operations—decisions, work logs, bugs, tool calls, and governed automation.
- **Cognee:** derived semantic index over an approved, read-only unstructured corpus.

Cognee should then store source references and provenance, not be described as the source of truth. ActiveGraph should store the decision to create/update the index and operational outcomes, not duplicate every extracted Cognee node. Retrieval answers should link back to original documents.

### Boundaries to reject

- Cognee as an Employee, Assignment, or Floor Plan database.
- Agents writing domain records to Cognee instead of DSKT's REST API.
- Cognee extraction deciding authorization or domain validity.
- Automatic ingestion of spreadsheets, unrestricted repositories, production database dumps, or map exports.
- Mirroring all ActiveGraph content into Cognee without a measured recall problem.

## Recommendation

### Decision: defer

**Do not adopt Cognee now and do not start a product-data spike yet.**

Reasons:

1. **No defined DSKT use case.** Current requirements are transactional floor planning and workplace allocation, not semantic document retrieval or an AI assistant.
2. **ActiveGraph already covers engineering-agent memory.** Cognee would initially duplicate repository memory rather than fill a proven gap.
3. **The domain fit is weak.** DSKT's critical rules require deterministic normalized data, transactions, RBAC, and audit; Cognee's value is probabilistic extraction and retrieval.
4. **Sensitive-data exposure expands.** Employee and floor information would be copied into more stores and processed by models.
5. **Authorization does not compose automatically.** Cognee datasets/users do not directly enforce DSKT's Entra and application-role rules.
6. **Operations expand substantially.** Models, embeddings, three storage roles, indexing, re-indexing, backups, and memory reconciliation are additional ownership.

This is a deferral based on present requirements, not a rejection of Cognee's technology.

### Trigger for a future bounded spike

Run a spike only when all of these are true:

- A named user workflow has a measurable retrieval problem.
- Baseline ActiveGraph/project search fails that workload.
- The corpus can start with public, non-personal, or synthetic data.
- A product/security owner approves the evaluation boundary.
- Success and exit criteria are agreed before installation.

The best initial candidate is **developer documentation retrieval**, not employee or floor data.

### Suggested spike, if triggered

Time-box to five working days and isolate it from DSKT runtime:

1. Use 50–200 synthetic/public architecture and API documents.
2. Run Cognee standalone and local-only with Ollama + Fastembed.
3. Set `TELEMETRY_DISABLED=true`, `ENABLE_BACKEND_ACCESS_CONTROL=true`, `HASH_API_KEY=true`, `ACCEPT_LOCAL_FILE_PATH=false`, `ALLOW_HTTP_REQUESTS=false`, and `ALLOW_CYPHER_QUERY=false`.
4. Do not connect Cognee to DSKT PostgreSQL or production identity.
5. Compare against ActiveGraph/current repository search on 25 pre-written questions:
   - factual precision and citation to source;
   - relationship/multi-document recall;
   - stale/contradictory document handling;
   - ingestion latency and failure recovery;
   - deletion verification across stores;
   - CPU/RAM/disk and operator time.
6. Adopt only if it materially improves the target workload and the team accepts the security and operational model.
7. Delete the spike stores and models or document their retention when the evaluation ends.

### Adoption gates after a successful spike

Before any production use:

- New ADR defining Cognee as a derived, non-authoritative subsystem.
- Threat model and privacy/retention review.
- Approved LLM and embedding providers with no silent fallback.
- Entra-compatible gateway and explicit authorization mapping.
- One-way, permission-filtered ingestion with source version/provenance.
- Tested revocation, re-indexing, and complete-deletion procedures.
- Backup/restore and disaster-recovery ownership for every store.
- Quality monitoring for unsupported or hallucinated relationships.
- Clear ownership split between PostgreSQL, ActiveGraph, and Cognee.

## Final position

Cognee is technically capable and Apache-2.0 licensed, and it offers materially better semantic/graph retrieval than the current ActiveGraph project-memory setup. Those strengths do not address DSKT's immediate product architecture. ActiveGraph remains the better fit for explicit agent/project memory; PostgreSQL remains the only appropriate authoritative store for employee, assignment, and floor-plan state.

**Result: defer Cognee. Preserve a narrow future option for a synthetic, developer-documentation retrieval spike once a measured need exists.**
