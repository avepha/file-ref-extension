# Roadmap: File Reference

## Overview

File Reference reaches MVP by first locking down deterministic file-reference generation, then wiring that behavior into a minimal VS Code command workflow, and finally finishing the packaging and cross-platform verification needed for a public extension release.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Reference Engine** - Deliver correct, deterministic file-reference generation for supported editor states.
- [ ] **Phase 2: Command Workflow** - Make the copy flow accessible from commands and shortcuts with clipboard and notification feedback.
- [ ] **Phase 3: Release Readiness** - Verify cross-platform consistency and package the extension for public distribution.

## Phase Details

### Phase 1: Reference Engine
**Goal**: Users can generate a correct file reference from a supported active editor with deterministic formatting and clear unsupported-state handling.
**Depends on**: Nothing (first phase)
**Requirements**: EDIT-01, EDIT-02, REF-01, REF-02, REF-03, REF-04, REF-05
**Success Criteria** (what must be TRUE):
  1. User can copy an absolute reference as `path:line` from a saved local text file when there is no multi-line selection.
  2. User can copy an absolute reference as `path:start-end` when the selection spans multiple lines.
  3. User can copy a workspace-relative reference for files inside a workspace and still get a valid absolute reference when relative mode is used outside the workspace.
  4. Copied references always use POSIX-style forward slashes and normalized line ranges regardless of OS or selection direction.
  5. User gets a clear failure instead of ambiguous output when the active editor is unsupported.
**Plans**: 2 plans

#### Plan 1.1: Validation and Range Contract
**Outcome**: The project has a pure domain contract for supported editor state checks and deterministic line/range normalization, with tests locking down the output rules before VS Code command wiring begins.
**Covers**: EDIT-01, EDIT-02, REF-01, REF-02, REF-05
**Key work**:
- Scaffold the minimal TypeScript extension project shape needed to build and test pure modules.
- Implement validation helpers for active-editor requirements: saved document, local `file` scheme, and clear unsupported outcomes.
- Implement one normalized line/range helper covering cursor-only, single-line selection, multi-line selection, and reverse selections.
- Add unit tests for supported vs unsupported editor-state inputs and for line/range normalization edge cases.
**Exit checks**:
- Unsupported states return explicit failures instead of partial references.
- Selection direction never changes emitted line or range values.
- Single-line cases always collapse to `path:line`, never `path:start-end`.

#### Plan 1.2: Path Resolution and Reference Formatting
**Outcome**: The pure reference engine can assemble absolute or workspace-relative references with POSIX normalization and absolute fallback behavior, ready to be consumed by command handlers in Phase 2.
**Covers**: REF-03, REF-04, REF-05
**Key work**:
- Implement absolute-path normalization and workspace-relative path resolution using the containing workspace folder only.
- Add fallback logic so relative mode emits an absolute path when no workspace-relative path exists.
- Implement the final formatter that combines normalized path output with the normalized line/range contract.
- Add unit tests for POSIX slash normalization, Windows-style path fixtures, workspace-relative behavior, and outside-workspace fallback.
**Exit checks**:
- Absolute and relative modes share one canonical formatter.
- Output uses forward slashes on every platform.
- Multi-root workspace fixtures prove relative output is based on the containing folder, not workspace order.

### Phase 2: Command Workflow
**Goal**: Users can trigger the copy workflow quickly from standard VS Code entry points and immediately get clipboard and feedback results.
**Depends on**: Phase 1
**Requirements**: ACC-01, ACC-02, ACC-03, CLIP-01, CLIP-02, CLIP-03
**Success Criteria** (what must be TRUE):
  1. User can run both absolute and relative copy commands from the Command Palette.
  2. User can trigger both copy commands with default macOS shortcuts and with default Windows/Linux shortcuts.
  3. A successful command writes the final reference directly to the clipboard with no extra confirmation flow.
  4. User sees a concise success notification after a successful copy and a clear failure notification when the command cannot run.
**Plans**: 2 plans

### Phase 3: Release Readiness
**Goal**: Maintainers can publish the extension confidently, and users get the same core behavior across supported desktop platforms.
**Depends on**: Phase 2
**Requirements**: REL-01, REL-02
**Success Criteria** (what must be TRUE):
  1. Maintainer can package the extension for both VS Code Marketplace and Open VSX using a repeatable release workflow.
  2. Users on macOS, Windows, and Linux get the same reference-formatting and command behavior for the same editor scenario.
  3. The published artifact is suitable for public installation without missing metadata or packaging blockers.
**Plans**: 1 plan

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Reference Engine | 0/2 | Not started | - |
| 2. Command Workflow | 0/2 | Not started | - |
| 3. Release Readiness | 0/1 | Not started | - |
