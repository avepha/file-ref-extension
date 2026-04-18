# Copy File Path with Line Numbers (AI Prompt)

Copy deterministic file paths with line numbers from the active VS Code editor in one keypress.

## Install

- Open VSX: [open-vsx.org/extension/avepha/copy-file-path-with-line-numbers](https://open-vsx.org/extension/avepha/copy-file-path-with-line-numbers)
- VS Code Marketplace: [marketplace.visualstudio.com/items?itemName=avepha.copy-file-path-with-line-numbers](https://marketplace.visualstudio.com/items?itemName=avepha.copy-file-path-with-line-numbers)

## What it does

### VSCode
<p>
<img width="720" height="480" alt="image" src="https://github.com/user-attachments/assets/c07302a5-edf5-4663-a0ca-e8910934c32a" />
</p>

### Jetbrains IDEs
<p>
<img width="720" height="480" alt="image" src="https://github.com/user-attachments/assets/206d9eee-2594-4832-90ba-b9b55b31f30d" />
</p>

Copy File Path with Line Numbers (AI Prompt) is a focused utility for developers who need a paste-ready `path:line` or `path:start-end` reference without cleanup. It fits AI prompting especially well, but it is just as useful for code reviews, tickets, and debugging notes.

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

## Product scope

- One-step clipboard copy with no confirmation UI
- Saved local text files only
- POSIX-style forward slashes on every platform
- Deterministic output that is ready for AI prompts and other developer workflows

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for local development, release workflow, and commit conventions.
