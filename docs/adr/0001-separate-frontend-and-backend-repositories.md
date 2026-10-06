---
status: accepted
---

# Keep frontend and backend in separate repositories

The setup/documentation workspace, `dskt-frontend`, and `dskt-backend` are three independent Git repositories. For local work, the application repositories are cloned into gitignored directories inside the setup workspace; they are not members of an application monorepo. This preserves independent dependencies, versioning, CI, and deployment, while the backend-owned OpenAPI contract replaces a shared source package.
