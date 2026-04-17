---
phase: 03-release-readiness
verified: 2026-04-17T05:23:50Z
status: human_needed
score: 8/8 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Run the absolute and relative commands in VS Code on macOS, Windows, and Linux"
    expected: "Each OS copies the same reference format for the same file/selection scenario and shows the same success/failure messaging"
    why_human: "The repo contains cross-platform CI and tests, but real keybinding/clipboard behavior still depends on interactive VS Code hosts on each OS"
  - test: "Check extension host placement in a remote VS Code window"
    expected: "Developer: Show Running Extensions lists File Reference under Local/UI host"
    why_human: "This requires a live VS Code remote session and UI inspection"
  - test: "Perform credentialed publish validation for Marketplace and Open VSX"
    expected: "Maintainer can authenticate and complete publish steps documented in docs/release-checklist.md"
    why_human: "Publishing requires maintainer credentials and external services that are not available programmatically here"
---

# Phase 3: Release Readiness Verification Report

**Phase Goal:** Maintainers can publish the extension confidently, and users get the same core behavior across supported desktop platforms.
**Verified:** 2026-04-17T05:23:50Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
| --- | --- | --- | --- |
| 1 | Maintainer can package the extension for both VS Code Marketplace and Open VSX using a repeatable release workflow. | ✓ VERIFIED | `package.json` defines `package`, `publish:marketplace`, `publish:openvsx`, and `release:check` scripts (package.json:70-82); `docs/release-checklist.md` documents credentials and publish steps for both services (docs/release-checklist.md:10-29). |
| 2 | Users on macOS, Windows, and Linux get the same reference-formatting and command behavior for the same editor scenario. | ✓ VERIFIED | Release CI runs build/typecheck/test on `macos-latest`, `ubuntu-latest`, and `windows-latest` (.github/workflows/release-validation.yml:10-29); workflow/path/reference tests lock command behavior, fallback behavior, unsupported-state handling, and Windows slash normalization (test/workflow.test.ts:56-302, test/reference.test.ts:26-114, test/path.test.ts:6-97). |
| 3 | The published artifact is suitable for public installation without missing metadata or packaging blockers. | ✓ VERIFIED | Marketplace metadata fields, icon, repo/bugs/homepage, `vscode:prepublish`, and packaging scripts are present (package.json:2-18,70-82); required release files exist and VSIX inspection enforces runtime-only contents (test/release-assets.test.ts:154-202, scripts/inspect-vsix.js:4-101); `node scripts/inspect-vsix.js` passed on `file-reference-0.0.1.vsix`. |
| 4 | README documents the shipped absolute and relative shortcuts exactly as contributed in `package.json`. | ✓ VERIFIED | README command titles and default shortcuts match manifest contributions (README.md:13-27; package.json:44-69). |
| 5 | Release validation fails if README shortcut docs drift from manifest command titles or keybindings again. | ✓ VERIFIED | `test/release-assets.test.ts` parses README command/shortcut sections, derives expected values from `package.json`, and includes an explicit drift-failure assertion (test/release-assets.test.ts:57-152,176-187). |
| 6 | High-severity npm audit findings are removed from the installed dependency tree. | ✓ VERIFIED | `package.json` upgrades to `mocha` `^11.7.5` and pins safe overrides for `diff` and `serialize-javascript` (package.json:83-98); `package-lock.json` resolves `diff` `8.0.4` and `serialize-javascript` `7.0.5` (package-lock.json:2499-2505,4765-4771); `npm audit --audit-level=high` returned `found 0 vulnerabilities`. |
| 7 | Release validation blocks packaging when npm audit reports high-severity vulnerabilities. | ✓ VERIFIED | `audit:check` is defined and included before packaging in `release:check` (package.json:70-82); CI runs `npm run audit:check` before `npm run package` (.github/workflows/release-validation.yml:24-42); `test/release-audit.test.ts` asserts this wiring (test/release-audit.test.ts:10-34). |
| 8 | Maintainer release guidance explicitly includes the audit gate before packaging or publish. | ✓ VERIFIED | Release checklist requires `npm run audit:check` before packaging/publish and again after dependency changes (docs/release-checklist.md:3-8,23-29); regression test enforces this doc contract (test/release-audit.test.ts:36-42). |

**Score:** 8/8 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| `README.md` | Current command and shortcut documentation aligned to shipped manifest | ✓ VERIFIED | Substantive command/shortcut and release workflow docs present (README.md:13-49); wired by `test/release-assets.test.ts` README-vs-manifest assertions (test/release-assets.test.ts:163-187). |
| `test/release-assets.test.ts` | Automated README-versus-manifest release doc validation | ✓ VERIFIED | Substantive parser/assertion coverage (test/release-assets.test.ts:57-202); wired via `npm run test` in `package.json` and CI test job (package.json:74-81, .github/workflows/release-validation.yml:24-29). |
| `package.json` | Upgraded dependency path and release audit script wiring | ✓ VERIFIED | Release metadata, publish scripts, audit gate, and overrides present (package.json:2-18,70-98); consumed by tests and packaging flow. |
| `package-lock.json` | Resolved dependency tree without diagnosed high vulnerabilities | ✓ VERIFIED | Lockfile records upgraded tree and safe transitive versions (package-lock.json:7-24,2499-2505,3968-3999,4765-4771); validated by `npm audit --audit-level=high`. |
| `.github/workflows/release-validation.yml` | CI audit enforcement in release validation | ✓ VERIFIED | Matrix test job covers macOS/Ubuntu/Windows and package job runs audit before packaging (.github/workflows/release-validation.yml:9-42). |
| `docs/release-checklist.md` | Maintainer audit requirement in release checklist | ✓ VERIFIED | Includes local validation, publish prerequisites, and cross-platform/manual smoke matrix (docs/release-checklist.md:3-44); referenced from README (README.md:43-49). |
| `test/release-audit.test.ts` | Regression checks for audit gate coverage | ✓ VERIFIED | Asserts script wiring, CI ordering, and checklist audit language (test/release-audit.test.ts:10-43); wired through `npm run test` and CI. |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| `README.md` | `package.json` | documented command titles and keybinding values | ✓ WIRED | README command table and shortcut table match manifest command titles and bindings (README.md:15-27; package.json:45-68). `gsd-tools` missed this due to case-sensitive pattern matching, but the linked values are present and `test/release-assets.test.ts` enforces parity. |
| `test/release-assets.test.ts` | `README.md` | test parses documented shortcuts and compares them to manifest values | ✓ WIRED | Test reads README and package.json, parses both sections, and compares structured values (test/release-assets.test.ts:48-152,163-187). |
| `package.json` | `package-lock.json` | dependency upgrade and lockfile refresh | ✓ WIRED | Manifest devDependency/override changes correspond to resolved lockfile versions for `mocha`, `diff`, and `serialize-javascript` (package.json:83-98; package-lock.json:7-24,2499-2505,4765-4771). |
| `.github/workflows/release-validation.yml` | `package.json` | CI runs audit script before package/release validation | ✓ WIRED | Workflow invokes `npm run audit:check`, `npm run test`, and `npm run package`, all defined in `package.json` (package.json:70-82; .github/workflows/release-validation.yml:24-42). |
| `docs/release-checklist.md` | `release:check` | maintainer instructions reference the enforced audit gate | ✓ WIRED | Checklist instructs maintainers to run `npm run release:check` and `npm run audit:check` before package/publish (docs/release-checklist.md:3-8,23-29). |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
| --- | --- | --- | --- | --- |
| N/A | — | — | — | No wired artifacts in this phase render dynamic user data; Level 4 not applicable. |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| High-severity audit gate is currently clean | `npm audit --audit-level=high` | `found 0 vulnerabilities` | ✓ PASS |
| Existing release artifact passes VSIX hygiene inspection | `node scripts/inspect-vsix.js` | `VSIX inspection passed for file-reference-0.0.1.vsix` | ✓ PASS |
| Real publish to Marketplace/Open VSX | Credentialed publish flow | Not run here | ? SKIP |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| `REL-01` | `03-02-PLAN.md`, `03-03-PLAN.md` | Maintainer can package and publish the extension to VS Code Marketplace and Open VSX. | ? NEEDS HUMAN | Packaging/publish scripts and docs exist in `package.json` and `docs/release-checklist.md` (package.json:70-82; docs/release-checklist.md:10-29), existing VSIX inspection passes, but live publish requires maintainer credentials and external services. |
| `REL-02` | `03-02-PLAN.md`, `03-03-PLAN.md` | Users get consistent copy behavior on macOS, Windows, and Linux. | ? NEEDS HUMAN | CI matrix and tests cover macOS/Ubuntu/Windows plus formatting/workflow behavior (.github/workflows/release-validation.yml:10-29; test/path.test.ts:6-97; test/reference.test.ts:26-114; test/workflow.test.ts:56-302), but real VS Code smoke checks across OSes still need human confirmation. |

No orphaned Phase 3 requirements were found in `REQUIREMENTS.md`.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| — | — | No blocker anti-patterns detected in the phase files scanned. | ℹ️ Info | Benign matches like `return []` in parser helpers and `console.log` in the CLI inspection script do not create user-visible stubs or broken release wiring. |

### Human Verification Required

### 1. Cross-platform command smoke

**Test:** In VS Code on macOS, Windows, and Linux, run both copy commands in the same saved local file for single-line, multi-line, workspace-relative, outside-workspace-relative, and unsupported-editor scenarios.
**Expected:** Each platform copies the same reference format for the same scenario, uses forward slashes, and shows the same success/failure messaging.
**Why human:** The repo proves intended behavior and cross-platform CI coverage, but real clipboard, keybinding, and host-editor interaction still require live OS-hosted VS Code verification.

### 2. UI-host placement in remote window

**Test:** Open a remote VS Code window and run `Developer: Show Running Extensions`.
**Expected:** File Reference appears under the local/UI extension host, matching `extensionKind: ["ui"]`.
**Why human:** This is a runtime host-placement check that cannot be confirmed from static files alone.

### 3. Credentialed publish validation

**Test:** Using real maintainer credentials, execute the documented Marketplace and Open VSX publish flows.
**Expected:** Authentication succeeds and the documented publish commands work without missing prerequisites.
**Why human:** External service credentials and network-side publish behavior are outside programmatic verification here.

### Gaps Summary

No code or wiring gaps were found for Phase 3 must-haves. The remaining work is final human validation for live cross-platform smoke behavior, UI-host placement, and credentialed publish execution.

---

_Verified: 2026-04-17T05:23:50Z_
_Verifier: the agent (gsd-verifier)_
