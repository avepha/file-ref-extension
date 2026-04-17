---
phase: 03-release-readiness
reviewed: 2026-04-17T04:59:37Z
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

**Reviewed:** 2026-04-17T04:59:37Z
**Depth:** deep
**Files Reviewed:** 11
**Status:** issues_found

## Summary

Reviewed the release-readiness files across CI, packaging checks, metadata, docs, and release tests. I also executed `npm run release:check`; build, typecheck, tests, and VSIX packaging passed, but `npm run package:inspect` failed against the real `.vsix`. The main risk is that the current inspection/tests encode the wrong packaged filenames, so release validation is currently broken despite the unit tests passing.

## Warnings

### WR-01: Real VSIX inspection is broken by incorrect expected entry names

**File:** `scripts/inspect-vsix.js:4-11`, `scripts/inspect-vsix.js:67-70`, `test/release-assets.test.ts:29-40`
**Issue:** `requiredEntries` expects `extension/README.md`, `extension/CHANGELOG.md`, and `extension/LICENSE`, but `vsce package` emits `extension/readme.md`, `extension/changelog.md`, and `extension/LICENSE.txt`. As a result, `npm run package:inspect` fails on the actual archive, which also makes `npm run release:check` fail and blocks release validation. The accompanying test only feeds `inspectEntries([...requiredEntries])`, so it gives false confidence and never exercises the real packaged names.
**Fix:** Align the required entries with actual `vsce` output, or normalize entry names before comparison, and add a test that inspects a real packaged VSIX (or a fixture that matches `vsce` naming).

```js
const requiredEntries = [
  'extension/package.json',
  'extension/dist/extension.js',
  'extension/readme.md',
  'extension/changelog.md',
  'extension/LICENSE.txt',
  'extension/media/icon.png',
];
```

### WR-02: Published shortcut documentation does not match the manifest

**File:** `README.md:18-23`, `package.json:55-67`
**Issue:** The README advertises `Cmd+Option+K` / `Cmd+Option+Shift+K` on macOS and `Ctrl+Alt+K` / `Ctrl+Alt+Shift+K` on Windows/Linux, but the manifest actually contributes `Alt+Shift+C` and `Alt+C` variants. Shipping the current README would publish incorrect usage instructions and make the extension look broken to users even if the commands work.
**Fix:** Update the README table to match `package.json`, or change the manifest to match the documented shortcuts and keep both in sync with a test.

```md
| Platform | Absolute | Relative |
| --- | --- | --- |
| macOS | `Alt+Shift+C` | `Alt+C` |
| Windows / Linux | `Ctrl+Alt+Shift+C` | `Ctrl+Alt+C` |
```

## Info

### IN-01: VSIX hygiene rules do not account for shipped source maps

**File:** `.vscodeignore:1-15`, `scripts/inspect-vsix.js:13-29`
**Issue:** The packaged archive currently includes `extension/dist/extension.js.map`, but neither `.vscodeignore` nor the inspection script treats source maps as intentionally allowed or explicitly forbidden. That makes the package contents drift from the stated goal of shipping only the bundled runtime and release assets.
**Fix:** Decide whether source maps are part of the public artifact. If not, exclude `dist/**/*.map` from the VSIX or disable production sourcemaps; if yes, add an explicit allowlist/assertion so the packaging policy is clear.

---

_Reviewed: 2026-04-17T04:59:37Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
