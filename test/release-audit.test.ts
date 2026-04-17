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

    assert.match(workflow, /- run: npm run audit:check/);

    const auditIndex = workflow.indexOf('- run: npm run audit:check');
    const packageIndex = workflow.indexOf('- run: npm run package');

    assert.notEqual(auditIndex, -1, 'Workflow should include npm run audit:check');
    assert.notEqual(packageIndex, -1, 'Workflow should include npm run package');
    assert.ok(auditIndex < packageIndex, 'Workflow should run npm audit before packaging the VSIX');
  });

  it('documents audit review in the maintainer release checklist', () => {
    const checklist = readFileSync(rootPath('docs', 'release-checklist.md'), 'utf8');

    assert.match(checklist, /npm run audit:check/);
    assert.match(checklist, /before packaging or publish/i);
    assert.match(checklist, /audit/i);
  });
});
