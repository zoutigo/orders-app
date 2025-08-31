#!/usr/bin/env bash
set -euo pipefail

echo "=== Fix lockfile for npm ci (EAS compatible) ==="
echo "Node: $(node -v)  npm(local): $(npm -v)"

echo "\n[1/3] Remove node_modules and lockfile"
rm -rf node_modules package-lock.json

echo "\n[2/3] Fresh install using npm@10 (updates new lockfile)"
npx -y npm@10 install --no-audit --no-fund

echo "\n[3/3] Validate with npm@10 'ci' (dry-run, CI env)"
CI=1 npx -y npm@10 ci --dry-run

echo "\n✔ Lockfile valid for npm ci. Commit 'package-lock.json' and push."
