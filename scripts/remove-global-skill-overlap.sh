#!/usr/bin/env bash
# Remove global mattpocock skills that duplicate project-local skills in this repo.
# Run once per machine when Cursor pins/opens ~/.claude/skills instead of .agents/skills.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

PROJECT_JSON="$(npx skills list --json 2>/dev/null)"
GLOBAL_JSON="$(npx skills list -g --json 2>/dev/null)"

NAMES="$(PROJECT_JSON="$PROJECT_JSON" GLOBAL_JSON="$GLOBAL_JSON" python3 <<'PY'
import json, os
project = {s["name"] for s in json.loads(os.environ["PROJECT_JSON"])}
global_skills = json.loads(os.environ["GLOBAL_JSON"])
overlap = [s["name"] for s in global_skills if s.get("source") == "mattpocock/skills" and s["name"] in project]
print(" ".join(overlap))
PY
)"

if [[ -z "$NAMES" ]]; then
  echo "No overlapping global mattpocock skills found."
  exit 0
fi

COUNT="$(echo "$NAMES" | wc -w | tr -d ' ')"
echo "Removing $COUNT global skill(s) that overlap this repo..."
npx skills remove -g -y $NAMES
echo "Done. Project skills in .agents/skills/ will now take precedence."
