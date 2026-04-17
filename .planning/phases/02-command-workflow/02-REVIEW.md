---
phase: 02-command-workflow
reviewed: 2026-04-17T00:00:00Z
depth: deep
files_reviewed: 7
files_reviewed_list:
  - src/commands.ts
  - src/workflow.ts
  - test/manifest.test.ts
  - test/workflow.test.ts
  - package.json
  - src/extension.ts
  - src/reference.ts
critical: 0
warning: 1
info: 0
total: 1
findings:
  critical: 0
  warning: 1
  info: 0
  total: 1
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-04-17T00:00:00Z
**Depth:** deep
**Files Reviewed:** 7
**Status:** issues_found

## Summary

Reviewed the command registration, workflow adapter, reference builder, manifest metadata, and workflow tests. The main issue is in the editor adapter path used by the live extension: it can return a shallow-spread `vscode.TextEditor`, which is not a safe way to normalize VS Code API objects and can break command execution at runtime.

## Warnings

### WR-01: `toEditorLike()` can strip `TextEditor` fields in the real extension path

**File:** `src/workflow.ts:46-50`, `src/extension.ts:19`

**Issue:** `getActiveEditorForCommand()` always calls `toEditorLike(editor, { isDiffEditor })`. For real `vscode.TextEditor` instances, `toEditorLike()` takes the early return path and builds `{ ...candidate, ...overrides }`. Object spread only copies enumerable own properties, but VS Code API objects commonly expose data via accessors/prototypes. That means the returned object may lose `document` and `selection`, and `validateEditorInput()` / `buildFileReference()` can then throw when they read `editor.document.isUntitled`. This regression would not be caught by the current tests because they only exercise plain `EditorLike` fixtures.

**Fix:** Only preserve the original object when it is already a plain `EditorLike` and there are no overrides; otherwise always construct a normalized plain object explicitly.

```ts
export function toEditorLike(
  editor: vscode.TextEditor | EditorLike,
  overrides: Partial<EditorLike> = {},
): EditorLike {
  const looksPlainEditorLike =
    'document' in editor &&
    'selection' in editor &&
    'uri' in editor.document &&
    'anchor' in editor.selection &&
    'active' in editor.selection &&
    !('edit' in editor);

  if (looksPlainEditorLike) {
    const candidate = editor as EditorLike;
    return Object.keys(overrides).length === 0 ? candidate : { ...candidate, ...overrides };
  }

  const vscodeEditor = editor as vscode.TextEditor;
  return {
    document: {
      uri: {
        scheme: vscodeEditor.document.uri.scheme,
        fsPath: vscodeEditor.document.uri.fsPath,
      },
      isUntitled: vscodeEditor.document.isUntitled,
    },
    selection: {
      anchor: {
        line: vscodeEditor.selection.anchor.line,
        character: vscodeEditor.selection.anchor.character,
      },
      active: {
        line: vscodeEditor.selection.active.line,
        character: vscodeEditor.selection.active.character,
      },
    },
    ...overrides,
  };
}
```

---

_Reviewed: 2026-04-17T00:00:00Z_
_Reviewer: the agent (gsd-code-reviewer)_
_Depth: deep_
