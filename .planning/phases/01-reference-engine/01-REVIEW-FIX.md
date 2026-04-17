---
phase: 01-reference-engine
fixed_at: 2026-04-17T04:46:35Z
review_path: .planning/phases/01-reference-engine/01-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 01: Code Review Fix Report

**Fixed at:** 2026-04-17T04:46:35Z
**Source review:** `.planning/phases/01-reference-engine/01-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### WR-01: Relative mode picks the first matching workspace instead of the closest one

**Files modified:** `src/path.ts`, `test/path.test.ts`
**Commit:** `2e2eceb`
**Applied fix:** Updated relative path resolution to choose the deepest containing workspace folder and added a nested multi-root regression test.
**Validation:** `npm run typecheck` ✅; `npm test` ✅ (36 passing, including new nested workspace test).

### WR-02: POSIX root workspaces never resolve to relative paths

**Files modified:** `src/path.ts`, `test/path.test.ts`
**Commit:** `b8f2b0b`
**Applied fix:** Special-cased `/` in workspace containment checks so root workspaces still produce relative references, with coverage in `test/path.test.ts`.
**Validation:** `npm run typecheck` ✅; `npm test` ✅ (37 passing, including root-workspace case).

### WR-03: Read-only saved files lose the advertised one-keystroke workflow

**Files modified:** `package.json`, `test/manifest.test.ts`
**Commit:** `797c501`
**Applied fix:** Removed the `!editorReadonly` guard from both keybinding `when` clauses and updated manifest expectations accordingly.
**Validation:** `node -e "JSON.parse(...)"` ✅; `npm test` ✅ (37 passing).

### WR-04: The production bundle targets a newer Node runtime than the declared VS Code support range

**Files modified:** `esbuild.js`
**Commit:** `e3c84be`
**Applied fix:** Lowered the production bundle target from `node24` to `node20` to align with the minimum supported VS Code runtime.
**Validation:** `node -c esbuild.js` ✅; `npm run build` ✅.

---

_Fixed: 2026-04-17T04:46:35Z_
_Fixer: the agent (gsd-code-fixer)_
_Iteration: 1_
