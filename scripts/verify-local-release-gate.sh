#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKSPACE_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
BACKEND_DIR="${WORKSPACE_ROOT}/dskt-backend"
FRONTEND_DIR="${WORKSPACE_ROOT}/dskt-frontend"

DATABASE_URL="${DATABASE_URL:-postgres://dskt:dskt-local-only@localhost:5436/dskt}"

echo "================================================================================"
echo " DSKT Local Release Gate Verification (Ticket 30)"
echo " Environment: Docker-only Local Release Candidate"
echo " Time: $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "================================================================================"

pass_count=0
fail_count=0

run_step() {
  local title="$1"
  shift
  echo ""
  echo "--- [STEP] ${title} ---"
  if "$@"; then
    echo "✓ [PASS] ${title}"
    pass_count=$((pass_count + 1))
  else
    echo "✗ [FAIL] ${title}"
    fail_count=$((fail_count + 1))
    exit 1
  fi
}

# 1. Dependency and Security Audit Checks
run_step "Backend Dependency & Security Scan" \
  bash -c "cd '${BACKEND_DIR}' && npm audit --omit=dev --audit-level=high"

run_step "Frontend Dependency & Security Scan" \
  bash -c "cd '${FRONTEND_DIR}' && npm audit --omit=dev --audit-level=high"

# 2. Code Quality & Lint Checks
run_step "Backend ESLint Check" \
  bash -c "cd '${BACKEND_DIR}' && npm run lint"

run_step "Frontend ESLint Check" \
  bash -c "cd '${FRONTEND_DIR}' && npm run lint"

# 3. TypeScript Typechecking
run_step "Backend TypeScript Typecheck" \
  bash -c "cd '${BACKEND_DIR}' && npm run typecheck"

run_step "Frontend TypeScript Typecheck" \
  bash -c "cd '${FRONTEND_DIR}' && npm run typecheck"

# 4. OpenAPI Contract Drift Checks
run_step "Backend OpenAPI Spec Drift Check" \
  bash -c "cd '${BACKEND_DIR}' && npm run openapi:check"

run_step "Frontend OpenAPI Client Drift Check" \
  bash -c "cd '${FRONTEND_DIR}' && npm run openapi:check"

# 5. Production Builds
run_step "Backend TypeScript Production Build" \
  bash -c "cd '${BACKEND_DIR}' && npm run build"

run_step "Frontend Vite Production Build" \
  bash -c "cd '${FRONTEND_DIR}' && npm run build"

# 6. Backend Integration Test Suite (including clean migration, synthetic bootstrap, authorization matrix, 2,000-element floor budget, and zero-leak verification)
run_step "Backend PostgreSQL Integration & Local Release Gate Tests" \
  bash -c "cd '${BACKEND_DIR}' && DATABASE_URL='${DATABASE_URL}' npm test"

# 7. Frontend Unit, Component, Accessibility, and Performance Tests
run_step "Frontend Unit, Accessibility & Release Gate Tests" \
  bash -c "cd '${FRONTEND_DIR}' && npm test"

# 8. Compose Configuration & Local Release Candidate Spec Validation
run_step "Docker Compose Local Configuration Validation" \
  bash -c "cd '${WORKSPACE_ROOT}' && docker compose config --quiet"

echo ""
echo "================================================================================"
echo " RELEASE GATE PASSED: All ${pass_count} verification steps completed successfully!"
echo " Objective quality evidence confirms:"
echo "   - Clean start migration and synthetic bootstrap operational with one command"
echo "   - Critical browser journeys and non-canvas map alternatives covered"
echo "   - Protected operation allow/deny matrix fully enforced against PostgreSQL"
echo "   - 2,000-element floor query, serialization, sorting, and interaction budgets met"
echo "   - Observability, correlation IDs, and credential/employee leak prevention verified"
echo "   - Zero hosted runtime / AWS / Entra dependencies required"
echo "================================================================================"
