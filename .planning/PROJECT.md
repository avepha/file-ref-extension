# File Reference

## What This Is

File Reference is a shipped cross-IDE product for copying AI-friendly file references from the active editor in one step. It now has a released VS Code extension and a completed JetBrains plugin milestone that preserves the same core promise: copy a correct, paste-ready file reference with predictable formatting and minimal friction.

## Core Value

Copy a correct, paste-ready file reference from the active editor instantly, with predictable formatting and minimal friction.

## Current State

- **Latest shipped milestones:** v1.0 VS Code MVP and v2.0 JetBrains Plugin
- **Current release posture:** VS Code packaging remains in place, and the JetBrains plugin is archived as shipped milestone work with a manual marketplace submission path ready when needed
- **Planning status:** No active milestone is open; the project is ready for fresh requirements and roadmap definition

## Requirements

### Validated

- [x] Users can copy an absolute file path with the current line or selected line range from the active editor.
- [x] Users can copy a workspace-relative file path with the current line or selected line range, falling back to absolute when the file is outside the workspace.
- [x] Copied references always use deterministic `path:line` or `path:start-end` formatting with normalized ranges and POSIX-style forward slashes.
- [x] The extension provides both Command Palette commands and default keyboard shortcuts on macOS, Windows, and Linux.
- [x] Successful copies write directly to the clipboard and show a success toast; unsupported editor states show a clear error message.
- [x] The VS Code MVP is suitable for public release on VS Code Marketplace and Open VSX.
- [x] Users can run File Reference as a JetBrains plugin through JetBrains-native action entry points, keyboard shortcuts, direct clipboard copy, and concise success or failure feedback.
- [x] Users can copy absolute and project-relative file references from supported JetBrains editors with the same deterministic output contract as the VS Code MVP.
- [x] Maintainers can build, verify, sign-configure, and prepare JetBrains Marketplace submission assets for the plugin without needing last-minute packaging work.

### Active

None - the next milestone has not been defined yet.

### Out of Scope

- Settings UI for output customization or behavior toggles — this milestone is a platform port, not a customization release.
- Alternate AI-specific output formats — preserve one deterministic plain-text contract first.
- Actual JetBrains Marketplace publication execution — prepare the package and listing assets, but stop short of the real upload/publish step.
- Large JetBrains-only UX expansions like context menus or tool windows — keep scope close to the shipped active-editor workflow.

## Context

The project began as a focused VS Code extension and shipped a complete v1.0 MVP covering deterministic reference formatting, clipboard workflow, and release readiness. Milestone v2.0 then expanded that validated workflow into the JetBrains ecosystem using the IntelliJ Platform, while keeping the product contract stable across IDEs.

With v2.0 archived, the project is in a brownfield state: the core cross-IDE workflow is proven, release assets exist for both IDE families, and future work can focus on either deeper product functionality or live distribution follow-through rather than foundational platform work.

## Constraints

- **Platform**: The product now spans VS Code and JetBrains IDEs — behavior should stay consistent where the user-visible contract overlaps.
- **Editor support**: Supported text editors with local file references only — unsupported states must fail clearly instead of producing ambiguous output.
- **Output format**: POSIX-style forward slashes and normalized line ranges — copied references must remain deterministic across platforms and IDEs.
- **UX**: Keep the workflow close to the VS Code MVP while allowing JetBrains-native action patterns and menus.
- **Distribution**: Marketplace-ready quality — the plugin must be buildable, verifiable, signing-ready, and documented for JetBrains Marketplace submission.
- **Maintainability**: Preserve the lightweight, understandable product shape instead of building a JetBrains-specific feature maze.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Expand File Reference to JetBrains as the next milestone | The VS Code MVP validated the core product promise; the next highest-value move is platform reach, not deeper VS Code customization | Implemented through the v2.0 action workflow and remaining marketplace-readiness work |
| Target broad JetBrains IDE compatibility from the start | The core workflow uses general editor/platform APIs, so product value grows if the plugin is not IntelliJ-only | Validated through platform-only dependencies and Phase 6 action workflow coverage |
| Keep the output contract as close as possible to v1.0 | Deterministic plain-text references are the product's main differentiator and should not drift during the port | Validated in Phases 5 and 6 through shared formatting behavior and fallback messaging parity |
| Allow JetBrains-native UX differences where they improve fit | Action registration, keymaps, and menus should feel native in JetBrains even when behavior parity is preserved | Validated in Phase 6 through JetBrains action registration and notification handling |
| Prepare publishing assets but stop before actual marketplace upload | This milestone should remove release-preparation risk without depending on maintainer credentials or a live publish event | Implemented in Phase 7 through release validation, signing-ready configuration, listing assets, and manual submission docs |
| Standardize the public product identity across IDEs | Cross-IDE distribution is easier to explain and maintain when marketplace names, package IDs, and docs point to one product | Implemented in Phase 8 through the shared `Copy File Path with Line Numbers (AI Prompt)` rename |

## Next Milestone Goals

- Decide whether the next milestone is distribution-focused, product-depth-focused, or both.
- If JetBrains distribution is the immediate priority, use the prepared manual runbook to perform the live marketplace submission as milestone work rather than ad hoc follow-up.
- If product depth is the next priority, define fresh requirements around settings, alternate formats, or richer action surfaces instead of carrying over old scope implicitly.

<details>
<summary>Archived Milestone Context</summary>

### Closed Milestone: v2.0 JetBrains Plugin

**Goal:** Deliver a JetBrains plugin version of File Reference that matches the core v1.0 copy workflow closely, adapts it to JetBrains-native action patterns, and prepares the plugin for JetBrains Marketplace publication without performing the real publish.

**Target features:**
- Broad JetBrains IDE support from the start using shared IntelliJ Platform APIs where possible.
- Absolute and project-relative copy actions with deterministic `path:line` and `path:start-end` output.
- JetBrains-native action registration, keyboard-driven access, and concise copy feedback.
- Build, verification, signing-ready configuration, and marketplace listing assets needed for publish readiness.

</details>

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition:**
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone:**
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-18 after v2.0 milestone closeout*
