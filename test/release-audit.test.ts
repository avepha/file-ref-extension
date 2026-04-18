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
    assert.equal(
      packageJson.scripts?.['release:publish'],
      'npm run release:check && npm run publish:marketplace:vsix && npm run publish:openvsx:vsix',
    );
    assert.match(packageJson.scripts?.release ?? '', /semantic-release/);
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

  it('documents semantic-release commit rules and required secrets', () => {
    const contributing = readFileSync(rootPath('CONTRIBUTING.md'), 'utf8');
    const checklist = readFileSync(rootPath('docs', 'release-checklist.md'), 'utf8');

    assert.match(contributing, /Conventional Commits/i);
    assert.match(contributing, /VSCE_PAT/);
    assert.match(contributing, /OVSX_PAT/);
    assert.match(checklist, /GITHUB_TOKEN/);
    assert.match(checklist, /VSCE_PAT/);
    assert.match(checklist, /OVSX_PAT/);
  });

  it('defines a semantic-release workflow on main', () => {
    const workflow = readFileSync(rootPath('.github', 'workflows', 'release.yml'), 'utf8');

    assert.match(workflow, /branches:\n\s+- main/);
    assert.match(workflow, /fetch-depth:\s+0/);
    assert.match(workflow, /npm run release/);
    assert.match(workflow, /VSCE_PAT/);
    assert.match(workflow, /OVSX_PAT/);
  });

  it('keeps release validation on read-only repository permissions', () => {
    const workflow = readFileSync(rootPath('.github', 'workflows', 'release-validation.yml'), 'utf8');

    assert.match(workflow, /permissions:\n\s+contents:\s+read/);
  });

  it('defines baseline repository security automation', () => {
    const dependabot = readFileSync(rootPath('.github', 'dependabot.yml'), 'utf8');
    const codeql = readFileSync(rootPath('.github', 'workflows', 'codeql.yml'), 'utf8');
    const security = readFileSync(rootPath('SECURITY.md'), 'utf8');

    assert.match(dependabot, /package-ecosystem:\s+npm/);
    assert.match(dependabot, /package-ecosystem:\s+github-actions/);
    assert.match(codeql, /github\/codeql-action\/init@v3/);
    assert.match(codeql, /security-events:\s+write/);
    assert.match(security, /private vulnerability reporting/i);
  });
});
