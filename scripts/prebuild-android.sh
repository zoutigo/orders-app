#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Android prebuild helper"

# Ensure we run from repo root
cd "$(dirname "$0")/.."

if [ -d android ]; then
  echo "Stopping Gradle daemon..."
  (cd android && ./gradlew --stop || true)
  echo "Cleaning android build..."
  (cd android && ./gradlew clean || true)
fi

echo "Running expo prebuild (android)..."
npx expo prebuild -p android

echo "✅ Prebuild done"
