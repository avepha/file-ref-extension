import * as vscode from 'vscode';

import {
  COPY_ABSOLUTE_REFERENCE_COMMAND,
  COPY_RELATIVE_REFERENCE_COMMAND,
} from './commands';
import { executeCopyReferenceCommand } from './workflow';

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(COPY_ABSOLUTE_REFERENCE_COMMAND, async () =>
      executeCopyReferenceCommand(
        {
          activeEditor: vscode.window.activeTextEditor,
          workspaceFolders: vscode.workspace.workspaceFolders,
        },
        'absolute',
      ),
    ),
    vscode.commands.registerCommand(COPY_RELATIVE_REFERENCE_COMMAND, async () =>
      executeCopyReferenceCommand(
        {
          activeEditor: vscode.window.activeTextEditor,
          workspaceFolders: vscode.workspace.workspaceFolders,
        },
        'relative',
      ),
    ),
  );
}

export function deactivate(): void {}
