"""DSKT pack behaviors."""

from __future__ import annotations

from activegraph.packs import behavior, relation_behavior

from .settings import DsktSettings

_PROJECT_REGISTRY: dict[str, str] = {}


def clear_project_registry() -> None:
    _PROJECT_REGISTRY.clear()


@behavior(
    name="project_linker",
    on=["object.created"],
    where={"object.type": "work_log"},
    creates=[],
)
def project_linker(event, graph, ctx, *, settings: DsktSettings):
    """Ensure new work logs are linked to the project when project_id is set."""
    obj = event.payload.get("object", {})
    data = obj.get("data", {})
    project_id = data.get("project_id")
    if not project_id:
        return
    try:
        graph.add_relation(obj["id"], project_id, "belongs_to_project")
    except Exception:
        pass


@behavior(
    name="decision_note_linker",
    on=["object.created"],
    where={"object.type": "decision_note"},
    creates=[],
)
def decision_note_linker(event, graph, ctx, *, settings: DsktSettings):
    """Link decision notes to the project and optional ADR path references."""
    obj = event.payload.get("object", {})
    obj_id = obj.get("id")
    data = obj.get("data", {})
    project_id = data.get("project_id")
    if project_id:
        try:
            graph.add_relation(obj_id, project_id, "belongs_to_project")
        except Exception:
            pass

    adr_path = (data.get("adr_path") or "").strip()
    if not adr_path:
        return

    for candidate in graph.objects(type="architecture_decision"):
        meta = (candidate.data or {}).get("metadata") or {}
        if meta.get("adr_path") == adr_path:
            try:
                graph.add_relation(obj_id, candidate.id, "references")
            except Exception:
                pass
            break


@behavior(
    name="bug_linker",
    on=["object.created"],
    where={"object.type": "bug"},
    creates=[],
)
def bug_linker(event, graph, ctx, *, settings: DsktSettings):
    """Link bugs to the project anchor."""
    obj = event.payload.get("object", {})
    data = obj.get("data", {})
    project_id = data.get("project_id")
    if not project_id:
        return
    try:
        graph.add_relation(obj["id"], project_id, "belongs_to_project")
    except Exception:
        pass


@relation_behavior(
    name="unblock_on_fix",
    relation_type="blocks",
    on=["object.created"],
    where={"object.type": "bug"},
)
def unblock_on_fix(relation, event, graph, ctx, *, settings: DsktSettings):
    """When a blocking bug is marked fixed, remove the blocks edge."""
    obj = event.payload.get("object", {})
    if obj.get("type") != "bug":
        return
    data = obj.get("data", {})
    if data.get("status") != "fixed":
        return
    if obj.get("id") != relation.source:
        return
    try:
        graph.remove_relation(relation.id)
    except Exception:
        pass


BEHAVIORS = [
    project_linker,
    decision_note_linker,
    bug_linker,
    unblock_on_fix,
]
