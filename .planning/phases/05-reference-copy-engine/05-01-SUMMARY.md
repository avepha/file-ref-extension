---
phase: 05-reference-copy-engine
plan: 01
subsystem: editor-boundary
tags: [jetbrains, editor, selection-normalization]
requirements_completed: [EDIT-01, EDIT-02]
---

# Phase 5 Plan 01: Editor Boundary and Line Normalization Summary

The JetBrains reference engine now has a narrow editor boundary that accepts only supported local-file editors, rejects multi-caret and non-local states explicitly, and converts editor data into immutable snapshot values before formatting begins.

## Accomplishments

- Added plain Kotlin snapshot and unsupported-state contracts in `EditorSnapshot.kt`.
- Implemented `validateEditorInput()` so the JetBrains-specific boundary stops IntelliJ runtime objects at the `editor` package and carries only `documentPath`, `selection`, and `containingRootPaths` forward.
- Added pure line and range normalization in `SelectionLineNormalizer.kt`, matching the existing TypeScript behavior for same-line, reverse-selection, and end-at-column-zero cases.
- Added platform-backed guard tests plus pure normalization parity tests.

## Verification

- `cd jetbrains-plugin && ./gradlew test --tests com.avepha.filereference.editor.EditorInputGuardsTest --tests com.avepha.filereference.reference.SelectionLineNormalizerTest`

## Files Created

- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/editor/EditorSnapshot.kt`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/editor/EditorInputGuards.kt`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/reference/SelectionLineNormalizer.kt`
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/editor/EditorInputGuardsTest.kt`
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/reference/SelectionLineNormalizerTest.kt`

## Task Commits

No git commits were created during this execution run.

## Self-Check: PASSED
