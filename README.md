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
| macOS | `Alt+Shift+C` | `Alt+C` |
| Windows / Linux | `Ctrl+Alt+Shift+C` | `Ctrl+Alt+C` |

These defaults match the shipped `package.json` manifest contributions.

## Supported editor state

- Saved local text files

This extension only supports saved local files. Unsupported states fail clearly with `No saved local text file is active` instead of copying something ambiguous.

## Development

```bash
npm install
npm run build
npm run test
```

## Release workflow

- Pull requests are validated by `.github/workflows/release-validation.yml`.
- Pushes to `main` run `.github/workflows/release.yml`, where `semantic-release` calculates the next SemVer from commit messages and updates `package.json`, `package-lock.json`, and `CHANGELOG.md`. The workflow then packages one versioned VSIX and publishes that same file to both VS Code Marketplace and Open VSX.
- Required repository secrets: `VSCE_PAT` for VS Code Marketplace and `OVSX_PAT` for Open VSX. `GITHUB_TOKEN` comes from GitHub Actions automatically.

### Commit rules

- Use Conventional Commits on the commits that land on `main`.
- `fix:` triggers a patch release.
- `feat:` triggers a minor release.
- Add `!` to the type or include a `BREAKING CHANGE:` footer to trigger a major release.
- `docs:`, `chore:`, `test:`, and `refactor:` do not publish a release unless they also mark a breaking change.
- If you use squash merges, the squash commit title must follow the same format because semantic-release reads the final commits on `main`.

See [`docs/release-checklist.md`](docs/release-checklist.md) for maintainer setup, secret names, and cross-platform verification guidance.
