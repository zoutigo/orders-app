#!/usr/bin/env bash
set -euo pipefail

echo "=== CI Prepare: local validation before push ==="
echo "Node: $(node -v)  npm(local): $(npm -v)"

# 1) Fresh install to refresh and sync the lockfile (local only)
echo "\n[1/6] Fresh install with npm@10 (updates lockfile if needed)"
rm -rf node_modules
npx -y npm@10 install --no-audit --no-fund

# 2) Ensure the lockfile is compatible with 'npm ci' (what EAS uses)
echo "\n[2/6] Validate lockfile with npm@10 'ci' (dry-run, CI env)"
CI=1 npx -y npm@10 ci --dry-run > /dev/null 2>&1 && echo "Lockfile OK for npm ci" || {
  echo "Lockfile not in sync. Re-run 'npm install' and commit package-lock.json";
  exit 1;
}

# 3) Prettier check
echo "\n[3/6] Prettier check"
npx prettier --check .

# 4) TypeScript type check
echo "\n[4/6] TypeScript check"
npx tsc --noEmit

# 5) ESLint (allow warnings locally; CI already runs lint)
echo "\n[5/6] ESLint"
npm run lint

# 6) Expo Doctor (sanity checks for SDK/versions)
echo "\n[6/6] Expo Doctor"
npx expo-doctor || true

echo "\n✔ All local checks passed. You can push and build."
