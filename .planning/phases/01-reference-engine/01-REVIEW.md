---
phase: 01-reference-engine
reviewed: 2026-04-17T04:30:34Z
depth: deep
files_reviewed: 12
files_reviewed_list:
  - package.json
  - tsconfig.json
  - esbuild.js
  - src/contracts.ts
  - src/guards.ts
  - src/range.ts
  - src/path.ts
  - src/reference.ts
  - test/guards.test.ts
  - test/range.test.ts
  - test/path.test.ts
  - test/reference.test.ts
findings:
  critical: 0
  warning: 4
  info: 0
  total: 4
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-17T04:30:34Z
**Depth:** deep
**Files Reviewed:** 12
**Status:** issues_found

## Summary

Reviewed the reference-formatting pipeline end to end: editor validation in `src/guards.ts`, line normalization in `src/range.ts`, path resolution in `src/path.ts`, and the package/build wiring that exposes the commands. The main risks are path-resolution edge cases in relative mode and configuration choices that can block valid usage or break compatibility on supported VS Code versions.

## Warnings

### WR-01: Relative mode picks the first matching workspace instead of the closest one

**File:** `src/path.ts:51-60`
**Issue:** `resolveReferencePath()` uses `workspaceFolders.find(...)`, so in nested multi-root workspaces it picks the first containing folder rather than the deepest containing folder. For a file like `/repo/packages/app/src/main.ts` with workspace folders `/repo` and `/repo/packages/app`, the current code returns `packages/app/src/main.ts` instead of the expected `src/main.ts`.
**Fix:** Choose the longest matching workspace path before calling `path.relative()`.

```ts
const containingFolder = workspaceFolders
  .filter((folder) => isContainingFolder(folder.uri.fsPath, documentPath))
  .sort((left, right) => right.uri.fsPath.length - left.uri.fsPath.length)[0];
```

### WR-02: POSIX root workspaces never count as containing folders

**File:** `src/path.ts:5-7,22-29`
**Issue:** `trimTrailingSlash('/')` preserves `/`, then `isContainingFolder()` checks `normalizedDocument.startsWith(`${normalizedFolder}/`)`, which becomes `startsWith('//')`. If a user opens `/` as the workspace root, every file incorrectly falls back to an absolute reference instead of a relative one.
**Fix:** Special-case the POSIX root when checking containment.

```ts
function isContainingFolder(folderPath: string, documentPath: string): boolean {
  const normalizedFolder = normalizeForComparison(folderPath);
  const normalizedDocument = normalizeForComparison(documentPath);

  if (normalizedFolder === '/') {
    return normalizedDocument.startsWith('/');
  }

  return (
    normalizedDocument === normalizedFolder ||
    normalizedDocument.startsWith(`${normalizedFolder}/`)
  );
}
```

### WR-03: Keybindings are disabled for read-only files even though the feature is safe there

**File:** `package.json:60,66`
**Issue:** Both keybindings require `!editorReadonly`. Copying a file reference does not modify the document, so this unnecessarily disables the extension's primary one-keypress workflow for valid saved local files opened in read-only mode.
**Fix:** Remove the read-only restriction from the `when` clauses.

```json
"when": "editorTextFocus && !isInDiffEditor && resourceScheme == file"
```

### WR-04: esbuild targets Node 24 instead of the extension host runtime

**File:** `esbuild.js:12`
**Issue:** The bundle target is `node24`, but `engines.vscode: ^1.100.0` allows VS Code versions whose extension host may run an older Node release. esbuild can emit syntax/features unavailable in those hosts, causing runtime failures on otherwise supported VS Code versions.
**Fix:** Target the minimum Node version guaranteed by the supported VS Code range, or use a conservative ECMAScript target.

```js
target: 'node20',
// or a similarly conservative target aligned with the minimum supported VS Code host
```

---

_Reviewed: 2026-04-17T04:30:34Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
