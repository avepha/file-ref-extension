---
phase: 05-reference-copy-engine
plan: 02
subsystem: reference-formatting
tags: [jetbrains, path-resolution, formatting]
requirements_completed: [REF-01, REF-02, REF-03, REF-04, REF-05]
---

# Phase 5 Plan 02: Path Resolution and Reference Builder Summary

The pure JetBrains reference package now resolves absolute versus project-relative paths, normalizes separators to POSIX output, assembles the final `path:line` and `path:start-end` strings, and reports when relative mode falls back to absolute output.

## Accomplishments

- Added `ReferencePathResolver.kt` with deterministic containing-root matching, deepest-root selection, Windows-style path handling, UNC normalization, and explicit absolute fallback.
- Added `FileReferenceBuilder.kt` as the single final assembly entry point for Phase 5, consuming the editor snapshot from Plan 01 and reporting the effective output mode.
- Added resolver and builder tests covering absolute output, relative output, nested roots, Windows-like paths, and relative-to-absolute fallback.

## Verification

- `cd jetbrains-plugin && ./gradlew test --tests com.avepha.filereference.reference.ReferencePathResolverTest --tests com.avepha.filereference.reference.FileReferenceBuilderTest`

## Files Created

- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/reference/ReferencePathResolver.kt`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/reference/FileReferenceBuilder.kt`
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/reference/ReferencePathResolverTest.kt`
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/reference/FileReferenceBuilderTest.kt`

## Task Commits

No git commits were created during this execution run.

## Self-Check: PASSED
