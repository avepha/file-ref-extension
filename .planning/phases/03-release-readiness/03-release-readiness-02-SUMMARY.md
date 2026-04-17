---
phase: 03-release-readiness
plan: 02
subsystem: testing
tags: [readme, keybindings, manifest, release-validation, docs]

# Dependency graph
requires:
  - phase: 03-release-readiness
    provides: release assets, release check pipeline, current README baseline
provides:
  - README command and shortcut docs aligned to shipped manifest metadata
  - release validation coverage that rejects future README shortcut drift
affects: [release-operations, documentation, packaging]

# Tech tracking
tech-stack:
  added: []
  patterns: [manifest-to-readme drift tests, structured README command documentation]

key-files:
  created: [.planning/phases/03-release-readiness/03-release-readiness-02-SUMMARY.md]
  modified: [README.md, test/release-assets.test.ts]

key-decisions:
  - "Represent the README command section as a manifest-aligned table so command ids and titles stay explicit for users and maintainers."

patterns-established:
  - "Release docs guard: README command titles and platform shortcuts must be compared directly against package.json in release-assets tests."

requirements-completed: [REL-01, REL-02]

# Metrics
duration: 1 min
completed: 2026-04-17
---

# Phase 3 Plan 02: README Drift Guard Summary

**README command docs now mirror the shipped manifest, with release tests enforcing command-title and shortcut parity across macOS and Windows/Linux defaults**

## Performance

- **Duration:** 1 min
- **Started:** 2026-04-17T05:06:31Z
- **Completed:** 2026-04-17T05:07:43Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Added release-validation coverage that parses README command and shortcut sections and compares them to `package.json` contributions.
- Ensured drift failures name the affected README section so future release fixes are obvious.
- Updated the README command section to document the shipped command ids, titles, and C-based default shortcuts.

## Task Commits

Each task was committed atomically:

1. **Task 1: Add README-versus-manifest shortcut regression coverage** - `ba07a42` (test)
2. **Task 2: Correct README command and shortcut docs** - `b8d045b` (docs)

**Plan metadata:** pending final `docs(03-02)` commit for planning artifacts

## Files Created/Modified
- `test/release-assets.test.ts` - Parses README command and shortcut sections, derives expected values from the manifest, and fails with section-specific drift messages.
- `README.md` - Documents the shipped command ids, command titles, and default shortcuts that match `package.json`.

## Decisions Made
- Represented the README command list as a small table so the public docs expose both the command ids and their Command Palette titles without ambiguity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated the drift parser to accept the new structured command table**
- **Found during:** Task 2 (Correct README command and shortcut docs)
- **Issue:** Converting the README command list into a deterministic table broke the new drift test because it only parsed bullet-list commands.
- **Fix:** Extended the README parser in `test/release-assets.test.ts` to support either bullet or table command documentation while still comparing structured values from `package.json`.
- **Files modified:** `test/release-assets.test.ts`
- **Verification:** `npm run test -- --grep "release assets"`
- **Committed in:** `b8d045b`

**2. [Rule 3 - Blocking] Corrected stale planning progress after roadmap/state tooling left old values behind**
- **Found during:** Summary and state update steps
- **Issue:** The GSD update commands advanced frontmatter counters, but the human-readable `STATE.md` and `ROADMAP.md` progress sections still showed the previous Phase 3 completion state.
- **Fix:** Manually updated the visible progress rows and metrics so planning artifacts reflect Plan 02 completion and the remaining Plan 03 work.
- **Files modified:** `.planning/STATE.md`, `.planning/ROADMAP.md`
- **Verification:** Re-read both files and confirmed they show Phase 3 at `2/3` plans complete with `80%` overall progress.
- **Committed in:** final `docs(03-02)` metadata commit

---

**Total deviations:** 2 auto-fixed (2 blocking)
**Impact on plan:** Both fixes were required to keep release documentation and planning metadata trustworthy without expanding product scope.

## Issues Encountered
- The first README table revision caused the drift test to read no documented commands; extending the parser resolved it immediately.
- Planning helper commands still left stale human-readable progress text in `STATE.md` and `ROADMAP.md`, so those sections were corrected manually after the tool run.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- README release docs now fail fast if manifest command titles or default shortcuts drift again.
- Phase 3 can proceed to the remaining audit-focused release-readiness work.

## Self-Check: PASSED

---
*Phase: 03-release-readiness*
*Completed: 2026-04-17*
