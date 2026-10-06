#!/usr/bin/env bash
# Stop ActiveGraph Inspector processes for this repo (UI :3000, API :8088, Python :7788).
#
# Usage (from dskt repo root):
#   ./.activegraph/stop.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ -f "$SCRIPT_DIR/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$SCRIPT_DIR/.env"
  set +a
fi

API_PORT="${API_PORT:-8088}"
UI_PORT="${UI_PORT:-3000}"
AG_PORT="${ACTIVEGRAPH_PORT:-7788}"

ports=("$UI_PORT" "$API_PORT" "$AG_PORT")
pids=()

for port in "${ports[@]}"; do
  while IFS= read -r pid; do
    [[ -n "$pid" ]] && pids+=("$pid")
  done < <(lsof -ti ":$port" 2>/dev/null || true)
done

if [[ ${#pids[@]} -eq 0 ]]; then
  echo "No ActiveGraph processes found on ports ${ports[*]}."
  exit 0
fi

# Deduplicate PIDs
unique_pids=($(printf '%s\n' "${pids[@]}" | sort -u))

echo "Stopping ActiveGraph (PIDs: ${unique_pids[*]}) on ports ${ports[*]}..."
kill "${unique_pids[@]}" 2>/dev/null || true
sleep 1

still_running=()
for pid in "${unique_pids[@]}"; do
  if kill -0 "$pid" 2>/dev/null; then
    still_running+=("$pid")
  fi
done

if [[ ${#still_running[@]} -gt 0 ]]; then
  echo "Force stopping: ${still_running[*]}"
  kill -9 "${still_running[@]}" 2>/dev/null || true
  sleep 1
fi

if lsof -ti ":$UI_PORT,:$API_PORT,:$AG_PORT" >/dev/null 2>&1; then
  echo "Warning: some processes may still be listening on ${ports[*]}." >&2
  lsof -nP -iTCP:"$UI_PORT,$API_PORT,$AG_PORT" -sTCP:LISTEN 2>/dev/null || true
  exit 1
fi

echo "ActiveGraph stopped."
