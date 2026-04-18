# Copy File Path with Line Numbers (AI Prompt) JetBrains Plugin

This Gradle project contains the JetBrains plugin for Copy File Path with Line Numbers (AI Prompt). It lives alongside the VS Code extension, but it uses an isolated IntelliJ Platform and Gradle toolchain under `jetbrains-plugin/`.

## Local Commands

- `./gradlew runIde`
- `./gradlew test`
- `./gradlew verifyMarketplaceReady`
- `./gradlew buildPlugin`

## Notes

- Open `jetbrains-plugin/` as its own project when working on the JetBrains plugin.
- The IntelliJ Platform build, sandbox, and verifier tooling are intentionally separate from the repo's npm and esbuild workflow.
- The Gradle toolchain provisions the JetBrains plugin dependencies without changing the root VS Code extension setup.
- Use [docs/release-workflow.md](docs/release-workflow.md) for the full packaging, verification, signing, and future publish runbook.
- Use [docs/marketplace-listing.md](docs/marketplace-listing.md) for canonical JetBrains Marketplace copy.
- Use [docs/marketplace-assets/README.md](docs/marketplace-assets/README.md) for the screenshot and asset checklist.
- Use [docs/marketplace-submission.md](docs/marketplace-submission.md) for the manual submission steps and review checklist.
