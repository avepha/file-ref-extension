# Phase 8: Rename plugin and package for clearer product positioning - Research

**Researched:** 2026-04-18
**Confidence:** HIGH
**Scope:** Cross-IDE product rename across the shipped VS Code extension, the JetBrains plugin, and their technical/package identities

## Executive Summary

Phase 8 is not a cosmetic doc pass. The current `File Reference` identity is wired into three different layers of the repo: public marketplace naming, package/plugin metadata, and JetBrains Kotlin package plus action namespaces. Because the user explicitly wants a full rename and is comfortable replacing the already-published VS Code identity, the cleanest planning shape is to separate the work into two passes: first, define and apply the new canonical public identity and metadata slugs across both products; second, propagate that identity through the deeper JetBrains source/test namespace rename, remaining technical identifiers, and release verification.

The new public name is intentionally long and descriptive: `Copy File Path with Line Numbers (AI Prompt)`. That works well for marketplace discovery, but it should not be copied verbatim into every command label, action text, or code namespace. The research-supported recommendation is to use the full public name for marketplace/documentation surfaces, shorter explicit labels inside the IDEs, and concise technical slugs for package identifiers. The repo already has a good pattern for this split: public-facing docs and manifest metadata are centralized, while implementation-specific identifiers stay in the platform-specific subproject.

## Key Findings

### The rename surface is broader than the roadmap title alone suggests

- The VS Code side still uses `File Reference` in `package.json`, `README.md`, `README.marketplace.md`, command titles, keywords, and marketplace links.
- The JetBrains side uses the old identity in `jetbrains-plugin/gradle.properties`, `jetbrains-plugin/src/main/resources/META-INF/plugin.xml`, `jetbrains-plugin/settings.gradle.kts`, marketplace docs, packaged asset docs, and the entire `com.avepha.filereference` Kotlin package tree.
- Inference from the repo shape: a true full rename necessarily spans metadata, docs, source packages, tests, and distribution-facing identifiers. Stopping at marketplace copy would leave the product internally inconsistent and make future maintenance confusing.

### Public identity and technical identity should be intentionally different

- The locked public name `Copy File Path with Line Numbers (AI Prompt)` is well suited to marketplace discoverability and README copy.
- The user also explicitly prefers shorter in-editor labels. That makes it safe to use shorter command and action text such as `Copy Absolute File Path with Line Numbers` and `Copy Relative File Path with Line Numbers`.
- The repo already tolerates shorter technical identifiers than public names: for example, the VS Code extension uses command IDs like `fileReference.copyAbsoluteReference` while the public command title is longer.
- Recommendation: choose technical slugs that preserve clarity without repeating `(AI Prompt)` or every stop word in code namespaces.

### The JetBrains namespace rename is the deepest-risk part

- The JetBrains plugin has package declarations, imports, action IDs, notification IDs, doc examples, and tests all rooted in `com.avepha.filereference`.
- `jetbrains-plugin/docs/architecture.md` also codifies that namespace as the future package map, so Phase 8 must update both code and architecture docs together.
- The VS Code side has fewer internal namespace constraints because the runtime is centered on manifest metadata and TypeScript file exports rather than Java/Kotlin package paths.
- Recommendation: treat the Kotlin namespace move and JetBrains action/notification ID updates as a dedicated second plan after the public metadata rename is locked.

### Distribution docs must move with the rename

- The repo has release-facing docs on both sides that still use the old name or old listing assumptions: `README.md`, `README.marketplace.md`, `docs/release-checklist.md`, `jetbrains-plugin/docs/marketplace-listing.md`, `jetbrains-plugin/docs/marketplace-assets/README.md`, and `jetbrains-plugin/docs/marketplace-submission.md`.
- Because the user is willing to replace the published VS Code identity, the docs should align with the new package and listing slugs instead of preserving old links for compatibility.
- Recommendation: update distribution docs in the same plan as the metadata rename so the repo never has a mixed-name release story.

## Repo Implications

### What should change

- `package.json`
  - Update `name`, `displayName`, keywords, manifest command titles, and any marketplace-facing metadata tied to the old identity.
  - Adopt a clearer technical namespace for command IDs if the implementation follows through on the full internal rename.
- `README.md` and `README.marketplace.md`
  - Rewrite the public narrative around the new name and update listing URLs to the new slug path.
- `jetbrains-plugin/gradle.properties`, `jetbrains-plugin/settings.gradle.kts`, and `jetbrains-plugin/src/main/resources/META-INF/plugin.xml`
  - Apply the new plugin name and plugin ID, plus shorter action labels and a shorter visible notification group.
- `jetbrains-plugin/src/main/kotlin/**` and `jetbrains-plugin/src/test/kotlin/**`
  - Rename the Kotlin package root away from `com.avepha.filereference` and update imports, file locations, action IDs, and tests to match.
- `jetbrains-plugin/docs/*.md`
  - Update marketplace, asset, submission, README, and architecture docs so they reflect the renamed product and any new technical slugs.

### What should not change

- The core product behavior should stay exactly the same: deterministic absolute and relative file references with current line or selected line range.
- Phase 8 should not become a feature phase for settings UI, alternate formats, or JetBrains-only interaction surfaces.
- The rename should not weaken the existing release-validation posture on either the VS Code or JetBrains side.

## Risks and Pitfalls

- **Long-name sprawl:** blindly copying the full public name into every command, action, ID, and package path will create awkward UI and brittle code. The plan should explicitly separate public naming from technical slugs.
- **Partial identity drift:** changing display names without updating package IDs, architecture docs, tests, and marketplace links will leave the repo inconsistent and confusing to maintain.
- **JetBrains package move regressions:** the Kotlin package rename affects imports, paths, action IDs, test expectations, and docs simultaneously. Missing one layer will break the build or leave stale references.
- **Release-link drift:** if VS Code/Open VSX links stay on the old slug while `package.json` changes, repo docs will point users at the wrong listing.
- **Over-scoping into migration tooling:** because the user is comfortable removing or unpublishing the old VS Code listing, the phase does not need complex migration compatibility logic. The plan should avoid inventing it.

## Recommended Technical Slug Strategy

These choices are not user-facing brand decisions; they are execution choices that keep the full rename concrete and consistent:

- VS Code extension package name: `copy-file-path-with-line-numbers`
- VS Code command namespace: `copyFilePathWithLineNumbers`
- JetBrains plugin ID: `com.avepha.copy-file-path-with-line-numbers`
- JetBrains Kotlin package root: `com.avepha.copyfilepathwithlinenumbers`
- JetBrains Gradle project name: `copy-file-path-with-line-numbers-jetbrains-plugin`

Rationale:
- They stay close to the discoverability-oriented public name.
- They avoid carrying the parenthetical `(AI Prompt)` into technical identifiers.
- They are explicit enough that future maintainers will not have to mentally translate an unrelated short codename back to the product.

## Recommended Planning Split

### 08-01: Apply the canonical public identity and metadata slugs across both products

Focus on manifest-level and doc-level identity:
- VS Code package name, display name, keywords, command titles, and marketplace-facing docs
- JetBrains plugin name, plugin ID, root project name, action text, notification group label, and marketplace-facing docs
- Release and submission docs updated to the new package/listing slugs
- Short in-editor labels chosen and applied consistently

### 08-02: Propagate the full rename through source namespaces, tests, and release verification

Focus on deep technical consistency:
- JetBrains Kotlin package and test namespace move from `com.avepha.filereference`
- Action IDs, class references, imports, and architecture docs updated to the new namespace
- Any remaining VS Code internal ID or packaging follow-through handled after metadata rename
- Full verification across `npm` and Gradle release paths to ensure the rename did not break shipped behavior

## Sources

- `package.json`
- `README.md`
- `README.marketplace.md`
- `jetbrains-plugin/gradle.properties`
- `jetbrains-plugin/settings.gradle.kts`
- `jetbrains-plugin/src/main/resources/META-INF/plugin.xml`
- `jetbrains-plugin/docs/marketplace-listing.md`
- `jetbrains-plugin/docs/marketplace-assets/README.md`
- `jetbrains-plugin/docs/marketplace-submission.md`
- `jetbrains-plugin/docs/architecture.md`
- `jetbrains-plugin/src/main/kotlin/com/avepha/filereference/**`
- `jetbrains-plugin/src/test/kotlin/com/avepha/filereference/**`

---
*Phase: 08-rename-plugin-and-package-for-clearer-product-positioning*
*Research completed: 2026-04-18*
