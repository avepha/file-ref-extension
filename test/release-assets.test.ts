import { strict as assert } from 'node:assert';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'mocha';

function rootPath(...parts: string[]): string {
  return path.resolve(__dirname, '..', '..', ...parts);
}

describe('release assets', () => {
  it('checks in the root files needed for public distribution', () => {
    for (const relativePath of ['README.md', 'CHANGELOG.md', 'LICENSE', '.vscodeignore', 'docs/release-checklist.md', 'media/icon.png']) {
      assert.equal(existsSync(rootPath(relativePath)), true, `${relativePath} should exist`);
    }
  });

  it('checks in the release validation workflow', () => {
    assert.equal(existsSync(rootPath('.github', 'workflows', 'release-validation.yml')), true);
  });
});
