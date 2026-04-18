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
- [ ] **Phase 4: Verify Reference Engine** - Close Phase 1 audit gaps by restoring requirement-level verification evidence.
- [ ] **Phase 5: Verify Command Workflow** - Close Phase 2 audit gaps by restoring requirement-level verification evidence.
- [ ] **Phase 6: Complete Live Release Validation** - Finish the manual release checks the audit still requires for milestone closure.

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

#### Plan 2.1: Commands, Contributions, and Editor Adapters
**Outcome**: The extension contributes both copy commands, wires them through activation, and adapts VS Code editor/workspace state into the Phase 1 formatter through one shared command path.
**Covers**: ACC-01, ACC-02, ACC-03
**Key work**:
- Add command and keybinding contributions to `package.json` with editor-focused `when` clauses.
- Implement one shared command-use-case path that reads the active editor and workspace folders and requests absolute or relative output from the existing reference engine.
- Register both commands in `src/extension.ts` with minimal mode-specific branching.
- Add tests for command routing, editor/workspace adaptation, and manifest-level contribution assumptions.
**Exit checks**:
- Both commands are discoverable from the Command Palette.
- Default shortcuts are declared for macOS, Windows, and Linux.
- Command handlers do not duplicate formatting logic already locked in Phase 1.

#### Plan 2.2: Clipboard Write and User Feedback Flow
**Outcome**: Successful commands copy the exact final reference to the clipboard and show concise success or failure feedback with no extra confirmation step.
**Covers**: CLIP-01, CLIP-02, CLIP-03
**Key work**:
- Write successful outputs through `vscode.env.clipboard.writeText()`.
- Show concise absolute/relative success notifications after copy completes.
- Surface unsupported editor failures with the clear existing error message.
- Add tests for clipboard writes, notification selection, and no-copy behavior on invalid input.
**Exit checks**:
- Success copies exactly the final formatted string.
- Failures never copy partial output.
- User feedback stays minimal while still satisfying the product requirement.

### Phase 3: Release Readiness
**Goal**: Maintainers can publish the extension confidently, and users get the same core behavior across supported desktop platforms.
**Depends on**: Phase 2
**Requirements**: REL-01, REL-02
**Success Criteria** (what must be TRUE):
  1. Maintainer can package the extension for both VS Code Marketplace and Open VSX using a repeatable release workflow.
  2. Users on macOS, Windows, and Linux get the same reference-formatting and command behavior for the same editor scenario.
  3. The published artifact is suitable for public installation without missing metadata or packaging blockers.
**Plans**: 3 plans

Plans:
- [x] 03-PLAN.md — Package the extension, add release assets, and wire repeatable VSIX validation.
- [x] 03-02-PLAN.md — Align README command/shortcut docs with the shipped manifest and add drift detection.
- [x] 03-03-PLAN.md — Remove high-severity audit findings and enforce audit review in release validation.

### Phase 4: Verify Reference Engine
**Goal**: Close the audit blocker on Phase 1 by adding missing verification evidence for the reference-engine requirements already implemented in the codebase.
**Depends on**: Phase 3 and milestone audit review
**Requirements**: EDIT-01, EDIT-02, REF-01, REF-02, REF-03, REF-04, REF-05
**Gap Closure**: Closes the audit gap created by the missing `01-VERIFICATION.md`
**Success Criteria** (what must be TRUE):
  1. Phase 1 has a `VERIFICATION.md` with explicit requirement-level evidence and verdicts.
  2. `EDIT-01`, `EDIT-02`, and `REF-01` through `REF-05` are no longer orphaned in the milestone audit cross-check.
  3. Verification evidence ties back to the shipped implementation, tests, and planned scope without reopening Phase 1 design work.
**Plans**: 1 planned

#### Plan 4.1: Restore Phase 1 Verification Evidence
**Outcome**: The audit can trace every Phase 1 requirement through requirements mapping, shipped implementation evidence, and a formal verification report.
**Covers**: EDIT-01, EDIT-02, REF-01, REF-02, REF-03, REF-04, REF-05
**Key work**:
- Review the existing Phase 1 plan, summary, tests, and implementation to rebuild the verification record.
- Write `01-VERIFICATION.md` with explicit evidence and final verdicts for each requirement.
- Align any phase status metadata needed so the milestone audit no longer treats Phase 1 as orphaned.
**Exit checks**:
- Phase 1 verification exists and is auditable.
- Every Phase 1 requirement is explicitly covered in the verification report.
- Re-running milestone audit should no longer report missing verification for Phase 1.

### Phase 5: Verify Command Workflow
**Goal**: Close the audit blocker on Phase 2 by adding missing verification evidence for the command, clipboard, and notification requirements already implemented in the codebase.
**Depends on**: Phase 4
**Requirements**: ACC-01, CLIP-01, CLIP-02, CLIP-03
**Gap Closure**: Closes the audit gap created by the missing `02-VERIFICATION.md`
**Success Criteria** (what must be TRUE):
  1. Phase 2 has a `VERIFICATION.md` with explicit requirement-level evidence and verdicts.
  2. `ACC-01` and `CLIP-01` through `CLIP-03` are no longer orphaned in the milestone audit cross-check.
  3. Verification evidence proves the shared command workflow, clipboard writes, and feedback behavior already shipped in the repo.
**Plans**: 1 planned

#### Plan 5.1: Restore Phase 2 Verification Evidence
**Outcome**: The audit can trace the Phase 2 command workflow requirements through requirements mapping, shipped implementation evidence, and a formal verification report.
**Covers**: ACC-01, CLIP-01, CLIP-02, CLIP-03
**Key work**:
- Review the existing Phase 2 plan, summary, tests, and implementation to rebuild the verification record.
- Write `02-VERIFICATION.md` with explicit evidence and final verdicts for each requirement.
- Align any phase status metadata needed so the milestone audit no longer treats Phase 2 as orphaned.
**Exit checks**:
- Phase 2 verification exists and is auditable.
- Every Phase 2 requirement in scope is explicitly covered in the verification report.
- Re-running milestone audit should no longer report missing verification for Phase 2.

### Phase 6: Complete Live Release Validation
**Goal**: Finish the remaining human-only release validation so the milestone audit can clear the live publish and live host behavior requirements.
**Depends on**: Phase 5
**Requirements**: ACC-02, ACC-03, REL-01, REL-02
**Gap Closure**: Closes the remaining Phase 2 -> Phase 3 integration gap, the live host smoke-test flow gap, and the credentialed publish gap
**Success Criteria** (what must be TRUE):
  1. Live VS Code host validation is recorded for command palette, default keybindings, clipboard behavior, and notifications on supported desktop platforms.
  2. Remote/UI-host placement expectations are confirmed and documented for the shipped extension.
  3. Marketplace and Open VSX publish validation is completed with maintainer credentials and captured in verification artifacts.
  4. Phase 3 verification no longer leaves `REL-01` or `REL-02` in a human-needed state.
**Plans**: 1 planned

#### Plan 6.1: Close Live Validation And Publish Gaps
**Outcome**: The release workflow has the manual evidence the audit requires to treat cross-platform behavior and real publishing as satisfied instead of partial.
**Covers**: ACC-02, ACC-03, REL-01, REL-02
**Key work**:
- Run and record live extension-host smoke checks across supported platforms.
- Verify default shortcut behavior, clipboard integration, and success/failure notifications in real VS Code hosts.
- Execute credentialed Marketplace and Open VSX publish validation and record outcomes.
- Update release verification artifacts and checklist evidence to remove the remaining human-needed audit gaps.
**Exit checks**:
- Audit evidence exists for the live host behavior requirements.
- Publish validation has real registry evidence, not just packaging proof.
- Re-running milestone audit should no longer report the current Phase 3 partials or related integration gaps.

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Reference Engine | 2/2 | Complete | 2026-04-17 |
| 2. Command Workflow | 2/2 | Complete | 2026-04-17 |
| 3. Release Readiness | 3/3 | Complete | 2026-04-17 |
| 4. Verify Reference Engine | 1/1 | Complete | 2026-04-18 |
| 5. Verify Command Workflow | 0/1 | Pending | - |
| 6. Complete Live Release Validation | 0/1 | Pending | - |
