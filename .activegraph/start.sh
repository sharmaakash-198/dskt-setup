#!/usr/bin/env bash
# Start ActiveGraph Inspector for the DSKT (dskt) repo.
#
# Prerequisites (once per machine):
#   git clone https://github.com/yoheinakajima/activegraph-packs ~/Local/activegraph-packs
#   cd ~/Local/activegraph-packs && pip install -e ".[dev]" && pnpm install
#
# Usage (from dskt repo root):
#   ./.activegraph/start.sh
#
# Then open http://localhost:3000 — filter the graph by pack "dskt".

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DSKT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
AG_PACKS_ROOT="${ACTIVEGRAPH_PACKS_ROOT:-$HOME/Local/activegraph-packs}"

if [[ ! -f "$AG_PACKS_ROOT/packs/demo_server.py" ]]; then
  echo "activegraph-packs not found at: $AG_PACKS_ROOT" >&2
  echo "Set ACTIVEGRAPH_PACKS_ROOT or clone activegraph-packs there." >&2
  exit 1
fi

if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.env"
  set +a
fi

export ACTIVEGRAPH_DEMO_SCRIPT="$SCRIPT_DIR/demo_server.py"
export ACTIVEGRAPH_PROJECT_ROOT="$DSKT_ROOT"
export ACTIVEGRAPH_DB="${ACTIVEGRAPH_DB:-$SCRIPT_DIR/data/dskt.sqlite}"
export ACTIVEGRAPH_MEMORY_DB="${ACTIVEGRAPH_MEMORY_DB:-$SCRIPT_DIR/data/dskt_memory.sqlite}"
export PYTHONPATH="$SCRIPT_DIR/pack:$AG_PACKS_ROOT:${PYTHONPATH:-}"

mkdir -p "$SCRIPT_DIR/data"

# Stop a previous stack on the same ports (avoids EADDRINUSE on restart).
if [[ -x "$SCRIPT_DIR/stop.sh" ]]; then
  "$SCRIPT_DIR/stop.sh" || true
fi

API_PORT="${API_PORT:-8088}"
UI_PORT="${UI_PORT:-3000}"

echo "DSKT ActiveGraph"
echo "  dskt repo:       $DSKT_ROOT"
echo "  activegraph:    $AG_PACKS_ROOT"
echo "  event store:    $ACTIVEGRAPH_DB"
echo "  memory store:   $ACTIVEGRAPH_MEMORY_DB"
echo "  UI:             http://localhost:${UI_PORT}"
echo "  API:            http://localhost:${API_PORT}"
echo "  Python runtime: http://localhost:${ACTIVEGRAPH_PORT:-7788}"
echo ""

cd "$AG_PACKS_ROOT"
exec env API_PORT="$API_PORT" UI_PORT="$UI_PORT" pnpm dev
