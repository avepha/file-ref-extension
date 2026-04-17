# File Reference

## What This Is

File Reference is a VS Code extension that lets developers copy an AI-friendly file reference from the active editor in one keypress. It is built for people using Claude Code, OpenCode, and similar AI coding tools who frequently need a file path plus a current line or selected line range without manual cleanup.

## Core Value

Copy a correct, paste-ready file reference from VS Code instantly, with predictable formatting and minimal friction.

## Requirements

### Validated

- [x] Users can copy an absolute file path with the current line or selected line range from the active editor. Validated in Phase 1 and shipped through the Phase 2 command flow.
- [x] Users can copy a workspace-relative file path with the current line or selected line range, falling back to absolute when the file is outside the workspace. Validated in Phase 1 and shipped through the Phase 2 command flow.
- [x] Copied references always use deterministic `path:line` or `path:start-end` formatting with normalized ranges and POSIX-style forward slashes. Validated in Phase 1 and covered by release verification in Phase 3.
- [x] The extension provides both Command Palette commands and default keyboard shortcuts on macOS, Windows, and Linux. Implemented in Phase 2 and release-documented in Phase 3, with Windows/Linux live smoke tests still deferred in `03-HUMAN-UAT.md`.
- [x] Successful copies write directly to the clipboard and show a success toast; unsupported editor states show a clear error message. Validated in Phase 2 and carried through Phase 3 release verification.
- [x] The MVP is suitable for public release on VS Code Marketplace and Open VSX. Validated in Phase 3 aside from deferred credentialed publish and non-macOS manual smoke confirmation tracked in `03-HUMAN-UAT.md`.

### Active

- None.

### Out of Scope

- Untitled, unsaved, notebook, diff, virtual, and other non-local document types — MVP only supports saved local text files in the active editor.
- Column numbers and markdown link formatting — the MVP focuses on simple plain-text references that paste cleanly into AI tools.
- Customizable output formats, AI-tool-specific formats, context menu actions, and status bar integration — these are deferred until the core copy workflow is validated.

## Context

The project starts from a concrete product requirements document for a greenfield VS Code extension named File Reference. The main use case is a developer working in the editor who wants to paste references such as `/Users/farhan/project/src/main.cpp:123`, `/Users/farhan/project/src/main.cpp:123-234`, `src/main.cpp:123`, or `src/main.cpp:123-234` into AI coding agents. The product should feel immediate, predictable, minimal, and optimized for repeated daily use without requiring configuration in the MVP.

## Constraints

- **Platform**: VS Code extension for macOS, Windows, and Linux — behavior must stay consistent across platforms.
- **Editor support**: Saved local text files only — unsupported editor states must fail clearly instead of producing ambiguous output.
- **Output format**: POSIX-style forward slashes and normalized line ranges — copied references must be deterministic and AI-friendly.
- **UX**: One-step clipboard action with no confirmation — the feature exists to remove friction from a repetitive workflow.
- **Maintainability**: Lightweight, simple implementation — future contributors should be able to understand and extend it quickly.
- **Distribution**: Public-release quality — the extension must be publishable to VS Code Marketplace and Open VSX.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Provide two commands: absolute and relative copy | Users need both workspace-agnostic and workspace-friendly references depending on the target tool and context | — Pending |
| Format output as `path:line` or `path:start-end` only | Plain-text references are the fastest, most interoperable format for AI coding workflows | — Pending |
| Normalize selections so `start <= end` | Selection direction should never change the copied result | — Pending |
| Fall back to absolute path when relative path cannot be resolved | Relative copy should still succeed for files outside a workspace folder | — Pending |
| Ship with default keybindings plus Command Palette support | The feature must be accessible both as a one-keypress habit and as a discoverable command | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? -> Move to Out of Scope with reason
2. Requirements validated? -> Move to Validated with phase reference
3. New requirements emerged? -> Add to Active
4. Decisions to log? -> Add to Key Decisions
5. "What This Is" still accurate? -> Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check -> still the right priority?
3. Audit Out of Scope -> reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-17 after Phase 3 completion*
