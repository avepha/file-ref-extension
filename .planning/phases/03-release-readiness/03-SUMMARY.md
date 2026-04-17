---
phase: 03-release-readiness
plan: 03
subsystem: infra
tags: [vsce, ovsx, github-actions, packaging, vscode-extension]

# Dependency graph
requires:
  - phase: 02-command-workflow
    provides: shared command flow, clipboard integration, manifest command contracts
provides:
  - public release metadata and assets for Marketplace/Open VSX publication
  - repeatable release validation and VSIX hygiene enforcement
  - cross-platform CI coverage and manual smoke verification guidance
affects: [publishing, distribution, release-operations]

# Tech tracking
tech-stack:
  added: [@vscode/vsce, ovsx, GitHub Actions]
  patterns: [release-check pipeline, VSIX archive inspection, cross-platform smoke matrix]

key-files:
  created: [.github/workflows/release-validation.yml, CHANGELOG.md, LICENSE, docs/release-checklist.md, media/icon.png, scripts/inspect-vsix.js]
  modified: [package.json, README.md, .vscodeignore, test/manifest.test.ts, test/release-assets.test.ts]

key-decisions:
  - "Keep release validation on one npm entrypoint so build, tests, packaging, and VSIX inspection stay repeatable."
  - "Enforce packaging hygiene with both .vscodeignore rules and an archive inspection step so accidental dev-file regressions fail fast."

patterns-established:
  - "Release gate: npm run release:check must pass before packaging or publish attempts."
  - "Artifact hygiene: inspect the generated VSIX instead of assuming ignore rules are correct."

requirements-completed: [REL-01, REL-02]

# Metrics
duration: 12 min
completed: 2026-04-17
---

# Phase 3 Plan 03: Release Readiness Summary

**Marketplace/Open VSX release metadata, repeatable packaging scripts, and automated VSIX hygiene checks for a publishable File Reference extension**

## Performance

- **Duration:** 12 min
- **Started:** 2026-04-17T04:24:00Z
- **Completed:** 2026-04-17T04:35:52Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments
- Added the public-release assets, metadata, publish scripts, and CI validation needed to package the extension for Marketplace and Open VSX.
- Documented the maintainer release checklist and a macOS/Windows/Linux smoke matrix for command, clipboard, and formatting consistency.
- Closed a packaging bug by excluding editor/dev files from the VSIX and enforcing archive inspection in `release:check`.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add release metadata, assets, and validation workflow** - `c65131d` (feat)
2. **Task 2: Tighten VSIX packaging hygiene** - `01412d8` (fix)

**Plan metadata:** recorded in the final `docs(03-03)` commit for planning artifacts

## Files Created/Modified
- `.github/workflows/release-validation.yml` - Runs build/test coverage on macOS, Windows, and Linux and packages a VSIX on Linux.
- `package.json` - Adds publish/package scripts, release validation entrypoints, and Marketplace metadata.
- `.vscodeignore` - Excludes non-runtime files from the shipped VSIX.
- `scripts/inspect-vsix.js` - Fails release validation if dev-only files leak into the packaged archive.
- `README.md` - Documents commands, shortcuts, supported states, and maintainer release commands.
- `docs/release-checklist.md` - Captures credential prerequisites, publish steps, and cross-platform smoke checks.
- `CHANGELOG.md` - Records the initial public-release entry.
- `LICENSE` - Adds the MIT license required for distribution.
- `media/icon.png` - Supplies the required Marketplace/Open VSX icon asset.
- `test/manifest.test.ts` - Locks release metadata and release script expectations.
- `test/release-assets.test.ts` - Verifies required release assets and workflow files exist.

## Decisions Made
- Kept release automation on npm scripts already anchored in the repo so packaging stays lightweight and understandable for future contributors.
- Added explicit VSIX archive inspection rather than relying only on `.vscodeignore`, because local packaging showed editor workspace files still leaking into the artifact.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed leaked editor workspace files from the VSIX**
- **Found during:** Task 2 (full release validation)
- **Issue:** `vsce package` still included `.vscode/launch.json` and `test-workspace.code-workspace`, which violated the plan's VSIX hygiene requirement.
- **Fix:** Added `.vscode/**` and `scripts/**` ignore rules, created `scripts/inspect-vsix.js`, and extended `release:check` plus tests to enforce clean packaging.
- **Files modified:** `.vscodeignore`, `package.json`, `README.md`, `docs/release-checklist.md`, `test/manifest.test.ts`, `scripts/inspect-vsix.js`
- **Verification:** `npm run test`; `npm run release:check`
- **Committed in:** `01412d8`

**2. [Rule 3 - Blocking] Corrected stale roadmap/state progress after tooling update misfire**
- **Found during:** Summary and state update steps
- **Issue:** `gsd-tools` reported successful roadmap/state updates, but `ROADMAP.md` and the human-readable progress sections in `STATE.md` still showed Phase 2/3 as incomplete.
- **Fix:** Manually updated the affected planning artifacts to reflect 3/3 completed phases and the finished release-readiness plan.
- **Files modified:** `.planning/STATE.md`, `.planning/ROADMAP.md`
- **Verification:** Re-read both files and confirmed the completion rows and progress text matched the executed plan state.
- **Committed in:** final `docs(03-03)` metadata commit

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both fixes were necessary to keep the release artifact and planning metadata accurate. No product-scope creep.

## Issues Encountered
- `vsce package` initially produced a VSIX that still contained `.vscode` workspace files. The archive-inspection step now catches that regression automatically.
- Planning helper commands reported successful completion updates without fully refreshing the roadmap/state markdown, so the final metadata files were corrected manually.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- The repo can now build, test, package, and inspect a release artifact with one command: `npm run release:check`.
- Marketplace and Open VSX publication still require maintainer credentials and the remaining human smoke checks noted in `docs/release-checklist.md`.

## Self-Check: PASSED

---
*Phase: 03-release-readiness*
*Completed: 2026-04-17*
