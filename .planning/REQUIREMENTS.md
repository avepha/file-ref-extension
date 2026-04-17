# Requirements: File Reference

**Defined:** 2026-04-17
**Core Value:** Copy a correct, paste-ready file reference from VS Code instantly, with predictable formatting and minimal friction.

## v1 Requirements

### Editor Support

- [x] **EDIT-01**: User can run File Reference from a saved local text file in the active editor.
- [x] **EDIT-02**: User gets a clear error instead of copied output when the active editor is unsupported.

### Reference Output

- [x] **REF-01**: User can copy an absolute file reference as `path:line` when there is no selection or the selection stays on one line.
- [x] **REF-02**: User can copy an absolute file reference as `path:start-end` when the selection spans multiple lines.
- [x] **REF-03**: User can copy a workspace-relative file reference with the same line and range rules when the file belongs to a workspace folder.
- [x] **REF-04**: User can still copy a reference when using relative mode outside the workspace because the command falls back to an absolute path.
- [x] **REF-05**: User always gets POSIX-style forward slashes and normalized line ranges regardless of platform or selection direction.

### Access

- [x] **ACC-01**: User can run the absolute and relative copy commands from the Command Palette.
- [x] **ACC-02**: User can trigger the absolute and relative copy commands with the default macOS shortcuts.
- [x] **ACC-03**: User can trigger the absolute and relative copy commands with the default Windows and Linux shortcuts.

### Clipboard and Feedback

- [x] **CLIP-01**: User gets the final file reference copied directly to the clipboard with no confirmation step.
- [x] **CLIP-02**: User sees a concise success notification after a successful copy.
- [x] **CLIP-03**: User sees a clear failure notification when a copy command cannot run.

### Release Quality

- [x] **REL-01**: Maintainer can package and publish the extension to VS Code Marketplace and Open VSX.
- [x] **REL-02**: Users get consistent copy behavior on macOS, Windows, and Linux.

## v2 Requirements

### Usability Enhancements

- **USE-01**: User can trigger file-reference copy from an editor context menu entry.
- **USE-02**: User gets improved multi-root workspace disambiguation when more than one workspace folder could affect relative output.

### Alternate Formats

- **FMT-01**: User can choose from a small set of opinionated alternate reference formats for specific AI tools.

### Expanded Surfaces

- **SURF-01**: User can copy references for files or folders from the Explorer.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Untitled, unsaved, notebook, diff, virtual, and other non-local documents | MVP supports only saved local text files in the active editor because those states have ambiguous or unsupported path semantics |
| Column numbers | The core product goal is line-based references, and column support adds complexity without improving the primary AI workflow |
| Markdown link formatting | MVP favors plain text that pastes cleanly into any AI tool or chat surface |
| Fully customizable output templates | Heavy customization weakens predictability and expands the test surface too early |
| Tool-specific auto-paste into AI chat UIs | Clipboard-first behavior is more reliable and avoids brittle UI coupling |
| Status bar integration | Adds UI surface area without improving the primary one-keystroke workflow |
| Multi-cursor or multi-file aggregate copy | Increases formatting and UX complexity before the single-reference workflow is validated |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| EDIT-01 | Phase 1 | Complete |
| EDIT-02 | Phase 1 | Complete |
| REF-01 | Phase 1 | Complete |
| REF-02 | Phase 1 | Complete |
| REF-03 | Phase 1 | Complete |
| REF-04 | Phase 1 | Complete |
| REF-05 | Phase 1 | Complete |
| ACC-01 | Phase 2 | Complete |
| ACC-02 | Phase 2 | Complete |
| ACC-03 | Phase 2 | Complete |
| CLIP-01 | Phase 2 | Complete |
| CLIP-02 | Phase 2 | Complete |
| CLIP-03 | Phase 2 | Complete |
| REL-01 | Phase 3 | Complete |
| REL-02 | Phase 3 | Complete |

**Coverage:**
- v1 requirements: 15 total
- Mapped to phases: 15
- Unmapped: 0 ✓

---
*Requirements defined: 2026-04-17*
*Last updated: 2026-04-17 after roadmap creation*
