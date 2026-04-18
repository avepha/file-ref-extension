# Phase 5: Reference Copy Engine - Research

**Researched:** 2026-04-18
**Domain:** JetBrains editor validation, selection normalization, path resolution, and deterministic reference formatting
**Confidence:** HIGH

<user_constraints>
## User Constraints

No `05-CONTEXT.md` exists for this phase, so implementation details remain at the agent's discretion unless already locked by roadmap, requirements, or prior phase artifacts.

Constraints inferred from roadmap, requirements, and prior phase output:
- Preserve the shipped File Reference contract: deterministic `path:line` / `path:start-end` output with POSIX-style slashes and explicit unsupported-state failures.
- Keep Phase 5 focused on the JetBrains-side reference engine only. Do not add action registration, clipboard writes, notifications, or marketplace work here.
- Preserve the broad JetBrains compatibility posture established in Phase 4 by avoiding IntelliJ IDEA-only APIs unless clearly required.
- Treat the current TypeScript implementation as the behavioral spec, not as a runtime abstraction to share directly.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Active editor and file validation | `editor` package | `actions` caller | JetBrains editor/project/runtime objects should be converted to a small snapshot before reference formatting starts. |
| Line/range normalization | `reference` package | `editor` snapshot model | This is pure behavior and should mirror the existing TypeScript rules without JetBrains UI dependencies. |
| Absolute vs project-relative path resolution | `reference` package | `editor`/`platform` root lookup helper | The engine should consume a document path plus containing roots, then decide relative fallback deterministically. |
| Project membership/root lookup | `editor` or `platform` package | IntelliJ project model APIs | JetBrains project/content-root discovery is host-specific and should stay outside the formatting core. |
| Reference-engine verification | JetBrains test layer | current TypeScript implementation as behavior oracle | Phase 5 should lock parity with contract-style tests before Phase 6 adds UI and clipboard surfaces. |
</architectural_responsibility_map>

<research_summary>
## Summary

JetBrains gives the plugin the active text editor through `CommonDataKeys.EDITOR` in an action context, and the plugin can also obtain the current project from the same event. Official docs also point to `FileEditorManager` for generic selected-editor access. For file-backed validation, JetBrains represents open files as `VirtualFile` instances, and the docs explicitly note that virtual files can come from multiple file systems, not only the local file system. That means Phase 5 should not assume every editor-backed file maps to a local on-disk path.

The safest Phase 5 design is a thin JetBrains adapter around a pure reference engine. The adapter should validate that there is an editor, a project-aware context when needed, and a local physical file before building a reference. The reference engine should then operate on plain values: document path, normalized selection snapshot, and candidate containing roots. This mirrors the existing TypeScript split between `guards.ts`, `range.ts`, `path.ts`, and `reference.ts`.

Selection behavior should stay contract-first. JetBrains documents that editor logical positions are zero-based, matching the current VS Code implementation model, and that multiple carets each carry their own selection. Because File Reference produces exactly one string per invocation, multi-caret handling is a design risk: using the primary caret silently would be deterministic but surprising, while supporting all carets would change the product contract. The safer Phase 5 recommendation is to treat multi-caret state as unsupported unless the implementation can prove that only one effective selection is active. This is an inference from product constraints, not an explicit JetBrains requirement.

For relative output, JetBrains project docs recommend `ProjectFileIndex` when checking whether a file belongs to the project and when retrieving a content root. That lines up well with the current VS Code behavior of selecting the deepest containing workspace folder. Phase 5 should therefore resolve relative paths from the closest containing content root and fall back to normalized absolute output when no containing root exists. This keeps `REF-03` and `REF-04` aligned with the shipped behavior without collapsing the logic to a single project base path.

**Primary recommendation:** Implement Phase 5 as two executable plans: first, build editor/file guards plus line/range normalization with contract tests; second, build content-root-based path resolution plus final `path:line` / `path:start-end` formatting with absolute fallback and parity-focused tests.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| IntelliJ Platform editor APIs | existing Phase 4 baseline | Active editor, caret, selection, and document access | Official JetBrains path for editor-backed plugin behavior. |
| `VirtualFile` / VFS APIs | existing Phase 4 baseline | Resolve the backing file and distinguish local files from non-local/in-memory VFS entries | JetBrains docs explicitly frame file access through VFS, not raw `java.io.File`. |
| `ProjectRootManager` / `ProjectFileIndex` | existing Phase 4 baseline | Detect project membership and resolve containing content roots | Official docs use these APIs to check whether a file belongs to a project and to fetch content/source roots. |
| Kotlin/JUnit test stack already configured in `jetbrains-plugin/` | existing repo baseline | Contract tests for guard, range, and path behavior | Already present in the project and sufficient for pure behavior coverage. |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `BasePlatformTestCase` | Project-backed plugin tests | Use when tests need a real IntelliJ project/editor fixture rather than plain pure-function assertions. |
| `IdeaTestFixtureFactory` | Lower-level custom fixtures | Use only if `BasePlatformTestCase` becomes too rigid for editor-state scenarios. |
| Starter/Driver integration tests | IDE-startup or UI-level verification | Defer until Phase 6 or later; Phase 5 should stay mostly unit/light-platform focused. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `ProjectFileIndex` content-root lookup | single project base path | Simpler, but wrong for multi-root projects and less faithful to current deepest-containing-folder behavior. |
| pure Kotlin data models | direct use of `Editor`, `Document`, and `VirtualFile` throughout | Faster to start, but harder to test and too leaky across host boundaries. |
| fail on multi-caret | use primary caret only | Simpler runtime path, but risks silently ignoring user selections and producing surprising output. |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Pattern 1: Snapshot JetBrains state once, then switch to pure logic
**What:** Convert the JetBrains `Editor`, `VirtualFile`, and project-root information into a small immutable snapshot before invoking reference logic.
**When to use:** For any action flow that ultimately needs deterministic string output and testable behavior.
**Why:** This preserves the current product pattern from `src/workflow.ts` and keeps host APIs out of normalization/formatting code.

### Pattern 2: Mirror the TypeScript engine structure, not the TypeScript types
**What:** Keep separate Kotlin units for guard validation, range normalization, path resolution, and final reference assembly.
**When to use:** When porting the shipped behavior into JetBrains.
**Why:** The repo already proved this split is understandable, testable, and stable across platforms.

### Pattern 3: Use content-root-relative resolution, then explicit absolute fallback
**What:** Ask `ProjectFileIndex` for the file's containing content root; if none exists, emit normalized absolute output even in relative mode.
**When to use:** For `REF-03` and `REF-04`.
**Why:** This best matches the current longest-containing-folder semantics while respecting JetBrains project modeling.

### Pattern 4: Keep Phase 5 verification mostly at the engine boundary
**What:** Prefer pure behavior tests plus one or two light platform tests proving that JetBrains editor/file snapshots are extracted correctly.
**When to use:** In this phase before actions, clipboard, and notifications are wired.
**Why:** It gives strong parity coverage without prematurely expanding into Phase 6 UI flow.

### Anti-Patterns to Avoid
- **Project-base-path shortcut:** Do not compute relative output only from a single base directory; it weakens multi-root behavior and breaks parity with the current containing-folder logic.
- **VFS blind spots:** Do not assume every editor file is local and saved. JetBrains docs explicitly allow non-local and in-memory virtual files.
- **Host leakage into pure logic:** Do not thread `Editor`, `Document`, or `VirtualFile` through the whole engine.
- **Silent multi-caret truncation:** Do not implicitly use whichever caret JetBrains marks primary without documenting and testing the choice.
- **Clipboard/notification drift:** Do not let Phase 5 absorb success/error messaging or clipboard writes; those belong to Phase 6.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Active-editor discovery | Custom global editor tracking | `CommonDataKeys.EDITOR` / `FileEditorManager` | JetBrains already exposes the active editor through official action and editor APIs. |
| Project membership checks | Manual parent-directory walking only | `ProjectFileIndex` content-root lookup | Official APIs already encode project/content-root membership rules. |
| IDE-level verification for every rule | Full UI/integration suite first | unit + light platform tests | Phase 5 is mostly pure logic; heavy tests would slow iteration for limited benefit. |
| Relative-path formatting semantics | Ad hoc string slicing | explicit root lookup + normalization helper | The current product contract depends on deterministic fallback and separator normalization. |

**Key insight:** JetBrains provides the host-specific editor, file, and project metadata. The plugin should consume those APIs and keep the actual reference rules small, explicit, and easy to compare against the shipped TypeScript engine.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Treating any `VirtualFile` as a supported local file
**What goes wrong:** The plugin copies references for scratch, temporary, archive, or other non-local VFS-backed files that do not meet the product promise.
**Why it happens:** IntelliJ editors can be backed by more than the local file system.
**How to avoid:** Guard on a real backing `VirtualFile` and explicitly reject non-local/in-memory cases before formatting.
**Warning signs:** Tests pass for normal project files but the action still appears usable in preview, scratch, or generated editor contexts.

### Pitfall 2: Losing the end-at-column-zero rule during range normalization
**What goes wrong:** A selection that ends at column `0` on the next line is formatted as an extra line in the range.
**Why it happens:** JetBrains selections are easy to convert directly to start/end lines without applying the same normalization as `src/range.ts`.
**How to avoid:** Port the current normalization rule directly and cover it with parity tests.
**Warning signs:** A selection from line 3 into the start of line 5 prints `3-5` instead of `3-4`.

### Pitfall 3: Collapsing project-relative output to one project root
**What goes wrong:** Files under nested or module-specific roots get longer or wrong relative paths.
**Why it happens:** The implementation uses only project base path instead of the closest containing root.
**How to avoid:** Query content roots and choose the deepest containing root, matching the current workspace-folder semantics.
**Warning signs:** Module files in nested roots produce paths starting with module directories that the user did not expect.

### Pitfall 4: Letting multi-caret behavior stay accidental
**What goes wrong:** The plugin copies a reference based on whichever caret JetBrains considers primary, without any explicit product decision.
**Why it happens:** Many editor APIs default to the primary caret and selection.
**How to avoid:** Decide deliberately in planning: reject multi-caret as unsupported for deterministic single-reference output, or add explicit documented support later.
**Warning signs:** Tests cover only single-caret editors while manual testing with multiple carets yields unpredictable output.

### Pitfall 5: Mixing JetBrains extraction logic with formatting logic
**What goes wrong:** Small behavior changes require platform fixtures instead of cheap pure tests, slowing future iteration.
**Why it happens:** It feels convenient to pass `Editor` and `Project` straight into the formatter.
**How to avoid:** Freeze the boundary early with snapshot/value objects.
**Warning signs:** Even line normalization tests require an IDE fixture.
</common_pitfalls>

<verification_strategy>
## Verification Strategy

- Cover guard rules with light platform tests or adapter tests that exercise: no editor, non-local/in-memory file, and any explicitly unsupported editor state.
- Cover line normalization with pure Kotlin tests mirroring `src/range.ts`, including reversed selection order, zero-width caret, multi-line selection, and the end-at-column-zero collapse.
- Cover path resolution with pure tests for absolute mode, deepest-containing-root relative mode, and fallback-to-absolute when no root matches.
- Add final assembly tests for `path:line`, `path:start-end`, and `effectiveMode` fallback from relative to absolute.
- Keep Phase 5 verification separate from clipboard/notifications; those should wait for Phase 6 action workflow testing.
</verification_strategy>

<proposed_plan_split>
## Proposed Plan Split

### Plan 05-01
Implement JetBrains editor/file guards, snapshot extraction, and selection line/range normalization with parity-focused tests.

### Plan 05-02
Implement path resolution, POSIX normalization, final reference assembly, and relative-to-absolute fallback with content-root-aware tests.
</proposed_plan_split>

## Sources

Primary JetBrains sources:
- https://plugins.jetbrains.com/docs/intellij/editors.html
- https://plugins.jetbrains.com/docs/intellij/working-with-text.html
- https://plugins.jetbrains.com/docs/intellij/coordinates-system.html
- https://plugins.jetbrains.com/docs/intellij/multiple-carets.html
- https://plugins.jetbrains.com/docs/intellij/virtual-file.html
- https://plugins.jetbrains.com/docs/intellij/project.html
- https://plugins.jetbrains.com/docs/intellij/module.html
- https://plugins.jetbrains.com/docs/intellij/tests-and-fixtures.html
- https://plugins.jetbrains.com/docs/intellij/integration-tests-intro.html

Repo-local behavior and architecture sources:
- `.planning/ROADMAP.md`
- `.planning/REQUIREMENTS.md`
- `.planning/phases/04-jetbrains-plugin-foundation/04-RESEARCH.md`
- `.planning/phases/04-jetbrains-plugin-foundation/04-PATTERNS.md`
- `.planning/phases/04-jetbrains-plugin-foundation/04-01-SUMMARY.md`
- `.planning/phases/04-jetbrains-plugin-foundation/04-02-SUMMARY.md`
- `jetbrains-plugin/docs/architecture.md`
- `src/guards.ts`
- `src/range.ts`
- `src/path.ts`
- `src/reference.ts`
- `src/workflow.ts`

---
*Phase: 05-reference-copy-engine*
*Research created: 2026-04-18*
