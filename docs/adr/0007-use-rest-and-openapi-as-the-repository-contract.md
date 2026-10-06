---
status: accepted
---

# Use REST and OpenAPI as the repository contract

The backend will expose a versioned REST API and own its generated OpenAPI document. The frontend will generate a typed client from a pinned contract artifact instead of sharing a source package, preserving repository independence while making compatibility testable. Breaking contract changes require explicit versioning or a coordinated deprecation period.
