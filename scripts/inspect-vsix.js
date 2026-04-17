const { existsSync, readFileSync } = require('node:fs');
const path = require('node:path');

const allowedEntries = [
  '[Content_Types].xml',
  'extension.vsixmanifest',
  'extension/package.json',
  'extension/dist/extension.js',
  'extension/dist/extension.js.map',
  'extension/readme.md',
  'extension/changelog.md',
  'extension/LICENSE.txt',
  'extension/docs/release-checklist.md',
  'extension/media/icon.png',
];

const allowedEntrySet = new Set(allowedEntries);
const requiredEntries = allowedEntries;

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
  const unexpectedEntries = entries.filter((entry) => !allowedEntrySet.has(entry));

  if (unexpectedEntries.length > 0) {
    throw new Error(`VSIX contains unexpected files:\n${unexpectedEntries.join('\n')}`);
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
  allowedEntries,
  inspectEntries,
  inspectVsix,
  readZipEntries,
  requiredEntries,
};
