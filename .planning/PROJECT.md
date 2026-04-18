# File Reference

## What This Is

File Reference is a shipped VS Code extension and an expanding cross-IDE product for copying AI-friendly file references from the active editor in one step. The current milestone extends the product to JetBrains IDEs through an IntelliJ Platform plugin while preserving the same core promise: copy a correct, paste-ready file reference with predictable formatting and minimal friction.

## Core Value

Copy a correct, paste-ready file reference from the active editor instantly, with predictable formatting and minimal friction.

## Current Milestone: v2.0 JetBrains Plugin

**Goal:** Deliver a JetBrains plugin version of File Reference that matches the core v1.0 copy workflow closely, adapts it to JetBrains-native action patterns, and prepares the plugin for JetBrains Marketplace publication without performing the real publish.

**Target features:**
- Broad JetBrains IDE support from the start using shared IntelliJ Platform APIs where possible.
- Absolute and project-relative copy actions with deterministic `path:line` and `path:start-end` output.
- JetBrains-native action registration, keyboard-driven access, and concise copy feedback.
- Build, verification, signing-ready configuration, and marketplace listing assets needed for publish readiness.

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

None - all currently planned milestone requirements are validated.

### Out of Scope

- Settings UI for output customization or behavior toggles — this milestone is a platform port, not a customization release.
- Alternate AI-specific output formats — preserve one deterministic plain-text contract first.
- Actual JetBrains Marketplace publication execution — prepare the package and listing assets, but stop short of the real upload/publish step.
- Large JetBrains-only UX expansions like context menus or tool windows — keep scope close to the shipped active-editor workflow.

## Context

The project began as a focused VS Code extension and shipped a complete v1.0 MVP covering deterministic reference formatting, clipboard workflow, and release readiness. The next milestone is a platform expansion rather than a re-think of the product: move the same core promise into the JetBrains ecosystem using the IntelliJ Platform.

Research for this milestone points to a modern Gradle-based IntelliJ Platform plugin using the IntelliJ Platform Gradle Plugin 2.x, JetBrains Action System registrations, verifier tasks, signing hooks, and marketplace listing preparation. The main complexity is ecosystem translation: JetBrains IDE support, plugin metadata and compatibility ranges, and action/clipboard behavior need to feel native without drifting from the product's simple copy-first contract.

## Constraints

- **Platform**: JetBrains plugin for common IntelliJ Platform IDEs — behavior should work broadly, not just in IntelliJ IDEA.
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

## Current State

- **Latest shipped milestone:** v1.0 VS Code MVP
- **Current focus:** v2.0 JetBrains plugin wrap-up and future manual marketplace submission
- **Release posture:** VS Code marketplace packaging remains in place, and the JetBrains plugin now has a verified release path, packaged marketplace assets, and manual submission documentation without requiring a live publish

## Next Milestone Goals

- Close out milestone v2.0 once the maintainer is ready to archive the completed JetBrains plugin work.
- Use the prepared manual runbook if and when a live JetBrains Marketplace submission is desired.

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
*Last updated: 2026-04-18 after Phase 7 execution*
