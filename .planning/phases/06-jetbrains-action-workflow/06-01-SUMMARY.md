---
phase: 06-jetbrains-action-workflow
plan: 01
subsystem: actions
tags: [jetbrains, actions, clipboard]
requirements_completed: [ACC-01, ACC-02, CLIP-01]
---

# Phase 6 Plan 01: JetBrains Action Registration and Clipboard Workflow Summary

The JetBrains plugin now exposes absolute and relative File Reference actions through standard IDE discovery surfaces, applies the shared supported-editor guard at action-update time, and routes supported invocations into a single clipboard workflow built on the Phase 5 reference engine.

## Accomplishments

- Registered paired absolute and relative File Reference actions in `plugin.xml` with stable IDs, Find Action aliases, editor popup placement, Tools menu placement, and default plus macOS shortcut metadata.
- Added a thin shared `CopyReferenceAction` base plus concrete absolute and relative action entrypoints that stay stateless and reuse `validateEditorInput()` for visibility and enablement.
- Added `JetBrainsCopyReferenceWorkflow.kt` so action execution validates the current editor, builds the final reference through `buildFileReference()`, and writes the copied value to the system clipboard.
- Added focused JetBrains tests for descriptor registration, action update behavior, and absolute/relative/fallback clipboard execution.

## Verification

- `cd jetbrains-plugin && ./gradlew test --tests com.avepha.filereference.actions.CopyReferenceActionRegistrationTest --tests com.avepha.filereference.actions.CopyReferenceActionUpdateTest --tests com.avepha.filereference.platform.JetBrainsCopyReferenceWorkflowTest`

## Files Created

- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/actions/CopyReferenceAction.kt`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/actions/CopyAbsoluteReferenceAction.kt`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/actions/CopyRelativeReferenceAction.kt`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/platform/JetBrainsCopyReferenceWorkflow.kt`
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/actions/CopyReferenceActionRegistrationTest.kt`
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/actions/CopyReferenceActionUpdateTest.kt`
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/platform/JetBrainsCopyReferenceWorkflowTest.kt`

## Files Modified

- `jetbrains-plugin/src/main/resources/META-INF/plugin.xml`

## Task Commits

No git commits were created during this execution run.

## Self-Check: PASSED
