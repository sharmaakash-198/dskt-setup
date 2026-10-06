# Domain documentation

How engineering agents consume DSKT’s normative domain material.

## Read order

1. `GLOSSARY.md` for canonical language.
2. Relevant accepted ADRs under `docs/adr/`.
3. `PRODUCT.md`, architecture, data, security, and integration documents relevant to the task.
4. ActiveGraph `memory_search`, when running, for supplemental work logs and draft notes.

The Git-tracked glossary and accepted ADRs are authoritative. ActiveGraph must not silently replace or contradict them. An accepted ActiveGraph decision note requires an `adr_path` pointing to its authoritative ADR.

## Use canonical vocabulary

Use terms exactly as defined in `GLOSSARY.md` in issues, APIs, schema names, tests, and documentation. If a necessary term is missing, use `/domain-modeling` to resolve it and update the glossary.

## Flag conflicts

If proposed work contradicts an accepted ADR, surface that conflict before implementation and supersede the ADR explicitly if the decision changes.

The historical `introduction.md` preserves source context but is not normative.
