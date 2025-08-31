// Skip lockfile mutation on CI to keep `npm ci` happy.
// When running locally, still allow `npm-force-resolutions` to patch the lock.
const { spawnSync } = require('node:child_process');

if (process.env.CI) {
  // No-op in CI environments (EAS Build, GitHub Actions, etc.)
  console.log('[preinstall] CI detected – skip npm-force-resolutions');
  process.exit(0);
}

console.log('[preinstall] Applying npm-force-resolutions locally');
const res = spawnSync('npx', ['npm-force-resolutions'], { stdio: 'inherit' });
process.exit(res.status ?? 0);
