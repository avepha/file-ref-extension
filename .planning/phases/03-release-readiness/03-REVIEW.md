---
phase: 03-release-readiness
reviewed: 2026-04-17T04:33:22Z
depth: deep
files_reviewed: 10
files_reviewed_list:
  - .github/workflows/release-validation.yml
  - .vscodeignore
  - CHANGELOG.md
  - LICENSE
  - README.md
  - docs/release-checklist.md
  - media/icon.png
  - package.json
  - test/manifest.test.ts
  - test/release-assets.test.ts
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 03: Code Review Report

**Reviewed:** 2026-04-17T04:33:22Z
**Depth:** deep
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Reviewed the release-readiness changes across packaging metadata, release docs, CI validation, and release-focused tests. The package metadata itself looks publishable, but the automated validation still has two important gaps: it does not verify the actual VSIX contents, and it does not assert several manifest fields that the project depends on for Marketplace/Open VSX publishability and local/UI-host behavior.

## Warnings

### WR-01: CI validates repository files, not the shipped VSIX payload

**File:** `.github/workflows/release-validation.yml:38-39`, `test/release-assets.test.ts:11-19`, `.vscodeignore:1-13`

**Issue:** The release pipeline only runs `npm run package`, and the release-assets test only checks that files exist in the repository. Neither one verifies the contents of the generated `.vsix`. A packaging regression in `.vscodeignore` could therefore pass CI while shipping an invalid package that omits required assets (README, CHANGELOG, LICENSE, icon) or includes unwanted files.

**Fix:** Add a post-package verification step that inspects the packaged extension rather than the working tree. For example, generate the VSIX in CI, assert its file list against an allowlist/denylist, and upload the artifact for inspection.

```yaml
- run: npm run package
- run: npx @vscode/vsce ls
- uses: actions/upload-artifact@v4
  with:
    name: extension-vsix
    path: "*.vsix"
```

or replace the existence-only test with a package-content test that shells out to `vsce ls` and asserts expected included/excluded paths.

### WR-02: Manifest test misses publishability-critical fields the checklist relies on

**File:** `test/manifest.test.ts:75-104`, `package.json:26-43`, `docs/release-checklist.md:37`

**Issue:** The manifest test covers some release metadata, but it does not lock down several fields that are critical to publishability and runtime behavior: `name`, `publisher`, `version`, `engines.vscode`, `categories`, `extensionKind`, and workspace capability flags. That leaves a gap where CI can stay green even if the extension stops advertising the required VS Code compatibility or loses the `extensionKind: ["ui"]` behavior that the checklist says is automated.

**Fix:** Extend `manifest.test.ts` to assert the remaining release-critical manifest fields directly.

```ts
assert.equal(pkg.name, 'file-reference');
assert.equal(pkg.publisher, 'farhan');
assert.equal(pkg.version, '0.0.1');
assert.deepEqual(pkg.engines, { vscode: '^1.100.0' });
assert.deepEqual(pkg.categories, ['Other']);
assert.deepEqual(pkg.extensionKind, ['ui']);
assert.deepEqual(pkg.capabilities, {
  virtualWorkspaces: { supported: false },
  untrustedWorkspaces: { supported: true },
});
```

---

_Reviewed: 2026-04-17T04:33:22Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
