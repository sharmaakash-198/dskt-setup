#!/usr/bin/env python3
"""DSKT ActiveGraph demo server entrypoint.

Wraps activegraph-packs/packs/demo_server.py and loads the dskt project pack.
Set ACTIVEGRAPH_DEMO_SCRIPT to this file (see .activegraph/start.sh).
"""

from __future__ import annotations

import os
import sys

_THIS_DIR = os.path.dirname(os.path.abspath(__file__))
_DSKT_ROOT = os.path.dirname(_THIS_DIR)
_AG_ROOT = os.environ.get(
    "ACTIVEGRAPH_PACKS_ROOT",
    os.path.expanduser("~/Local/activegraph-packs"),
)

for path in (os.path.join(_THIS_DIR, "pack"), _AG_ROOT):
    if path not in sys.path:
        sys.path.insert(0, path)

if not os.path.isdir(_AG_ROOT):
    raise SystemExit(
        f"activegraph-packs not found at {_AG_ROOT}. "
        "Clone https://github.com/yoheinakajima/activegraph-packs or set ACTIVEGRAPH_PACKS_ROOT."
    )

os.chdir(_AG_ROOT)

import hook  # noqa: E402

hook.install()

import packs.demo_server as demo  # noqa: E402

if __name__ == "__main__":
    demo.main()
