#!/usr/bin/env bash
set -euo pipefail

echo "=== Fix lockfile for npm ci (EAS compatible) ==="
echo "Node: $(node -v)  npm: $(npm -v)"

echo "\n[1/3] Remove node_modules and lockfile"
rm -rf node_modules package-lock.json

echo "\n[2/3] Fresh npm install (updates new lockfile)"
npm install --no-audit --no-fund

echo "\n[3/3] Validate with 'npm ci' (dry-run, CI env)"
CI=1 npm ci --dry-run

echo "\n✔ Lockfile valid for npm ci. Commit 'package-lock.json' and push."

