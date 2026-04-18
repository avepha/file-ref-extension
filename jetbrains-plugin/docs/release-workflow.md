# JetBrains Plugin Release Workflow

This runbook is the source of truth for packaging and validating the JetBrains plugin before a manual Marketplace submission.

## Scope

- Default compatibility verification targets PyCharm because it is the maintainer-owned IDE for Phase 7.
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
- The default Phase 7 target is `pycharm:2026.1`.

If broader coverage is needed later, temporarily override `verifierIdeTargets` when running Gradle instead of changing the committed default:

```bash
./gradlew verifyPlugin -PverifierIdeTargets=pycharm:2026.1,intellijIdea:2026.1,webstorm:2026.1
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
