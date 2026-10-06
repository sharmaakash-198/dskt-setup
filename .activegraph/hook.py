"""Install DSKT hooks into activegraph-packs demo_server."""

from __future__ import annotations

import os


def install() -> None:
    import packs.demo_server as demo_server
    from packs.tool_gateway import registration_check

    original_build = demo_server._build_runtime
    original_arm = registration_check.arm_registration_enforcement
    deferred_graph: dict[str, object | None] = {"graph": None}

    def deferred_arm(graph) -> None:
        deferred_graph["graph"] = graph

    def _build_runtime():
        demo_server._seed_demo = _skip_generic_demo_seed
        registration_check.arm_registration_enforcement = deferred_arm
        try:
            rt = original_build()
        finally:
            registration_check.arm_registration_enforcement = original_arm

        _load_project_packs(rt)
        _maybe_seed_project(rt)

        if deferred_graph["graph"] is not None:
            original_arm(deferred_graph["graph"])

        return rt

    demo_server._build_runtime = _build_runtime


def _skip_generic_demo_seed(rt) -> None:
    """Replace Northwind demo sources with dskt-specific seeding."""
    return


def _load_project_packs(rt) -> None:
    from dskt.settings import DsktSettings
    from packs.codebase import pack as codebase_pack
    from packs.codebase.settings import CodebaseSettings
    from dskt import pack as dskt_pack

    settings = DsktSettings.from_environment()

    rt.load_pack(
        codebase_pack,
        settings=CodebaseSettings(
            adr_path_patterns=["docs/adr"],
            auto_create_issues_as_tasks=False,
        ),
    )
    rt.load_pack(dskt_pack, settings=settings)

    dskt_tool_keys: list[str] = []
    if settings.register_tools_on_chat:
        from dskt.capabilities import register_dskt_capabilities

        dskt_tool_keys = register_dskt_capabilities()
        _register_chat_tools(rt, dskt_tool_keys)

    rt.run_until_idle()


def _register_chat_tools(rt, dskt_tool_keys: list[str]) -> None:
    """Append dskt gateway capabilities to the demo chat allow-list."""
    try:
        import packs.demo_server as demo_server
        from packs.tool_gateway.llm_tools import llm_tools_for
        from packs.tool_gateway import ToolGatewaySettings

        allow = list(demo_server._chat_allow_list or [])
        for key in dskt_tool_keys:
            if key not in allow:
                allow.append(key)

        demo_server._chat_allow_list = allow

        from packs.chat import build_pack as build_chat_pack, ChatSettings

        cs = ChatSettings(
            memory_backend_url=demo_server._memory_db_path(),
            tool_allow_list=allow,
            reply_policy=os.environ.get("ACTIVEGRAPH_REPLY_POLICY", "open"),
        )
        tools = llm_tools_for(rt.graph, allow, settings=ToolGatewaySettings(), runtime=rt)
        chat_pack = build_chat_pack(llm_tools=tools, max_tool_turns=cs.max_tool_turns)
        rt.load_pack(chat_pack, settings=cs)
    except Exception as exc:
        print(f"[dskt hook] Chat tool registration skipped: {exc}", flush=True)


def _maybe_seed_project(rt) -> None:
    from dskt.seed import seed_project_graph
    from dskt.settings import DsktSettings

    settings = DsktSettings.from_environment()
    if not settings.seed_on_fresh_store:
        return

    existing = list(rt.graph.objects(type="project"))
    if existing:
        return

    result = seed_project_graph(rt, settings)
    print(
        f"[dskt hook] Seeded project graph: project={result.get('project_id')} "
        f"adr_pointers={result.get('adr_pointers', 0)}",
        flush=True,
    )
