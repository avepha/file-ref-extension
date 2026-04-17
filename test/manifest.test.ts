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
        title: 'File Reference: Copy Absolute Path with Line',
      },
      {
        command: COPY_RELATIVE_REFERENCE_COMMAND,
        title: 'File Reference: Copy Relative Path with Line',
      },
    ]);
  });

  it('declares platform shortcuts only for saved local text editors', () => {
    const pkg = loadPackageJson();
    const keybindings = pkg.contributes?.keybindings ?? [];

    assert.deepEqual(keybindings, [
      {
        command: COPY_ABSOLUTE_REFERENCE_COMMAND,
        key: 'ctrl+alt+k',
        mac: 'cmd+alt+k',
        when: 'editorTextFocus && !editorReadonly && !isInDiffEditor && resourceScheme == file',
      },
      {
        command: COPY_RELATIVE_REFERENCE_COMMAND,
        key: 'ctrl+alt+shift+k',
        mac: 'cmd+alt+shift+k',
        when: 'editorTextFocus && !editorReadonly && !isInDiffEditor && resourceScheme == file',
      },
    ]);
  });

  it('includes release metadata and packaging scripts required for publishing', () => {
    const pkg = loadPackageJson();

    assert.equal(pkg.displayName, 'File Reference');
    assert.equal(pkg.description, 'Copy AI-friendly file references from the active editor.');
    assert.equal(pkg.license, 'SEE LICENSE IN LICENSE');
    assert.equal(pkg.pricing, 'Free');
    assert.deepEqual(pkg.repository, {
      type: 'git',
      url: 'https://github.com/farhan/file-ref-extension.git',
    });
    assert.deepEqual(pkg.bugs, {
      url: 'https://github.com/farhan/file-ref-extension/issues',
    });
    assert.equal(pkg.homepage, 'https://github.com/farhan/file-ref-extension#readme');
    assert.equal(pkg.icon, 'media/icon.png');
    assert.deepEqual(pkg.keywords, [
      'ai',
      'claude-code',
      'opencode',
      'file-reference',
      'path',
      'clipboard',
    ]);
    assert.equal(pkg.scripts?.['vscode:prepublish'], 'npm run build');
    assert.equal(pkg.scripts?.package, 'vsce package');
    assert.equal(pkg.scripts?.['publish:marketplace'], 'vsce publish');
    assert.equal(pkg.scripts?.['publish:openvsx'], 'ovsx publish');
    assert.equal(pkg.scripts?.['release:check'], 'npm run build && npm run typecheck && npm run test && npm run package');
  });
});
