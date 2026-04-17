export interface PositionLike {
  line: number;
  character: number;
}

export interface SelectionLike {
  anchor: PositionLike;
  active: PositionLike;
}

export interface DocumentLike {
  uri: {
    scheme: string;
    fsPath: string;
  };
  isUntitled: boolean;
}

export interface EditorLike {
  document: DocumentLike;
  selection: SelectionLike;
  isDiffEditor?: boolean;
}

export interface SupportedEditorInput {
  documentPath: string;
  selection: SelectionLike;
}

export interface WorkspaceFolderLike {
  uri: {
    fsPath: string;
  };
}

export type UnsupportedEditorReason =
  | 'no-active-editor'
  | 'diff-editor'
  | 'untitled-document'
  | 'non-file-scheme';

export interface UnsupportedEditorState {
  reason: UnsupportedEditorReason;
  message: string;
}

export type ValidationResult =
  | { ok: true; value: SupportedEditorInput }
  | { ok: false; error: UnsupportedEditorState };

export type NormalizedLineOutput =
  | { kind: 'line'; line: number }
  | { kind: 'range'; startLine: number; endLine: number };

export type ReferenceMode = 'absolute' | 'relative';
