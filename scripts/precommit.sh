#!/usr/bin/env bash
set -euo pipefail

echo "🔎 Pre-commit checks starting..."

# Ensure we run from repo root when invoked by git hook
cd "$(git rev-parse --show-toplevel)"

echo "\n[1/7] TypeScript check (tsc --noEmit)"
npx tsc --noEmit

echo "\n[2/7] ESLint check"
npm run -s lint

echo "\n[3/7] Unit tests"
npm run -s test:unit

echo "\n[4/7] Functional tests"
npm run -s test:func

echo "\n[5/7] Prettier format check"
set +e
npm run -s format:check
PRETTIER_STATUS=$?
set -e
if [[ $PRETTIER_STATUS -ne 0 ]]; then
  echo "Prettier found formatting issues. Applying fixes..."
  npm run -s format
  echo "Files were formatted. Please review and re-stage changes."
  exit 1
fi

echo "\n[6/7] Lockfile sanity (npm ci dry-run)"
set +e
CI=1 npx -y npm@10 ci --dry-run >/dev/null 2>&1
LOCK_OK=$?
set -e

if [[ $LOCK_OK -ne 0 ]]; then
  echo "Lockfile is out of sync with package.json."
  # Fast path: update lockfile only when package.json changed but lock not staged
  if git diff --name-only --cached | grep -q '^package.json$' && ! git diff --name-only --cached | grep -q '^package-lock.json$'; then
    echo "Updating package-lock.json (no install)..."
    npx -y npm@10 install --package-lock-only --no-audit --no-fund
    git add package-lock.json
    echo "Re-validating npm ci..."
    CI=1 npx -y npm@10 ci --dry-run
  else
    echo "Running scripts/fix-lock.sh (may take a while)..."
    bash ./scripts/fix-lock.sh
    git add package-lock.json
  fi
fi

echo "\n[7/7] All checks passed ✅"
exit 0

