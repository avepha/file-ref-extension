import { strict as assert } from 'node:assert';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { describe, it } from 'mocha';

import {
  COPY_ABSOLUTE_REFERENCE_COMMAND,
  COPY_RELATIVE_REFERENCE_COMMAND,
} from '../src/commands';

interface PackageJson {
  displayName?: string;
  description?: string;
  homepage?: string;
  icon?: string;
  license?: string;
  pricing?: string;
  repository?: {
    type?: string;
    url?: string;
  };
  bugs?: {
    url?: string;
  };
  keywords?: string[];
  scripts?: Record<string, string>;
  contributes?: {
    commands?: Array<{ command: string; title: string }>;
    keybindings?: Array<{ command: string; key: string; mac?: string; when?: string }>;
  };
}

function loadPackageJson(): PackageJson {
  const packagePath = path.resolve(__dirname, '..', '..', 'package.json');
  return JSON.parse(readFileSync(packagePath, 'utf8')) as PackageJson;
}

describe('package.json contributions', () => {
  it('contributes both copy commands to the Command Palette', () => {
    const pkg = loadPackageJson();
    const commands = pkg.contributes?.commands ?? [];

    assert.deepEqual(commands, [
      {
        command: COPY_ABSOLUTE_REFERENCE_COMMAND,
        title: 'Copy Absolute File Path with Line Numbers',
      },
      {
        command: COPY_RELATIVE_REFERENCE_COMMAND,
        title: 'Copy Relative File Path with Line Numbers',
      },
    ]);
  });

  it('declares platform shortcuts only for saved local text editors', () => {
    const pkg = loadPackageJson();
    const keybindings = pkg.contributes?.keybindings ?? [];

    assert.deepEqual(keybindings, [
      {
        command: COPY_ABSOLUTE_REFERENCE_COMMAND,
        key: 'ctrl+alt+shift+c',
        mac: 'alt+shift+c',
        when: 'editorTextFocus && !isInDiffEditor && resourceScheme == file',
      },
      {
        command: COPY_RELATIVE_REFERENCE_COMMAND,
        key: 'ctrl+alt+c',
        mac: 'alt+c',
        when: 'editorTextFocus && !isInDiffEditor && resourceScheme == file',
      },
    ]);
  });

  it('includes release metadata and packaging scripts required for publishing', () => {
    const pkg = loadPackageJson();

    assert.equal(pkg.displayName, 'Copy File Path with Line Numbers (AI Prompt)');
    assert.equal(pkg.description, 'Copy deterministic file paths with line numbers for prompts, reviews, and notes.');
    assert.equal(pkg.license, 'SEE LICENSE IN LICENSE');
    assert.equal(pkg.pricing, 'Free');
    assert.equal((pkg as PackageJson & { publisher?: string }).publisher, 'avepha');
    assert.deepEqual(pkg.repository, {
      type: 'git',
      url: 'https://github.com/avepha/file-ref-extension.git',
    });
    assert.deepEqual(pkg.bugs, {
      url: 'https://github.com/avepha/file-ref-extension/issues',
    });
    assert.equal(pkg.homepage, 'https://github.com/avepha/file-ref-extension#readme');
    assert.equal(pkg.icon, 'media/icon.png');
    assert.deepEqual(pkg.keywords, [
      'ai',
      'ai-prompt',
      'claude-code',
      'opencode',
      'file-path',
      'line-numbers',
      'clipboard',
    ]);
    assert.equal(pkg.scripts?.['vscode:prepublish'], 'npm run build');
    assert.equal(pkg.scripts?.['audit:check'], 'npm audit --audit-level=high');
    assert.equal(pkg.scripts?.package, 'vsce package --readme-path README.marketplace.md');
    assert.equal(pkg.scripts?.['package:inspect'], 'node scripts/inspect-vsix.js');
    assert.equal(pkg.scripts?.['publish:marketplace'], 'npm run package && node scripts/publish-vsix.js marketplace');
    assert.equal(pkg.scripts?.['publish:openvsx'], 'npm run package && node scripts/publish-vsix.js openvsx');
    assert.equal(pkg.scripts?.['release:check'], 'npm run build && npm run typecheck && npm run test && npm run audit:check && npm run package && npm run package:inspect');
  });
});
