# Copy File Path with Line Numbers (AI Prompt)

Copy deterministic file paths with line numbers from the active VS Code editor in one keypress.

## What it does

Copy File Path with Line Numbers (AI Prompt) is a focused developer utility for producing a clean `path:line` or `path:start-end` reference in one step. It is especially helpful for AI prompting, while staying useful for code reviews, bug reports, and personal notes.

It always produces POSIX-style slash paths with normalized `path:line` or `path:start-end` output for the active saved local file.

- Absolute command: `/full/path/to/file.ts:42`
- Relative command: `src/file.ts:42`
- Multi-line selection: `src/file.ts:42-57`

## Commands

| Command ID | Command Palette title |
| --- | --- |
| `copyFilePathWithLineNumbers.copyAbsoluteReference` | `Copy Absolute File Path with Line Numbers` |
| `copyFilePathWithLineNumbers.copyRelativeReference` | `Copy Relative File Path with Line Numbers` |

## Default shortcuts

| Platform | Absolute | Relative |
| --- | --- | --- |
| macOS | `⌥⇧C` | `⌥C` |
| Windows / Linux | `Ctrl+Alt+Shift+C` | `Ctrl+Alt+C` |

These defaults match the shipped `package.json` manifest contributions.

## Supported editor state

- Saved local text files

This extension only supports saved local files. Unsupported states fail clearly with `No saved local text file is active` instead of copying something ambiguous.
