"""DSKT pack tools."""

from __future__ import annotations

import json
import subprocess
from typing import Any, Optional

from activegraph import Graph
from activegraph.packs import tool

from .settings import DsktSettings


def _project_id(graph: Graph) -> str:
    projects = list(graph.objects(type="project"))
    if not projects:
        raise ValueError("No project object found — run seed or create_project first.")
    return projects[0].id


def log_work_fn(
    graph: Graph,
    title: str,
    body: str = "",
    author_ref: str | None = None,
    session_id: str | None = None,
    tags: list[str] | None = None,
) -> dict[str, Any]:
    project_id = _project_id(graph)
    obj = graph.add_object(
        "work_log",
        {
            "project_id": project_id,
            "title": title,
            "body": body,
            "author_ref": author_ref,
            "session_id": session_id,
            "tags": tags or [],
        },
    )
    graph.add_relation(obj.id, project_id, "belongs_to_project")
    return {"work_log_id": obj.id, "project_id": project_id}


def log_decision_fn(
    graph: Graph,
    summary: str,
    rationale: str = "",
    status: str = "draft",
    adr_path: str | None = None,
    author_ref: str | None = None,
    tags: list[str] | None = None,
) -> dict[str, Any]:
    if status == "accepted" and not adr_path:
        raise ValueError("Accepted DSKT decisions require an authoritative docs/adr/ path.")
    project_id = _project_id(graph)
    obj = graph.add_object(
        "decision_note",
        {
            "project_id": project_id,
            "summary": summary,
            "rationale": rationale,
            "status": status,
            "adr_path": adr_path,
            "author_ref": author_ref,
            "tags": tags or [],
        },
    )
    return {"decision_note_id": obj.id, "project_id": project_id}


def register_bug_fn(
    graph: Graph,
    title: str,
    description: str = "",
    severity: str = "medium",
    gitlab_issue_iid: int | None = None,
    author_ref: str | None = None,
) -> dict[str, Any]:
    project_id = _project_id(graph)
    obj = graph.add_object(
        "bug",
        {
            "project_id": project_id,
            "title": title,
            "description": description,
            "severity": severity,
            "gitlab_issue_iid": gitlab_issue_iid,
            "author_ref": author_ref,
        },
    )
    return {"bug_id": obj.id, "project_id": project_id}


def fetch_gitlab_issue_fn(
    graph: Graph,
    issue_iid: int,
    gitlab_project: str | None = None,
) -> dict[str, Any]:
    """Read a GitLab issue via glab (read-only). Stores a core task + observation."""
    settings = DsktSettings.from_environment()
    project = gitlab_project or settings.gitlab_project
    if not project:
        raise ValueError("DSKT_GITLAB_PROJECT is not set and gitlab_project was not provided.")

    cmd = ["glab", "issue", "view", str(issue_iid), "-R", project, "-F", "json"]
    proc = subprocess.run(cmd, capture_output=True, text=True, check=False)
    if proc.returncode != 0:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip() or "glab failed")

    issue = json.loads(proc.stdout)
    title = issue.get("title") or f"Issue #{issue_iid}"
    body = issue.get("description") or ""
    state = "open" if (issue.get("state") or "").lower() == "opened" else "closed"
    labels = issue.get("labels") or []

    source = graph.add_object(
        "source",
        {
            "kind": "issue",
            "content": f"{title}\n\n{body}"[:4000],
            "channel": "gitlab",
            "metadata": {
                "event": "issues",
                "repo_full_name": project,
                "repository": {"full_name": project},
                "issue_number": issue_iid,
                "number": issue_iid,
                "title": title,
                "body": body,
                "state": state,
                "labels": [{"name": l} for l in labels],
                "web_url": issue.get("web_url"),
            },
        },
    )
    return {
        "source_id": source.id,
        "issue_iid": issue_iid,
        "title": title,
        "state": state,
        "web_url": issue.get("web_url"),
    }


@tool(name="log_work", description="Record a short work log entry for the DSKT project.")
def log_work(
    graph: Graph,
    title: str,
    body: str = "",
    author_ref: str | None = None,
    session_id: str | None = None,
    tags: list[str] | None = None,
) -> dict[str, Any]:
    return log_work_fn(graph, title, body, author_ref, session_id, tags)


@tool(name="log_decision", description="Record a draft decision note or pointer to an authoritative DSKT ADR.")
def log_decision(
    graph: Graph,
    summary: str,
    rationale: str = "",
    status: str = "draft",
    adr_path: str | None = None,
    author_ref: str | None = None,
    tags: list[str] | None = None,
) -> dict[str, Any]:
    return log_decision_fn(graph, summary, rationale, status, adr_path, author_ref, tags)


@tool(name="register_bug", description="Register a bug tracked in the project graph.")
def register_bug(
    graph: Graph,
    title: str,
    description: str = "",
    severity: str = "medium",
    gitlab_issue_iid: int | None = None,
    author_ref: str | None = None,
) -> dict[str, Any]:
    return register_bug_fn(graph, title, description, severity, gitlab_issue_iid, author_ref)


@tool(name="fetch_gitlab_issue", description="Fetch a GitLab issue via glab and ingest it as a source.")
def fetch_gitlab_issue(
    graph: Graph,
    issue_iid: int,
    gitlab_project: str | None = None,
) -> dict[str, Any]:
    return fetch_gitlab_issue_fn(graph, issue_iid, gitlab_project)


TOOLS = [log_work, log_decision, register_bug, fetch_gitlab_issue]
