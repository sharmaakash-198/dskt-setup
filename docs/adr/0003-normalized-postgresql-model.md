---
status: accepted
---

# Use normalized PostgreSQL without JSONB geometry

DSKT uses PostgreSQL with ordered relational vertex tables because floor revisions, templates, and assignments require explicit constraints, stable relationships, and auditable queries. Geometry validation runs in the API, and PostGIS and JSONB are excluded from the initial model to keep storage transparent and normalized.
