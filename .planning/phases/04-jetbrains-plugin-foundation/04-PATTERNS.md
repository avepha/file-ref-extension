# Phase 4: JetBrains Plugin Foundation - Patterns

**Generated:** 2026-04-18
**Purpose:** Repo pattern map for planning the JetBrains foundation work

## Reusable Patterns

- Keep host entrypoints thin. The current VS Code extension entrypoint only registers commands and hands off to a workflow/use-case layer.
- Keep product logic separate from host side effects. The reference engine computes output before clipboard or notification work happens.
- Keep tests contract-first. Existing tests validate deterministic behavior using plain data shapes instead of editor runtime objects.
- Keep packaging verification explicit. The repo already treats release/build validation as a first-class artifact, not a last-step chore.

## Boundaries To Preserve

- Reuse behavior, not runtime shapes. The TypeScript engine is the behavioral spec for line/range normalization, path formatting, and unsupported-state handling.
- Keep JetBrains-only concerns separate from core product rules: editor extraction, project/content-root resolution, action registration, notifications, clipboard access, and Gradle packaging.
- Do not force the current VS Code contracts into a fake cross-host abstraction. They already encode VS Code assumptions like `fsPath`, `scheme`, and workspace-folder semantics.

## Suggested Phase 4 Layout

```text
jetbrains-plugin/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
├── src/main/kotlin/com/avepha/filereference/
│   ├── actions/
│   ├── editor/
│   ├── reference/
│   └── platform/
├── src/main/resources/META-INF/plugin.xml
└── src/test/kotlin/com/avepha/filereference/
```

## Planning Cautions

- Do not make `src/workflow.ts` the cross-host abstraction boundary. It is still a VS Code-specific use-case shell.
- Do not let Phase 4 turn into a cross-language shared-runtime project. A clean JetBrains module is enough.
- Do not create product-specific JetBrains dependencies unless the code genuinely needs them. Broad support starts with platform-only dependencies and verifier coverage.
- Do not blur release tooling. The existing npm/esbuild VS Code flow should stay intact while the JetBrains Gradle flow is added alongside it.

---
*Phase: 04-jetbrains-plugin-foundation*
*Patterns created: 2026-04-18*
