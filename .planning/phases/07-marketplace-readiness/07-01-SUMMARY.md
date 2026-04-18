---
phase: 07-marketplace-readiness
plan: 01
subsystem: infra
tags: [jetbrains, gradle, marketplace, ci]
requires:
  - phase: 06-jetbrains-action-workflow
    provides: JetBrains copy actions, clipboard workflow, and validated plugin baseline
provides:
  - PyCharm-first Plugin Verifier configuration
  - environment-based signing and publish wiring
  - plugin-local release workflow documentation
  - CI validation for the JetBrains plugin release path
affects: [release, marketplace, ci, documentation]
tech-stack:
  added: []
  patterns: [plugin-local JetBrains release runbook, env-only signing and publish configuration]
key-files:
  created: [jetbrains-plugin/docs/release-workflow.md]
  modified: [jetbrains-plugin/build.gradle.kts, jetbrains-plugin/gradle.properties, jetbrains-plugin/README.md, .github/workflows/release-validation.yml]
key-decisions:
  - "Made PyCharm the default verifier target while keeping the plugin on com.intellij.modules.platform."
  - "Kept signing and future publish configuration environment-driven so validation stays credential-free."
patterns-established:
  - "JetBrains release prep lives under jetbrains-plugin/ and is referenced from repo-root CI as a thin wrapper."
  - "verifyMarketplaceReady is the canonical release-validation command for the plugin."
requirements-completed: [DIST-01, DIST-02, DIST-03]
duration: 14 min
completed: 2026-04-18
---

# Phase 7 Plan 01 Summary

**JetBrains release wiring now builds a Marketplace ZIP, verifies against PyCharm by default, and documents one authoritative validation path for maintainers and CI.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-04-18T11:18:00Z
- **Completed:** 2026-04-18T11:32:14Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Added a `verifyMarketplaceReady` Gradle task that packages and validates the plugin in one command.
- Switched the default verifier target to `pycharm:2026.1` and wired signing and publish inputs through environment variables only.
- Added a plugin-local release runbook and a matching GitHub Actions job that runs the same JetBrains validation commands.

## Task Commits

No task-local git commits were created.

The workspace already contained pre-existing untracked `jetbrains-plugin/` baseline files from earlier phases. To avoid bundling unrelated prior work into a misleading Phase 7 commit, the release-readiness changes were left uncommitted in the working tree.

## Files Created/Modified

- `jetbrains-plugin/build.gradle.kts` - Added PyCharm verifier parsing, env-backed signing/publishing wiring, and `verifyMarketplaceReady`.
- `jetbrains-plugin/gradle.properties` - Set `verifierIdeTargets=pycharm:2026.1` and the default publish host.
- `jetbrains-plugin/docs/release-workflow.md` - Documented the maintainer release path, artifact output, env vars, and dormant publish behavior.
- `jetbrains-plugin/README.md` - Pointed maintainers to the plugin-local release runbook.
- `.github/workflows/release-validation.yml` - Added a JetBrains plugin validation job that runs from `jetbrains-plugin/`.

## Decisions Made

- Kept PyCharm as the default verification gate without changing the plugin's broad IntelliJ Platform compatibility posture.
- Let `publishPlugin` remain dormant until `PUBLISH_TOKEN` is configured instead of forcing credential setup into normal validation.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Verification] Switched ZIP asset verification to JAR-level inspection**
- **Found during:** Task 2 (Document and validate the plugin-local release workflow)
- **Issue:** JetBrains packages `META-INF/plugin.xml` and `pluginIcon*.svg` inside the plugin JAR under the ZIP, so a top-level ZIP grep would miss the packaged assets.
- **Fix:** Verified the built plugin JAR directly with `jar tf build/libs/file-reference-jetbrains-plugin-0.1.0.jar`.
- **Files modified:** None
- **Verification:** `jar tf build/libs/file-reference-jetbrains-plugin-0.1.0.jar | rg 'pluginIcon(_dark)?\.svg|META-INF/plugin.xml'`
- **Committed in:** Not committed

---

**Total deviations:** 1 auto-fixed (verification-path adjustment)
**Impact on plan:** No scope creep. The change kept the asset verification aligned with JetBrains' actual plugin packaging layout.

## Issues Encountered

- `buildSearchableOptions` emitted headless-environment warnings during Gradle runs, but `buildPlugin`, `verifyPluginStructure`, `verifyPlugin`, and `verifyMarketplaceReady` all completed successfully.

## User Setup Required

None - no external service configuration is required to run the validation-only release path.

## Next Phase Readiness

- The JetBrains plugin now has a repeatable build and validation path suitable for Marketplace preparation.
- Listing copy, packaged icons, and manual submission docs can build directly on this release workflow.

---
*Phase: 07-marketplace-readiness*
*Completed: 2026-04-18*
