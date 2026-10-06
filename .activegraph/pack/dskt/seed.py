"""Seed the DSKT project graph on a fresh store."""

from __future__ import annotations

import os
from pathlib import Path
from typing import Any

from activegraph import Runtime

from .settings import DsktSettings


def _repo_full_name(settings: DsktSettings) -> str:
    if settings.gitlab_project:
        return settings.gitlab_project
    return f"local/{settings.project_slug}"


def seed_project_graph(rt: Runtime, settings: DsktSettings | None = None) -> dict[str, Any]:
    """Create the project anchor, codebase repo link, and ADR path stubs."""
    settings = settings or DsktSettings.from_environment()
    graph = rt.graph

    existing = list(graph.objects(type="project"))
    if existing:
        return {"project_id": existing[0].id, "seeded": False}

    repo_path = settings.repo_path or os.environ.get("ACTIVEGRAPH_PROJECT_ROOT", "")
    project = graph.add_object(
        "project",
        {
            "name": settings.project_name,
            "slug": settings.project_slug,
            "repo_path": repo_path,
            "gitlab_project": settings.gitlab_project,
            "description": "DSKT workplace mapping and seat-allocation documentation workspace.",
            "default_branch": settings.default_branch,
        },
    )

    full_name = _repo_full_name(settings)
    repo = graph.add_object(
        "repo",
        {
            "name": settings.project_slug,
            "full_name": full_name,
            "description": settings.project_name,
            "url": None,
            "default_branch": settings.default_branch,
            "language": None,
            "metadata": {"local_path": repo_path},
        },
    )
    graph.add_relation(repo.id, project.id, "repo_for_project")

    adr_dir = Path(repo_path) / "docs" / "adr" if repo_path else None
    adr_count = 0
    if adr_dir and adr_dir.is_dir():
        for adr_file in sorted(adr_dir.glob("*.md")):
            title = adr_file.stem.replace("-", " ").replace("_", " ")
            rel_path = f"docs/adr/{adr_file.name}"
            adr = graph.add_object(
                "architecture_decision",
                {
                    "repo_id": repo.id,
                    "title": title,
                    "context": "",
                    "decision": "",
                    "consequences": "",
                    "status": "accepted",
                    "adr_number": _adr_number(adr_file.name),
                    "metadata": {
                        "adr_path": rel_path,
                        "pointer_only": True,
                        "note": "Formal content lives in the repo file; graph holds a pointer only.",
                    },
                },
            )
            graph.add_relation(adr.id, repo.id, "adr_in_repo")
            adr_count += 1

    welcome = graph.add_object(
        "work_log",
        {
            "project_id": project.id,
            "title": "ActiveGraph project memory online",
            "body": (
                "DSKT ActiveGraph pack seeded. Use the graph for work logs and searchable notes. "
                "Accepted decisions remain authoritative in docs/adr/."
            ),
            "tags": ["bootstrap", "activegraph"],
        },
    )
    graph.add_relation(welcome.id, project.id, "belongs_to_project")

    rt.run_until_idle()
    return {
        "project_id": project.id,
        "repo_id": repo.id,
        "adr_pointers": adr_count,
        "seeded": True,
    }


def _adr_number(filename: str) -> int | None:
    digits = "".join(ch for ch in filename.split("-", 1)[0] if ch.isdigit())
    return int(digits) if digits else None
