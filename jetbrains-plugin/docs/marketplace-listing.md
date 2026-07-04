# JetBrains Marketplace Listing

This document is the source of truth for the JetBrains Marketplace page copy.

## Plugin title

Copy File Path with Line Numbers (AI Prompt)

## One-line summary

Copy deterministic, paste-ready file paths with line numbers from the active JetBrains editor in one step.

## Full description

Copy File Path with Line Numbers (AI Prompt) is a general developer utility that helps you move from editor context to a reusable reference without cleanup. It copies one predictable plain-text reference from the active editor so the pasted result is ready for AI prompting, code review notes, issue reports, and similar workflows immediately.

The plugin supports absolute and project-relative copy actions, with deterministic `path:line` and `path:start-end` output. Relative mode falls back to an absolute path when the current file is outside the project, so the command still produces a usable reference instead of failing ambiguously.

The product scope stays intentionally narrow. Copy File Path with Line Numbers (AI Prompt) works with saved local text files only, normalizes slashes to forward-slash POSIX style, and surfaces a concise success or failure notification after each action.

## Feature bullets

- Copy an absolute file path with line numbers for the current line or selected line range.
- Copy a project-relative file path with line numbers, with an automatic absolute fallback for files outside the project root.
- Keep output deterministic with normalized ranges and forward slashes on every platform.
- Trigger the workflow from keyboard shortcuts, Find Action, or JetBrains action menus.
- Fail clearly for unsupported editor states instead of copying ambiguous output.

## Supported IDE positioning

Copy File Path with Line Numbers (AI Prompt) is built on shared IntelliJ Platform APIs and remains positioned as a JetBrains-platform plugin rather than a single-IDE tool. Because it depends only on `com.intellij.modules.platform`, it runs across the entire IntelliJ Platform family — IntelliJ IDEA, PyCharm, WebStorm, GoLand, Rider, CLion, RubyMine, PhpStorm, Android Studio, and more — from build `233` (2023.3) through the latest release, with no upper bound. Verification pins the floor (IntelliJ IDEA Community 2023.3) and the current ends of the range (Android Studio Panda 3 and Quail 1, plus PyCharm 2026.1).

## Supported editor-state boundaries

- Saved local text files are supported.
- Unsaved, virtual, or otherwise unsupported editor states should fail clearly.
- The plugin does not add settings UI, alternate output formats, or extra tool-window surfaces in this release.

## Release notes template

```md
## Copy File Path with Line Numbers (AI Prompt) vX.Y.Z

- Added:
  - <new user-visible capability>
- Improved:
  - <workflow, verification, or packaging improvement>
- Fixed:
  - <bug fix or compatibility issue>

Validation:
- `./gradlew verifyMarketplaceReady`
- `./gradlew test`
```
