# JetBrains Plugin Architecture

The JetBrains plugin keeps its runtime under the `com.avepha.copyfilepathwithlinenumbers` package and splits work by host responsibility rather than mirroring VS Code types directly.

## Package Map

- `com.avepha.copyfilepathwithlinenumbers.actions` handles action registration, keyboard shortcuts, and any command entrypoints.
- `com.avepha.copyfilepathwithlinenumbers.editor` owns JetBrains editor, document, and project adapters.
- `com.avepha.copyfilepathwithlinenumbers.reference` contains JetBrains-side reference-building workflow logic and normalization orchestration.
- `com.avepha.copyfilepathwithlinenumbers.platform` holds IntelliJ Platform integration helpers such as notifications, clipboard access, and IDE-specific bridging.

## Compatibility Posture

- The plugin foundation targets `com.intellij.modules.platform` so it stays compatible with the entire IntelliJ Platform product family (IntelliJ IDEA, PyCharm, WebStorm, GoLand, Rider, CLion, RubyMine, PhpStorm, Android Studio, and more) without a product-specific dependency.
- The compatibility floor is `sinceBuild=233` (2023.3) with no upper bound. This floor is dictated by the build toolchain, not by the plugin's own API surface (which reaches back years):
  - The Kotlin 2.3 compiler emits `kotlin.enums.EnumEntries` for every enum, which requires the IDE's bundled Kotlin stdlib to be 1.9+ (first in 2023.2/2023.3). Older IDEs would hit `NoSuchClassError`.
  - Compiling against the 2026.1 SDK produces a companion-object reference for `ModuleManager.getInstance`, which resolves only on 2023.x+ platforms.
  - The JetBrains Plugin Verifier confirms both: 2022.2 reports these as compatibility problems; 2023.3 and 2024.1 are Compatible.
- Bytecode targets Java 17 (`targetCompatibility`/Kotlin `jvmTarget` = 17) even though it compiles with a JDK 21 toolchain against the 2026.1 SDK. This is required so classes load on the JBR 17 IDEs (2023.3–2024.1); Java 21 bytecode would fail with `UnsupportedClassVersionError` there. JBR 21 IDEs (2024.2+) run Java 17 bytecode without issue.
- The plugin builds against IntelliJ Platform 2026.1 while remaining verifiable back to 2023.3 (IntelliJ IDEA Community) and forward across Android Studio Panda/Quail.
- To push the floor below 233 later, the plugin would need to bundle its own Kotlin stdlib (or compile against an older SDK) — deliberately out of scope given the low value of pre-2023.3 IDEs.
- The project treats the existing TypeScript engine as the behavioral specification for path and range formatting.
- VS Code-specific contracts are not shared runtime abstractions. JetBrains adapters should stay native to IntelliJ Platform APIs.
