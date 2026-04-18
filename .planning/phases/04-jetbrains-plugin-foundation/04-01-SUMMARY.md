---
phase: 04-jetbrains-plugin-foundation
plan: 01
subsystem: infra
tags: [jetbrains, intellij-platform, gradle, wrapper, plugin-xml]

# Dependency graph
requires:
  - phase: 03-release-readiness
    provides: packaging discipline, verification-first workflow, public-release metadata patterns
provides:
  - standalone jetbrains-plugin Gradle project
  - checked-in Gradle wrapper and IntelliJ Platform build configuration
  - patched plugin descriptor baseline and local developer task docs
affects: [phase-04-02, phase-05, jetbrains-build, plugin-runtime]

# Tech tracking
tech-stack:
  added: [IntelliJ Platform Gradle Plugin 2.14.0, Gradle Wrapper 9.0.0, Kotlin Gradle plugin 2.3.20]
  patterns: [isolated JetBrains subproject, Gradle-patched plugin metadata, local IDE sandbox verification]

key-files:
  created: [jetbrains-plugin/settings.gradle.kts, jetbrains-plugin/build.gradle.kts, jetbrains-plugin/gradle.properties, jetbrains-plugin/gradle/wrapper/gradle-wrapper.properties, jetbrains-plugin/src/main/resources/META-INF/plugin.xml, jetbrains-plugin/README.md]
  modified: [jetbrains-plugin/.gitignore, jetbrains-plugin/gradlew, jetbrains-plugin/gradlew.bat, jetbrains-plugin/gradle/wrapper/gradle-wrapper.jar]

key-decisions:
  - "Kept the JetBrains implementation in jetbrains-plugin/ so the existing npm/esbuild VS Code release flow stays untouched."
  - "Patched plugin version and since-build through Gradle instead of duplicating mutable release metadata in plugin.xml."
  - "Used a checked-in Gradle wrapper because no system Gradle is available in the repo contract."

patterns-established:
  - "JetBrains foundation lives in its own Gradle project with its own wrapper and repo-local README."
  - "Descriptor source stays minimal while Gradle owns mutable compatibility/version patching."

requirements-completed: [PLAT-01]

# Metrics
duration: 24 min
completed: 2026-04-18
---

# Phase 4 Plan 01: JetBrains Plugin Scaffold Summary

**A standalone JetBrains plugin project now builds, validates, and resolves a development sandbox without touching the shipped VS Code toolchain**

## Performance

- **Duration:** 24 min
- **Started:** 2026-04-18T08:58:00Z
- **Completed:** 2026-04-18T09:22:00Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments

- Added a self-contained `jetbrains-plugin/` Gradle project with the IntelliJ Platform Gradle Plugin, Java 21 toolchain, and checked-in wrapper files.
- Wired the descriptor baseline so plugin version and `since-build` are patched from Gradle properties instead of drifting in `plugin.xml`.
- Documented the exact local JetBrains development commands and verified `tasks --all`, `buildPlugin`, `verifyPluginProjectConfiguration`, `verifyPluginStructure`, and `runIde --dry-run`.

## Task Commits

No git commits were created during this execution run.

## Files Created/Modified

- `jetbrains-plugin/settings.gradle.kts` - Configures the JetBrains settings plugin, Foojay toolchain resolver, and repository management.
- `jetbrains-plugin/build.gradle.kts` - Defines the IntelliJ Platform target, Java/Kotlin toolchains, patched descriptor metadata, and wrapper settings.
- `jetbrains-plugin/gradle.properties` - Stores mutable plugin metadata and target platform properties.
- `jetbrains-plugin/gradlew` - Unix Gradle wrapper entrypoint.
- `jetbrains-plugin/gradlew.bat` - Windows Gradle wrapper entrypoint.
- `jetbrains-plugin/gradle/wrapper/gradle-wrapper.properties` - Pins the wrapper distribution.
- `jetbrains-plugin/gradle/wrapper/gradle-wrapper.jar` - Enables wrapper execution without a local Gradle install.
- `jetbrains-plugin/src/main/resources/META-INF/plugin.xml` - Defines the stable plugin identity and description baseline.
- `jetbrains-plugin/README.md` - Documents the local JetBrains build and run commands.
- `jetbrains-plugin/.gitignore` - Ignores Gradle and IntelliJ Platform cache output created by local verification.

## Decisions Made

- Used `jetbrains-plugin/` as an isolated build boundary instead of introducing root Gradle files or npm script coupling.
- Left the descriptor foundation-only with no actions or product-specific modules in this first scaffold.
- Added a local `.gitignore` for Gradle and IntelliJ cache directories so verification output does not pollute the repo.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Moved the wrapper target from Gradle 8.13 to 9.0.0**
- **Found during:** Task 1 (Scaffold the standalone JetBrains Gradle project)
- **Issue:** `org.jetbrains.intellij.platform` `2.14.0` failed during wrapper generation and reported that it requires Gradle `9.0.0` or newer in practice.
- **Fix:** Updated the wrapper target to `9.0.0`, regenerated the wrapper, and re-ran the scaffold verifications.
- **Files modified:** `jetbrains-plugin/gradle.properties`, `jetbrains-plugin/gradlew`, `jetbrains-plugin/gradlew.bat`, `jetbrains-plugin/gradle/wrapper/gradle-wrapper.properties`, `jetbrains-plugin/gradle/wrapper/gradle-wrapper.jar`
- **Verification:** `cd jetbrains-plugin && ./gradlew tasks --all`; `cd jetbrains-plugin && ./gradlew buildPlugin verifyPluginProjectConfiguration verifyPluginStructure`; `cd jetbrains-plugin && ./gradlew runIde --dry-run`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The wrapper version moved forward, but the project stayed within the intended modern JetBrains toolchain baseline and all plan-level verifications passed.

## Issues Encountered

- The first verification pass surfaced an additional `.intellijPlatform/` cache directory that needed to be ignored locally for a clean verifier configuration.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- The project can now launch the JetBrains development sandbox, build a distributable archive, and run structure/config validation from `jetbrains-plugin/`.
- Phase 04-02 can build directly on this scaffold to lock the compatibility posture and reserve source-package boundaries.

## Self-Check: PASSED

---
*Phase: 04-jetbrains-plugin-foundation*
*Completed: 2026-04-18*

