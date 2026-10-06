"""Register dskt pack tools on the Tool Gateway (for chat + MCP)."""

from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class LogWorkInput(BaseModel):
    title: str = Field(description="Short title for the work log entry.")
    body: str = Field(default="", description="Optional detail.")
    author_ref: Optional[str] = Field(default=None)
    session_id: Optional[str] = Field(default=None)
    tags: list[str] = Field(default_factory=list)


class LogDecisionInput(BaseModel):
    summary: str = Field(description="One-line decision summary.")
    rationale: str = Field(default="", description="Why this decision was made.")
    status: str = Field(default="draft", description="draft | accepted | superseded | deprecated")
    adr_path: Optional[str] = Field(
        default=None,
        description="Optional pointer to docs/adr/… (does not copy ADR content).",
    )
    author_ref: Optional[str] = Field(default=None)
    tags: list[str] = Field(default_factory=list)


class RegisterBugInput(BaseModel):
    title: str
    description: str = Field(default="")
    severity: str = Field(default="medium")
    gitlab_issue_iid: Optional[int] = Field(default=None)
    author_ref: Optional[str] = Field(default=None)


class FetchGitlabIssueInput(BaseModel):
    issue_iid: int = Field(description="GitLab issue internal id (IID).")
    gitlab_project: Optional[str] = Field(
        default=None,
        description="Override DSKT_GITLAB_PROJECT path_with_namespace.",
    )


def register_dskt_capabilities() -> list[str]:
    """Register dskt tools on the gateway. Returns registered capability keys."""
    try:
        from packs.tool_gateway.tools import register_local_capability
    except Exception:
        return []

    from .tools import fetch_gitlab_issue_fn, log_decision_fn, log_work_fn, register_bug_fn

    keys: list[str] = []

    def _log_work(
        title: str = "",
        body: str = "",
        author_ref: Optional[str] = None,
        session_id: Optional[str] = None,
        tags: list[str] | None = None,
        execution_context: Optional[dict] = None,
    ) -> dict:
        graph = (execution_context or {}).get("graph")
        if graph is None:
            raise RuntimeError("graph missing from execution_context")
        return log_work_fn(graph, title, body, author_ref, session_id, tags)

    register_local_capability(
        "dskt",
        "log_work",
        _log_work,
        input_schema=LogWorkInput,
        description="Record a short work log for the DSKT project.",
        risk_class="low",
        action_class="R1",
    )
    keys.append("dskt.log_work")

    def _log_decision(
        summary: str = "",
        rationale: str = "",
        status: str = "draft",
        adr_path: Optional[str] = None,
        author_ref: Optional[str] = None,
        tags: list[str] | None = None,
        execution_context: Optional[dict] = None,
    ) -> dict:
        graph = (execution_context or {}).get("graph")
        if graph is None:
            raise RuntimeError("graph missing from execution_context")
        return log_decision_fn(graph, summary, rationale, status, adr_path, author_ref, tags)

    register_local_capability(
        "dskt",
        "log_decision",
        _log_decision,
        input_schema=LogDecisionInput,
        description="Record a draft decision note or pointer to an authoritative DSKT ADR.",
        risk_class="low",
        action_class="R1",
    )
    keys.append("dskt.log_decision")

    def _register_bug(
        title: str = "",
        description: str = "",
        severity: str = "medium",
        gitlab_issue_iid: Optional[int] = None,
        author_ref: Optional[str] = None,
        execution_context: Optional[dict] = None,
    ) -> dict:
        graph = (execution_context or {}).get("graph")
        if graph is None:
            raise RuntimeError("graph missing from execution_context")
        return register_bug_fn(graph, title, description, severity, gitlab_issue_iid, author_ref)

    register_local_capability(
        "dskt",
        "register_bug",
        _register_bug,
        input_schema=RegisterBugInput,
        description="Register a bug in the project graph.",
        risk_class="low",
        action_class="R1",
    )
    keys.append("dskt.register_bug")

    def _fetch_gitlab_issue(
        issue_iid: int = 0,
        gitlab_project: Optional[str] = None,
        execution_context: Optional[dict] = None,
    ) -> dict:
        graph = (execution_context or {}).get("graph")
        if graph is None:
            raise RuntimeError("graph missing from execution_context")
        return fetch_gitlab_issue_fn(graph, issue_iid, gitlab_project)

    register_local_capability(
        "dskt",
        "fetch_gitlab_issue",
        _fetch_gitlab_issue,
        input_schema=FetchGitlabIssueInput,
        description="Read a GitLab issue via glab and ingest it as a source (read-only).",
        risk_class="low",
        action_class="R0",
    )
    keys.append("dskt.fetch_gitlab_issue")

    return keys
