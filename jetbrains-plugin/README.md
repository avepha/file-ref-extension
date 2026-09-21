# Copy File Path with Line Numbers (AI Prompt) JetBrains Plugin

This Gradle project contains the JetBrains plugin for Copy File Path with Line Numbers (AI Prompt). It lives alongside the VS Code extension, but it uses an isolated IntelliJ Platform and Gradle toolchain under `jetbrains-plugin/`.

## Compatibility

- Runs on **any IntelliJ Platform IDE from build `233` (2023.3) through the latest and every future release** (`sinceBuild=233`, no upper bound), because the plugin depends only on `com.intellij.modules.platform` and uses long-stable editor APIs.
- `233` is the verified floor. It is not set by our source APIs (those go back years) but by the modern toolchain: the Kotlin 2.3 compiler emits `kotlin.enums.EnumEntries`, which needs the IDE's bundled Kotlin stdlib to be 1.9+ (first shipped in 2023.2/2023.3), and compiling against the 2026.1 SDK produces a companion-object `ModuleManager.getInstance` reference that only resolves on 2023.x+. The JetBrains Plugin Verifier confirms 2022.2 fails on these and 2023.3 passes.
- Bytecode targets Java 17 (`sourceCompatibility`/`targetCompatibility`/Kotlin `jvmTarget` = 17) so it loads on the JBR 17 IDEs (2023.3–2024.1) as well as the JBR 21 IDEs (2024.2+).
- This covers IntelliJ IDEA, PyCharm, WebStorm, GoLand, Rider, CLion, RubyMine, PhpStorm, Android Studio, and the rest of the family at 2023.3 or newer.
- Android Studio is supported from the **2023.2-based builds (Iguana)** onward — including **Panda 3 | 2025.3.3** (branch `253`), **Quail | 2026.1** (branch `261`), and later.
- The Plugin Verifier default targets pin the floor and both current ends of the range: `intellijIdeaCommunity:2023.3` (floor), `androidStudio:2025.3.3.6` (Panda 3), `androidStudio:2026.1.1.8` (Quail 1), and `pycharm:2026.1`. The build also accepts `webstorm`, `goland`, `rider`, `clion`, `rubymine`, `phpstorm`, `pycharmCommunity`, and `intellijIdea` targets for on-demand override (see `gradle.properties`).

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
