const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const requiredEntries = [
  'extension/package.json',
  'extension/dist/extension.js',
  'extension/README.md',
  'extension/CHANGELOG.md',
  'extension/LICENSE',
  'extension/media/icon.png',
];

const forbiddenPrefixes = [
  'extension/.vscode/',
  'extension/.github/',
  'extension/.planning/',
  'extension/learning/',
  'extension/scripts/',
  'extension/src/',
  'extension/test/',
];

const forbiddenEntries = new Set([
  'extension/AGENTS.md',
  'extension/PRODUCT_REQUIREMENTS.md',
  'extension/esbuild.js',
  'extension/package-lock.json',
  'extension/tsconfig.json',
]);

function readZipEntries(zipBuffer) {
  const entries = [];
  let offset = 0;

  while (offset <= zipBuffer.length - 4) {
    const signature = zipBuffer.readUInt32LE(offset);

    if (signature !== 0x02014b50) {
      offset += 1;
      continue;
    }

    const fileNameLength = zipBuffer.readUInt16LE(offset + 28);
    const extraFieldLength = zipBuffer.readUInt16LE(offset + 30);
    const fileCommentLength = zipBuffer.readUInt16LE(offset + 32);
    const fileNameStart = offset + 46;
    const fileNameEnd = fileNameStart + fileNameLength;

    entries.push(zipBuffer.toString('utf8', fileNameStart, fileNameEnd));

    offset = fileNameEnd + extraFieldLength + fileCommentLength;
  }

  return entries;
}

function inspectEntries(entries) {
  const unexpectedEntries = entries.filter((entry) => (
    forbiddenPrefixes.some((prefix) => entry.startsWith(prefix))
    || forbiddenEntries.has(entry)
  ));

  if (unexpectedEntries.length > 0) {
    throw new Error(`VSIX contains development-only files:\n${unexpectedEntries.join('\n')}`);
  }

  const missingEntries = requiredEntries.filter((entry) => !entries.includes(entry));

  if (missingEntries.length > 0) {
    throw new Error(`VSIX is missing required files:\n${missingEntries.join('\n')}`);
  }
}

function inspectVsix(vsixPath) {
  if (!existsSync(vsixPath)) {
    throw new Error(`VSIX not found: ${vsixPath}`);
  }

  const entries = readZipEntries(readFileSync(vsixPath));
  inspectEntries(entries);

  return entries;
}

const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
const { name, version } = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
const vsixPath = path.resolve(__dirname, '..', `${name}-${version}.vsix`);

if (require.main === module) {
  inspectVsix(vsixPath);
  console.log(`VSIX inspection passed for ${path.basename(vsixPath)}`);
}

module.exports = {
  forbiddenEntries,
  forbiddenPrefixes,
  inspectEntries,
  inspectVsix,
  readZipEntries,
  requiredEntries,
};
