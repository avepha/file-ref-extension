---
phase: 03-release-readiness
reviewed: 2026-04-17T06:00:00Z
depth: deep
files_reviewed: 10
files_reviewed_list:
  - .github/workflows/release-validation.yml
  - CHANGELOG.md
  - docs/release-checklist.md
  - scripts/inspect-vsix.js
  - package.json
  - README.md
  - .vscodeignore
  - test/manifest.test.ts
  - test/release-assets.test.ts
  - test/release-audit.test.ts
critical: 0
warning: 3
info: 1
total: 4
findings:
  critical: 0
  warning: 3
  info: 1
  total: 4
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-17T06:00:00Z
**Depth:** deep
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Reviewed the phase 03 release-readiness changes plus the later gap-closure work from plans 03-02 and 03-03 across packaging, CI, release docs, and regression tests. The release flow is materially stronger than the original phase cut, but three validation gaps remain: VSIX inspection still tolerates unexpected packaged files, README drift coverage still misses command-ID regressions, and the new audit workflow test can pass even if the package job stops running the audit gate.

## Warnings

### WR-01: VSIX inspection still uses a partial blacklist, so unexpected packaged files can slip through

**File:** `/Users/farhan/Documents/file-ref-extension/scripts/inspect-vsix.js:57-71`, `/Users/farhan/Documents/file-ref-extension/test/release-assets.test.ts:189-200`
**Issue:** `inspectEntries()` rejects only known forbidden paths and checks for a small required set. Any newly introduced file that is neither explicitly forbidden nor required will still pass inspection, which weakens the release guarantee that the VSIX only ships the bundled runtime and release assets. The current tests only cover missing required files, so this regression path is untested.
**Fix:** Change the inspection to an allowlist and add a regression test that fails when an unexpected entry is present.

```js
const allowedEntries = new Set([
  'extension/package.json',
  'extension/dist/extension.js',
  'extension/readme.md',
  'extension/changelog.md',
  'extension/LICENSE.txt',
  'extension/media/icon.png',
]);

const unexpectedEntries = entries.filter((entry) => !allowedEntries.has(entry));
if (unexpectedEntries.length > 0) {
  throw new Error(`VSIX contains unexpected files:\n${unexpectedEntries.join('\n')}`);
}
```

### WR-02: README drift guard still does not verify documented command IDs

**File:** `/Users/farhan/Documents/file-ref-extension/test/release-assets.test.ts:61-79`, `/Users/farhan/Documents/file-ref-extension/test/release-assets.test.ts:110-121`, `/Users/farhan/Documents/file-ref-extension/README.md:15-18`
**Issue:** The README command table documents both command IDs and command titles, but the parser returns only the second column and the expected values are derived only from manifest titles. A typo in a published command ID would still pass CI, so the new 03-02 drift guard only protects half of the table.
**Fix:** Parse both columns into structured rows and compare `{ id, title }` objects against `package.json` command contributions.

```ts
type ReadmeCommandRow = { id: string; title: string };

const cells = line.split('|').slice(1, -1).map((cell) => cell.trim().replace(/^`|`$/g, ''));
return [{ id: cells[0], title: cells[1] }];

const expectedCommands = manifest.contributes.commands.map(({ command, title }) => ({
  id: command,
  title,
}));
```

### WR-03: Audit workflow regression test can pass even if the package job loses its audit step

**File:** `/Users/farhan/Documents/file-ref-extension/test/release-audit.test.ts:23-34`
**Issue:** The new 03-03 test searches the whole workflow text for the first `npm run audit:check` and the first `npm run package`, then compares their indexes. If the audit step is removed from the `package` job but remains in the `test` job, the assertion still passes because the earlier audit occurrence is found first. That makes the new safeguard unreliable for the exact regression it claims to cover.
**Fix:** Scope the assertion to the `package` job block, or parse the workflow and assert that `npm run audit:check` appears in that specific job before `npm run package`.

```ts
const packageJob = workflow.match(/package:\n([\s\S]*?)\n(?:\w|$)/)?.[1] ?? '';

const auditIndex = packageJob.indexOf('- run: npm run audit:check');
const packageIndex = packageJob.indexOf('- run: npm run package');

assert.notEqual(auditIndex, -1, 'Package job should include npm run audit:check');
assert.notEqual(packageIndex, -1, 'Package job should include npm run package');
assert.ok(auditIndex < packageIndex, 'Package job should run npm audit before packaging');
```

## Info

### IN-01: Package version and changelog version are still not enforced together

**File:** `/Users/farhan/Documents/file-ref-extension/package.json:5`, `/Users/farhan/Documents/file-ref-extension/CHANGELOG.md:5`, `/Users/farhan/Documents/file-ref-extension/docs/release-checklist.md:25-29`
**Issue:** The maintainer checklist requires updating both `package.json` and `CHANGELOG.md`, but no test or workflow check verifies that the latest changelog heading matches `package.json.version`. A mismatched release note version can still ship unnoticed.
**Fix:** Add a small release test that parses the latest changelog version and compares it to `package.json.version`.

---

_Reviewed: 2026-04-17T06:00:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
