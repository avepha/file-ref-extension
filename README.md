# File Reference

Copy AI-friendly file references from the active VS Code editor in one keypress.

## What it does

File Reference copies a deterministic plain-text reference for the active saved file using POSIX-style slashes on every platform.

- Absolute command: `/full/path/to/file.ts:42`
- Relative command: `src/file.ts:42`
- Multi-line selection: `src/file.ts:42-57`

## Commands

- `File Reference: Copy Absolute Path with Line`
- `File Reference: Copy Relative Path with Line`

## Default shortcuts

| Platform | Absolute | Relative |
| --- | --- | --- |
| macOS | `Cmd+Option+K` | `Cmd+Option+Shift+K` |
| Windows / Linux | `Ctrl+Alt+K` | `Ctrl+Alt+Shift+K` |

## Supported editor state

- Saved local text files

Unsupported states fail clearly with `No saved local text file is active`.

## Development

```bash
npm install
npm run build
npm run test
```

## Release workflow

- `npm run release:check` validates build, types, tests, VSIX packaging, and inspects the archive for dev-only files.
- `npm run publish:marketplace` publishes to VS Code Marketplace after `vsce login <publisher>`.
- `npm run publish:openvsx` publishes to Open VSX after `ovsx create-namespace <publisher>` and `ovsx publish` authentication setup.

See [`docs/release-checklist.md`](docs/release-checklist.md) for the full maintainer checklist and cross-platform verification matrix.
