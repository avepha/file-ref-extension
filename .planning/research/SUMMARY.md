# Project Research Summary

**Project:** File Reference
**Domain:** VS Code utility extension for AI-friendly file references
**Researched:** 2026-04-17
**Confidence:** HIGH

## Executive Summary

File Reference is a narrow, command-driven VS Code extension: users want one keystroke that copies a stable file reference such as `path:line` or `path:start-end` for use in AI chats, issues, and docs. The research is unusually consistent: experts build this kind of product as a small desktop extension with almost no UI, a thin activation layer, pure formatting/path logic, and strict support boundaries around saved local `file:` documents.

The recommended approach is opinionated and simple: TypeScript + esbuild, two explicit commands (absolute and relative), deterministic plain-text formatting, workspace-relative output with absolute fallback, and minimal feedback. The architecture should be a thin VS Code shell around a pure domain core so line normalization, path normalization, and validation are easy to test before wiring the extension host.

The main risks are not scale or performance; they are correctness and scope creep. The roadmap should front-load validation, line/range normalization, cross-platform path formatting, and workspace-relative semantics, while explicitly deferring tool-specific auto-paste, rich configuration, explorer workflows, and multi-file aggregation until demand is proven.

## Key Findings

### Recommended Stack

Use the standard 2025+ stack for a small public VS Code extension: TypeScript for safer URI/path handling, esbuild for the simplest fast bundle, ESLint 9 flat config for modern linting, and the official VS Code test tooling for extension-host tests. Keep MVP runtime scope to a desktop/local Node extension only, with no runtime dependencies unless later requirements prove a real need.

**Core technologies:**
- **VS Code Extension API + manifest (`engines.vscode` / `@types/vscode` `^1.100.0`)**: runtime, commands, clipboard, metadata — current official baseline and avoids legacy activation patterns.
- **TypeScript (`^5.9.2`)**: extension source language — safest low-cost choice for URI/path correctness.
- **esbuild (`^0.25.0`)**: bundle `src/extension.ts` to `dist/extension.js` — fastest, smallest-config option for a tiny command extension.
- **Node 24 LTS + npm 10+**: development toolchain — stable and directly aligned with VS Code packaging workflows.
- **`@vscode/test-cli` + `@vscode/test-electron` + Mocha**: integration testing — official path for extension-host validation.
- **`@vscode/vsce` + `ovsx`**: packaging and publishing — needed because Marketplace and Open VSX are separate release targets.

Critical packaging/runtime choices: bundle to a single `dist/extension.js`, prefer `extensionKind: ["ui"]`, declare virtual workspaces unsupported for MVP, and use `vscode.env.clipboard` rather than third-party clipboard packages.

### Expected Features

The category has clear table stakes: users expect to copy the current file reference or selected line range instantly from the active editor, via both Command Palette and shortcuts, with deterministic plain-text output and reliable clipboard behavior. The project should compete on predictability and speed, not on customization.

**Must have (table stakes):**
- Copy current file reference from the active editor.
- Copy selected line range with normalized `start-end` behavior.
- Relative path output for workspace files.
- Absolute-path fallback when relative output is impossible.
- Command Palette commands plus default cross-platform keybindings.
- Clipboard write with immediate clear success/error feedback.
- Deterministic plain-text formatting using POSIX slashes.

**Should have (competitive):**
- Separate “copy absolute” and “copy relative” commands to avoid mode confusion.
- Strict AI-friendly formatting discipline with one canonical output shape.
- Cross-OS path normalization and selection normalization.
- Minimal UX surface area that feels instant and trustworthy.

**Defer (v2+):**
- Explorer file/folder copying.
- Multi-cursor or multi-file aggregate references.
- Tool-specific auto-paste into AI chat panels.
- Highly customizable output templates.
- Hover previews or richer prompt-authoring UI.

### Architecture Approach

The right architecture is a thin VS Code shell around a pure formatting core. `extension.ts` should only register commands; command handlers should orchestrate validation, range normalization, path resolution, formatting, clipboard writes, and notifications through small modules with `vscode` API usage pushed to the platform edge.

**Major components:**
1. **Manifest + entrypoint** — declare commands/keybindings and keep activation as a tiny composition root.
2. **Command/use-case layer** — run one shared copy-reference flow with `absolute` vs `relative` mode.
3. **Domain layer** — validate supported editor state, normalize lines/ranges, resolve paths, and format the final reference string.
4. **Platform layer** — perform clipboard writes and show concise success/error messages.
5. **Test layer** — lock down pure logic with unit tests and verify command behavior with a few integration tests.

### Critical Pitfalls

1. **Assuming every active editor is a normal local file** — validate active text editor, saved document, `file` scheme, and non-diff state before any formatting.
2. **Getting line/range normalization subtly wrong** — centralize one output contract, convert to 1-based lines at the formatter boundary, and test forward/backward/single/multi-line selections.
3. **Mixing filesystem paths with display-format rules** — resolve file locations first, then normalize emitted output to forward slashes via one canonical formatter.
4. **Breaking relative-path behavior in multi-root or out-of-workspace cases** — define the rule now: relative to containing workspace folder, otherwise absolute fallback.
5. **Shipping the wrong runtime/clipboard behavior** — use `vscode.env.clipboard`, prefer `extensionKind: ["ui"]`, and validate at least one remote scenario.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Reference Engine
**Rationale:** Everything depends on a correct, deterministic output contract; this is the highest product risk and easiest part to validate early.
**Delivers:** Validation for supported editor states, line/range normalization, path normalization, absolute/relative path resolution rules, formatter unit tests.
**Addresses:** Absolute copy, current-line and selected-range support, deterministic formatting, absolute fallback behavior.
**Avoids:** Unsupported-editor bugs, off-by-one line errors, OS-specific path inconsistency.

### Phase 2: VS Code Command UX
**Rationale:** Once the core is correct, wire it into the editor with the smallest possible UX surface and validate daily-use ergonomics.
**Delivers:** Two commands, shared copy use case, Command Palette entries, default per-platform keybindings, concise success/error messaging, `when`/enablement rules.
**Uses:** VS Code contribution points, clipboard API, `extensionKind: ["ui"]` runtime placement.
**Implements:** Manifest, entrypoint, command layer, platform adapters.
**Avoids:** Keybinding conflicts, noisy UX, wrong clipboard host behavior.

### Phase 3: Packaging and Release Readiness
**Rationale:** Packaging should wrap a stable runtime, not shape implementation decisions.
**Delivers:** esbuild bundle, `vscode:prepublish`, `.vscodeignore`, Marketplace/Open VSX metadata, `vsce`/`ovsx` workflows, release checklist.
**Addresses:** Recommended stack and packaging choices for public distribution.
**Avoids:** Sloppy VSIX contents, metadata failures, late publish surprises.

### Phase 4: Verification and Post-MVP Polish
**Rationale:** The remaining risk is environment coverage, not feature breadth.
**Delivers:** Extension-host integration tests, cross-platform path fixtures, single-root/multi-root/out-of-workspace validation, one remote clipboard/runtime sanity check, optional P2 polish only if core usage validates demand.
**Addresses:** Relative-path semantics, packaging confidence, selective v1.x improvements like context menu entry or multi-root polish.
**Avoids:** Regressions from “too small to test” assumptions and hidden remote/workspace edge cases.

### Phase Ordering Rationale

- Build the pure domain core first because deterministic correctness is the real product, while VS Code wiring is straightforward afterward.
- Group command UX after core logic so shortcuts, messages, and command names reflect settled validation and formatting rules.
- Keep packaging after runtime stability so bundle/release work does not distort architecture.
- Put deeper environment verification last but mandatory, since multi-root, cross-platform, and remote behavior are the main remaining risk pockets.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2:** confirm best default cross-platform shortcuts and decide how aggressive success notifications should be for high-frequency use.
- **Phase 4:** validate at least one remote-development scenario and finalize exact test fixtures for multi-root and Windows path behavior.
- **Any v1.x alternate format phase:** if Claude-style syntax is added later, do targeted demand/API research first rather than inferring from competitor behavior.

Phases with standard patterns (skip research-phase):
- **Phase 1:** pure formatter/validator/path modules are well-documented and already strongly covered by the research.
- **Phase 3:** bundling, packaging, and publishing follow established official VS Code and Open VSX workflows.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Backed mostly by official VS Code, Node, and Open VSX documentation with clear current-version recommendations. |
| Features | MEDIUM | Strong pattern consistency across competitors, but competitor README analysis is less authoritative than official docs. |
| Architecture | HIGH | Driven by official VS Code extension guidance and very standard utility-extension patterns. |
| Pitfalls | HIGH | Mostly grounded in official VS Code docs plus realistic extension-host/runtime failure modes. |

**Overall confidence:** HIGH

### Gaps to Address

- **Default shortcut choice:** validate actual conflicts on macOS, Windows, and Linux during planning before freezing keybindings.
- **Success-feedback policy:** decide whether frequent success toasts are acceptable or whether lighter feedback is needed after hands-on testing.
- **Remote behavior boundary:** MVP research recommends local desktop scope, but one remote-window sanity check is still prudent because clipboard behavior is UI-host sensitive.
- **Alternate format demand:** keep plain text as the default unless real users repeatedly request agent-specific syntax.

## Sources

### Primary (HIGH confidence)
- VS Code official docs — extension anatomy, manifest, contribution points, activation events, bundling, testing, publishing, virtual workspaces, workspace trust, extension host, notifications, command palette, when clauses, remote extensions.
- Node.js official release guidance — Node LTS recommendation for tooling.
- Open VSX official publishing docs/wiki — separate publishing requirements and token flow.
- Current Microsoft VS Code extension samples — TypeScript, esbuild, and test-cli baselines.

### Secondary (MEDIUM confidence)
- Competitor extension READMEs and Open VSX listing patterns — table stakes, differentiators, and common scope creep patterns for file-reference utilities.
- Project research files: `.planning/research/STACK.md`, `.planning/research/FEATURES.md`, `.planning/research/ARCHITECTURE.md`, `.planning/research/PITFALLS.md`.

### Tertiary (LOW confidence)
- None material; the main remaining unknowns are product decisions to validate in implementation, not missing source categories.

---
*Research completed: 2026-04-17*
*Ready for roadmap: yes*
