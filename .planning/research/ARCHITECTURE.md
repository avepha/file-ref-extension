# Architecture Research

**Domain:** Small VS Code extension for copying AI-friendly file references
**Researched:** 2026-04-17
**Confidence:** HIGH

## Standard Architecture

### System Overview

For this extension, the right architecture is a **thin VS Code shell around a pure formatting core**. Small command-driven extensions are typically structured as one extension-host entrypoint plus a few focused modules for command execution, editor/document validation, path resolution, formatting, and clipboard/notification output.

```
┌──────────────────────────────────────────────────────────────┐
│                    VS Code contribution layer               │
├──────────────────────────────────────────────────────────────┤
│  package.json                                               │
│  ├── contributes.commands                                   │
│  ├── contributes.keybindings                                │
│  └── menus.commandPalette (optional visibility control)     │
├──────────────────────────────────────────────────────────────┤
│                    Extension host runtime                   │
├──────────────────────────────────────────────────────────────┤
│  src/extension.ts                                           │
│  └── registers commands and wires handlers                  │
│                                                              │
│  src/commands/                                              │
│  └── copyAbsolute / copyRelative handlers                   │
│                                                              │
│  src/domain/                                                │
│  ├── validate active editor/document                        │
│  ├── compute normalized line range                          │
│  ├── resolve absolute/relative path                         │
│  └── format `path:line` or `path:start-end`                 │
│                                                              │
│  src/platform/                                              │
│  ├── clipboard write                                        │
│  └── success/error notifications                            │
├──────────────────────────────────────────────────────────────┤
│                    Packaging / QA layer                     │
│  esbuild config • dist/extension.js • tests • vsce/ovsx     │
└──────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| `package.json` manifest | Declares commands, keybindings, categories, engine compatibility, entrypoint | Static VS Code contribution points |
| `extension.ts` | Activation boundary only; registers commands and disposables | Small composition root using `context.subscriptions.push(...)` |
| Command handlers | Turn a VS Code command invocation into one application use case | One function per command, very little logic |
| Validation module | Reject unsupported states: no active editor, unsaved file, non-`file` scheme, invalid selection assumptions | Pure functions returning typed result/error |
| Range/path/format modules | Normalize selection into line or line-range, convert separators to POSIX style, compute workspace-relative fallback | Pure deterministic helpers |
| Clipboard/notification adapter | Writes final string and shows one success or error message | Thin wrapper over `vscode.env.clipboard` and `window.show...Message` |
| Tests | Lock down edge cases and packaging safety | Unit tests for pure logic, a few integration tests for command execution |

## Recommended Project Structure

```
src/
├── extension.ts                 # activation entrypoint only
├── commands/
│   ├── copyAbsolute.ts          # absolute-path command handler
│   └── copyRelative.ts          # relative-path command handler
├── domain/
│   ├── activeEditor.ts          # extract editor/document context
│   ├── validation.ts            # supported-state checks
│   ├── lineRange.ts             # normalize start/end lines
│   ├── pathResolver.ts          # absolute vs workspace-relative resolution
│   ├── formatReference.ts       # final string formatter
│   └── types.ts                 # small shared types/result objects
├── platform/
│   ├── clipboard.ts             # clipboard adapter
│   └── notifications.ts         # info/error adapter
└── test/
    ├── unit/
    │   ├── lineRange.test.ts
    │   ├── pathResolver.test.ts
    │   └── formatReference.test.ts
    └── integration/
        └── commands.test.ts

package.json                     # manifest and contribution points
esbuild.js                       # lightweight bundling
tsconfig.json                    # TypeScript config
.vscodeignore                    # exclude src/, out/, node_modules from package
```

### Structure Rationale

- **`extension.ts`:** keep this tiny so activation remains easy to understand and hard to break.
- **`commands/`:** separates user-facing actions from reusable logic; adding future commands stays cheap.
- **`domain/`:** all deterministic behavior lives here, which makes testing fast and avoids accidental coupling to VS Code APIs.
- **`platform/`:** keeps `vscode` API calls at the edge; easier to mock and easier to port/change later.
- **`test/`:** most value comes from unit tests on formatting and validation; integration coverage can stay minimal.

## Architectural Patterns

### Pattern 1: Thin Entrypoint, Pure Core

**What:** `activate()` should only register commands. Command handlers should orchestrate pure domain functions and then call side-effect adapters.
**When to use:** Always for a utility extension with a narrow workflow.
**Trade-offs:** Slightly more files up front, much easier maintenance and testing later.

**Example:**
```typescript
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('fileReference.copyAbsolute', () =>
      runCopyReference({ mode: 'absolute' })
    ),
    vscode.commands.registerCommand('fileReference.copyRelative', () =>
      runCopyReference({ mode: 'relative' })
    )
  );
}
```

### Pattern 2: Shared Use Case With Mode Parameter

**What:** Implement one copy-reference use case with a small strategy switch (`absolute` vs `relative`) instead of duplicating command logic.
**When to use:** When commands differ only in path resolution policy.
**Trade-offs:** Keeps behavior consistent; requires discipline so mode branching stays small.

**Example:**
```typescript
type CopyMode = 'absolute' | 'relative';

async function runCopyReference(input: { mode: CopyMode }) {
  const editorState = getActiveEditorState();
  const validated = validateCopyRequest(editorState);
  if (!validated.ok) return showCopyError(validated.error);

  const range = getNormalizedLineRange(validated.value.selection);
  const path = resolveReferencePath(validated.value.document, input.mode);
  const reference = formatReference(path, range);

  await writeClipboard(reference);
  showCopySuccess(reference);
}
```

### Pattern 3: Explicit Validation Pipeline

**What:** Validate editor state before formatting. Treat unsupported editor modes as first-class outcomes, not exceptions.
**When to use:** Required here because untitled, notebook, diff, virtual, and unsaved documents are out of scope.
**Trade-offs:** More explicit branching, but much clearer UX and fewer bug reports.

**Example:**
```typescript
function validateCopyRequest(state: ActiveEditorState): Result<ValidatedState, CopyError> {
  if (!state.editor) return err('NO_ACTIVE_EDITOR');
  if (state.document.isUntitled) return err('UNSAVED_FILE');
  if (state.document.uri.scheme !== 'file') return err('UNSUPPORTED_SCHEME');
  return ok({ document: state.document, selection: state.editor.selection });
}
```

## Data Flow

### Request Flow

```
User presses shortcut / runs command
    ↓
VS Code command contribution
    ↓
registerCommand handler
    ↓
get active editor + document
    ↓
validate supported state
    ↓
normalize line or range
    ↓
resolve path mode
    ↓
format reference string
    ↓
write to clipboard
    ↓
show one success toast
```

### Error Flow

```
User action
    ↓
handler
    ↓
validation fails / path resolution fails
    ↓
map domain error → human message
    ↓
show one error toast
    ↓
stop; no clipboard write
```

### Key Data Flows

1. **Absolute copy:** active editor → validate local saved file → normalized lines → absolute fs path → POSIX normalization → clipboard.
2. **Relative copy:** active editor → validate local saved file → determine containing workspace folder → relative path if possible, else absolute → POSIX normalization → clipboard.
3. **Selection normalization:** any selection direction → line extraction → `start <= end` normalization → single-line collapse to `path:line`.

## Suggested Build Order

Build order matters because this extension should stay lightweight and should avoid UI-driven rework.

1. **Pure domain core first**
   - Implement `lineRange`, `pathResolver`, `formatReference`, and validation.
   - Add unit tests before wiring VS Code APIs.
   - Reason: most product risk is deterministic correctness, not UI complexity.

2. **Single shared use case**
   - Implement one `runCopyReference()` flow with mode-based path strategy.
   - Reason: prevents command duplication from day one.

3. **Command registration and manifest**
   - Add two commands, Command Palette titles/category, and default keybindings.
   - Reason: contribution wiring is simple once core behavior is stable.

4. **User feedback polish**
   - Add concise success/error notifications.
   - Reason: UX should reflect validated edge cases rather than invent them.

5. **Packaging and release boundaries**
   - Bundle with esbuild, configure `vscode:prepublish`, `.vscodeignore`, Marketplace metadata, and publish tests.
   - Reason: packaging should wrap a stable runtime, not shape it.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-1k users | Keep a single extension entrypoint and function-based modules; no classes or DI container needed |
| 1k-100k users | Add a tiny configuration module if customization ships; preserve pure formatter/validator core |
| 100k+ users | Split by feature area only if the extension grows beyond copy-reference into menus, settings, context actions, or AI-tool-specific formats |

### Scaling Priorities

1. **First bottleneck:** behavioral edge cases, not performance. Fix with tests around path/range normalization and unsupported editors.
2. **Second bottleneck:** feature sprawl. Fix with packaging boundaries and by refusing to mix MVP logic with future custom-format/settings complexity.

## Anti-Patterns

### Anti-Pattern 1: Put all logic in `extension.ts`

**What people do:** Register commands and also perform validation, formatting, path math, clipboard writes, and messages inline.
**Why it's wrong:** Fast to start, painful to extend; hard to test without spinning up VS Code.
**Do this instead:** Keep `extension.ts` as composition root only.

### Anti-Pattern 2: Duplicate absolute and relative command logic

**What people do:** Copy-paste two similar handlers with slightly different path math.
**Why it's wrong:** Edge cases drift and one command inevitably behaves differently.
**Do this instead:** One use case with one branching decision for path strategy.

### Anti-Pattern 3: Treat unsupported editor states as surprises

**What people do:** Assume every active document is a saved local text file.
**Why it's wrong:** Notebooks, untitled files, diffs, and virtual documents produce ambiguous or broken output.
**Do this instead:** Centralize validation and fail clearly before formatting.

### Anti-Pattern 4: Overbuild for a tiny extension

**What people do:** Add state stores, service containers, telemetry pipelines, or webviews before validating the core workflow.
**Why it's wrong:** Increases maintenance cost without improving the main copy action.
**Do this instead:** Use plain functions, minimal modules, and bundle to one runtime file.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| VS Code command system | `contributes.commands` + `commands.registerCommand` | Command contributions implicitly activate the extension in modern VS Code |
| VS Code keybinding system | `contributes.keybindings` | Use platform-specific defaults; avoid collisions where possible |
| Clipboard API | `vscode.env.clipboard.writeText` | Single write after successful validation and formatting |
| Notification API | `window.showInformationMessage` / `showErrorMessage` | Use sparingly; one message per action |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `extension.ts` ↔ `commands/*` | direct function call | Entrypoint should know command IDs, not formatting rules |
| `commands/*` ↔ `domain/*` | direct function call with typed inputs/results | Domain stays pure and reusable |
| `commands/*` ↔ `platform/*` | adapter call | All `vscode` side effects stay at the edge |
| `domain/validation` ↔ `domain/formatting` | typed result object | Formatting should only run on validated state |

## Lightweight Architecture Choices

- **Use TypeScript, but keep runtime simple:** one bundled `dist/extension.js`, no framework.
- **Prefer functions over classes:** there is no long-lived state or polymorphic object graph in MVP.
- **Avoid persistent state entirely in MVP:** no storage layer is needed for a copy-only workflow.
- **Declare only necessary contributions:** commands + keybindings first; defer menus/settings until validated.
- **Keep unsupported environments explicit:** MVP should validate for local saved `file:` documents and avoid pretending virtual/untitled cases work.
- **Use bundling as a packaging boundary, not an architecture driver:** source stays modular, published artifact stays small.

## Recommendation

Structure the extension as a **small command-driven application with a pure domain core**. The maintainable boundary is:

- **Manifest declares behavior**
- **Entrypoint wires behavior**
- **Command layer orchestrates behavior**
- **Domain layer decides behavior**
- **Platform layer performs side effects**

That gives you the smallest architecture that still scales cleanly when later phases add settings, context menu entries, or alternate output formats.

## Sources

- VS Code Extension Anatomy — https://code.visualstudio.com/api/get-started/extension-anatomy — HIGH
- VS Code Contribution Points / Commands & Keybindings — https://code.visualstudio.com/api/references/contribution-points#contributes.commands — HIGH
- VS Code Activation Events — https://code.visualstudio.com/api/references/activation-events — HIGH
- VS Code Extension Manifest — https://code.visualstudio.com/api/references/extension-manifest — HIGH
- VS Code Bundling Extensions — https://code.visualstudio.com/api/working-with-extensions/bundling-extension — HIGH
- VS Code UX Guidelines: Command Palette — https://code.visualstudio.com/api/ux-guidelines/command-palette — HIGH
- VS Code UX Guidelines: Notifications — https://code.visualstudio.com/api/ux-guidelines/notifications — HIGH

---
*Architecture research for: File Reference VS Code extension*
*Researched: 2026-04-17*
