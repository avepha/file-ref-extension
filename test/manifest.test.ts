import { strict as assert } from 'node:assert';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { describe, it } from 'mocha';

import {
  COPY_ABSOLUTE_REFERENCE_COMMAND,
  COPY_RELATIVE_REFERENCE_COMMAND,
} from '../src/commands';

interface PackageJson {
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
        title: 'File Reference: Copy Absolute Reference',
      },
      {
        command: COPY_RELATIVE_REFERENCE_COMMAND,
        title: 'File Reference: Copy Relative Reference',
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
        mac: 'cmd+alt+shift+c',
        when: 'editorTextFocus && !editorReadonly && resourceScheme == file',
      },
      {
        command: COPY_RELATIVE_REFERENCE_COMMAND,
        key: 'ctrl+alt+shift+r',
        mac: 'cmd+alt+shift+r',
        when: 'editorTextFocus && !editorReadonly && resourceScheme == file',
      },
    ]);
  });
});
