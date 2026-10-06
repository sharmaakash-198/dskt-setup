#!/usr/bin/env bash
# Open an Excalidraw diagram in Obsidian.
# Usage: ./scripts/open-diagram.sh docs/diagrams/foo.excalidraw.md
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TARGET="${1:-}"

if [[ -z "$TARGET" ]]; then
  echo "Usage: $0 <path-to-diagram.excalidraw[.md]>" >&2
  exit 2
fi

if [[ "$TARGET" != /* ]]; then
  TARGET="$ROOT/$TARGET"
fi

if [[ ! -f "$TARGET" ]]; then
  echo "File not found: $TARGET" >&2
  exit 1
fi

OBSIDIAN_APP=""
if [[ -d "/Applications/Obsidian.app" ]]; then
  OBSIDIAN_APP="/Applications/Obsidian.app"
else
  OBSIDIAN_APP="$(mdfind "kMDItemCFBundleIdentifier == 'md.obsidian'" 2>/dev/null | head -1 || true)"
fi

if [[ -n "$OBSIDIAN_APP" ]]; then
  open -a "$OBSIDIAN_APP" "$TARGET"
  exit 0
fi

ENCODED="$(python3 -c 'import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=""))' "$TARGET")"
if open "obsidian://open?path=${ENCODED}" 2>/dev/null; then
  exit 0
fi

echo "Obsidian not found. Open this file manually in your vault:" >&2
echo "  $TARGET" >&2
echo "Tip: open the DSKT-setup root as an Obsidian vault, then browse docs/diagrams/." >&2
exit 1
