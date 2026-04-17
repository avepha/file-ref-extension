---
phase: 03
fixed_at: 2026-04-17T05:05:58Z
review_path: .planning/phases/03-release-readiness/03-REVIEW.md
iteration: 1
findings_in_scope: 2
fixed: 2
skipped: 0
status: all_fixed
---

# Phase 03: Code Review Fix Report

**Fixed at:** 2026-04-17T05:05:58Z
**Source review:** `.planning/phases/03-release-readiness/03-REVIEW.md`
**Iteration:** 1

**Summary:**
- Findings in scope: 2
- Fixed: 2
- Skipped: 0

## Fixed Issues

### WR-01: Real VSIX inspection is broken by incorrect expected entry names

**Files modified:** `scripts/inspect-vsix.js`, `test/release-assets.test.ts`
**Commit:** `eee265a`
**Applied fix:** Updated the VSIX required entry allowlist to match actual `vsce` output and changed the release asset test to assert against a fixture with the real packaged filenames instead of echoing `requiredEntries` back into the inspector.
**Validation:** `node -c scripts/inspect-vsix.js` passed; `npm test` passed; `node scripts/inspect-vsix.js` passed against `file-reference-0.0.1.vsix`.

### WR-02: Published shortcut documentation does not match the manifest

**Files modified:** `README.md`
**Commit:** `1318f3f`
**Applied fix:** Updated the published shortcut table so the documented macOS and Windows/Linux bindings match the actual keybindings contributed in `package.json`.
**Validation:** Re-read the README shortcut table and verified it against the manifest; `node -e 'const fs=require("node:fs"); const readme=fs.readFileSync("README.md","utf8"); const expected=["| macOS | `Alt+Shift+C` | `Alt+C` |","| Windows / Linux | `Ctrl+Alt+Shift+C` | `Ctrl+Alt+C` |"]; for (const line of expected) { if (!readme.includes(line)) throw new Error(`README missing expected shortcut row: ${line}`); }'` passed.

---

_Fixed: 2026-04-17T05:05:58Z_
_Fixer: the agent (gsd-code-fixer)_
_Iteration: 1_
