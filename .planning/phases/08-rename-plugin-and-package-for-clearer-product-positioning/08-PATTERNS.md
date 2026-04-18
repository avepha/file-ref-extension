# Phase 8: Rename plugin and package for clearer product positioning - Pattern Map

**Mapped:** 2026-04-18
**Files analyzed:** 11
**Analogs found:** 11 / 11

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `package.json` | VS Code product metadata | manifest-driven | existing `package.json` command and marketplace fields | exact |
| `README.md` | repo-facing product entrypoint | documentation-driven | existing root README public product narrative | exact |
| `README.marketplace.md` | VS Code marketplace copy source | documentation-driven | existing `README.marketplace.md` | exact |
| `jetbrains-plugin/gradle.properties` | JetBrains identity metadata | config-driven | existing `jetbrains-plugin/gradle.properties` | exact |
| `jetbrains-plugin/settings.gradle.kts` | JetBrains project/package artifact naming | build-config | existing `jetbrains-plugin/settings.gradle.kts` | exact |
| `jetbrains-plugin/src/main/resources/META-INF/plugin.xml` | JetBrains plugin descriptor | manifest-driven | existing `plugin.xml` public metadata and action registrations | exact |
| `jetbrains-plugin/README.md` | JetBrains maintainer entrypoint | documentation-driven | existing `jetbrains-plugin/README.md` | exact |
| `jetbrains-plugin/docs/marketplace-listing.md` | JetBrains marketplace copy source | documentation-driven | existing JetBrains listing source | exact |
| `jetbrains-plugin/docs/architecture.md` | namespace/package map | documentation-driven | existing architecture package map | exact |
| `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/**` | JetBrains runtime namespace | source-driven | existing Kotlin package tree | exact |
| `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/**` | JetBrains verification namespace | test-driven | existing Kotlin test package tree | exact |

## Pattern Assignments

### `package.json` and `plugin.xml` (manifest-driven identity surfaces)

**Analogs:** existing manifest metadata and action title fields

**Pattern to copy:** update identity at the manifest boundary first, then let downstream source/test work follow those decisions. The repo already treats manifest files as the source of truth for public naming and command/action labels.

**Why it fits:** both VS Code and JetBrains present user-visible naming through these files, so Phase 8 should lock the new name here before propagating it deeper.

### `README.marketplace.md` and `jetbrains-plugin/docs/marketplace-listing.md` (marketplace copy source)

**Analogs:** existing marketplace copy source docs

**Pattern to copy:** keep one canonical marketplace-copy document per ecosystem rather than scattering release messaging across README files, descriptor blurbs, and submission notes.

**Why it fits:** the repo already uses a standalone source-of-truth listing doc for JetBrains and a dedicated marketplace README for VS Code.

### `README.md` and `jetbrains-plugin/README.md` (short entrypoints with deeper links)

**Analogs:** existing root and JetBrains READMEs

**Pattern to copy:** keep top-level docs concise, aligned with the current product identity, and linked to deeper release/submission docs where needed.

**Why it fits:** previous phases already use short maintainer entrypoints backed by dedicated runbooks.

### `jetbrains-plugin/docs/architecture.md` and Kotlin package tree (doc + code namespace pairing)

**Analogs:** current JetBrains architecture package map plus the matching `com.avepha.filereference` directory structure

**Pattern to copy:** when package ownership is documented, the architecture doc and the source tree must move together.

**Why it fits:** leaving architecture docs on the old namespace after a code rename would create immediate drift and make future phases harder to reason about.

### Release and submission docs (distribution-facing consistency)

**Analogs:** `docs/release-checklist.md`, `jetbrains-plugin/docs/marketplace-submission.md`, and `jetbrains-plugin/docs/marketplace-assets/README.md`

**Pattern to copy:** distribution docs should point at the same package slugs, marketplace names, and artifact identity that the manifests actually ship.

**Why it fits:** the repo treats release-readiness as part of the product, not as optional post-processing.

## Shared Patterns

### One canonical public name, shorter task labels

- Use the full locked name on marketplace and README surfaces.
- Use shorter, explicit action and command labels inside the IDEs.
- Do not mirror the full public name verbatim into every technical identifier.

### Metadata first, namespace second

- First update the manifest/config surfaces that define the official identity.
- Then propagate the technical rename through code, tests, and architecture docs.
- This keeps the deeper rename anchored to explicit metadata choices instead of ad hoc replacements.

### Platform-local implementation, cross-product branding

- The public rename should be shared across both products.
- Platform-specific code and docs should still stay local to their own runtime directories (`jetbrains-plugin/` vs repo root VS Code extension files).

### Verification after every identity layer changes

- Manifest/doc rename work should be checked with the existing package/build commands.
- Source/package rename work should be checked with Gradle tests and plugin verification plus the VS Code build/test/package path.

---
*Phase: 08-rename-plugin-and-package-for-clearer-product-positioning*
*Patterns mapped: 2026-04-18*
