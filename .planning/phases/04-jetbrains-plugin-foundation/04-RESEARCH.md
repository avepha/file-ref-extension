# Phase 4: JetBrains Plugin Foundation - Research

**Researched:** 2026-04-18
**Domain:** IntelliJ Platform plugin foundation and compatibility setup
**Confidence:** HIGH

<user_constraints>
## User Constraints

No `04-CONTEXT.md` exists for this phase, so all implementation details remain at the agent's discretion.

Constraints inferred from roadmap, requirements, and prior milestone output:
- Preserve the shipped File Reference workflow as the product contract: deterministic `path:line` / `path:start-end`, minimal UX, explicit unsupported-state failures.
- Keep Phase 4 limited to plugin foundation, compatibility, and project boundaries. Do not implement the copy workflow yet.
- Broad JetBrains IDE support matters more than a fast IntelliJ IDEA-only spike.
- Keep JetBrains-specific build and runtime wiring isolated from the existing npm/esbuild VS Code toolchain.
</user_constraints>

<architectural_responsibility_map>
## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| JetBrains plugin build and sandbox run flow | Client plugin build layer | — | Gradle and IntelliJ Platform tasks own local development, packaging, and sandbox execution. |
| Plugin metadata and compatibility declarations | Client plugin descriptor layer | Marketplace metadata | `plugin.xml` and Gradle patching determine product loading rules and release metadata. |
| Future editor/action/reference implementation boundaries | Client plugin runtime layer | Shared product spec docs | Phase 4 should reserve clean package boundaries without prematurely implementing workflow logic. |
| Verification of cross-product compatibility | Build verification layer | Marketplace compatibility model | Plugin Verifier and descriptor validation catch accidental IntelliJ-only coupling early. |
</architectural_responsibility_map>

<research_summary>
## Summary

Phase 4 needs a standalone JetBrains plugin project inside the repo rather than a retrofit of the existing VS Code package. Current official JetBrains guidance recommends the IntelliJ Platform Gradle Plugin `2.x`, and the current published plugin ID is `org.jetbrains.intellij.platform`. The toolchain provides the tasks we need for this phase: `runIde`, `buildPlugin`, `verifyPluginProjectConfiguration`, `verifyPluginStructure`, and `verifyPlugin`.

The compatibility model is the main architectural decision in this phase. JetBrains documents that plugins with no module dependency, or only plugin dependencies, are treated as legacy and load only in IntelliJ IDEA. For a broad multi-product foundation, the plugin should declare `com.intellij.modules.platform` and avoid product-specific module dependencies such as `com.intellij.java` unless a later phase truly needs them. JetBrains also recommends omitting `until-build` by default so compatibility can extend forward and be narrowed later in Marketplace if necessary.

This phase should therefore establish a self-contained `jetbrains-plugin/` Gradle project, codify a platform-only dependency posture, and make the future package boundaries obvious for actions, editor adapters, and reference logic. The current TypeScript engine remains the behavioral spec, but not a shared runtime abstraction.

**Primary recommendation:** Create a standalone `jetbrains-plugin/` project using IntelliJ Platform Gradle Plugin `2.14.0`, Java `21` for a modern 2024.2+ baseline, `com.intellij.modules.platform` compatibility, and verifier-backed checks against more than IntelliJ IDEA.
</research_summary>

<standard_stack>
## Standard Stack

### Core
| Library / Tool | Version | Purpose | Why Standard |
|----------------|---------|---------|--------------|
| IntelliJ Platform Gradle Plugin | `2.14.0` | Build, sandbox run, packaging, signing, and verifier tasks | JetBrains currently recommends the `2.x` plugin and publishes `org.jetbrains.intellij.platform` as the active plugin ID. |
| Gradle Wrapper | `8.13+` | Reproducible local and CI build runtime | The current 2.x migration guide sets Gradle `8.13` as the minimum. |
| Java toolchain | `21` for 2024.2+ target branches | JVM compatibility for current platform releases | JetBrains documents Java `21` for 2024.2+ platform targets. |
| Kotlin source layout | project-default | Idiomatic plugin implementation language | JetBrains wizard/template defaults and ecosystem examples center on Kotlin-first plugin scaffolds. |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Plugin DevKit IDE plugin | IntelliJ IDEA support for plugin development | Install locally because it is no longer bundled since 2023.3. |
| IntelliJ Platform Plugin Template | Reference scaffold and CI patterns | Use as a structure reference, not as a full repo replacement. |
| Plugin Verifier | Cross-product binary compatibility checks | Use in this phase to prove the foundation is not accidentally IntelliJ-only. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `org.jetbrains.intellij.platform` 2.x | `org.jetbrains.intellij` 1.x | 1.x is obsolete and no longer the recommended baseline. |
| Standalone `jetbrains-plugin/` subproject | Root-level mixed Gradle/npm build | A nested Gradle project keeps JetBrains tooling isolated from the shipped VS Code release workflow. |
| Platform-only module dependency | Product-specific dependencies like `com.intellij.java` | Product-specific modules narrow compatibility too early and risk failing the broad-support goal. |
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure

```text
jetbrains-plugin/
├── build.gradle.kts
├── settings.gradle.kts
├── gradle.properties
├── gradle/wrapper/
├── src/main/kotlin/com/avepha/filereference/
│   ├── actions/
│   ├── editor/
│   ├── reference/
│   └── platform/
├── src/main/resources/META-INF/plugin.xml
└── src/test/kotlin/com/avepha/filereference/
```

### Pattern 1: Standalone JetBrains module inside a multi-runtime repo
**What:** Add a self-contained Gradle plugin project under `jetbrains-plugin/` instead of mixing JetBrains build files into the existing npm root.
**When to use:** When an existing repo already ships another editor integration and its release pipeline should stay untouched.
**Why:** It preserves the current VS Code package and tests while making the new plugin's build, sandbox, and verifier flow explicit.

### Pattern 2: Platform-first compatibility declaration
**What:** Declare `com.intellij.modules.platform` in `plugin.xml`, omit `until-build`, and defer product-specific dependencies until later phases prove they are necessary.
**When to use:** When a plugin's first milestone only needs editor/file/action foundation that exists across IntelliJ Platform products.
**Why:** JetBrains Marketplace compatibility derives from declared module/plugin dependencies, so broad support starts with conservative dependencies.

### Pattern 3: Behavior parity by contract, not by shared runtime
**What:** Use the existing TypeScript implementation as the behavioral source of truth, but create JetBrains-native packages for editor access, platform wiring, and future reference logic.
**When to use:** When porting the same user-facing workflow across different host runtimes and languages.
**Why:** Shared behavior is valuable; shared host abstractions too early will leak VS Code concepts into JetBrains design.

### Anti-Patterns to Avoid
- **Obsolete Gradle plugin baseline:** Do not start with `org.jetbrains.intellij` 1.x for a new plugin project.
- **Legacy dependency declaration:** Do not leave `plugin.xml` without a module dependency or with plugin-only dependencies.
- **Premature IntelliJ-specific coupling:** Do not add Java/IntelliJ IDEA-only modules in the foundation phase unless the code genuinely uses them.
- **Cross-host fake abstraction:** Do not force the current VS Code `EditorLike` contract into the JetBrains project as if it were host-neutral.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Sandbox IDE launching | Custom shell scripts to assemble plugin sandboxes | `runIde` | The official task already provisions the right IDE + sandbox behavior. |
| Descriptor/package validation | Manual zip inspection only | `verifyPluginProjectConfiguration` and `verifyPluginStructure` | Official tasks catch descriptor and archive problems earlier and more accurately. |
| Cross-product compatibility checks | Ad-hoc install tests in one IDE | `verifyPlugin` | Plugin Verifier is the official compatibility signal for multiple IDE builds. |
| Marketplace signing flow | Custom signing script in foundation phase | Built-in `signPlugin` / `publishPlugin` hooks later | Official Gradle integration already models the publish/sign path when the project reaches release readiness. |

**Key insight:** JetBrains already ships build, sandbox, structure, and compatibility tooling for plugin projects. Phase 4 should adopt that tooling directly rather than recreating it around the plugin.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Accidental IntelliJ IDEA-only compatibility
**What goes wrong:** The plugin loads in IntelliJ IDEA but is treated as legacy or incompatible elsewhere.
**Why it happens:** `plugin.xml` omits module dependencies or depends only on other plugins.
**How to avoid:** Declare `com.intellij.modules.platform` and verify against at least one non-IntelliJ product branch.
**Warning signs:** Marketplace/product compatibility looks narrower than expected or verifier checks only one IDE.

### Pitfall 2: Mixing JetBrains build logic into the npm root
**What goes wrong:** The repo ends up with tangled release tooling and unclear ownership between VS Code and JetBrains artifacts.
**Why it happens:** Root-level Gradle files or shared scripts are introduced before the new plugin boundaries are clear.
**How to avoid:** Keep the JetBrains plugin in `jetbrains-plugin/` with its own wrapper, properties, and docs.
**Warning signs:** Root README/package scripts start referencing Gradle before the JetBrains project is even runnable on its own.

### Pitfall 3: Recreating VS Code concepts instead of designing JetBrains-native boundaries
**What goes wrong:** Future phases inherit awkward abstractions around workspace folders, URIs, and editor shells that do not map well to IntelliJ Platform APIs.
**Why it happens:** The current TypeScript contracts are mistaken for universal host-neutral types.
**How to avoid:** Reuse behavior as the spec, but define JetBrains-native packages and contracts for editor/project access.
**Warning signs:** New Kotlin types mirror VS Code names like `WorkspaceFolderLike` or `EditorLike` verbatim.

### Pitfall 4: Over-constraining version compatibility too early
**What goes wrong:** The plugin unnecessarily excludes future compatible IDE releases.
**Why it happens:** `until-build` is pinned during initial scaffolding.
**How to avoid:** Set `since-build`, omit `until-build`, and let Marketplace narrow later only if required.
**Warning signs:** Plugin descriptor includes an upper bound before compatibility policy or release cadence exists.
</common_pitfalls>

<verification_strategy>
## Verification Strategy

- Use `./gradlew runIde` as the primary proof that the project launches a JetBrains development instance from the repo.
- Run `./gradlew verifyPluginProjectConfiguration` and `./gradlew verifyPluginStructure` in this phase to validate the scaffold and descriptor.
- Configure `verifyPlugin` against a small current-product matrix before leaving the phase, so platform-only compatibility is tested instead of assumed.
- Keep Phase 4 verification focused on build/runtime foundation and compatibility declarations, not end-user copy behavior.
</verification_strategy>

<proposed_plan_split>
## Proposed Plan Split

### Plan 04-01
Create the standalone IntelliJ Platform plugin project, Gradle wrapper/build files, metadata baseline, and local developer run instructions.

### Plan 04-02
Lock the compatibility model (`com.intellij.modules.platform`, version range policy, verifier targets) and define the JetBrains-side package boundaries for actions, editor access, and reference logic.
</proposed_plan_split>

## Sources

- [Developing a Plugin](https://plugins.jetbrains.com/docs/intellij/developing-plugins.html)
- [IntelliJ Platform Gradle Plugin (2.x) Configuration](https://plugins.jetbrains.com/docs/intellij/configuring-gradle.html)
- [IntelliJ Platform Gradle Plugin Plugins](https://plugins.jetbrains.com/docs/intellij/tools-intellij-platform-gradle-plugin-plugins.html)
- [Migrating from Gradle IntelliJ Plugin (1.x)](https://plugins.jetbrains.com/docs/intellij/tools-intellij-platform-gradle-plugin-migration.html)
- [Plugin Compatibility with IntelliJ Platform Products](https://plugins.jetbrains.com/docs/intellij/plugin-compatibility.html?section=English)
- [Plugins Targeting IntelliJ Platform-Based IDEs](https://plugins.jetbrains.com/docs/intellij/dev-alternate-products.html)
- [Plugin Configuration File](https://plugins.jetbrains.com/docs/intellij/plugin-configuration-file.html)
- [Plugin Signing](https://plugins.jetbrains.com/docs/intellij/plugin-signing.html)
- [IntelliJ Platform Plugin Template](https://plugins.jetbrains.com/docs/intellij/plugin-github-template.html)
- [Plugin Content](https://plugins.jetbrains.com/docs/intellij/plugin-content.html)
- [Incompatible Changes in IntelliJ Platform and Plugins API 2026.*](https://plugins.jetbrains.com/docs/intellij/api-changes-list-2026.html)

---
*Phase: 04-jetbrains-plugin-foundation*
*Research created: 2026-04-18*
