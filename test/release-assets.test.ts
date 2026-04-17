import { strict as assert } from 'node:assert';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'mocha';

function rootPath(...parts: string[]): string {
  return path.resolve(__dirname, '..', '..', ...parts);
}

const {
  inspectEntries,
  requiredEntries,
} = require(rootPath('scripts', 'inspect-vsix.js')) as {
  inspectEntries: (entries: string[]) => void;
  requiredEntries: string[];
};

type CommandContribution = {
  command: string;
  title: string;
};

type KeybindingContribution = {
  command: string;
  key: string;
  mac?: string;
};

type ReadmeCommandRow = {
  id: string;
  title: string;
};

type ManifestShape = {
  contributes: {
    commands: CommandContribution[];
    keybindings: KeybindingContribution[];
  };
};

type ReadmeDocs = {
  commands: ReadmeCommandRow[];
  shortcuts: {
    macos: { absolute: string; relative: string };
    windowsLinux: { absolute: string; relative: string };
  };
};

function normalizeShortcut(shortcut: string): string {
  return shortcut.trim().replace(/\s+/g, ' ').toLowerCase();
}

function getSection(readme: string, heading: string): string {
  const pattern = new RegExp(`## ${heading}\\n([\\s\\S]*?)(?:\\n## |$)`);
  const match = readme.match(pattern);

  assert.ok(match, `README is missing the \"${heading}\" section`);

  return match[1].trim();
}

function parseReadmeDocs(readme: string): ReadmeDocs {
  const commandsSection = getSection(readme, 'Commands');
  const shortcutsSection = getSection(readme, 'Default shortcuts');

  const commands = commandsSection
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- ') || line.startsWith('|'))
    .flatMap((line) => {
      if (line.startsWith('- ')) {
        const match = line.match(/`([^`]+)`\s*[-–—:]\s*(.+)$/);
        assert.ok(match, `README Commands section contains an unparseable command line: ${line}`);
        return [{ id: match[1], title: match[2].trim() }];
      }

      if (/^\|\s*---/.test(line) || /^\|\s*Command ID\s*\|/.test(line)) {
        return [];
      }

      const cells = line.split('|').slice(1, -1).map((cell) => cell.trim().replace(/^`|`$/g, ''));
      assert.equal(cells.length, 2, `README Commands section contains an unexpected table row: ${line}`);
      return [{ id: cells[0], title: cells[1] }];
    });

  const shortcutRows = shortcutsSection
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('|'))
    .slice(2)
    .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim().replace(/^`|`$/g, '')));

  assert.equal(shortcutRows.length, 2, 'README Default shortcuts section should contain macOS and Windows / Linux rows');

  const [macRow, windowsRow] = shortcutRows;

  assert.equal(macRow[0], 'macOS', 'README Default shortcuts section should label the first row macOS');
  assert.equal(windowsRow[0], 'Windows / Linux', 'README Default shortcuts section should label the second row Windows / Linux');

  return {
    commands,
    shortcuts: {
      macos: {
        absolute: normalizeShortcut(macRow[1]),
        relative: normalizeShortcut(macRow[2]),
      },
      windowsLinux: {
        absolute: normalizeShortcut(windowsRow[1]),
        relative: normalizeShortcut(windowsRow[2]),
      },
    },
  };
}

function getExpectedReadmeDocs(manifest: ManifestShape): ReadmeDocs {
  const commands = manifest.contributes.commands.map(({ command, title }) => ({
    id: command,
    title,
  }));
  const keybindingByCommand = new Map(manifest.contributes.keybindings.map((binding) => [binding.command, binding]));

  const absoluteBinding = keybindingByCommand.get('fileReference.copyAbsoluteReference');
  const relativeBinding = keybindingByCommand.get('fileReference.copyRelativeReference');

  assert.ok(absoluteBinding, 'Manifest missing absolute reference keybinding');
  assert.ok(relativeBinding, 'Manifest missing relative reference keybinding');

  return {
    commands,
    shortcuts: {
      macos: {
        absolute: normalizeShortcut(absoluteBinding.mac ?? ''),
        relative: normalizeShortcut(relativeBinding.mac ?? ''),
      },
      windowsLinux: {
        absolute: normalizeShortcut(absoluteBinding.key),
        relative: normalizeShortcut(relativeBinding.key),
      },
    },
  };
}

function assertReadmeSectionMatches(sectionName: string, actual: unknown, expected: unknown): void {
  try {
    assert.deepEqual(actual, expected);
  } catch (error) {
    const details = error instanceof Error ? error.message : String(error);
    throw new assert.AssertionError({
      message: `README ${sectionName} section drifted from package.json.\n${details}`,
    });
  }
}

function assertReadmeMatchesManifest(readme: string, manifest: ManifestShape): void {
  const actualDocs = parseReadmeDocs(readme);
  const expectedDocs = getExpectedReadmeDocs(manifest);

  assertReadmeSectionMatches('Commands', actualDocs.commands, expectedDocs.commands);
  assertReadmeSectionMatches('Default shortcuts', actualDocs.shortcuts, expectedDocs.shortcuts);
}

describe('release assets', () => {
  const packagedRuntimeEntries = [
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
  const readme = readFileSync(rootPath('README.md'), 'utf8');
  const manifest = JSON.parse(readFileSync(rootPath('package.json'), 'utf8')) as ManifestShape;

  it('checks in the root files needed for public distribution', () => {
    for (const relativePath of ['README.md', 'CHANGELOG.md', 'LICENSE', '.vscodeignore', 'docs/release-checklist.md', 'media/icon.png']) {
      assert.equal(existsSync(rootPath(relativePath)), true, `${relativePath} should exist`);
    }
  });

  it('checks in the release validation workflow', () => {
    assert.equal(existsSync(rootPath('.github', 'workflows', 'release-validation.yml')), true);
  });

  it('keeps README command titles and platform shortcuts aligned with the manifest', () => {
    assert.doesNotThrow(() => assertReadmeMatchesManifest(readme, manifest));
  });

  it('fails with a section-specific message when README shortcuts drift from the manifest', () => {
    const driftedReadme = readme.replace('`Alt+C`', '`Cmd+Option+Shift+K`');

    assert.throws(
      () => assertReadmeMatchesManifest(driftedReadme, manifest),
      /README Default shortcuts section drifted from package\.json/,
    );
  });

  it('fails with a section-specific message when README command IDs drift from the manifest', () => {
    const driftedReadme = readme.replace('`fileReference.copyAbsoluteReference`', '`fileReference.copyAbsoulteReference`');

    assert.throws(
      () => assertReadmeMatchesManifest(driftedReadme, manifest),
      /README Commands section drifted from package\.json/,
    );
  });

  it('requires the packaged VSIX to include all publishable runtime assets', () => {
    assert.doesNotThrow(() => inspectEntries([...packagedRuntimeEntries]));
    assert.deepEqual(requiredEntries, packagedRuntimeEntries);
  });

  it('fails when the packaged VSIX is missing a required runtime asset', () => {
    const entriesWithoutBundle = requiredEntries.filter((entry) => entry !== 'extension/dist/extension.js');

    assert.throws(
      () => inspectEntries(entriesWithoutBundle),
      /VSIX is missing required files:\nextension\/dist\/extension\.js/,
    );
  });

  it('fails when the packaged VSIX includes an unexpected file', () => {
    assert.throws(
      () => inspectEntries([...packagedRuntimeEntries, 'extension/src/extension.ts']),
      /VSIX contains unexpected files:\nextension\/src\/extension\.ts/,
    );
  });
});
