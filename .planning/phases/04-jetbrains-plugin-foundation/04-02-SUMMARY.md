---
phase: 04-jetbrains-plugin-foundation
plan: 02
subsystem: architecture
tags: [plugin-verifier, compatibility, webstorm, intellij-idea, kotlin]

# Dependency graph
requires:
  - phase: 04-jetbrains-plugin-foundation
    provides: standalone jetbrains-plugin scaffold, patched descriptor baseline, runnable Gradle wrapper
provides:
  - platform-level compatibility declaration in plugin.xml
  - multi-product verifier coverage for IntelliJ IDEA and WebStorm
  - documented JetBrains package boundaries and a local compatibility smoke test
affects: [phase-05, phase-06, jetbrains-compatibility, plugin-architecture]

# Tech tracking
tech-stack:
  added: [IntelliJ Plugin Verifier matrix, Kotlin Gradle plugin 2.3.20 test toolchain]
  patterns: [platform-only dependency posture, verifier-backed compatibility matrix, host-native package boundary documentation]

key-files:
  created: [jetbrains-plugin/docs/architecture.md, jetbrains-plugin/src/test/kotlin/com/avepha/filereference/PluginCompatibilitySmokeTest.kt]
  modified: [jetbrains-plugin/build.gradle.kts, jetbrains-plugin/gradle.properties, jetbrains-plugin/settings.gradle.kts, jetbrains-plugin/src/main/resources/META-INF/plugin.xml]

key-decisions:
  - "Declared only com.intellij.modules.platform so the plugin remains broad across JetBrains IDE families until product-specific APIs are truly needed."
  - "Verified compatibility against both IntelliJ IDEA and WebStorm instead of trusting the default single-product path."
  - "Treated the existing TypeScript implementation as the behavioral spec, but kept JetBrains boundaries native to IntelliJ concepts."

patterns-established:
  - "Compatibility claims must be backed by verifyPlugin matrix checks, not just descriptor intent."
  - "Future JetBrains work should split responsibilities across actions, editor, reference, and platform packages."

requirements-completed: [PLAT-02]

# Metrics
duration: 22 min
completed: 2026-04-18
---

# Phase 4 Plan 02: JetBrains Compatibility Foundation Summary

**The JetBrains plugin now advertises platform-wide compatibility, verifies cleanly against IntelliJ IDEA and WebStorm, and has a documented package map for future feature work**

## Performance

- **Duration:** 22 min
- **Started:** 2026-04-18T09:02:00Z
- **Completed:** 2026-04-18T09:24:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added the platform-level dependency declaration and kept the descriptor free of `until-build` and product-specific module dependencies.
- Configured `verifyPlugin` to consume an explicit IntelliJ IDEA plus WebStorm target matrix from `gradle.properties`.
- Added `jetbrains-plugin/docs/architecture.md` and a local smoke test that protect the future JetBrains package boundaries and compatibility posture.

## Task Commits

No git commits were created during this execution run.

## Files Created/Modified

- `jetbrains-plugin/src/main/resources/META-INF/plugin.xml` - Declares `com.intellij.modules.platform` and keeps the descriptor broad and foundation-only.
- `jetbrains-plugin/gradle.properties` - Pins the verifier IDE matrix and shared plugin metadata.
- `jetbrains-plugin/build.gradle.kts` - Parses the verifier targets and wires them into `verifyPlugin`.
- `jetbrains-plugin/settings.gradle.kts` - Uses Kotlin `2.3.20` so JetBrains `2026.1` test dependencies compile cleanly.
- `jetbrains-plugin/docs/architecture.md` - Maps future JetBrains work into `actions`, `editor`, `reference`, and `platform` packages.
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/PluginCompatibilitySmokeTest.kt` - Guards the platform-only dependency posture locally.

## Decisions Made

- Preserved a broad platform-only dependency posture instead of adding IntelliJ IDEA-specific modules just because IntelliJ is the base runtime.
- Used a small descriptor-focused test rather than any premature end-user action or clipboard behavior in this phase.
- Treated the VS Code TypeScript implementation as the product behavior reference, not as a cross-runtime abstraction to share directly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Upgraded the Kotlin Gradle plugin to 2.3.20 for IntelliJ 2026.1 test compatibility**
- **Found during:** Task 2 (Document and reserve JetBrains-side package boundaries)
- **Issue:** `./gradlew test` failed because IntelliJ `2026.1` ships Kotlin metadata `2.3.0`, while the template-scaffolded Kotlin plugin version was still `2.1.20`.
- **Fix:** Updated `org.jetbrains.kotlin.jvm` in `settings.gradle.kts` to `2.3.20` and reran the test and verifier gates.
- **Files modified:** `jetbrains-plugin/settings.gradle.kts`
- **Verification:** `cd jetbrains-plugin && ./gradlew test`; `cd jetbrains-plugin && ./gradlew verifyPlugin`

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The Kotlin plugin version moved forward to match the target JetBrains platform, which was necessary for the planned compatibility test coverage to work.

## Issues Encountered

- The first `verifyPlugin` run downloaded about 1 GB of verifier artifacts for the IntelliJ IDEA and WebStorm matrix. Subsequent runs should be much cheaper because those inputs are cached locally.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 5 can now implement the JetBrains reference engine on top of a verified multi-product plugin foundation.
- The compatibility model and package ownership are explicit enough to keep future work from drifting into an IntelliJ-only spike.

## Self-Check: PASSED

---
*Phase: 04-jetbrains-plugin-foundation*
*Completed: 2026-04-18*

