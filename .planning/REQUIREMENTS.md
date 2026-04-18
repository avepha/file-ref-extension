# Requirements: File Reference

**Defined:** 2026-04-18
**Milestone:** v2.0 JetBrains Plugin
**Core Value:** Copy a correct, paste-ready file reference from the active editor instantly, with predictable formatting and minimal friction.

## v2.0 Requirements

### Platform Foundation

- [x] **PLAT-01**: Maintainer can build and run File Reference as an IntelliJ Platform plugin using the modern Gradle-based JetBrains plugin toolchain.
- [x] **PLAT-02**: Plugin metadata, dependencies, and compatibility ranges are defined so the plugin is positioned for broad JetBrains IDE support rather than IntelliJ IDEA only.

### Editor Support

- [x] **EDIT-01**: User can run File Reference from a supported JetBrains text editor backed by a local file.
- [x] **EDIT-02**: User gets a clear failure instead of copied output when the current editor state is unsupported.

### Reference Output

- [x] **REF-01**: User can copy an absolute file reference as `path:line` when there is no selection or the selection stays on one line.
- [x] **REF-02**: User can copy an absolute file reference as `path:start-end` when the selection spans multiple lines.
- [x] **REF-03**: User can copy a project-relative file reference with the same line and range rules when the file belongs to the current project.
- [x] **REF-04**: User can still copy a reference in relative mode for files outside the current project because the action falls back to an absolute path.
- [x] **REF-05**: User always gets POSIX-style forward slashes and normalized line ranges regardless of OS or selection direction.

### Access and Feedback

- [x] **ACC-01**: User can trigger the absolute and relative copy actions through JetBrains action discovery surfaces such as Find Action and registered menus.
- [x] **ACC-02**: User can use a keyboard-driven workflow to trigger the copy actions quickly in supported JetBrains editors.
- [x] **CLIP-01**: User gets the final file reference copied directly to the system clipboard with no confirmation step.
- [x] **CLIP-02**: User sees a concise success notification after a successful copy.
- [x] **CLIP-03**: User sees a clear failure notification when a copy action cannot run.

### Distribution Readiness

- [x] **DIST-01**: Maintainer can package the plugin artifact in the format expected by the JetBrains Marketplace.
- [x] **DIST-02**: Maintainer can run plugin structure and compatibility verification before release.
- [x] **DIST-03**: Maintainer has signing-ready and publish-ready configuration that uses environment-based secrets instead of committed credentials.
- [x] **DIST-04**: Maintainer has the marketplace listing assets and release instructions needed to submit the plugin manually later.

## Future Requirements

### Deferred Product Work

- **SET-01**: User can configure output behavior in a settings UI.
- **FMT-01**: User can choose alternate AI-specific output formats.
- **SURF-01**: User can trigger copy actions from richer JetBrains-only UI surfaces such as context menus or tool windows.
- **REL-01**: Maintainer can execute the live JetBrains Marketplace publish flow from project automation.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Settings UI | Out of scope for this milestone; keep the JetBrains port focused on product parity first |
| Alternate output formats | Out of scope until the plain-text JetBrains workflow is validated |
| Actual marketplace upload/publish | Prepare release assets and configuration, but stop before the live submission step |
| Large JetBrains-specific UX expansion | Keep the milestone close to the active-editor copy workflow proven in v1.0 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PLAT-01 | Phase 4 | Complete |
| PLAT-02 | Phase 4 | Complete |
| EDIT-01 | Phase 5 | Complete |
| EDIT-02 | Phase 5 | Complete |
| REF-01 | Phase 5 | Complete |
| REF-02 | Phase 5 | Complete |
| REF-03 | Phase 5 | Complete |
| REF-04 | Phase 5 | Complete |
| REF-05 | Phase 5 | Complete |
| ACC-01 | Phase 6 | Complete |
| ACC-02 | Phase 6 | Complete |
| CLIP-01 | Phase 6 | Complete |
| CLIP-02 | Phase 6 | Complete |
| CLIP-03 | Phase 6 | Complete |
| DIST-01 | Phase 7 | Complete |
| DIST-02 | Phase 7 | Complete |
| DIST-03 | Phase 7 | Complete |
| DIST-04 | Phase 7 | Complete |

**Coverage:**
- v2.0 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-04-18*
*Last updated: 2026-04-18 after Phase 7 execution*
