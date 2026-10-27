#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

echo "========================================================"
echo " DSKT Local Clean Start: Single-Command Launch"
echo "========================================================"
echo "This command resets container state, starts PostgreSQL,"
echo "applies migrations, bootstraps synthetic users, and launches"
echo "the complete product locally with zero hosted dependencies."
echo ""

cd "${WORKSPACE_ROOT}"

# Bring down existing containers and clean volumes to guarantee clean state
docker compose down -v --remove-orphans

# Start up PostgreSQL, backend (with migration + synthetic user bootstrap), and frontend
docker compose up --build
