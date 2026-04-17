---
phase: 01-reference-engine
reviewed: 2026-04-17T05:00:23Z
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
  warning: 1
  info: 1
  total: 2
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-17T05:00:23Z
**Depth:** deep
**Files Reviewed:** 12
**Status:** issues_found

## Summary

Reviewed the reference engine across manifest/config, validation, range normalization, path resolution, and scoped tests. `npm test` and `npm run typecheck` both pass. The main remaining functional risk is Windows UNC path handling in relative mode.

## Warnings

### WR-01: Relative path resolution breaks for Windows UNC workspaces

**File:** `src/path.ts:9-16,36-41,55-64`
**Issue:** `isWindowsPath()` only recognizes drive-letter paths like `C:\...`. UNC paths such as `\\server\share\repo\file.ts` fall through to the POSIX branch in `relativeFromContainingFolder()`, which runs `path.posix.relative()` on backslash-delimited Windows paths. That produces malformed references like `..///server/share/...` instead of `src/file.ts`. The same drive-letter-only check also skips Windows-style case folding for UNC paths, so mixed-case UNC workspace/document pairs can fail containment checks.
**Fix:** Treat UNC paths as Windows paths and normalize separators before computing the relative path.

```ts
function isWindowsPath(value: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(value) || value.startsWith('\\\\');
}

function relativeFromContainingFolder(folderPath: string, documentPath: string): string {
  const normalizedFolder = normalizeToPosixPath(folderPath);
  const normalizedDocument = normalizeToPosixPath(documentPath);

  if (isWindowsPath(folderPath) || isWindowsPath(documentPath)) {
    return normalizeToPosixPath(path.win32.relative(folderPath, documentPath));
  }

  return path.posix.relative(normalizedFolder, normalizedDocument);
}
```

## Info

### IN-01: Path tests miss UNC regression coverage

**File:** `test/path.test.ts:73-96`
**Issue:** The path suite covers drive-letter Windows paths but not UNC shares. That leaves the broken `\\server\share\...` case unguarded, so this cross-platform regression can slip through despite the current tests passing.
**Fix:** Add tests for absolute and relative UNC paths, including mixed-case workspace/document pairs.

---

_Reviewed: 2026-04-17T05:00:23Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
