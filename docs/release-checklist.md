# Release Checklist

## Automation summary

1. Pull requests run `.github/workflows/release-validation.yml`.
2. Pushes to `main` run `.github/workflows/release.yml`.
3. `semantic-release` reads Conventional Commit messages on `main`, computes the next SemVer, updates `package.json`, `package-lock.json`, and `CHANGELOG.md`, tags the release, then runs `npm run release:publish`.
4. `npm run release:publish` validates the repo, builds one versioned `.vsix`, and publishes that same artifact to both registries.

## Local validation

1. Run `npm install` if dependencies changed.
2. Run `npm run audit:check` and resolve any high-severity findings before packaging or publish.
3. Run `npm run release:check`.
4. Confirm `npm run package:inspect` passes so the generated VSIX only contains the bundled runtime, manifest, release docs, and icon.

## GitHub repository setup

1. Leave the default Actions `GITHUB_TOKEN` enabled with read/write `Contents`, `Issues`, and `Pull requests` permissions so semantic-release can create tags, GitHub releases, and release commits.
2. Add `VSCE_PAT` as a repository secret with a VS Code Marketplace Personal Access Token.
3. Add `OVSX_PAT` as a repository secret with an Open VSX access token.
4. Make sure `package.json.repository.url` points at the real GitHub repository that will run the workflow.
5. Protect `main` so only reviewed commits that follow the release rules can land.

## Commit rules

1. Use Conventional Commits for every commit that reaches `main`.
2. `fix:` releases a patch version.
3. `feat:` releases a minor version.
4. Add `!` after the type or include a `BREAKING CHANGE:` footer to release a major version.
5. Other types such as `docs:`, `test:`, `refactor:`, and `chore:` do not release unless they include a breaking change.
6. If you squash merge pull requests, make sure the squash commit title follows the same rules.

## Marketplace prerequisites

1. Create an Azure DevOps Personal Access Token with **Marketplace (Manage)** scope and **All accessible organizations**.
2. Create or confirm the Marketplace publisher matches `publisher` in `package.json`.
3. Authenticate once with `npx @vscode/vsce login <publisher>` or `npm exec vsce login <publisher>`.

## Open VSX prerequisites

1. Create an Eclipse account.
2. Sign the Open VSX Publisher Agreement.
3. Create the namespace matching the publisher.
4. Authenticate with `npx ovsx publish -p <token>` or an `OVSX_PAT` environment variable.

## Manual dry run

1. Re-run `npm run audit:check` if dependencies changed since local validation; do not continue until the audit gate is clean.
2. Run `npm run release:check` to build, test, package, and inspect the publishable VSIX locally.
3. Run `npm run release -- --dry-run` to confirm the next version and release notes without publishing.

## Cross-platform verification matrix

| Scenario | Automated coverage | Manual smoke expectation |
| --- | --- | --- |
| Absolute copy output stays `path:line` / `path:start-end` | Unit tests + CI on macOS, Windows, Linux | Trigger absolute copy in a saved local file and paste into a text buffer |
| Relative copy uses workspace-relative path with absolute fallback | Unit tests + CI on macOS, Windows, Linux | Trigger relative copy for both in-workspace and out-of-workspace files |
| Unsupported editor states fail clearly | Workflow tests | Try an untitled or non-file editor and verify the error toast |
| Slash-normalized output on all platforms | Path/reference tests + CI on macOS, Windows, Linux | On Windows, confirm copied output still uses forward slashes |
| Extension stays UI-hosted for clipboard behavior | Manifest check (`extensionKind: ["ui"]`) | In a remote window, verify `Developer: Show Running Extensions` lists Copy File Path with Line Numbers (AI Prompt) under Local |

## Remaining manual checks

- The first Marketplace/Open VSX publish still depends on valid maintainer credentials and namespace setup.
- UI-host verification in a remote window still needs a human smoke test.
