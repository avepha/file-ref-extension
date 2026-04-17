# File Reference

## Overview

File Reference is a VS Code extension that lets users copy a file reference in one keypress for use in AI-assisted coding workflows and other developer tools.

The extension solves a simple workflow problem: users often need to paste a file path with a current line number or selected line range into an AI coding tool, but existing editor shortcuts are either missing, inconsistent, or not optimized for that use case.

## Product Goal

Enable users to copy an AI-friendly file reference from the active editor instantly, with predictable formatting and minimal friction.

## Primary Use Case

A user is working in VS Code and wants to paste a reference like:

```text
/path/to/project/src/main.cpp:123
/path/to/project/src/main.cpp:123-234
src/main.cpp:123
src/main.cpp:123-234
```

into an AI assistant, terminal-based coding tool, or another developer workflow.

## Success Criteria

The extension is successful if a user can:

1. Press a shortcut once.
2. Get a correctly formatted file reference in the clipboard.
3. Paste that reference directly into an AI tool without manual cleanup.

## Scope

### In Scope

- Copy absolute file path with line or range
- Copy workspace-relative file path with line or range
- Command Palette support
- Default keyboard shortcuts
- Clipboard output
- Toast notification on success
- Error message on unsupported editor state
- Cross-platform support for macOS, Windows, and Linux
- Publishable extension suitable for VS Code Marketplace and Open VSX

### Out of Scope for MVP

- Untitled files
- Notebook editors
- Diff editors
- Virtual or non-local documents
- Column numbers
- Markdown link formatting
- Customizable output formats
- Context menu actions
- Status bar integration

## Users

### Primary Users

- Developers using AI-assisted coding tools
- Developers who frequently reference files in chat-based coding tools
- Users who want a faster alternative to built-in file/path copy commands

### Example Tools

- Terminal-based coding assistants
- Editor-integrated AI assistants
- Other AI-assisted terminal or editor workflows

## Functional Requirements

### Commands

The extension must provide two commands:

1. `File Reference: Copy Absolute Path with Line`
2. `File Reference: Copy Relative Path with Line`

### Output Rules

The extension must copy plain text to the clipboard using these rules:

1. No selection:
   - format as `path:line`

2. Single-line selection:
   - format as `path:line`

3. Multi-line selection:
   - format as `path:start-end`

4. Selection ranges must always be normalized so `start <= end`.

### Path Rules

1. The absolute command must always copy an absolute file path.
2. The relative command must use a path relative to the containing workspace folder.
3. If the active file is outside any workspace folder, the relative command must fall back to the absolute path.
4. All copied paths must use POSIX-style forward slashes `/` on every platform.

### Clipboard Behavior

1. The final output must be copied directly to the clipboard.
2. The user should not need to confirm the action.

### Notifications

1. On success, the extension must show a toast notification.
2. On failure, the extension must show a clear error message.

Suggested success messages:

- `Copied absolute file reference`
- `Copied relative file reference`

Suggested error message:

- `No saved local text file is active`

## Editor Support Requirements

### Supported for MVP

- Saved local text files in the active editor

### Unsupported for MVP

- Unsaved or untitled files
- Notebook editors
- Diff editors
- Non-file URI editors
- Virtual documents

## Keyboard Shortcuts

The extension should ship with default keybindings:

### macOS

- Absolute: `Cmd+Option+K`
- Relative: `Cmd+Option+Shift+K`

### Windows and Linux

- Absolute: `Ctrl+Alt+K`
- Relative: `Ctrl+Alt+Shift+K`

## UX Requirements

The extension should feel:

- Immediate
- Predictable
- Minimal
- Optimized for repeated daily use

The user experience should require no configuration for the MVP.

## Non-Functional Requirements

1. The extension must behave consistently across macOS, Windows, and Linux.
2. The output format must be deterministic.
3. The extension should be lightweight and easy to maintain.
4. The extension should be simple enough to understand quickly by future contributors.
5. The extension should be structured so later enhancements can be added without major rewrites.

## Distribution Requirements

1. The extension should be suitable for public release.
2. The extension should be publishable to:
   - VS Code Marketplace
   - Open VSX

## Naming

### Product Name

`File Reference`

### Suggested Extension Identifier

`file-reference`

## Future Enhancements

These are explicitly deferred beyond the MVP:

- Notebook support
- Diff editor support
- Column support
- Markdown file-link output
- Configurable output templates
- Context menu actions
- Status bar button
- Additional integrations for AI-tool-specific formats
