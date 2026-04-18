# Phase 7: Marketplace Readiness - Pattern Map

**Mapped:** 2026-04-18
**Files analyzed:** 7
**Analogs found:** 7 / 7

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `jetbrains-plugin/build.gradle.kts` | build config | command-driven | `package.json` scripts + existing `jetbrains-plugin/build.gradle.kts` | role-match |
| `jetbrains-plugin/gradle.properties` | config | config-driven | root `package.json` metadata + existing `jetbrains-plugin/gradle.properties` | exact |
| `.github/workflows/release-validation.yml` | CI | event-driven | existing root PR validation workflow | exact |
| `jetbrains-plugin/README.md` | maintainer entrypoint | documentation-driven | `CONTRIBUTING.md` release section | role-match |
| `jetbrains-plugin/docs/release-workflow.md` | runbook | documentation-driven | `docs/release-checklist.md` | exact |
| `jetbrains-plugin/docs/marketplace-listing.md` | marketplace copy source | documentation-driven | `README.marketplace.md` | exact |
| `jetbrains-plugin/src/main/resources/META-INF/pluginIcon*.svg` | asset | package-content | `media/icon.png` + JetBrains `plugin.xml` resources | role-match |

## Pattern Assignments

### `jetbrains-plugin/build.gradle.kts` (build config, command-driven)

**Analogs:** root `package.json` scripts and existing `jetbrains-plugin/build.gradle.kts`

**Release command aggregation pattern** ([package.json](/Users/farhan/Documents/file-ref-extension/package.json:66)):

```json
"release:check": "npm run build && npm run typecheck && npm run test && npm run audit:check && npm run package && npm run package:inspect"
```

**Pattern to copy:** create one obvious JetBrains validation path that chains the packaging and verification tasks the maintainer needs before submission, rather than making them remember a loose list of Gradle commands.

**Existing verifier target parsing pattern** ([build.gradle.kts](/Users/farhan/Documents/file-ref-extension/jetbrains-plugin/build.gradle.kts:21)):

```kotlin
fun parseVerifierTarget(notation: String): Pair<IntelliJPlatformType, String> {
    val parts = notation.split(":", limit = 2)
    ...
}
```

**Pattern to copy:** extend the current string-to-platform mapping in place rather than replacing the verifier configuration structure.

### `.github/workflows/release-validation.yml` (CI, event-driven)

**Analog:** existing root validation workflow

**Focused PR validation pattern** ([release-validation.yml](/Users/farhan/Documents/file-ref-extension/.github/workflows/release-validation.yml:1)):

```yaml
on:
  pull_request:
...
  package:
    name: Package VSIX
```

**Pattern to copy:** keep CI as a thin wrapper that runs the authoritative local commands for the relevant ecosystem. For JetBrains work, that means `working-directory: jetbrains-plugin` and the Gradle commands from the plugin-local runbook.

### `jetbrains-plugin/docs/release-workflow.md` (runbook, documentation-driven)

**Analog:** `docs/release-checklist.md`

**Checklist/runbook pattern** ([docs/release-checklist.md](/Users/farhan/Documents/file-ref-extension/docs/release-checklist.md:1)):

```md
## Local validation

1. Run `npm install` if dependencies changed.
2. Run `npm run audit:check` ...
```

**Pattern to copy:** give maintainers a staged checklist with local validation, secret setup, and manual dry-run steps, not just a bare command list.

### `jetbrains-plugin/docs/marketplace-listing.md` (marketplace copy source, documentation-driven)

**Analog:** `README.marketplace.md`

**Marketplace copy source pattern** ([README.marketplace.md](/Users/farhan/Documents/file-ref-extension/README.marketplace.md:1)):

```md
# File Reference

Copy deterministic AI-ready file references ...
```

**Pattern to copy:** keep a standalone source document for marketplace-facing copy so release tooling and reviewers have one maintained place to pull title, summary, feature bullets, and supported-editor messaging from.

### `jetbrains-plugin/src/main/resources/META-INF/pluginIcon*.svg` (asset, package-content)

**Analogs:** root `media/icon.png` and JetBrains plugin content docs

**Packaged-asset pattern** ([package.json](/Users/farhan/Documents/file-ref-extension/package.json:12)):

```json
"icon": "media/icon.png"
```

**Pattern to copy:** keep packaged visual identity assets alongside the plugin descriptor resources so the marketplace artifact is self-contained.

### `jetbrains-plugin/README.md` (maintainer entrypoint, documentation-driven)

**Analog:** `CONTRIBUTING.md`

**Short entrypoint with deeper links pattern** ([CONTRIBUTING.md](/Users/farhan/Documents/file-ref-extension/CONTRIBUTING.md:9)):

```md
## Release workflow

- Pull requests are validated by `.github/workflows/release-validation.yml`.
...
See [docs/release-checklist.md](docs/release-checklist.md) ...
```

**Pattern to copy:** keep the README concise and link out to deeper runbooks and listing docs instead of overloading the top-level plugin README with every release detail.

## Shared Patterns

### One source of truth per concern

- Build and verification commands should live in Gradle plus a plugin-local release runbook.
- Marketplace copy should live in one listing doc, not be scattered across the README, plugin descriptor, and future submission notes.

### Thin wrappers around authoritative commands

- CI should call the same plugin-local commands that maintainers run.
- README pointers should lead to deeper docs rather than re-explaining the same steps.

### Distribution-ready assets stay close to the plugin

- Descriptor, icons, and marketplace copy inputs should all live under `jetbrains-plugin/` so the plugin can be released without depending on unrelated root assets.

---
*Phase: 07-marketplace-readiness*
*Patterns mapped: 2026-04-18*
