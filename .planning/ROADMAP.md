# Roadmap: File Reference

## Milestones

- [x] **v1.0 MVP** - Shipped 2026-04-17. Reference engine, command workflow, and release readiness are archived in [v1.0-ROADMAP.md](/Users/farhan/Documents/file-ref-extension/.planning/milestones/v1.0-ROADMAP.md).
- [ ] **v2.0 JetBrains Plugin** - All planned phases are complete as of 2026-04-18. The plugin is prepared for manual JetBrains Marketplace submission, with milestone closeout still separate from the live publish.

## Overview

The first milestone proved the product in VS Code. This roadmap extends that validated copy workflow into the JetBrains ecosystem by building an IntelliJ Platform plugin, recreating the deterministic absolute and relative reference behavior, wiring it into JetBrains-native action surfaces, and finishing the packaging and verification work needed for a marketplace-ready release.

### v2.0 JetBrains Plugin

**Milestone Goal:** Deliver a JetBrains plugin version of File Reference that preserves the core `path:line` and `path:start-end` workflow from the shipped VS Code MVP while adapting to JetBrains-native action patterns and preparing the plugin for JetBrains Marketplace submission.

#### Phase 4: JetBrains Plugin Foundation
**Goal**: Establish the IntelliJ Platform plugin project, compatibility model, and core platform wiring needed for broad JetBrains IDE support.
**Depends on**: Phase 3
**Requirements**: [PLAT-01, PLAT-02]
**Success Criteria** (what must be TRUE):
1. A developer can run the plugin in a JetBrains IDE development instance from the project.
2. Plugin metadata and compatibility settings are defined for broad JetBrains IDE support rather than a one-off IntelliJ-only spike.
3. The project structure makes it clear where JetBrains-specific actions, editor access, and reference logic will live.
**Plans**: 2 plans

Plans:
- [x] 04-01: Create the IntelliJ Platform plugin project, Gradle build, and metadata baseline
- [x] 04-02: Define compatibility, dependency, and module boundaries for broad JetBrains IDE support

#### Phase 5: Reference Copy Engine
**Goal**: Implement the JetBrains-side editor validation, line/range normalization, path resolution, and deterministic reference formatting.
**Depends on**: Phase 4
**Requirements**: [EDIT-01, EDIT-02, REF-01, REF-02, REF-03, REF-04, REF-05]
**Success Criteria** (what must be TRUE):
1. A user can copy deterministic absolute and project-relative references from supported JetBrains editors.
2. Relative mode falls back to absolute output when project-relative resolution is not possible.
3. Unsupported editor states fail clearly without copying ambiguous output.
**Plans**: 2 plans

Plans:
- [x] 05-01: Implement editor-state guards and line/range normalization
- [x] 05-02: Implement path resolution and final reference formatting with test coverage

#### Phase 6: JetBrains Action Workflow
**Goal**: Expose the copy workflow through JetBrains-native action surfaces, keyboard-driven access, clipboard integration, and concise user feedback.
**Depends on**: Phase 5
**Requirements**: [ACC-01, ACC-02, CLIP-01, CLIP-02, CLIP-03]
**Success Criteria** (what must be TRUE):
1. Users can discover and run absolute and relative copy actions from standard JetBrains action entry points.
2. The plugin supports a quick keyboard-driven workflow in supported editors.
3. Successful copy writes to the clipboard and failures produce concise, specific feedback.
**Plans**: 2 plans

Plans:
- [x] 06-01: Register actions, action visibility rules, and keyboard-driven entry points
- [x] 06-02: Wire clipboard execution and user messaging into the shared copy workflow

#### Phase 7: Marketplace Readiness
**Goal**: Make the JetBrains plugin build, verification, signing configuration, and listing assets ready for manual marketplace submission.
**Depends on**: Phase 6
**Requirements**: [DIST-01, DIST-02, DIST-03, DIST-04]
**Success Criteria** (what must be TRUE):
1. Maintainers can build the distributable plugin artifact and run verification tasks locally or in CI.
2. Publish and signing configuration is ready for environment-based secrets without committing credentials.
3. Marketplace listing assets and release instructions exist for a future manual submission.
**Plans**: 2 plans

Plans:
- [x] 07-01: Add packaging, verification, and signing-ready build configuration
- [x] 07-02: Create JetBrains Marketplace listing assets and release instructions

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 4. JetBrains Plugin Foundation | v2.0 | 2/2 | Completed | 2026-04-18 |
| 5. Reference Copy Engine | v2.0 | 2/2 | Completed | 2026-04-18 |
| 6. JetBrains Action Workflow | v2.0 | 2/2 | Completed | 2026-04-18 |
| 7. Marketplace Readiness | v2.0 | 2/2 | Completed | 2026-04-18 |
| 8. Rename plugin and package for clearer product positioning | v2.0 | 2/2 | Completed | 2026-04-18 |

### Phase 8: Rename plugin and package for clearer product positioning

**Goal:** Rename the VS Code extension and JetBrains plugin to `Copy File Path with Line Numbers (AI Prompt)` across metadata, package/plugin IDs, runtime namespaces, and release docs without changing the product behavior.
**Requirements**: Preserve the existing deterministic copy workflow while applying the rename consistently across both IDE ecosystems.
**Depends on:** Phase 7
**Plans:** 2 plans

Plans:
- [x] 08-01: Rename public metadata, marketplace copy, and release docs across VS Code and JetBrains
- [x] 08-02: Rename JetBrains namespaces and re-verify both release paths
