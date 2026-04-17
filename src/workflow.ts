import type * as vscode from 'vscode';

import type { EditorLike, ReferenceMode, WorkspaceFolderLike } from './contracts';
import { buildFileReference } from './reference';

export interface CommandEnvironment {
  activeEditor: vscode.TextEditor | EditorLike | null | undefined;
  workspaceFolders?: readonly vscode.WorkspaceFolder[] | readonly WorkspaceFolderLike[];
}

export type CommandExecutionResult = ReturnType<typeof buildFileReference>;

export function toEditorLike(editor: vscode.TextEditor | EditorLike): EditorLike {
  if ('document' in editor && 'selection' in editor && 'uri' in editor.document) {
    const candidate = editor as EditorLike;

    if ('anchor' in candidate.selection && 'active' in candidate.selection) {
      return candidate;
    }
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

  return buildFileReference(editor, mode, workspaceFolders);
}
