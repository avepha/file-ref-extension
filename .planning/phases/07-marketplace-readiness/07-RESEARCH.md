# Phase 7: Marketplace Readiness - Research

**Researched:** 2026-04-18
**Confidence:** HIGH
**Scope:** JetBrains plugin packaging, verification, signing, publish-ready configuration, and marketplace listing preparation

## Executive Summary

Phase 7 should not invent a custom release system. The JetBrains plugin already sits on the IntelliJ Platform Gradle Plugin 2.x, which officially provides the core release path we need: `buildPlugin` for the distributable ZIP, `verifyPluginProjectConfiguration` and `verifyPluginStructure` for integrity checks, `verifyPlugin` for compatibility verification, `signPlugin` for author signing, and `publishPlugin` for marketplace upload. The work in this phase is to turn that baseline into a maintainable maintainer workflow centered on `jetbrains-plugin/`, swap the default verifier target from IntelliJ IDEA/WebStorm to PyCharm, wire signing and publish secrets through environment variables, and create the listing assets plus manual submission docs that make the eventual marketplace upload routine rather than exploratory.

The repo already has a strong release pattern on the VS Code side: one source-of-truth checklist, focused CI validation, and secret-driven publish automation. The best Phase 7 shape is to mirror that pattern for the JetBrains plugin without forcing both ecosystems into one shared build script. That means plugin-local Gradle tasks and plugin-local docs should stay authoritative, while any CI integration can act as a thin wrapper that simply runs those commands from the repo root.

## Key Findings

### Packaging and verification

- JetBrains' official Gradle Plugin 2.x docs list `buildPlugin`, `verifyPluginProjectConfiguration`, `verifyPluginStructure`, and `verifyPlugin` as the core packaging and verification tasks for plugin release work.
- The IntelliJ Platform extension docs show that `pluginVerification.ides` supports explicit IDE selections through `create(...)`, plus report configuration and verifier failure-level controls.
- The current project already uses `buildPlugin`, `verifyPluginProjectConfiguration`, `verifyPluginStructure`, and `verifyPlugin`, so Phase 7 should extend existing Gradle wiring rather than replace it.
- The current `verifierIdeTargets` property defaults to IntelliJ IDEA and WebStorm. Based on the locked context decisions, that property should change to PyCharm for the default maintainer-owned verification path.

### PyCharm as the default verifier target

- JetBrains documents PyCharm as an IntelliJ Platform product with product-specific setup when a plugin needs Python APIs.
- This plugin currently depends only on `com.intellij.modules.platform`, not on Python-specific APIs, and Phase 4 explicitly chose a platform-level compatibility posture.
- Inference from the codebase and docs: using PyCharm as the default verifier target does not require changing the plugin to a PyCharm-specific dependency model, as long as the plugin continues using shared platform APIs only. PyCharm here is a validation target, not a narrowing of product scope.

### Signing and publish-ready configuration

- JetBrains' signing docs say `signPlugin` runs automatically before `publishPlugin` when signing inputs are provided.
- The same docs explicitly recommend environment variables for `CERTIFICATE_CHAIN`, `PRIVATE_KEY`, `PRIVATE_KEY_PASSWORD`, and `PUBLISH_TOKEN`, and note that multiline values can be Base64-encoded for IDE/CI environment fields.
- The Gradle extension docs expose `intellijPlatform.signing` and `intellijPlatform.publishing`, so Phase 7 can keep credentials completely out of committed files while still wiring a real future publish path.
- The project should stop short of live publication in this phase, but dormant publish-ready config is consistent with both the user decision and JetBrains' recommended Gradle path.

### Listing assets and manual submission

- JetBrains Marketplace docs emphasize that plugin pages are manually reviewed and that listing requirements can evolve, so the repo should capture submission-ready copy and a human runbook rather than rely on memory.
- JetBrains' plugin content docs recommend including plugin logo assets such as `META-INF/pluginIcon.svg` and `META-INF/pluginIcon_dark.svg` in the plugin distribution.
- The existing plugin descriptor contains a minimal description and vendor identity, but the repo has no JetBrains-specific listing copy, no screenshot requirements, and no submission checklist yet.
- The best fit for Phase 7 is a fuller listing pack: marketplace copy source, asset requirements/placeholders, release-notes guidance, and a manual submission checklist.

## Repo Implications

### What should change

- `jetbrains-plugin/build.gradle.kts`
  - Extend verifier-target parsing to support a PyCharm target notation.
  - Set signing and publishing configuration from environment variables.
  - Optionally add one aggregate validation task that wraps `buildPlugin`, `verifyPluginProjectConfiguration`, `verifyPluginStructure`, and `verifyPlugin`.
- `jetbrains-plugin/gradle.properties`
  - Change the default verifier target set to PyCharm.
  - Add clearly named release-related properties only when they are stable and non-secret.
- `jetbrains-plugin/README.md` and new docs under `jetbrains-plugin/docs/`
  - Document the local validation commands, env var names, artifact path, and manual submission flow.
- CI
  - A root workflow can call plugin-local Gradle commands, but the command list and release process should still live under `jetbrains-plugin/`.
- Marketplace assets
  - Add a source-of-truth listing document, screenshot requirements, and plugin icon assets.

### What should not change

- The plugin should stay on `com.intellij.modules.platform` unless a later phase introduces product-specific APIs.
- The release path should not depend on live credentials during normal development.
- Phase 7 should not turn into actual JetBrains Marketplace publication or monetization setup.

## Risks and Pitfalls

- **False compatibility confidence:** switching the default verifier target to PyCharm helps the maintainer, but it reduces default breadth. The docs and runbook should state clearly that the plugin is designed for IntelliJ Platform products and that broader verifier coverage can be run later if desired.
- **Credential leakage:** signing and publish settings must read from env vars only. No checked-in tokens, certs, or example secrets files with real-looking values.
- **Doc drift:** listing copy, plugin metadata, and release commands can diverge unless the plans keep one canonical docs path and link to it from `jetbrains-plugin/README.md`.
- **Artifact ambiguity:** maintainers need the exact ZIP location and validation commands written down, not implied.

## Recommended Planning Split

### 07-01: Packaging, verification, and signing-ready configuration

Focus on the executable build path:
- PyCharm as default verifier target
- aggregate validation commands
- environment-based signing and publish configuration
- plugin-local release workflow docs
- optional CI wrapper that runs the plugin-local validation commands

### 07-02: Marketplace listing assets and release instructions

Focus on the submission pack:
- marketplace listing copy source
- plugin icon assets
- screenshot and asset requirements/placeholders
- manual upload checklist and release-notes guidance

## Sources

- [Configuring IntelliJ Platform Gradle Plugin (2.x)](https://plugins.jetbrains.com/docs/intellij/configuring-gradle.html)
- [IntelliJ Platform Extension](https://plugins.jetbrains.com/docs/intellij/tools-intellij-platform-gradle-plugin-extension.html)
- [Plugin Signing](https://plugins.jetbrains.com/docs/intellij/plugin-signing.html)
- [Publishing and listing your plugin](https://plugins.jetbrains.com/docs/marketplace/publishing-and-listing-your-plugin.html)
- [PyCharm Plugin Development](https://plugins.jetbrains.com/docs/intellij/pycharm.html)
- [Plugins Targeting IntelliJ Platform-Based IDEs](https://plugins.jetbrains.com/docs/intellij/dev-alternate-products.html)
- [Plugin Content](https://plugins.jetbrains.com/docs/intellij/plugin-content.html)
- [Product codes](https://plugins.jetbrains.com/docs/marketplace/product-codes.html)

---
*Phase: 07-marketplace-readiness*
*Research completed: 2026-04-18*
