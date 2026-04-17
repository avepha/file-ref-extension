---
phase: 03-release-readiness
reviewed: 2026-04-17T05:18:01Z
depth: deep
files_reviewed: 11
files_reviewed_list:
  - .github/workflows/release-validation.yml
  - CHANGELOG.md
  - LICENSE
  - docs/release-checklist.md
  - media/icon.png
  - scripts/inspect-vsix.js
  - package.json
  - README.md
  - .vscodeignore
  - test/manifest.test.ts
  - test/release-assets.test.ts
critical: 0
warning: 2
info: 1
total: 3
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-17T05:18:01Z
**Depth:** deep
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed the release-readiness scope across CI, packaging rules, manifest metadata, publish docs, and release-focused tests. The release surface is close, but two validation gaps still allow packaging/documentation regressions to slip through, and changelog/version sync is not enforced.

## Warnings

### WR-01: VSIX inspection allows unexpected packaged files to ship unnoticed

**File:** `/Users/farhan/Documents/file-ref-extension/scripts/inspect-vsix.js:57-71`
**Issue:** `inspectEntries()` only checks that a small forbidden list is absent and a small required list is present. Any extra root file that is not covered by `forbiddenPrefixes`/`forbiddenEntries` will still pass inspection. That weakens the stated packaging guarantee in `docs/release-checklist.md` that the VSIX should contain only the bundled runtime, manifest, release docs, and icon.
**Fix:** Switch the inspection from a partial blacklist to an allowlist, then add a test that proves unexpected entries fail.

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

### WR-02: README drift test does not verify documented command IDs

**File:** `/Users/farhan/Documents/file-ref-extension/test/release-assets.test.ts:61-79`, `/Users/farhan/Documents/file-ref-extension/test/release-assets.test.ts:110-121`, `/Users/farhan/Documents/file-ref-extension/README.md:15-18`
**Issue:** The README “Commands” table documents both command IDs and command-palette titles, but `parseReadmeDocs()` returns only the second column and `getExpectedReadmeDocs()` compares only manifest titles. A broken README command ID such as ``fileReference.copyAbsoulteReference`` would still pass CI, leaving published docs incorrect.
**Fix:** Parse and compare both columns so the test fails when either the command ID or the title drifts.

```ts
type ReadmeCommandRow = { id: string; title: string };

const cells = line.split('|').slice(1, -1).map((cell) => cell.trim().replace(/^`|`$/g, ''));
return [{ id: cells[0], title: cells[1] }];

const expectedCommands = manifest.contributes.commands.map(({ command, title }) => ({ id: command, title }));
assertReadmeSectionMatches('Commands', actualDocs.commands, expectedCommands);
```

## Info

### IN-01: Package version and changelog version are not kept in sync by automation

**File:** `/Users/farhan/Documents/file-ref-extension/package.json:5`, `/Users/farhan/Documents/file-ref-extension/CHANGELOG.md:5`, `/Users/farhan/Documents/file-ref-extension/docs/release-checklist.md:25-29`
**Issue:** The checklist tells maintainers to update both `package.json` and `CHANGELOG.md`, but no test or workflow check enforces that the latest changelog entry matches `package.json.version`. A mismatched release note heading can therefore ship unnoticed.
**Fix:** Add a lightweight release test that parses the latest changelog version and compares it to `package.json.version`.

---

_Reviewed: 2026-04-17T05:18:01Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
