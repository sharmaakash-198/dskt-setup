"""Run deterministic fixtures for the dskt pack."""

from __future__ import annotations

import os
import sys
from pathlib import Path

_FIXTURE_DIR = Path(__file__).resolve().parent
_DSKT_PACK_ROOT = _FIXTURE_DIR.parent.parent
_DSKT_ROOT = _DSKT_PACK_ROOT.parent.parent
_AG_ROOT = Path(
    os.environ.get("ACTIVEGRAPH_PACKS_ROOT", Path.home() / "Local" / "activegraph-packs")
)

for path in (_DSKT_PACK_ROOT, _AG_ROOT):
    text = str(path)
    if text not in sys.path:
        sys.path.insert(0, text)

os.environ.setdefault("ACTIVEGRAPH_PROJECT_ROOT", str(_DSKT_ROOT))

from activegraph import Graph, Runtime  # noqa: E402

from dskt import pack as dskt_pack  # noqa: E402
from dskt.behaviors import clear_project_registry  # noqa: E402
from dskt.seed import seed_project_graph  # noqa: E402
from dskt.settings import DsktSettings  # noqa: E402
from packs.codebase import pack as codebase_pack  # noqa: E402
from packs.codebase.behaviors import clear_codebase_registry  # noqa: E402
from packs.codebase.settings import CodebaseSettings  # noqa: E402
from packs.core import pack as core_pack  # noqa: E402
from packs.core.settings import CoreSettings  # noqa: E402


def main() -> None:
    clear_project_registry()
    clear_codebase_registry()

    settings = DsktSettings.from_environment()

    rt = Runtime(Graph())
    rt.load_pack(core_pack, settings=CoreSettings())
    rt.load_pack(codebase_pack, settings=CodebaseSettings(auto_create_issues_as_tasks=False))
    rt.load_pack(dskt_pack, settings=settings)

    result = seed_project_graph(rt, settings)
    rt.run_until_idle()

    objects = list(rt.graph.all_objects())
    print(f"dskt fixtures: {len(objects)} objects, seeded={result['seeded']}")
    assert any(o.type == "project" for o in objects)
    assert any(o.type == "work_log" for o in objects)


if __name__ == "__main__":
    main()
