# JetBrains Plugin Architecture

The JetBrains plugin keeps its runtime under the `com.avepha.copyfilepathwithlinenumbers` package and splits work by host responsibility rather than mirroring VS Code types directly.

## Package Map

- `com.avepha.copyfilepathwithlinenumbers.actions` handles action registration, keyboard shortcuts, and any command entrypoints.
- `com.avepha.copyfilepathwithlinenumbers.editor` owns JetBrains editor, document, and project adapters.
- `com.avepha.copyfilepathwithlinenumbers.reference` contains JetBrains-side reference-building workflow logic and normalization orchestration.
- `com.avepha.copyfilepathwithlinenumbers.platform` holds IntelliJ Platform integration helpers such as notifications, clipboard access, and IDE-specific bridging.

## Compatibility Posture

- The plugin foundation targets `com.intellij.modules.platform` so it can stay compatible with broad IntelliJ Platform products until a later phase proves a product-specific dependency is necessary.
- The project treats the existing TypeScript engine as the behavioral specification for path and range formatting.
- VS Code-specific contracts are not shared runtime abstractions. JetBrains adapters should stay native to IntelliJ Platform APIs.
