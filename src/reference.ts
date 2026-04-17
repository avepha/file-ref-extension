import type {
  EditorLike,
  ReferenceMode,
  UnsupportedEditorState,
  WorkspaceFolderLike,
} from './contracts';
import { validateEditorInput } from './guards';
import { normalizeToPosixPath, resolveReferencePath } from './path';
import { formatNormalizedLine, normalizeSelectionLines } from './range';

export interface FileReferenceSuccessResult {
  ok: true;
  value: string;
  effectiveMode: ReferenceMode;
}

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
): FileReferenceSuccessResult | { ok: false; error: UnsupportedEditorState } {
  const validation = validateEditorInput(editor);

  if (!validation.ok) {
    return validation;
  }

  const pathOutput = resolveReferencePath(validation.value.documentPath, mode, workspaceFolders);
  const lineOutput = formatNormalizedLine(normalizeSelectionLines(validation.value.selection));
  const effectiveMode =
    mode === 'relative' && pathOutput === normalizeToPosixPath(validation.value.documentPath)
      ? 'absolute'
      : mode;

  return {
    ok: true,
    value: `${pathOutput}:${lineOutput}`,
    effectiveMode,
  };
}
