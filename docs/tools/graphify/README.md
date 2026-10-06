# Graphify — code structure graph

Local AST knowledge graph for navigating the future TypeScript frontend and backend repositories. It is not project memory; supplemental work memory belongs in [ActiveGraph](../activegraph/README.md).

## Install (once per machine)

```bash
uv tool install graphifyy
# optional SQL nodes in migrations:
# uv tool install 'graphifyy[sql]'
graphify install --platform cursor
```

## Build / refresh

Run Graphify independently inside each application repository after code exists:

```bash
cd dskt-frontend
graphify update .
graphify cluster-only . --no-label
open graphify-out/graph.html

cd ../dskt-backend
graphify update .
graphify cluster-only . --no-label
open graphify-out/graph.html
```

Each application repository must gitignore its own `graphify-out/`. Do not commit generated graphs to the setup repository.

## Agent usage

Cursor rule: `.cursor/rules/graphify.mdc`. Prefer Graphify for call/import/path questions; ActiveGraph for decisions and work logs.

## Files in this folder

| File | Contents |
|------|----------|
| `README.md` | Installation, refresh, and agent usage |
| [research.md](research.md) | Primary-source comparison with ActiveGraph and the adoption rationale |
