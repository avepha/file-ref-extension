---
status: diagnosed
phase: 03-release-readiness
source: [.planning/phases/03-release-readiness/03-SUMMARY.md]
started: 2026-04-17T04:45:14Z
updated: 2026-04-17T04:52:44Z
---

## Current Test

[testing complete]

## Tests

### 1. Release Check Pipeline
expected: Running `npm run release:check` should complete successfully and verify the full release path: build, typecheck, tests, VSIX packaging, and VSIX inspection.
result: pass

### 2. README Release Docs
expected: README should document the extension commands, the current default shortcuts, supported editor state, and the maintainer release commands so someone can understand how to use and ship the extension from the repo root.
result: issue
reported: "Default shortcut doesn't match with the current one."
severity: major

### 3. Release Checklist Guidance
expected: `docs/release-checklist.md` should list Marketplace and Open VSX prerequisites, publish steps, and the macOS/Windows/Linux smoke-check matrix for the release.
result: issue
reported: "npm audit still has high vuls we should fix this first."
severity: major

## Summary

total: 3
passed: 1
issues: 2
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "README should document the extension commands, the current default shortcuts, supported editor state, and the maintainer release commands so someone can understand how to use and ship the extension from the repo root."
  status: failed
  reason: "User reported: Default shortcut doesn't match with the current one."
  severity: major
  test: 2
  root_cause: "README.md still documents the older K-based shortcuts while package.json and manifest tests were updated to the new C-based keybindings, and no automated check validates README shortcut content against the manifest."
  artifacts:
    - path: "README.md"
      issue: "Shortcut table is stale and does not match shipped keybindings"
    - path: "test/release-assets.test.ts"
      issue: "Only checks README presence, not shortcut content correctness"
  missing:
    - "Update the README shortcut table to match package.json"
    - "Add coverage that validates documented shortcuts against manifest keybindings"
  debug_session: ".planning/debug/readme-shortcut-mismatch.md"
- truth: "`docs/release-checklist.md` should list Marketplace and Open VSX prerequisites, publish steps, and the macOS/Windows/Linux smoke-check matrix for the release."
  status: failed
  reason: "User reported: npm audit still has high vuls we should fix this first."
  severity: major
  test: 3
  root_cause: "The repo still installs a vulnerable dependency tree rooted in mocha 7.2.0, and the Phase 3 release gate does not run or document npm audit checks, so high-severity vulnerabilities remain unblocked during release validation."
  artifacts:
    - path: "package.json"
      issue: "Pins vulnerable mocha 7.x dependency path"
    - path: "package-lock.json"
      issue: "Locks the vulnerable installed dependency tree"
    - path: ".github/workflows/release-validation.yml"
      issue: "Release validation omits an npm audit gate"
    - path: "docs/release-checklist.md"
      issue: "Release guidance does not require audit review or remediation"
  missing:
    - "Upgrade the vulnerable dependency path causing the audit findings"
    - "Add an explicit audit check or audit-review gate to release validation"
    - "Document the audit requirement in the maintainer release checklist"
  debug_session: ".planning/debug/release-audit-high-vulns.md"
