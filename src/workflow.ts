import type * as vscode from 'vscode';

import type { EditorLike, ReferenceMode, WorkspaceFolderLike } from './contracts';
import { buildFileReference, type FileReferenceSuccessResult } from './reference';

interface ClipboardWriteFailedError {
  reason: 'clipboard-write-failed';
  message: string;
}

export interface ClipboardService {
  writeText(value: string): PromiseLike<void> | void;
}

export interface NotificationService {
  showErrorMessage(message: string): PromiseLike<unknown> | unknown;
  showInformationMessage(message: string): PromiseLike<unknown> | unknown;
}

export interface CommandEnvironment {
  activeEditor: vscode.TextEditor | EditorLike | null | undefined;
  clipboard?: ClipboardService;
  notifications?: NotificationService;
  workspaceFolders?: readonly vscode.WorkspaceFolder[] | readonly WorkspaceFolderLike[];
}

export type CommandExecutionResult =
  | ReturnType<typeof buildFileReference>
  | { ok: false; error: ClipboardWriteFailedError };

export const ABSOLUTE_SUCCESS_MESSAGE = 'Copied absolute file reference';
export const RELATIVE_SUCCESS_MESSAGE = 'Copied relative file reference';

function successMessageFor(mode: ReferenceMode): string {
  return mode === 'absolute' ? ABSOLUTE_SUCCESS_MESSAGE : RELATIVE_SUCCESS_MESSAGE;
}

function isSuccessfulResult(result: CommandExecutionResult): result is FileReferenceSuccessResult {
  return result.ok;
}

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

export function toWorkspaceFolderLikes(
  workspaceFolders: readonly vscode.WorkspaceFolder[] | readonly WorkspaceFolderLike[] = [],
): WorkspaceFolderLike[] {
  return workspaceFolders.map((folder) => ({
    uri: {
      fsPath: folder.uri.fsPath,
    },
  }));
}

export async function executeCopyReferenceCommand(
  environment: CommandEnvironment,
  mode: ReferenceMode,
): Promise<CommandExecutionResult> {
  const editor = environment.activeEditor ? toEditorLike(environment.activeEditor) : environment.activeEditor;
  const workspaceFolders = toWorkspaceFolderLikes(environment.workspaceFolders ?? []);
  const result = buildFileReference(editor, mode, workspaceFolders);

  if (!isSuccessfulResult(result)) {
    void environment.notifications?.showErrorMessage(result.error.message);
    return result;
  }

  const reference = result.value;

  if (!environment.clipboard) {
    const message = 'Failed to copy file reference';

    void environment.notifications?.showErrorMessage(message);

    return {
      ok: false,
      error: {
        reason: 'clipboard-write-failed',
        message,
      },
    };
  }

  try {
    await environment.clipboard.writeText(reference);
  } catch {
    const message = 'Failed to copy file reference';

    void environment.notifications?.showErrorMessage(message);

    return {
      ok: false,
      error: {
        reason: 'clipboard-write-failed',
        message,
      },
    };
  }

  void environment.notifications?.showInformationMessage(successMessageFor(result.effectiveMode));

  return result;
}
