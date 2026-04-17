---
phase: 01-reference-engine
reviewed: 2026-04-17T04:40:09Z
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

**Reviewed:** 2026-04-17T04:40:09Z
**Depth:** deep
**Files Reviewed:** 12
**Status:** issues_found

## Summary

Reviewed the reference engine end to end across validation, line normalization, path resolution, manifest wiring, and scoped tests. `npm test` and `npm run typecheck` both pass, but there are still four behavior/configuration issues that can produce incorrect relative paths or block supported usage.

## Warnings

### WR-01: Relative mode picks the first matching workspace instead of the closest one

**File:** `src/path.ts:51-60`
**Issue:** `resolveReferencePath()` uses `workspaceFolders.find(...)`, so nested multi-root workspaces resolve against whichever containing folder appears first. If both `/repo` and `/repo/packages/app` are open, a file inside `app` is rendered as `packages/app/...` instead of `src/...`, which is the wrong project-local reference.
**Fix:** Prefer the deepest containing workspace folder before computing the relative path.

```ts
const containingFolder = workspaceFolders
  .filter((folder) => isContainingFolder(folder.uri.fsPath, documentPath))
  .sort((left, right) => right.uri.fsPath.length - left.uri.fsPath.length)[0];
```

### WR-02: POSIX root workspaces never resolve to relative paths

**File:** `src/path.ts:5-7,22-29`
**Issue:** When the workspace folder is `/`, `isContainingFolder()` checks `normalizedDocument.startsWith('//')`, which is always false for normal POSIX paths. Opening the filesystem root as a workspace therefore forces absolute output even in relative mode.
**Fix:** Special-case the POSIX root when checking folder containment.

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

### WR-03: Read-only saved files lose the advertised one-keystroke workflow

**File:** `package.json:60,66`
**Issue:** Both keybindings require `!editorReadonly`, but copying a file reference is read-only behavior. This blocks the extension's primary shortcut for valid saved local files opened in read-only mode, which is stricter than the product constraint.
**Fix:** Remove the read-only guard from the keybinding `when` clauses.

```json
"when": "editorTextFocus && !isInDiffEditor && resourceScheme == file"
```

### WR-04: The production bundle targets a newer Node runtime than the declared VS Code support range

**File:** `esbuild.js:12`
**Issue:** The bundle target is `node24`, but the extension runs inside VS Code's extension host, not the developer's local Node installation. With `engines.vscode: ^1.100.0`, this can emit syntax/features newer than the minimum supported host runtime and cause avoidable runtime incompatibilities.
**Fix:** Target the minimum Node version guaranteed by the supported VS Code range, or use a conservative ECMAScript target aligned with that runtime.

```js
target: 'node20',
```

---

_Reviewed: 2026-04-17T04:40:09Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
