---
phase: 03-release-readiness
plan: 03
subsystem: infra
tags: [npm-audit, mocha, github-actions, release-validation, security]

# Dependency graph
requires:
  - phase: 03-release-readiness
    provides: release packaging scripts, VSIX inspection, maintainer release checklist
provides:
  - high-severity audit remediation in the installed dependency tree
  - npm audit enforcement in local and CI release validation
  - documented maintainer audit review before packaging or publish
affects: [publishing, ci, dependency-management, release-operations]

# Tech tracking
tech-stack:
  added: [npm audit gate, npm overrides]
  patterns: [audit-before-package release gate, dependency override remediation for vulnerable transitive packages]

key-files:
  created: [test/release-audit.test.ts]
  modified: [package.json, package-lock.json, test/manifest.test.ts, .github/workflows/release-validation.yml, docs/release-checklist.md]

key-decisions:
  - "Keep the supported Mocha upgrade and use npm overrides to replace vulnerable transitive packages so audit enforcement can pass without replacing the test runner."
  - "Run npm audit in both the general test job and the packaging job so release validation rejects vulnerable trees before a VSIX is built."

patterns-established:
  - "Release security gate: npm run audit:check must pass before package and publish flows continue."
  - "Regression guard: release audit expectations live in focused tests for package scripts, workflow steps, and maintainer docs."

requirements-completed: [REL-01, REL-02]

# Metrics
duration: 5 min
completed: 2026-04-17
---

# Phase 3 Plan 03: Release Audit Hardening Summary

**High-severity npm audit remediation with an enforced audit gate across local release checks, CI validation, and maintainer release guidance**

## Performance

- **Duration:** 5 min
- **Started:** 2026-04-17T05:09:00Z
- **Completed:** 2026-04-17T05:14:45Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Upgraded the Mocha dependency path and removed the installed high-severity audit findings.
- Added an explicit `audit:check` script and required `release:check` to pass it before packaging.
- Added regression coverage plus workflow and checklist updates so audit review cannot silently disappear from release validation.

## Task Commits

Each task was committed atomically:

1. **Task 1: Remove the vulnerable audit dependency path and wire an audit script** - `332479c` (fix)
2. **Task 2: Enforce and document audit review in release validation** - `a03a989` (fix)

**Plan metadata:** pending final `docs(03-03)` commit

## Files Created/Modified
- `package.json` - Adds `audit:check`, updates `release:check`, upgrades Mocha, and pins safe transitive overrides.
- `package-lock.json` - Refreshes the installed dependency tree to remove high-severity audit findings.
- `test/manifest.test.ts` - Locks the new audit-aware release script contract.
- `.github/workflows/release-validation.yml` - Runs the audit gate in CI before packaging.
- `docs/release-checklist.md` - Requires maintainers to clear npm audit before packaging or publish.
- `test/release-audit.test.ts` - Guards audit coverage across scripts, workflow, and checklist docs.

## Decisions Made
- Kept the existing npm-script release flow and inserted audit enforcement into that path instead of adding new tooling.
- Used npm overrides for Mocha's vulnerable transitive packages so the project could stay on the supported Mocha line while still satisfying the audit gate.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Added safe transitive overrides for Mocha's remaining audit findings**
- **Found during:** Task 1 (Remove the vulnerable audit dependency path and wire an audit script)
- **Issue:** Upgrading from `mocha@7.2.0` to the supported `mocha@11.7.5` still left high-severity audit findings through `diff` and `serialize-javascript`, so the release gate would still fail.
- **Fix:** Added npm `overrides` for Mocha's transitive `diff` and `serialize-javascript` packages, then refreshed `package-lock.json`.
- **Files modified:** `package.json`, `package-lock.json`
- **Verification:** `npm audit --audit-level=high`; `npm run test -- --grep "package.json contributions"`
- **Committed in:** `332479c`

---

**Total deviations:** 1 auto-fixed (1 missing critical)
**Impact on plan:** The override was necessary to satisfy the plan's no-high-vulnerability requirement while preserving the existing test runner and release workflow.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Phase 3 now enforces audit review in the same local and CI release paths that already build and package the extension.
- Remaining release work is limited to maintainer credentials and manual publish/smoke steps already documented in `docs/release-checklist.md`.

## Self-Check: PASSED
