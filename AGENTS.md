<!-- GSD:project-start source:PROJECT.md -->
## Project

**File Reference**

File Reference is a VS Code extension that lets developers copy an AI-friendly file reference from the active editor in one keypress. It is built for people using Claude Code, OpenCode, and similar AI coding tools who frequently need a file path plus a current line or selected line range without manual cleanup.

**Core Value:** Copy a correct, paste-ready file reference from VS Code instantly, with predictable formatting and minimal friction.

### Constraints

- **Platform**: VS Code extension for macOS, Windows, and Linux — behavior must stay consistent across platforms.
- **Editor support**: Saved local text files only — unsupported editor states must fail clearly instead of producing ambiguous output.
- **Output format**: POSIX-style forward slashes and normalized line ranges — copied references must be deterministic and AI-friendly.
- **UX**: One-step clipboard action with no confirmation — the feature exists to remove friction from a repetitive workflow.
- **Maintainability**: Lightweight, simple implementation — future contributors should be able to understand and extend it quickly.
- **Distribution**: Public-release quality — the extension must be publishable to VS Code Marketplace and Open VSX.
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| VS Code Extension API + manifest | `engines.vscode: ^1.100.0`, `@types/vscode: ^1.100.0` | Extension runtime, commands, clipboard, active editor access, Marketplace metadata | This is the standard base for modern extensions. Microsoft’s current samples target `^1.100.0`, which is a sensible 2025+ floor and avoids legacy activation boilerplate. |
| TypeScript | `^5.9.2` | Authoring the extension code | TypeScript is the default recommendation in VS Code docs and the standard choice for maintainable extensions. For this project it gives safer URI/path handling with almost no complexity cost. |
| esbuild | `^0.25.0` | Bundle `src/extension.ts` to `dist/extension.js` | For a tiny command-driven extension, esbuild is the best fit: fastest builds, smallest config, and officially documented by VS Code. Use it instead of a heavier bundler. |
| Node.js + npm | Node `24 LTS` for development, npm `10+` | Local toolchain for build/test/publish | Node LTS is the safe production choice per Node’s release guidance. npm is the simplest package manager here, and VS Code explicitly supports npm or Yarn v1 for extension publishing workflows. |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `typescript-eslint` | `^8.58.2` | TypeScript-aware linting | Use by default. The current VS Code samples use ESLint 9 + `typescript-eslint`, which is the cleanest modern setup. |
| `@eslint/js` | `^10.0.1` | Base ESLint flat config | Use with ESLint 9 flat config; keeps lint setup aligned with current VS Code samples. |
| `@types/node` | `^25.6.0` | Node typings for build/test scripts | Use whenever `esbuild.js`, test config, or packaging scripts run in Node. |
| `npm-run-all` | `^4.1.5` | Parallel watch scripts | Use if you keep the standard `watch:esbuild` + `watch:tsc` split from the official bundling guide. |
| `@vscode/test-cli` | `^0.0.12` | Official extension test runner CLI | Use for integration tests. It is the current recommended quick-start path in the VS Code testing docs. |
| `@vscode/test-electron` | `^2.5.2` | Runs tests inside a VS Code instance | Use with `@vscode/test-cli` for real extension-host tests. |
| `mocha` + `@types/mocha` | `^11.7.5` + `^10.0.10` | Test authoring surface used by VS Code test tooling | Use only if you keep the standard Mocha-based integration tests. This is still the path VS Code docs and samples use. |
| `@vscode/vsce` | `^3.9.0` | Package/publish to VS Code Marketplace | Required for Marketplace publishing and `.vsix` packaging. |
| `ovsx` | `^0.10.11` | Publish to Open VSX | Required for Open VSX publication; keep it alongside `vsce` because Marketplace and Open VSX are separate release targets. |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| `generator-code` | Bootstrap a new extension | Good for one-time scaffolding only. Do not keep your architecture tied to the generator defaults. |
| ESLint 9 flat config | Linting | Prefer the flat config used by current VS Code samples; avoid older `.eslintrc` setups. |
| VS Code Extension Development Host | Manual dev/debug loop | Standard local development path: F5 launches an isolated extension host. |
| GitHub Actions | CI for lint, test, package, publish | Best fit for a small public extension. Use secrets for `VSCE_PAT` and `OVSX_PAT`. |
## Installation
# Core
# Supporting
# Optional one-time scaffold
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| TypeScript | Plain JavaScript | Use JavaScript only if this extension is truly throwaway. For a public extension, TypeScript is the better default. |
| esbuild | webpack | Use webpack only if you later need a browser/web extension target, complex asset handling, or a more advanced bundle graph. For this MVP it is unnecessary overhead. |
| npm | Yarn v1 | Use Yarn v1 only if your team already standardizes on it. For a solo/small extension, npm is simpler and fully supported. |
| Mocha via `@vscode/test-cli` | Custom runner with `@vscode/test-electron` | Use a custom runner only if the CLI becomes too limiting. Start with the CLI. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Webviews, React, or UI frameworks | This extension is command-only. Adding UI frameworks creates bundle and maintenance cost with no product benefit. | Plain extension commands and notifications via the VS Code API |
| webpack as the default | Too much config for a tiny extension; slower iteration than esbuild | esbuild |
| unbundled publish artifacts | Bundling is the current VS Code recommendation for performance and packaging simplicity | Single bundled `dist/extension.js` via esbuild |
| runtime npm dependencies for path formatting | The project only needs Node/VS Code built-ins for path normalization and URI handling | `vscode.Uri`, `path`, and small internal utility functions |
| `fs`-heavy assumptions for all URIs | This breaks on virtual/remote resources and makes behavior ambiguous | Explicitly support only `file` scheme and fail clearly for unsupported editors |
| a `*` startup activation event | Unnecessary activation hurts perceived performance | Contributed commands with no explicit activation events, or targeted activation only |
## Stack Patterns by Variant
- Use a desktop Node extension only: `main` entry, no `browser` entry
- Use `extensionKind: ["ui"]`
- Set `capabilities.virtualWorkspaces.supported` to `false`
- Set `capabilities.untrustedWorkspaces.supported` to `true`
- Because the product promise is local saved files on macOS/Windows/Linux, and remote/web support would blur what an “absolute file path” means
- Revisit `extensionKind`, URI handling, and a possible `browser` build
- Prefer `vscode.Uri`-first logic instead of file-path-first logic
- Because Codespaces, SSH, and vscode.dev change where the file actually lives and where the extension runs
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `@types/vscode@^1.100.0` | `engines.vscode: ^1.100.0` | Keep these aligned; the official samples do. |
| `esbuild@^0.25.0` | `main: ./dist/extension.js` | Bundle for Node, mark `vscode` as external, and keep the published entry in `dist/`. |
| `typescript@^5.9.2` | `target/lib: ES2024`, `module: commonjs` | Matches current Microsoft sample defaults and keeps output modern without extra transpilation complexity. |
| `@vscode/test-cli@^0.0.12` | `@vscode/test-electron@^2.5.2` | Standard pairing for extension-host integration tests. |
| `@vscode/vsce@^3.9.0` | `ovsx@^0.10.11` | Use both in release automation; one does not replace the other. |
## Recommended Project Shape
- `src/extension.ts` — command registration + thin activation
- `src/reference.ts` — pure reference-formatting logic
- `src/guards.ts` — editor/document validation (`file` scheme, saved doc, supported selection)
- `src/test/` — integration tests for command behavior and unsupported states
- `dist/extension.js` — bundled publish artifact
## Publishing Requirements
### VS Code Marketplace
- Use `@vscode/vsce`
- Create an Azure DevOps Personal Access Token with **Marketplace (Manage)** scope and **All accessible organizations**
- Create a Marketplace publisher
- Include in `package.json`: `name`, `displayName`, `publisher`, `version`, `engines.vscode`, `categories`, `license`, `repository`, `icon`
- Ensure README/CHANGELOG images are HTTPS and not untrusted SVGs
- Package with `vsce package`; publish with `vsce publish`
### Open VSX
- Use `ovsx`
- Create an Eclipse account
- Sign the Open VSX Publisher Agreement
- Generate an Open VSX access token
- Create the namespace matching the `publisher` field
- Publish with `ovsx publish`
### Release Automation Recommendation
- Add `vscode:prepublish` to run the production bundle
- Publish from GitHub Actions on version tags or manual release workflow
- Store `VSCE_PAT` and `OVSX_PAT` as CI secrets
- Build/package on macOS or Linux, not Windows, because VS Code warns Windows-built packages may lose POSIX executable bits in packaged files
## Prescriptive Recommendation
- **Language:** TypeScript
- **Bundler:** esbuild
- **Linting:** ESLint 9 flat config + `typescript-eslint`
- **Testing:** `@vscode/test-cli` + `@vscode/test-electron` + Mocha
- **Package manager:** npm
- **Publishing:** `@vscode/vsce` for Marketplace, `ovsx` for Open VSX
- **Runtime scope:** desktop/local Node extension only for MVP
- **Runtime dependencies:** none unless proven necessary
## Sources
- https://code.visualstudio.com/api/get-started/your-first-extension — official TypeScript-first extension workflow
- https://code.visualstudio.com/api/working-with-extensions/bundling-extension — official bundling guidance; esbuild and webpack patterns
- https://code.visualstudio.com/api/working-with-extensions/testing-extension — official testing stack (`@vscode/test-cli`, `@vscode/test-electron`, Mocha)
- https://code.visualstudio.com/api/working-with-extensions/publishing-extension — Marketplace packaging/publishing requirements, PAT scope, `vsce`, compatibility, prepublish hooks
- https://code.visualstudio.com/api/references/extension-manifest — manifest fields required for packaging and discovery
- https://code.visualstudio.com/api/references/activation-events — command activation behavior and avoiding `*`
- https://code.visualstudio.com/api/advanced-topics/extension-host — `extensionKind` guidance for local/ui/workspace runtimes
- https://code.visualstudio.com/api/extension-guides/virtual-workspaces — virtual workspace capability signaling
- https://code.visualstudio.com/api/extension-guides/workspace-trust — untrusted workspace capability signaling
- https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-sample — current official sample baseline (HIGH)
- https://github.com/microsoft/vscode-extension-samples/tree/main/esbuild-sample — current official esbuild sample (HIGH)
- https://github.com/microsoft/vscode-extension-samples/tree/main/helloworld-test-cli-sample — current official test CLI sample (HIGH)
- https://github.com/eclipse/openvsx/openvsx/wiki/Publishing-Extensions — Open VSX publishing requirements
- https://nodejs.org/en/about/previous-releases — Node LTS guidance for production tooling
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.

Planning artifacts under `.planning/` are internal workflow state for this public repo. When gap-planning or roadmap updates create empty phase directories, do not force them into git with placeholder files; only commit the roadmap and requirements files explicitly called for by the workflow. Empty `.planning/phases/*` directories are expected to remain local and untracked until they contain real non-sensitive planning documents that should be versioned.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
