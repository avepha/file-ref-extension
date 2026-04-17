const { readFileSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const target = process.argv[2];

if (!['marketplace', 'openvsx'].includes(target)) {
  throw new Error('Usage: node scripts/publish-vsix.js <marketplace|openvsx>');
}

const rootPath = path.resolve(__dirname, '..');
const packageJson = JSON.parse(readFileSync(path.join(rootPath, 'package.json'), 'utf8'));
const vsixPath = path.join(rootPath, `${packageJson.name}-${packageJson.version}.vsix`);

const command = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args =
  target === 'marketplace'
    ? ['exec', 'vsce', '--', 'publish', '-i', vsixPath]
    : ['exec', 'ovsx', '--', 'publish', '-i', vsixPath, '--packageVersion', packageJson.version];

const result = spawnSync(command, args, {
  cwd: rootPath,
  stdio: 'inherit',
  env: process.env,
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}
