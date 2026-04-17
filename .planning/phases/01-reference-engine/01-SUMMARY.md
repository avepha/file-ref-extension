---
phase: 01-reference-engine
plan: 01
subsystem: testing
tags: [typescript, vscode-extension, esbuild, mocha, path-normalization]
requires: []
provides:
  - pure editor validation helpers for supported local file states
  - deterministic line and range normalization for cursor and selection cases
  - canonical absolute and workspace-relative reference formatting with fallback
affects: [phase-2-command-workflow, command-handlers, clipboard-flow]
tech-stack:
  added: [typescript, esbuild, mocha]
  patterns: [vscode-free domain contracts, canonical formatter composition, fixture-based cross-platform path tests]
key-files:
  created: [package.json, tsconfig.json, esbuild.js, src/contracts.ts, src/guards.ts, src/range.ts, src/path.ts, src/reference.ts, test/guards.test.ts, test/range.test.ts, test/path.test.ts, test/reference.test.ts]
  modified: [src/contracts.ts]
key-decisions:
  - "Keep the Phase 1 engine on plain TypeScript data shapes so domain tests do not depend on the VS Code host."
  - "Resolve relative output only from the containing workspace folder and fall back to absolute output otherwise."
patterns-established:
  - "Pure validation returns typed unsupported-state failures with one user-facing message."
  - "Reference formatting composes path resolution with one normalized line output contract."
requirements-completed: [EDIT-01, EDIT-02, REF-01, REF-02, REF-03, REF-04, REF-05]
duration: 7min
completed: 2026-04-17
---

# Phase 1 Plan 1: Reference Engine Summary

**Pure TypeScript helpers now validate supported local editors and format absolute or workspace-relative file references with normalized line ranges and POSIX paths.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-04-17T03:45:00Z
- **Completed:** 2026-04-17T03:52:04Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Scaffolded the TypeScript, esbuild, and Mocha project shape needed for a lightweight VS Code extension core.
- Added pure validation and selection-normalization helpers for supported local file editors and deterministic line output.
- Added canonical path resolution and reference formatting with workspace-relative containment rules and absolute fallback.

## Task Commits

Each task was committed atomically:

1. **Task 1: Validation and range contract** - `2251765` (feat)
2. **Task 2: Path resolution and reference formatting** - `2a3ca0f` (feat)

## Files Created/Modified
- `package.json` - Extension manifest metadata plus build, typecheck, and test scripts.
- `tsconfig.json` - Strict TypeScript compiler configuration for source and tests.
- `esbuild.js` - Minimal bundle entry for `src/extension.ts`.
- `src/contracts.ts` - Shared plain-data contracts for editor, selection, workspace, and formatter inputs.
- `src/guards.ts` - Supported-editor validation with explicit failure reasons.
- `src/range.ts` - Line/range normalization and formatting rules, including the column-0 edge.
- `src/path.ts` - POSIX slash normalization and containing-workspace relative resolution.
- `src/reference.ts` - Canonical formatter and end-to-end pure reference builder.
- `test/guards.test.ts` - Validation coverage for supported and unsupported editor states.
- `test/range.test.ts` - Selection normalization coverage for cursor, same-line, reversed, and column-0 cases.
- `test/path.test.ts` - Cross-platform path and multi-root containment fixtures.
- `test/reference.test.ts` - Final reference-formatting behavior tests.

## Decisions Made
- Kept the domain layer VS Code-free by using plain TypeScript contracts, which keeps Phase 1 fast to test and easy for Phase 2 command handlers to compose.
- Used one shared formatter path for absolute and relative outputs so path normalization and line normalization stay consistent across both commands.
- Treated relative output as "containing workspace folder only," with normalized absolute fallback when no containing folder applies.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- A local commit initially picked up pre-staged planning files from the existing working tree; I safely undid that commit before recreating the intended task-only commit.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 2 can call `buildFileReference` or `formatFileReference` directly from command handlers.
- Validation, path normalization, and line/range rules are locked down with automated tests and ready for clipboard and notification wiring.

## Self-Check: PASSED
