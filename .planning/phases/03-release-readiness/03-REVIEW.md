---
phase: 03-release-readiness
reviewed: 2026-04-17T00:00:00Z
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
info: 0
total: 2
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-17T00:00:00Z
**Depth:** deep
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed the release-readiness changes across packaging metadata, release docs, CI, and validation tests. The release surface is close to publishable, but the current checks still allow two important failure modes: CI can produce a VSIX without running archive hygiene validation, and the local VSIX inspection/tests do not prove that required runtime/release assets are actually present in the packaged artifact.

## Warnings

### WR-01: CI packaging job skips VSIX hygiene inspection

**File:** `.github/workflows/release-validation.yml:29-39`
**Issue:** The dedicated packaging job only runs `npm run package`. That means pull requests can pass release validation even when the generated VSIX still contains forbidden dev-only files, because `scripts/inspect-vsix.js` is never executed in CI. The release checklist and `release:check` script expect this validation, but the workflow does not enforce it.
**Fix:** Run the full release check or at minimum add the inspection step after packaging.

```yaml
package:
  name: Package VSIX
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 24
        cache: npm
    - run: npm ci
    - run: npm run package
    - run: npm run package:inspect
```

### WR-02: VSIX validation only checks for forbidden files, not required packaged assets

**File:** `scripts/inspect-vsix.js:39-63`, `test/release-assets.test.ts:11-19`
**Issue:** The inspector rejects known-bad paths, and the test only checks that release files exist in the repository. Neither verifies that the packaged VSIX actually contains the files required for a publishable extension, such as `extension/package.json`, `extension/dist/extension.js`, `extension/README.md`, `extension/CHANGELOG.md`, `extension/LICENSE`, and `extension/media/icon.png`. A broken `.vscodeignore`, packaging config change, or bundling failure could therefore ship an incomplete VSIX while both checks still pass.
**Fix:** Extend the inspector to assert required entries and add a test that exercises that stricter contract.

```js
const requiredEntries = [
  'extension/package.json',
  'extension/dist/extension.js',
  'extension/README.md',
  'extension/CHANGELOG.md',
  'extension/LICENSE',
  'extension/media/icon.png',
];

const missingEntries = requiredEntries.filter((entry) => !entries.includes(entry));

if (missingEntries.length > 0) {
  throw new Error(`VSIX is missing required files:\n${missingEntries.join('\n')}`);
}
```

---

_Reviewed: 2026-04-17T00:00:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
