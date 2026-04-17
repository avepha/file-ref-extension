import type {
  EditorLike,
  ReferenceMode,
  UnsupportedEditorState,
  WorkspaceFolderLike,
} from './contracts';
import { validateEditorInput } from './guards';
import { resolveReferencePath } from './path';
import { formatNormalizedLine, normalizeSelectionLines } from './range';

export function formatFileReference(
  documentPath: string,
  selection: EditorLike['selection'],
  mode: ReferenceMode,
  workspaceFolders: readonly WorkspaceFolderLike[] = [],
): string {
  const pathOutput = resolveReferencePath(documentPath, mode, workspaceFolders);
  const lineOutput = formatNormalizedLine(normalizeSelectionLines(selection));

  return `${pathOutput}:${lineOutput}`;
}

export function buildFileReference(
  editor: EditorLike | null | undefined,
  mode: ReferenceMode,
  workspaceFolders: readonly WorkspaceFolderLike[] = [],
): { ok: true; value: string } | { ok: false; error: UnsupportedEditorState } {
  const validation = validateEditorInput(editor);

  if (!validation.ok) {
    return validation;
  }

  return {
    ok: true,
    value: formatFileReference(
      validation.value.documentPath,
      validation.value.selection,
      mode,
      workspaceFolders,
    ),
  };
}
