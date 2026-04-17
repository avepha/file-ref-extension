import * as vscode from 'vscode';

import {
  COPY_ABSOLUTE_REFERENCE_COMMAND,
  COPY_RELATIVE_REFERENCE_COMMAND,
} from './commands';
import { executeCopyReferenceCommand, toEditorLike } from './workflow';

function getActiveEditorForCommand(): vscode.TextEditor | ReturnType<typeof toEditorLike> | undefined {
  const editor = vscode.window.activeTextEditor;

  if (!editor) {
    return editor;
  }

  const tab = vscode.window.tabGroups.activeTabGroup.activeTab;
  const isDiffEditor = tab?.input instanceof vscode.TabInputTextDiff;

  return toEditorLike(editor, { isDiffEditor });
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COPY_ABSOLUTE_REFERENCE_COMMAND, async () =>
      executeCopyReferenceCommand(
        {
          activeEditor: getActiveEditorForCommand(),
          clipboard: vscode.env.clipboard,
          notifications: vscode.window,
          workspaceFolders: vscode.workspace.workspaceFolders,
        },
        'absolute',
      ),
    ),
    vscode.commands.registerCommand(COPY_RELATIVE_REFERENCE_COMMAND, async () =>
      executeCopyReferenceCommand(
        {
          activeEditor: getActiveEditorForCommand(),
          clipboard: vscode.env.clipboard,
          notifications: vscode.window,
          workspaceFolders: vscode.workspace.workspaceFolders,
        },
        'relative',
      ),
    ),
  );
}

export function deactivate(): void {}
