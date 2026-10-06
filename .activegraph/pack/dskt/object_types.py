"""DSKT pack object and relation types."""

from __future__ import annotations

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

from activegraph.packs import ObjectType, RelationType


class Project(BaseModel):
    name: str
    slug: str = Field(default="dskt", description="Short repo identifier.")
    repo_path: str = Field(default="", description="Absolute path to the repo root.")
    gitlab_project: str = Field(
        default="",
        description="GitLab path_with_namespace, e.g. group/dskt.",
    )
    description: str = Field(default="")
    default_branch: str = Field(default="main")
    metadata: dict[str, Any] = Field(default_factory=dict)


class WorkLog(BaseModel):
    project_id: str
    title: str
    body: str = Field(default="")
    author_ref: Optional[str] = Field(default=None)
    session_id: Optional[str] = Field(default=None)
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class DecisionNote(BaseModel):
    project_id: str
    summary: str
    rationale: str = Field(default="")
    status: Literal["draft", "accepted", "superseded", "deprecated"] = Field(
        default="draft",
    )
    adr_path: Optional[str] = Field(
        default=None,
        description="Optional pointer to a formal ADR file under docs/adr/.",
    )
    author_ref: Optional[str] = Field(default=None)
    tags: list[str] = Field(default_factory=list)
    metadata: dict[str, Any] = Field(default_factory=dict)


class Bug(BaseModel):
    project_id: str
    title: str
    description: str = Field(default="")
    severity: Literal["low", "medium", "high", "critical"] = Field(default="medium")
    status: Literal["open", "investigating", "fixed", "wontfix"] = Field(default="open")
    gitlab_issue_iid: Optional[int] = Field(default=None)
    author_ref: Optional[str] = Field(default=None)
    metadata: dict[str, Any] = Field(default_factory=dict)


OBJECT_TYPES = [
    ObjectType(name="project", schema=Project, description="DSKT repo anchor."),
    ObjectType(name="work_log", schema=WorkLog, description="Short session or work log entry."),
    ObjectType(
        name="decision_note",
        schema=DecisionNote,
        description="Draft decision note or pointer to an authoritative accepted ADR under docs/adr/.",
    ),
    ObjectType(name="bug", schema=Bug, description="Tracked defect for this project."),
]

RELATION_TYPES = [
    RelationType(
        name="belongs_to_project",
        source_types=("work_log", "decision_note", "bug", "task"),
        target_types=("project",),
        description="Object belongs to the DSKT project.",
    ),
    RelationType(
        name="blocks",
        source_types=("task", "bug", "decision_note"),
        target_types=("task", "bug", "decision_note"),
        description="Source blocks progress on the target.",
    ),
    RelationType(
        name="implements",
        source_types=("task", "decision_note", "work_log"),
        target_types=("decision_note", "architecture_decision"),
        description="Source implements or realizes the target decision.",
    ),
    RelationType(
        name="references",
        source_types=("decision_note", "work_log", "bug"),
        target_types=("architecture_decision", "decision_note"),
        description="Pointer to a formal ADR or another decision note.",
    ),
    RelationType(
        name="supersedes",
        source_types=("decision_note", "architecture_decision"),
        target_types=("decision_note", "architecture_decision"),
        description="Source replaces the target decision.",
    ),
    RelationType(
        name="relates_to",
        source_types=("work_log", "decision_note", "bug", "task"),
        target_types=("work_log", "decision_note", "bug", "task"),
        description="Loose association between project artifacts.",
    ),
    RelationType(
        name="repo_for_project",
        source_types=("repo",),
        target_types=("project",),
        description="Codebase repo object for this project.",
    ),
]
