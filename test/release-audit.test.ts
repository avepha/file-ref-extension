import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'mocha';

function rootPath(...parts: string[]): string {
  return path.resolve(__dirname, '..', '..', ...parts);
}

describe('release audit gate', () => {
  it('keeps package.json release validation wired through npm audit', () => {
    const packageJson = JSON.parse(readFileSync(rootPath('package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };

    assert.equal(packageJson.scripts?.['audit:check'], 'npm audit --audit-level=high');
    assert.equal(
      packageJson.scripts?.['release:check'],
      'npm run build && npm run typecheck && npm run test && npm run audit:check && npm run package && npm run package:inspect',
    );
  });

  it('requires release validation workflow to run the audit gate before packaging', () => {
    const workflow = readFileSync(rootPath('.github', 'workflows', 'release-validation.yml'), 'utf8');

    const lines = workflow.split('\n');
    const packageStart = lines.indexOf('  package:');

    const packageJobLines: string[] = [];

    if (packageStart !== -1) {
      for (const line of lines.slice(packageStart + 1)) {
        if (line !== '' && !line.startsWith('    ')) {
          break;
        }

        packageJobLines.push(line);
      }
    }

    const packageJob = packageJobLines.join('\n');

    assert.notEqual(packageJob, '', 'Workflow should define a package job');

    const auditIndex = packageJob.indexOf('- run: npm run audit:check');
    const packageIndex = packageJob.indexOf('- run: npm run package');

    assert.notEqual(auditIndex, -1, 'Package job should include npm run audit:check');
    assert.notEqual(packageIndex, -1, 'Package job should include npm run package');
    assert.ok(auditIndex < packageIndex, 'Package job should run npm audit before packaging');
  });

  it('documents audit review in the maintainer release checklist', () => {
    const checklist = readFileSync(rootPath('docs', 'release-checklist.md'), 'utf8');

    assert.match(checklist, /npm run audit:check/);
    assert.match(checklist, /before packaging or publish/i);
    assert.match(checklist, /audit/i);
  });
});
