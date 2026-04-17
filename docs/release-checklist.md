# Release Checklist

## Local validation

1. Run `npm install` if dependencies changed.
2. Run `npm run audit:check` and resolve any high-severity findings before packaging or publish.
3. Run `npm run release:check`.
4. Confirm `npm run package:inspect` passes so the generated VSIX only contains the bundled runtime, manifest, release docs, and icon.

## Marketplace prerequisites

1. Create an Azure DevOps Personal Access Token with **Marketplace (Manage)** scope and **All accessible organizations**.
2. Create or confirm the Marketplace publisher matches `publisher` in `package.json`.
3. Authenticate once with `npx @vscode/vsce login <publisher>` or `npm exec vsce login <publisher>`.

## Open VSX prerequisites

1. Create an Eclipse account.
2. Sign the Open VSX Publisher Agreement.
3. Create the namespace matching the publisher.
4. Authenticate with `npx ovsx publish -p <token>` or an `OVSX_PAT` environment variable.

## Publish steps

1. Update `package.json` version and add release notes to `CHANGELOG.md`.
2. Re-run `npm run audit:check` if dependencies changed since local validation; do not continue until the audit gate is clean.
3. Run `npm run package` and keep the generated `.vsix` as the release artifact.
4. Publish to VS Code Marketplace with `npm run publish:marketplace`.
5. Publish the same version to Open VSX with `npm run publish:openvsx`.

## Cross-platform verification matrix

| Scenario | Automated coverage | Manual smoke expectation |
| --- | --- | --- |
| Absolute copy output stays `path:line` / `path:start-end` | Unit tests + CI on macOS, Windows, Linux | Trigger absolute copy in a saved local file and paste into a text buffer |
| Relative copy uses workspace-relative path with absolute fallback | Unit tests + CI on macOS, Windows, Linux | Trigger relative copy for both in-workspace and out-of-workspace files |
| Unsupported editor states fail clearly | Workflow tests | Try an untitled or non-file editor and verify the error toast |
| Slash-normalized output on all platforms | Path/reference tests + CI on macOS, Windows, Linux | On Windows, confirm copied output still uses forward slashes |
| Extension stays UI-hosted for clipboard behavior | Manifest check (`extensionKind: ["ui"]`) | In a remote window, verify `Developer: Show Running Extensions` lists File Reference under Local |

## Remaining manual checks

- Marketplace/Open VSX authentication and first publish cannot be completed without maintainer credentials.
- UI-host verification in a remote window still needs a human smoke test.
