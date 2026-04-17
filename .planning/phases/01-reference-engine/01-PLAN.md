# Phase 1: Reference Engine - Plan

**Planned:** 2026-04-17
**Status:** Ready for execution

## Objective

Build the pure reference engine for saved local text files so Phase 2 can wire it into VS Code commands without redefining validation, range normalization, or path formatting behavior.

## Scope

- In scope: TypeScript project scaffolding, pure validation helpers, range normalization, path resolution, final reference formatting, and automated tests for supported and unsupported cases.
- Out of scope: Command registration, keybindings, clipboard writes, notifications, packaging, and publish workflow work.

## Plan Sequence

### Plan 1.1: Validation and Range Contract

**Outcome:** Pure helpers validate supported editor state and normalize line output deterministically for cursor, single-line selection, multi-line selection, reverse selection, and end-at-column-0 cases.

**Requirements:** EDIT-01, EDIT-02, REF-01, REF-02, REF-05

**Implementation steps:**
1. Scaffold the minimal extension project structure for TypeScript source, bundling, and tests.
2. Define a small domain contract for supported editor input and explicit unsupported-state failures.
3. Implement line/range normalization that collapses single-line outcomes to `line` and emits normalized `start-end` for multi-line selections.
4. Add unit tests covering supported inputs, unsupported inputs, reversed selections, and the trailing column-0 edge.

**Exit checks:**
- Unsupported editor states produce explicit failures.
- Single-line inputs always format as `path:line` once combined later.
- Selection direction never changes the normalized line result.

### Plan 1.2: Path Resolution and Reference Formatting

**Outcome:** The engine formats absolute and workspace-relative references with POSIX separators and absolute fallback behavior when no containing workspace folder applies.

**Requirements:** REF-03, REF-04, REF-05

**Implementation steps:**
1. Implement POSIX path normalization while preserving VS Code-visible path identity.
2. Implement workspace-relative resolution based on the containing workspace folder only.
3. Add absolute fallback behavior for relative mode outside the workspace.
4. Implement the final formatter that combines normalized path output with normalized line output.
5. Add unit tests for POSIX normalization, Windows-style path fixtures, relative path behavior, fallback behavior, and multi-root containment rules.

**Exit checks:**
- Absolute and relative modes use one canonical formatter.
- Output always uses forward slashes.
- Relative mode falls back to absolute output outside a containing workspace folder.

## Risks and Controls

- VS Code editor objects are richer than Phase 1 needs. Keep the contract narrow and test against plain data shapes where possible.
- Workspace-relative behavior can drift in multi-root cases. Resolve against the containing folder only and lock that with fixtures.
- Windows path handling can over-normalize. Normalize separators only and preserve drive-letter form.

## Verification Strategy

- Prefer fast automated tests around pure modules for all phase requirements.
- Use Windows-style and POSIX-style path fixtures in tests regardless of host OS.
- Keep formatter tests at the string-output level so Phase 2 can reuse them unchanged.

## Completion Signal

Phase 1 is complete when both plans pass automated verification and expose a small pure API that Phase 2 command handlers can call directly for absolute and relative copy flows.

---

*Phase: 01-reference-engine*
*Plan created: 2026-04-17*
