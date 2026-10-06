#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

mkdir -p .lavish .activegraph/data dskt-frontend dskt-backend

clone_if_configured() {
  local url="$1"
  local directory="$2"

  if [[ -d "$directory/.git" ]]; then
    echo "$directory already contains a Git repository."
    return
  fi

  if [[ -z "$url" ]]; then
    echo "$directory created as an empty placeholder."
    return
  fi

  if [[ -n "$(ls -A "$directory" 2>/dev/null)" ]]; then
    echo "Cannot clone into non-empty $directory." >&2
    exit 1
  fi

  git clone "$url" "$directory"
}

clone_if_configured "${FRONTEND_REPO_URL:-}" "dskt-frontend"
clone_if_configured "${BACKEND_REPO_URL:-}" "dskt-backend"

if [[ ! -f .activegraph/.env ]]; then
  echo "ActiveGraph is not configured. Copy .activegraph/.env.example to .activegraph/.env and replace the token placeholder when needed."
fi

echo "DSKT workspace bootstrap complete."
