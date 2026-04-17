import type { EditorLike, UnsupportedEditorReason, ValidationResult } from './contracts';

const DEFAULT_UNSUPPORTED_MESSAGE = 'No saved local text file is active';

function unsupported(reason: UnsupportedEditorReason): ValidationResult {
  return {
    ok: false,
    error: {
      reason,
      message: DEFAULT_UNSUPPORTED_MESSAGE,
    },
  };
}

export function validateEditorInput(editor: EditorLike | null | undefined): ValidationResult {
  if (!editor) {
    return unsupported('no-active-editor');
  }

  if (editor.isDiffEditor) {
    return unsupported('diff-editor');
  }

  if (editor.document.isUntitled) {
    return unsupported('untitled-document');
  }

  if (editor.document.uri.scheme !== 'file') {
    return unsupported('non-file-scheme');
  }

  return {
    ok: true,
    value: {
      documentPath: editor.document.uri.fsPath,
      selection: editor.selection,
    },
  };
}

export { DEFAULT_UNSUPPORTED_MESSAGE };
