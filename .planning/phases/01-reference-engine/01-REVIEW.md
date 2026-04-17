---
phase: 01-reference-engine
reviewed: 2026-04-17T05:19:03Z
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
  warning: 2
  info: 0
  total: 2
status: issues_found
---

# Phase 01: Code Review Report

**Reviewed:** 2026-04-17T05:19:03Z
**Depth:** deep
**Files Reviewed:** 12
**Status:** issues_found

## Summary

Reviewed the reference engine end to end across manifest/config, editor guards, range normalization, path resolution, reference formatting, and the scoped unit tests. The core path/range logic is small and readable, but two cross-file reliability gaps remain: the test build can execute stale compiled tests, and the local test/runtime configuration is looser than the published extension target, which can hide extension-host regressions.

## Warnings

### WR-01: Test runs can pick up stale compiled files from previous builds

**File:** `package.json:74-75`
**Issue:** `npm test` compiles into `.build` and immediately runs `mocha ".build/test/**/*.test.js"`, but the script never clears `.build` first. TypeScript does not remove deleted or renamed outputs, so old compiled test files can continue to run after the source file is gone. That creates flaky review signals and can fail releases for tests that no longer exist in the repository.
**Fix:** Clean the output directory before compiling tests.

```json
{
  "scripts": {
    "clean:build": "rm -rf .build",
    "compile-tests": "npm run clean:build && tsc --outDir .build",
    "test": "npm run compile-tests && mocha \".build/test/**/*.test.js\""
  }
}
```

### WR-02: Test/runtime targets are misaligned with the published extension host

**File:** `tsconfig.json:3-6`, `esbuild.js:12`, `package.json:72-76`
**Issue:** The published bundle is explicitly compiled for `node20` in `esbuild.js`, but the TypeScript config and local test flow compile sources directly with `target: "ES2024"` and run them under the developer's local Node runtime. In practice, code can pass `npm test` and `npm run typecheck` while still using syntax or Node APIs that are available locally but not in the VS Code extension host. This is a cross-file regression risk, especially because these tests do not execute inside VS Code.
**Fix:** Align the checked/tested runtime with the shipped runtime. Either lower the TS target/lib to the extension-host baseline or add extension-host tests that run the code under VS Code's Node environment.

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2023",
    "lib": ["ES2023"]
  }
}
```

```json
// package.json
{
  "scripts": {
    "test": "npm run compile-tests && vscode-test"
  }
}
```

---

_Reviewed: 2026-04-17T05:19:03Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
