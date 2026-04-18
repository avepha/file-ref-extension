# File Reference

Copy deterministic AI-ready file references from the active VS Code editor in one keypress.

## What it does

VS Code can copy a file path, and some extensions can copy a path plus line numbers, but they often vary by platform, output style, or editor state. File Reference is intentionally narrow: it copies one predictable plain-text format for prompting AI tools.

It always produces POSIX-style slash paths with normalized `path:line` or `path:start-end` output for the active saved local file.

- Absolute command: `/full/path/to/file.ts:42`
- Relative command: `src/file.ts:42`
- Multi-line selection: `src/file.ts:42-57`

## Commands

| Command ID | Command Palette title |
| --- | --- |
| `fileReference.copyAbsoluteReference` | `File Reference: Copy Absolute Path with Line` |
| `fileReference.copyRelativeReference` | `File Reference: Copy Relative Path with Line` |

## Default shortcuts

| Platform | Absolute | Relative |
| --- | --- | --- |
| macOS | `⌥⇧C` | `⌥C` |
| Windows / Linux | `Ctrl+Alt+Shift+C` | `Ctrl+Alt+C` |

These defaults match the shipped `package.json` manifest contributions.

## Supported editor state

- Saved local text files

This extension only supports saved local files. Unsupported states fail clearly with `No saved local text file is active` instead of copying something ambiguous.
