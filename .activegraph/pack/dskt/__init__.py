"""activegraph.packs.dskt — DSKT supplemental project memory pack.

Searchable project memory for work logs, draft decision notes, discussions,
and bug tracking. Accepted ADR files in docs/adr/ remain authoritative.

Object types:
  project        — repo anchor (DSKT)
  work_log       — session / work logs
  decision_note  — draft notes or pointers to authoritative ADRs
  bug            — tracked defects

Composes with: core (task), codebase (repo, architecture_decision refs)
"""

from __future__ import annotations

from pathlib import Path

from activegraph.packs import Pack, PackPolicy, load_prompts_from_dir
from activegraph.packs.manifest import CapabilityDecl

from .behaviors import BEHAVIORS
from .object_types import OBJECT_TYPES, RELATION_TYPES
from .settings import DsktSettings
from .tools import TOOLS

_PROMPTS_DIR = Path(__file__).parent / "prompts"

pack = Pack(
    name="dskt",
    version="0.1.0",
    description=(
        "DSKT project memory: decisions, work logs, bugs, and GitLab refs. "
        "Accepted ADR files remain authoritative; graph decision notes are supplemental."
    ),
    object_types=OBJECT_TYPES,
    relation_types=RELATION_TYPES,
    behaviors=BEHAVIORS,
    tools=TOOLS,
    policies=[
        PackPolicy(
            name="gitlab_write_gate",
            requires_approval=("source",),
        ),
    ],
    capabilities=(
        CapabilityDecl(provider="dskt", capability="log_work", risk_class="low", credential_ref="", action_class="R1"),
        CapabilityDecl(provider="dskt", capability="log_decision", risk_class="low", credential_ref="", action_class="R1"),
        CapabilityDecl(provider="dskt", capability="register_bug", risk_class="low", credential_ref="", action_class="R1"),
        CapabilityDecl(provider="dskt", capability="fetch_gitlab_issue", risk_class="low", credential_ref="", action_class="R0"),
    ),
    prompts=load_prompts_from_dir(_PROMPTS_DIR) if _PROMPTS_DIR.exists() else (),
    settings_schema=DsktSettings,
)

__all__ = ["pack", "DsktSettings"]
