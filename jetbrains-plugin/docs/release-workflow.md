# JetBrains Plugin Release Workflow

This runbook is the source of truth for packaging and validating the JetBrains plugin before a manual Marketplace submission.

## Scope

- Default compatibility verification pins the floor and the current ends of the range: `intellijIdeaCommunity:2023.3` (the `233` floor), `androidStudio:2025.3.3.6` (Panda 3, branch `253`), `androidStudio:2026.1.1.8` (Quail 1, branch `261`), and `pycharm:2026.1`.
- The compatibility floor is `sinceBuild=233` (2023.3) with no upper bound — the lowest build the modern Kotlin 2.3 / 2026.1-SDK toolchain verifies clean. Because the plugin depends only on `com.intellij.modules.platform`, one verifier run per representative build is enough — it does not need a target for every product (WebStorm, GoLand, Rider, CLion, RubyMine, PhpStorm, etc. all share the verified platform module). Those product names are accepted for on-demand `-PverifierIdeTargets` overrides when broader coverage is wanted.
- Bytecode targets Java 17 so the plugin loads on JBR 17 IDEs (2023.3–2024.1) as well as JBR 21 IDEs (2024.2+).
- The plugin remains positioned as a JetBrains-platform plugin because it still depends only on `com.intellij.modules.platform`.
- Live publication stays out of scope for this phase; the publish path is wired but expected to stay dormant until marketplace credentials are available.

## Local validation commands

Run these commands from `jetbrains-plugin/`:

```bash
./gradlew test
./gradlew buildPlugin
./gradlew verifyPluginProjectConfiguration
./gradlew verifyPluginStructure
./gradlew verifyPlugin
./gradlew verifyMarketplaceReady
```

`verifyMarketplaceReady` is the one-command release check. It depends on:

- `buildPlugin`
- `verifyPluginProjectConfiguration`
- `verifyPluginStructure`
- `verifyPlugin`

## Artifact output

`buildPlugin` writes the distributable ZIP under `jetbrains-plugin/build/distributions/`.

Use this command to inspect the generated artifact path:

```bash
ls -1 build/distributions/
```

## Verification behavior

- `verifyPluginProjectConfiguration` validates the Gradle and plugin setup.
- `verifyPluginStructure` validates plugin archive structure and `plugin.xml`.
- `verifyPlugin` runs the JetBrains Plugin Verifier against the IDE targets from `gradle.properties`.
- The default targets are `intellijIdeaCommunity:2023.3` (floor), `androidStudio:2025.3.3.6` (Panda 3 | 2025.3.3), `androidStudio:2026.1.1.8` (Quail 1 | 2026.1.1), and `pycharm:2026.1`.

If broader coverage is needed later, temporarily override `verifierIdeTargets` when running Gradle instead of changing the committed default:

```bash
./gradlew verifyPlugin -PverifierIdeTargets=intellijIdeaCommunity:2023.3,androidStudio:2025.3.3.6,androidStudio:2026.1.1.8,pycharm:2026.1,webstorm:2026.1,goland:2026.1,rider:2026.1
```

## Signing and publish configuration

The build reads signing and future publish credentials only from environment variables:

- `CERTIFICATE_CHAIN`
- `PRIVATE_KEY`
- `PRIVATE_KEY_PASSWORD`
- `PUBLISH_TOKEN`

The configured publish host defaults to `https://plugins.jetbrains.com`.

## Dry-run expectations

- `signPlugin` stays dormant unless `CERTIFICATE_CHAIN`, `PRIVATE_KEY`, and `PRIVATE_KEY_PASSWORD` are all present.
- `publishPlugin` stays dormant unless `PUBLISH_TOKEN` is present.
- This means maintainers can run the validation tasks locally and in CI without marketplace credentials.

When credentials are available later, use:

```bash
./gradlew signPlugin
./gradlew publishPlugin
```

## CI alignment

The repository root workflow at `.github/workflows/release-validation.yml` should call the same Gradle commands from `jetbrains-plugin/` rather than defining a separate JetBrains release path.
