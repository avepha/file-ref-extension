# Feature Research

**Domain:** VS Code utility extension for AI-friendly file references
**Researched:** 2026-04-17
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Copy current file reference from active editor | This is the core job; competing extensions all support cursor-based single-line copy | LOW | Must work with no selection and produce deterministic output every time |
| Copy selected line range | Range copy is a standard expectation in this category, not a premium feature | LOW | Normalize reversed selections to `start-end`; depends on active text editor support |
| Command Palette + keyboard shortcut access | Utility extensions live or die on speed, but still need discoverability | LOW | Cross-platform default bindings matter more than rich UI |
| Clipboard write + immediate success/error feedback | Users need confidence that the one-step action worked | LOW | Success toast is enough; clear failures for unsupported editors are table stakes |
| Relative path output for workspace files | Most competitors default to workspace-relative output because it pastes well in chats, issues, and docs | LOW | Should resolve against workspace folder and stay stable in multi-root cases |
| Absolute-path fallback when relative path is impossible | External files and non-workspace files are common enough that silent failure feels broken | LOW | Important for reliability; matches project requirement to fall back instead of erroring |
| Deterministic plain-text formatting | AI workflows punish ambiguity; users expect a paste-ready reference, not UI-heavy formatting | LOW | `path:line` / `path:start-end`, POSIX slashes, no hidden metadata |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Separate “copy absolute” and “copy relative” commands | Removes mode confusion and keeps the tool fast for repeated use | LOW | Strong fit for this project's minimalism; better than one overloaded command with settings |
| AI-friendly formatting discipline | A strict, boring format is a differentiator because many adjacent tools drift into chat-specific or decorative output | LOW | Use one canonical format and document it clearly |
| Selection normalization and path normalization across OSes | Predictable output is more valuable in AI workflows than a long settings page | MEDIUM | Forward slashes on Windows and stable range ordering reduce prompt cleanup |
| Minimal UX surface area | Competitors often add explorer menus, rich previews, or auto-paste flows; a focused extension can win on trust and speed | LOW | Differentiate by feeling instant, obvious, and safe rather than feature-dense |
| Workspace-relative with sensible fallback policy | Some extensions choose one path mode; supporting both cleanly covers more AI tool contexts without configuration | LOW | Especially useful when users switch between local agents and shared chat tools |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Tool-specific auto-paste into Claude/Copilot/Chat panels | Feels magical for demos and reduces one more paste step | Couples the extension to unstable UI targets, creates brittle focus logic, and breaks the "copy reference" mental model | Stay clipboard-first; consider optional integrations only after core demand is proven |
| Highly customizable output templates | Users like flexibility and different tools use different syntaxes | Explodes test surface, weakens predictability, and makes support/docs harder for a tiny utility | Ship one default format in MVP; add only a very small number of opinionated variants later if demand is strong |
| Rich context packaging (copy file contents, previews, concatenation) | Seems helpful for AI prompts | Moves the product into prompt-building/context-bundling territory, far beyond a focused file-reference utility | Keep scope to references only; let other tools handle content bundling |
| Explorer/status bar/context-menu sprawl in MVP | Improves discoverability on paper | Adds UI clutter and maintenance without improving the core active-editor workflow | Start with Command Palette + shortcuts; add editor/explorer context entry only if usage shows real need |
| Support for every editor/document type at launch | Users may expect notebooks, diff editors, untitled buffers, remote/virtual docs | These cases have inconsistent path semantics and create edge-case heavy behavior early | Explicitly support saved local text files only in v1 and fail clearly elsewhere |
| Multi-cursor and multi-file aggregate output in MVP | Powerful for advanced users and some Claude-style mention flows | Adds non-trivial formatting decisions, separator choices, and ambiguous UX | Defer until single-selection workflow is validated |

## Feature Dependencies

```text
[Deterministic plain-text formatter]
    └──requires──> [Path resolution]
                         └──requires──> [Active saved local text editor detection]

[Copy current line]
    └──requires──> [Active saved local text editor detection]

[Copy selected range]
    └──requires──> [Selection normalization]
                         └──enhances──> [Deterministic plain-text formatter]

[Workspace-relative command]
    └──requires──> [Workspace folder resolution]
                         └──fallbacks-to──> [Absolute path command behavior]

[Keyboard shortcut UX]
    └──enhances──> [Copy current line]

[Tool-specific auto-paste]
    ──conflicts──> [Minimal, reliable clipboard-first workflow]

[Custom output templates]
    ──conflicts──> [Deterministic formatting discipline]
```

### Dependency Notes

- **Deterministic formatter requires path resolution:** output cannot be stable until the extension knows whether it is emitting workspace-relative or absolute paths.
- **Copy current line requires active saved local text editor detection:** unsupported editor states must fail before formatting begins.
- **Copy selected range requires selection normalization:** users should get the same result regardless of selection direction.
- **Workspace-relative command falls back to absolute behavior:** this preserves success for files outside the workspace instead of surprising users with an error.
- **Keyboard shortcuts enhance copy current line:** this is the habit-forming entry point for a utility extension, but the underlying command still matters.
- **Tool-specific auto-paste conflicts with clipboard-first workflow:** once focus manipulation is introduced, reliability drops and debugging/support cost rises.
- **Custom output templates conflict with deterministic formatting discipline:** flexibility directly undermines the product's "paste-ready with no cleanup" promise.

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [x] Copy absolute file reference from the active editor — core utility for any AI tool or local workflow
- [x] Copy workspace-relative file reference with absolute fallback — covers the most common chat/prompt use case without breaking on external files
- [x] Support current line and selected line range in deterministic plain-text format — essential for real code referencing, not just file naming
- [x] Command Palette commands plus default cross-platform keybindings — required for both discoverability and speed
- [x] Success and failure feedback — required so the one-shot action feels trustworthy

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Editor context menu entry — add if users discover the extension late or prefer right-click workflows
- [ ] Multi-root workspace disambiguation improvements — add if ambiguity appears in real usage across monorepos/workspaces
- [ ] Optional copy format variant for Claude-style `@path#Lx-Ly` references — add only if repeated demand appears from agent-specific users

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Explorer file/folder reference copying — valuable, but expands the product beyond the active-editor problem
- [ ] Multi-cursor / multi-file combined references — useful for advanced prompt composition, but format and UX complexity rise quickly
- [ ] AI-chat auto-focus / auto-paste integrations — only worth it if the extension deliberately evolves from "copy utility" to "workflow automation"
- [ ] Clickable in-editor reference previews / hover support — belongs to a larger prompt-authoring experience, not the minimal MVP

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Absolute copy command | HIGH | LOW | P1 |
| Relative copy command with fallback | HIGH | LOW | P1 |
| Current-line + selected-range support | HIGH | LOW | P1 |
| Deterministic normalized formatting | HIGH | LOW | P1 |
| Cross-platform shortcuts + Command Palette | HIGH | LOW | P1 |
| Clear success/error feedback | MEDIUM | LOW | P1 |
| Editor context menu | MEDIUM | LOW | P2 |
| Claude-style alternate format | MEDIUM | MEDIUM | P2 |
| Multi-root disambiguation polish | MEDIUM | MEDIUM | P2 |
| Explorer file/folder copy | MEDIUM | MEDIUM | P3 |
| Multi-cursor or multi-file aggregate copy | LOW | MEDIUM | P3 |
| Auto-paste into AI chat UI | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | Competitor A | Competitor B | Our Approach |
|---------|--------------|--------------|--------------|
| Core line/range reference copy | `copy-path-line` supports current line and selected range for relative paths | `copy-code-reference` supports `file:start-end` clipboard copy | Match this fully; it is table stakes |
| AI-specific format | `copy-code-line-for-ai` uses `@path:line` and can auto-paste into AI chat | `copy-path-for-claude-code-vscode` uses Claude-style `@path#Lx-Ly` for files/folders and multi-select | Do not chase tool-specific formats in MVP; keep plain text first |
| Rich configuration | `ClipCodeRef` adds preview format, multi-root behavior settings, truncation rules | `better-copy-path-with-lines` adds separator/path/message settings | Prefer almost no config initially; differentiate on predictability |
| UI surface area | `InContext` spans editor + explorer + hover previews + inline decorations | `better-copy-path-with-lines` adds gutter/editor context workflows | Stay focused on active editor commands and shortcuts first |
| Scope | Some competitors extend into folder refs, previews, or prompt authoring | Some stay narrow but still add custom separators and AI syntax | Stay narrower than both: fast, deterministic file references for AI coding workflows |

## Sources

- Project context: `/Users/farhan/Documents/file-ref-extension/.planning/PROJECT.md` — HIGH confidence
- Template guidance: `/Users/farhan/.config/opencode/get-shit-done/templates/research-project/FEATURES.md` — HIGH confidence
- Open VSX search results for `copy path`, `copy relative path`, `ai code reference`, `claude code reference`, `line number clipboard` (queried 2026-04-17) — MEDIUM confidence
- `copy-path-line` README: https://raw.githubusercontent.com/temple-slope/copy-path-line/main/README.md — MEDIUM confidence
- `better-copy-path-with-lines` README: https://raw.githubusercontent.com/MarkShawn2020/better-copy-path-with-lines/main/README.md — MEDIUM confidence
- `copy-code-reference` README: https://raw.githubusercontent.com/devmao/copy-code-reference/main/README.md — MEDIUM confidence
- `copy-code-line-for-ai` README: https://raw.githubusercontent.com/caticat/copy-code-line-for-ai/master/README.md — MEDIUM confidence
- `copy-path-for-claude-code-vscode` README: https://raw.githubusercontent.com/inwpasit619/copy-path-for-claude-code-vscode/main/README.md — MEDIUM confidence
- `ClipCodeRef` README: https://raw.githubusercontent.com/kenfdev/ClipCodeRef/main/README.md — MEDIUM confidence
- `InContext` README: https://raw.githubusercontent.com/managea/incontext/main/README.md — MEDIUM confidence
- `copy-code-ref` README: https://raw.githubusercontent.com/israel-gs/copy-code-ref/main/README.md — MEDIUM confidence

---
*Feature research for: VS Code utility extension for AI-friendly file references*
*Researched: 2026-04-17*
