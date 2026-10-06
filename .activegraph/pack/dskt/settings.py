"""DSKT pack settings."""

from __future__ import annotations

import os

from pydantic import BaseModel, Field


class DsktSettings(BaseModel):
    enabled: bool = True
    project_name: str = Field(default="DSKT")
    project_slug: str = Field(default="dskt")
    repo_path: str = Field(
        default="",
        description="Absolute path to the dskt repo; defaults to ACTIVEGRAPH_PROJECT_ROOT.",
    )
    gitlab_project: str = Field(
        default="",
        description="GitLab path_with_namespace for glab lookups.",
    )
    default_branch: str = Field(default="main")
    seed_on_fresh_store: bool = Field(
        default=True,
        description="Create the project anchor and repo link on a fresh SQLite store.",
    )
    register_tools_on_chat: bool = Field(
        default=True,
        description="Add dskt pack tools to the demo chat allow-list.",
    )

    @classmethod
    def from_environment(cls) -> DsktSettings:
        return cls(
            repo_path=os.environ.get("ACTIVEGRAPH_PROJECT_ROOT", ""),
            gitlab_project=os.environ.get("DSKT_GITLAB_PROJECT", ""),
            project_name=os.environ.get("DSKT_PROJECT_NAME", "DSKT"),
            project_slug=os.environ.get("DSKT_PROJECT_SLUG", "dskt"),
            default_branch=os.environ.get("DSKT_DEFAULT_BRANCH", "main"),
            seed_on_fresh_store=os.environ.get("DSKT_SEED_ON_FRESH", "1") != "0",
            register_tools_on_chat=os.environ.get("DSKT_REGISTER_CHAT_TOOLS", "1") != "0",
        )
