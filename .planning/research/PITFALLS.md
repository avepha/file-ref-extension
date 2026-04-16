# Pitfalls Research

**Domain:** VS Code extension for copying AI-friendly file references
**Researched:** 2026-04-17
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Treating every active editor as a normal local file

**What goes wrong:**
The command produces nonsense or crashes for untitled files, diff editors, notebooks, readonly virtual documents, remote/virtual workspace resources, or files outside the workspace assumptions.

**Why it happens:**
Small extensions often start from `window.activeTextEditor` and immediately read `document.uri.fsPath`, assuming the scheme is always `file` and the editor is always a standard saved text document.

**How to avoid:**
- Gate the command on supported states before formatting anything.
- Explicitly require: active text editor, saved document, local file scheme, non-diff editor.
- For unsupported states, fail with one clear message instead of best-effort output.
- Use `when` clauses so commands/keybindings only appear when they are likely to work (`editorTextFocus`, `resourceScheme == file`, `!isInDiffEditor`).
- Declare virtual workspace support honestly in `package.json` capabilities; if unsupported, say so.

**Warning signs:**
- Bug reports mentioning untitled, diff, notebook, or GitHub/Codespaces editors.
- Output contains empty paths, `undefined`, or odd URI prefixes.
- You are using `uri.fsPath` before checking `uri.scheme`.

**Phase to address:**
Phase 1 - Core command constraints and supported-state validation.

---

### Pitfall 2: Getting line/range normalization subtly wrong

**What goes wrong:**
Copied references are inconsistent: off-by-one line numbers, reversed ranges from backwards selections, `start-end` including wrong end line, or single-line selections sometimes emitting ranges and sometimes not.

**Why it happens:**
VS Code selection APIs expose zero-based positions and directional selections; the user-facing format here is one-based and deterministic. Tiny tools often skip a normalization layer.

**How to avoid:**
- Centralize formatting into one pure function: input editor selection + document URI, output exact string.
- Convert to 1-based line numbers only at the formatter boundary.
- Normalize to `start <= end` regardless of selection direction.
- Decide and document one rule for empty vs non-empty selections and single-line vs multi-line selections.
- Add integration tests for: cursor only, forward selection, backward selection, single-line selection, multi-line selection, first line, last line.

**Warning signs:**
- Manual testing shows different output when selecting bottom-to-top.
- Bug fixes keep touching line math in multiple places.
- You cannot state the exact rule for whether `path:12` or `path:12-12` should be emitted.

**Phase to address:**
Phase 1 - Output format contract and test coverage.

---

### Pitfall 3: Mixing platform-native paths with AI-friendly output rules

**What goes wrong:**
Windows outputs backslashes, drive-letter quirks, or mixed separators; workspace-relative paths differ by OS; pasted references are inconsistent across teammates and AI tools.

**Why it happens:**
Developers naturally reach for Node path helpers or raw `fsPath`, which are correct for local filesystem work but not for a deliberately normalized text format.

**How to avoid:**
- Treat display output as a formatting concern, not a filesystem concern.
- Resolve the actual file URI first, then normalize the final emitted string to forward slashes.
- Test on Windows, macOS, and Linux fixtures, especially drive letters and nested workspaces.
- Keep one canonical formatter for absolute and workspace-relative output.
- Be explicit about fallback behavior when no workspace-relative path exists.

**Warning signs:**
- Snapshot tests differ by OS.
- Code mixes `path.join`, `path.relative`, and string replacement ad hoc.
- Users report copied paths work on macOS/Linux but look ugly or ambiguous on Windows.

**Phase to address:**
Phase 1 - Cross-platform formatting rules; Phase 4 - cross-platform verification.

---

### Pitfall 4: Relative path logic that breaks in multi-root or out-of-workspace cases

**What goes wrong:**
“Relative copy” returns the wrong folder base, includes workspace-folder names unexpectedly, or fails completely for files outside the workspace.

**Why it happens:**
Single-folder local testing hides the edge cases. VS Code workspaces can have multiple folders, and relative-path behavior must be intentional, not accidental.

**How to avoid:**
- Define the rule now: relative to containing workspace folder; if none, fall back to absolute.
- Test single-root, multi-root, and outside-workspace files.
- Prefer VS Code workspace-aware APIs over handwritten workspace guessing.
- Add tests that prove the same file produces the same relative output regardless of unrelated workspace folders.

**Warning signs:**
- Relative output changes after adding a second workspace folder.
- Bugs mention “works in a folder, breaks in a `.code-workspace`.”
- Implementation picks `workspaceFolders[0]` or assumes exactly one workspace.

**Phase to address:**
Phase 2 - Relative-path behavior and workspace semantics.

---

### Pitfall 5: Using the wrong runtime location for clipboard behavior

**What goes wrong:**
Copy works locally but fails or copies to the wrong clipboard in SSH/WSL/Codespaces scenarios.

**Why it happens:**
Extension authors sometimes use Node clipboard packages or let the extension run in the workspace host by default, forgetting that clipboard access is a UI-side concern in remote setups.

**How to avoid:**
- Use `vscode.env.clipboard`, not third-party clipboard modules.
- Prefer `extensionKind: ["ui"]` for this workflow unless a later feature truly needs workspace-host execution.
- Validate behavior in at least one remote scenario (SSH, WSL, Dev Container, or Codespaces).
- If web support is desired later, plan a `browser` entry and web-extension tests instead of assuming Node-only code will transfer.

**Warning signs:**
- Clipboard bugs only appear in remote windows.
- Code imports `clipboardy` or shells out to OS clipboard commands.
- `Developer: Show Running Extensions` shows the extension running remotely when it should behave like a UI utility.

**Phase to address:**
Phase 2 - Runtime placement and remote-behavior validation.

---

### Pitfall 6: Noisy success/error UX for a high-frequency command

**What goes wrong:**
The extension technically works but feels annoying: every copy throws a disruptive toast, error messages repeat, or commands are visible when they cannot succeed.

**Why it happens:**
VS Code samples make notifications easy, and small utilities overuse them. For a command people may trigger dozens of times per day, even correct UX can be too loud.

**How to avoid:**
- Keep success feedback minimal and predictable; verify whether a toast is truly acceptable at high frequency.
- Never stack repeated notifications.
- Make unsupported-state failures specific and actionable.
- Hide or disable commands in obviously invalid contexts instead of teaching users through errors.
- User-test shortcut-driven usage, not just Command Palette usage.

**Warning signs:**
- You feel the need to dismiss your own notifications during testing.
- Users ask for a “disable success popup” setting immediately.
- Telemetry or manual observation shows frequent invalid-command attempts.

**Phase to address:**
Phase 2 - Command UX, messaging, and discoverability.

---

### Pitfall 7: Keybinding conflicts and non-portable shortcuts

**What goes wrong:**
Default shortcuts collide with common editor shortcuts, work on one OS but not another, or are unavailable in the contexts where users expect them.

**Why it happens:**
Authors test on one machine and add a convenient personal shortcut without checking platform conventions or `when` conditions.

**How to avoid:**
- Define per-platform keybindings deliberately for macOS, Windows, and Linux.
- Add tight `when` clauses so shortcuts only fire in supported text-editor contexts.
- Test discoverability in Keyboard Shortcuts UI and Command Palette.
- Expect some defaults to be revised after real-world collision feedback.

**Warning signs:**
- Shortcut works only when focus is in unusual places.
- Users report “nothing happens” instead of explicit errors.
- Default keybinding overlaps with existing navigation/editing muscle memory.

**Phase to address:**
Phase 2 - Keybinding design and validation.

---

### Pitfall 8: Shipping a VSIX that works in dev but is sloppy in marketplaces

**What goes wrong:**
Marketplace/Open VSX publishing fails or the released package is messy: missing README/license/icon, wrong engine range, extra source files, secrets, or broken metadata.

**Why it happens:**
For tiny utilities, release hygiene gets deferred until the end. Packaging is treated as clerical work instead of part of product quality.

**How to avoid:**
- Add release checks early: `engines.vscode`, icon, README, LICENSE, CHANGELOG, publisher metadata.
- Use `.vscodeignore` and a `vscode:prepublish` build step so the VSIX contains only runtime files.
- Test `vsce package` before marketplace day.
- Plan both Marketplace and Open VSX publishing flows; Open VSX requires separate namespace/token setup.
- Ensure no secrets or user-provided SVG/image issues are included in the package.

**Warning signs:**
- The project has no release checklist.
- The packaged VSIX includes `src/`, tests, local config, or token files.
- Publishing is the first time anyone runs `vsce package`.

**Phase to address:**
Phase 3 - Packaging, metadata, and release hardening.

---

### Pitfall 9: Skipping extension-host integration tests because the feature looks “too small”

**What goes wrong:**
The command passes manual smoke tests but regresses on editor state, keybindings, or OS/path edge cases right before release.

**Why it happens:**
The feature seems trivial, so teams rely on local clicking instead of automated extension tests. But VS Code behavior is mostly integration behavior.

**How to avoid:**
- Add extension integration tests from the start using `@vscode/test-cli` / `@vscode/test-electron`.
- Treat formatting behavior as snapshot-worthy.
- Include tests for unsupported editors and command visibility/enablement where practical.
- Run tests with other extensions disabled for deterministic results.

**Warning signs:**
- QA consists only of “I tried it once in the extension host.”
- No test fixture covers Windows-style paths or multi-root workspaces.
- Refactors require fully manual retesting.

**Phase to address:**
Phase 1 - formatter tests; Phase 4 - release validation matrix.

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Inline path/range formatting inside command handlers | Faster MVP coding | Duplicated line math and inconsistent output rules | Never |
| Assume single-root workspace | Simpler relative-path implementation | Breaks as soon as multi-root users appear | Only in throwaway prototype, not public MVP |
| Use raw `fsPath` as final output | Easy local success | Cross-platform inconsistency and virtual-resource bugs | Never |
| Skip `when` clauses and validate only at runtime | Fewer manifest changes | Annoying UX and avoidable error toasts | Acceptable for first dev spike only |
| Publish without `.vscodeignore` | Faster first package | Bloated VSIX, leaked files, avoidable publish failures | Never |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| VS Code command contributions | Register command in code but forget discoverable contribution or proper enablement | Contribute commands in `package.json`, add keybindings, and use `enablement`/`menus` `when` clauses |
| Remote development / Codespaces | Use Node clipboard libs or wrong extension host kind | Use `vscode.env.clipboard` and prefer `extensionKind: ["ui"]` for clipboard-first behavior |
| Virtual workspaces / web | Assume every URI is `file` and every extension can run unchanged on web | Check `uri.scheme`, declare capabilities honestly, and only add web support intentionally |
| VS Code Marketplace | Wait until release day to validate metadata and packaging | Run `vsce package` early and keep release assets in repo from the start |
| Open VSX | Assume Marketplace publisher flow is enough | Set up Open VSX account, agreement, token, and namespace separately |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Activating eagerly for a one-command utility | Extension loads before needed; unnecessary startup cost | Rely on command-based lazy activation and keep activation minimal | Immediately visible on startup-sensitive users |
| Doing filesystem work on every copy when not needed | Copy feels slower than expected | Read only what the active editor/document already provides; avoid extra fs calls | Noticeable even at small scale because command is high-frequency |
| Repeated notifications for hot-path commands | UX feels sluggish and noisy | Minimize toast usage and avoid repeated stacks | Breaks at daily-use frequency, not high user count |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Packaging secrets or local config files into the VSIX | Publish rejection or accidental credential exposure | Use `.vscodeignore`, inspect packaged contents, and keep tokens out of the repo |
| Logging copied file references verbosely in output channels or telemetry | Exposes sensitive local paths/project structure | Avoid telemetry in MVP; if logging exists, keep it opt-in and scrub path data |
| Pulling in unnecessary clipboard/OS shell dependencies | Larger attack surface and remote-runtime bugs | Use built-in VS Code APIs first |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Success toast on every copy with no restraint | Frequent interruption for a habit command | Keep feedback lightweight and validate whether success toast is worth it |
| Generic “copy failed” errors | User cannot tell whether file type, workspace, or editor state is unsupported | Return state-specific messages |
| Command always visible, even when impossible | Users trigger dead commands and lose trust | Hide/disable with `when` clauses where practical |
| Absolute and relative commands with ambiguous naming | Users memorize wrong shortcut or paste wrong format | Use explicit titles like “Copy Absolute File Reference” and “Copy Relative File Reference” |

## "Looks Done But Isn't" Checklist

- [ ] **Absolute copy:** Verified on macOS, Windows, and Linux-style path fixtures — confirm forward-slash normalization.
- [ ] **Relative copy:** Verified in single-root, multi-root, and outside-workspace cases — confirm absolute fallback.
- [ ] **Selection handling:** Verified cursor-only, forward selection, backward selection, and multi-line selection rules.
- [ ] **Unsupported states:** Verified untitled, diff, notebook, and virtual/remote edge behavior matches product scope.
- [ ] **Keybindings:** Verified each OS default shortcut works in supported editor contexts and does not obviously collide.
- [ ] **Packaging:** Verified `vsce package` output contains only runtime assets and passes Marketplace/Open VSX readiness checks.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Wrong output format contract after release | MEDIUM | Add tests from bug reports, preserve backward compatibility if possible, and document any format change clearly |
| Wrong extension runtime/clipboard behavior in remote | MEDIUM | Move to `vscode.env.clipboard`, adjust `extensionKind`, retest in SSH/WSL/Codespaces |
| Broken relative-path semantics | MEDIUM | Define a precise base-path rule, add multi-root fixtures, and ship a focused fix release |
| Packaging/publish failure | LOW | Fix metadata/ignore files, rerun `vsce package`, then repeat Marketplace/Open VSX publish flow |
| Noisy UX complaints | LOW | Tighten `when` clauses, reduce notifications, and add a setting only if repeated complaints justify it |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Unsupported editor/resource handling | Phase 1 | Commands fail clearly for untitled/diff/notebook/virtual states and only succeed for saved local text files |
| Line/range normalization bugs | Phase 1 | Test matrix covers cursor-only, reverse selections, and boundary lines |
| Cross-platform path inconsistency | Phase 1 | Snapshot tests produce identical normalized format across OS fixtures |
| Multi-root/out-of-workspace relative path bugs | Phase 2 | Relative command returns workspace-relative path when possible, absolute otherwise |
| Clipboard/runtime host mistakes | Phase 2 | Remote-window test confirms copied text reaches local user clipboard |
| Noisy command UX | Phase 2 | Repeated use feels non-disruptive and invalid contexts are hidden/disabled where possible |
| Keybinding conflicts | Phase 2 | Default shortcuts work on each target OS in editor focus without obvious collisions |
| Packaging/marketplace sloppiness | Phase 3 | `vsce package` succeeds, VSIX contents are clean, metadata assets are complete |
| Missing integration tests | Phase 4 | CI runs extension tests and release checklist covers remote + cross-platform sanity checks |

## Sources

- VS Code Command Guide (official, accessed 2026-04-17): https://code.visualstudio.com/api/extension-guides/command
- VS Code Extension Manifest Reference (official, accessed 2026-04-17): https://code.visualstudio.com/api/references/extension-manifest
- VS Code Notifications UX Guidelines (official, accessed 2026-04-17): https://code.visualstudio.com/api/ux-guidelines/notifications
- VS Code When Clause Contexts (official, accessed 2026-04-17): https://code.visualstudio.com/api/references/when-clause-contexts
- VS Code Virtual Workspaces Guide (official, accessed 2026-04-17): https://code.visualstudio.com/api/extension-guides/virtual-workspaces
- VS Code Web Extensions Guide (official, accessed 2026-04-17): https://code.visualstudio.com/api/extension-guides/web-extensions
- VS Code Extension Host / extensionKind docs (official, accessed 2026-04-17): https://code.visualstudio.com/api/advanced-topics/extension-host
- VS Code Remote Development for Extension Authors (official, accessed 2026-04-17): https://code.visualstudio.com/api/advanced-topics/remote-extensions
- VS Code Testing Extensions (official, accessed 2026-04-17): https://code.visualstudio.com/api/working-with-extensions/testing-extension
- VS Code Publishing Extensions (official, accessed 2026-04-17): https://code.visualstudio.com/api/working-with-extensions/publishing-extension
- Open VSX Publishing Extensions wiki (official project wiki, edited 2026-02-26, accessed 2026-04-17): https://github.com/eclipse/openvsx/openvsx/wiki/Publishing-Extensions

---
*Pitfalls research for: File Reference VS Code extension*
*Researched: 2026-04-17*
