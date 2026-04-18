# Phase 5: Reference Copy Engine - Patterns

**Generated:** 2026-04-18
**Purpose:** Repo pattern map for planning the JetBrains reference copy engine

## File Classification

| Likely File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/editor/EditorInputGuards.kt` | utility | request-response | `src/guards.ts:15-39` | exact |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/editor/EditorSnapshot.kt` | model | transform | `src/contracts.ts:1-55` | role-match |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/reference/SelectionLineNormalizer.kt` | utility | transform | `src/range.ts:17-40` | exact |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/reference/ReferencePathResolver.kt` | utility | transform | `src/path.ts:47-68` | exact |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/reference/FileReferenceBuilder.kt` | service | request-response | `src/reference.ts:29-52` | exact |
| `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/reference/FileReferenceBuilderTest.kt` | test | transform | `src/reference.ts:17-52` | role-match |

## Reusable Patterns

- Preserve the host boundary from `src/workflow.ts:94-141`: adapt host editor/project objects once, then call pure reference-building logic with plain data. In JetBrains, `actions` and `platform` stay out of `reference`; `editor` extracts snapshots and `reference` formats output.
- Preserve the guard shape from `src/guards.ts:15-39`: fail fast, return a structured success/failure result, and keep one clear default unsupported message. Port the behavior, not the VS Code runtime fields.
- Preserve the range normalization from `src/range.ts:17-40` almost verbatim: sort anchor/active first, treat a zero-width caret as a single line, and collapse a multi-line selection ending at column `0` onto the previous line.
- Preserve the path resolution from `src/path.ts:47-68`: absolute mode short-circuits, relative mode chooses the deepest containing root, and failure to resolve relative output falls back to normalized absolute output.
- Preserve final assembly from `src/reference.ts:29-52`: compute `effectiveMode` after path resolution, then build the final `path:line` or `path:start-end` string in one place.

## Host Boundary To Preserve

- `src/contracts.ts:1-55` is a useful behavior sketch, but not a shared abstraction. JetBrains should use Kotlin data classes under `com.avepha.filereference.editor` or `com.avepha.filereference.reference` instead of recreating `EditorLike`, `DocumentLike`, or `WorkspaceFolderLike` by name.
- `src/workflow.ts:42-92` shows the correct seam: convert host objects into plain shapes before calling core logic. The JetBrains equivalent should convert `Editor`, `Document`, selection/caret state, and project roots into snapshots, then stop passing IntelliJ runtime objects across the boundary.
- `src/commands.ts:1-2` stays host-owned. Phase 5 should not pull action IDs, notifications, or clipboard concerns into the reference engine.

## Likely Kotlin Ownership

- `com.avepha.filereference.editor`: editor-state guards, document locality checks, diff/viewer rejection, selection snapshot extraction, project/content-root lookup.
- `com.avepha.filereference.reference`: normalized line output model, line/range normalization, POSIX path normalization, relative-vs-absolute resolution, final reference formatting, effective-mode fallback.
- `com.avepha.filereference.actions`: out of scope for Phase 5 except as a future caller of the editor/reference boundary.
- `com.avepha.filereference.platform`: out of scope for Phase 5 except for any thin helper needed to read JetBrains project/content-root information without leaking platform APIs into reference formatting code.

## Planning Cautions

- Do not port VS Code assumptions literally. `uri.scheme`, `fsPath`, untitled semantics, and workspace-folder semantics are host-specific; only the resulting behavior is shared.
- Do not skip reverse-selection handling. JetBrains caret APIs can report lead/anchor differently from VS Code, but Phase 5 still needs deterministic `start <= end` normalization before formatting.
- Do not replace deepest-root resolution with a single project base path. The VS Code implementation chooses the longest containing folder; JetBrains should use the closest containing project/content root for the same behavior.
- Do not let relative mode emit empty or ambiguous output. Preserve the `src/path.ts:62-67` fallback to absolute output when relative resolution is impossible or empty.
- Do not move clipboard, notifications, or action text into Phase 5. That belongs to the Phase 6 workflow layer.
- Do not create a fake cross-host runtime shared between TypeScript and Kotlin. Phase 4 already established that the TypeScript engine is the behavioral spec, not a portable runtime.

## No Direct Analog

- JetBrains-specific editor/project extraction has no direct Kotlin analog yet. Follow `jetbrains-plugin/docs/architecture.md` for package placement and use the VS Code files above only as behavior specs.

---
*Phase: 05-reference-copy-engine*
*Patterns created: 2026-04-18*
