# Phase 2: Command Workflow - Plan

**Planned:** 2026-04-17
**Status:** Ready for execution

## Objective

Connect the completed reference engine to a minimal VS Code command workflow so users can trigger absolute and relative copy actions from the Command Palette or default shortcuts and immediately get clipboard and notification feedback.

## Scope

- In scope: command contribution metadata, keybindings, activation-time command registration, VS Code-to-domain adapters, clipboard writes, success/error notifications, and tests for the command workflow.
- Out of scope: release packaging metadata, marketplace artifacts, full extension-host integration coverage, remote-scenario verification, and post-MVP UI surfaces.

## Plan Sequence

### Plan 2.1: Commands, Contributions, and Editor Adapters

**Outcome:** The extension contributes both copy commands to VS Code, registers them on activation, and routes active-editor/workspace state into the Phase 1 formatter through one shared command path.

**Requirements:** ACC-01, ACC-02, ACC-03

**Implementation steps:**
1. Add the two command contributions to `package.json` with user-facing titles that match the product contract.
2. Add default keybindings for macOS, Windows, and Linux plus tight text-editor `when` clauses.
3. Implement a small command-use-case layer that reads the active editor and workspace folders, adapts them into the existing plain contracts, and requests either absolute or relative output from the Phase 1 engine.
4. Register both commands in `src/extension.ts` through one shared mode-driven handler and push disposables into the extension context.
5. Add tests covering command metadata assumptions, adapter behavior, and the mode-specific routing to the reference engine.

**Exit checks:**
- Both commands are visible in the Command Palette.
- Both default keybindings are declared for their target platforms and limited to relevant editor contexts.
- Command handlers reuse the Phase 1 formatter rather than rebuilding path or range logic locally.

### Plan 2.2: Clipboard Write and User Feedback Flow

**Outcome:** Running either command copies the final reference to the clipboard on success and shows concise success or failure feedback with no extra confirmation step.

**Requirements:** CLIP-01, CLIP-02, CLIP-03

**Implementation steps:**
1. Extend the shared command-use-case flow to write successful output with `vscode.env.clipboard.writeText()`.
2. Show concise mode-specific success notifications after clipboard writes complete.
3. Surface validation failures through a clear error notification using the existing unsupported-editor message contract.
4. Keep the UX minimal by avoiding additional prompts, custom views, or duplicate notifications.
5. Add tests covering clipboard writes, success message selection, failure-message propagation, and no-copy behavior on invalid editor states.

**Exit checks:**
- Successful commands write exactly the final formatted reference to the clipboard.
- Success messages distinguish absolute vs relative copy without adding extra friction.
- Unsupported states never copy partial output and always show the clear failure message.

## Risks and Controls

- Shortcut defaults may conflict on some platforms. Keep keybindings explicit and constrained by `when` clauses so collisions are easier to reason about and revise later if needed.
- Clipboard behavior can be wrong in remote-capable windows if the wrong API is used. Use `vscode.env.clipboard` only and keep the extension UI-hosted.
- Success notifications can become noisy for a high-frequency workflow. Keep copy short and avoid extra success surfaces beyond the required toast.
- Command handlers can drift from the Phase 1 contract if they perform local formatting. Route all output generation through the existing reference engine.

## Verification Strategy

- Add focused automated tests around the command-use-case layer with mocked clipboard and notification services.
- Verify command contributions and keybinding declarations statically through manifest assertions where practical.
- Reuse Phase 1 tests as the source of truth for final reference formatting, and only test the VS Code shell responsibilities here.

## Completion Signal

Phase 2 is complete when both commands are contributed and registered, default shortcuts are declared, successful runs copy the expected reference directly to the clipboard, failures surface the clear unsupported-editor message, and automated tests lock down the workflow.

---

*Phase: 02-command-workflow*
*Plan created: 2026-04-17*
