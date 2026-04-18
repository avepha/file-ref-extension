---
phase: 08-rename-plugin-and-package-for-clearer-product-positioning
plan: 01
subsystem: distribution
tags: [rename, vscode, jetbrains, marketplace, metadata]
requires:
  - phase: 07-marketplace-readiness
    provides: JetBrains marketplace copy, release docs, and validated packaging baseline
provides:
  - shared public product name across VS Code and JetBrains surfaces
  - renamed VS Code package slug and command namespace
  - renamed JetBrains plugin ID, project name, and marketplace documentation
affects: [distribution, manifests, documentation]
tech-stack:
  added: []
  patterns: [shared public brand with shorter in-editor labels, aligned marketplace slugs across IDEs]
key-files:
  created: []
  modified: [package.json, README.md, README.marketplace.md, src/commands.ts, test/manifest.test.ts, test/release-assets.test.ts, jetbrains-plugin/gradle.properties, jetbrains-plugin/settings.gradle.kts, jetbrains-plugin/src/main/resources/META-INF/plugin.xml, jetbrains-plugin/README.md, jetbrains-plugin/docs/marketplace-listing.md, jetbrains-plugin/docs/marketplace-assets/README.md, jetbrains-plugin/docs/marketplace-submission.md]
key-decisions:
  - "Locked the shared public product name to `Copy File Path with Line Numbers (AI Prompt)` while keeping shorter command and action labels inside the IDEs."
  - "Renamed the VS Code command namespace to `copyFilePathWithLineNumbers` immediately so manifest, runtime constants, and tests stayed aligned."
patterns-established:
  - "Marketplace-facing rename work updates VS Code and JetBrains metadata in the same pass to avoid mixed public identities."
  - "Public naming can stay long and descriptive while technical namespaces and UI labels remain concise."
requirements-completed: []
duration: 3 min
completed: 2026-04-18
---

# Phase 8 Plan 01 Summary

**VS Code and JetBrains now present one shared public name, one aligned set of package/plugin slugs, and shorter in-editor copy actions that match the renamed product.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-04-18T12:55:20.938Z
- **Completed:** 2026-04-18T12:58:30.000Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments

- Renamed the VS Code extension metadata to `copy-file-path-with-line-numbers` and switched command IDs to `copyFilePathWithLineNumbers.*`.
- Rewrote the root README and marketplace README around the new public name and updated listing links to the renamed slug.
- Renamed the JetBrains plugin ID, project name, descriptor copy, action labels, and maintainer-facing marketplace docs to the same shared identity.

## Task Commits

No task-local git commits were created.

The workspace already contained pre-existing untracked planning artifacts and the JetBrains plugin subproject, so the rename changes were intentionally left uncommitted in the working tree instead of bundling unrelated prior work into a misleading Phase 8 commit.

## Files Created/Modified

- `package.json` - Renamed the VS Code package, display name, keywords, and contributed command IDs/titles.
- `README.md` and `README.marketplace.md` - Updated install links, product framing, and command tables for the renamed extension.
- `src/commands.ts`, `test/manifest.test.ts`, and `test/release-assets.test.ts` - Kept runtime constants and manifest/readme checks aligned with the new command namespace.
- `jetbrains-plugin/gradle.properties`, `jetbrains-plugin/settings.gradle.kts`, and `jetbrains-plugin/src/main/resources/META-INF/plugin.xml` - Renamed the JetBrains plugin metadata, project slug, action labels, and descriptor copy.
- `jetbrains-plugin/README.md`, `jetbrains-plugin/docs/marketplace-listing.md`, `jetbrains-plugin/docs/marketplace-assets/README.md`, and `jetbrains-plugin/docs/marketplace-submission.md` - Updated the maintainer and marketplace documentation to the renamed product.

## Decisions Made

- Used the full public name on marketplace and README surfaces, but kept action labels shorter and task-focused inside both IDEs.
- Applied the VS Code command namespace rename during the metadata pass so manifest verification would stay green through the rest of the phase.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration is required for this rename pass.

## Next Phase Readiness

- The public rename contract is now locked across both IDE ecosystems.
- The JetBrains runtime and test package tree can be renamed next without guessing at the final package/plugin identity.

---
*Phase: 08-rename-plugin-and-package-for-clearer-product-positioning*
*Completed: 2026-04-18*
