import path from 'node:path';

import type { ReferenceMode, WorkspaceFolderLike } from './contracts';

function trimTrailingSlash(value: string): string {
  return value.length > 1 ? value.replace(/\/+$/, '') : value;
}

function isWindowsPath(value: string): boolean {
  return /^[A-Za-z]:[\\/]/.test(value);
}

function normalizeForComparison(value: string): string {
  const normalized = trimTrailingSlash(value.replace(/\\/g, '/'));
  return isWindowsPath(normalized) ? normalized.toLowerCase() : normalized;
}

export function normalizeToPosixPath(value: string): string {
  return value.replace(/\\/g, '/');
}

function isContainingFolder(folderPath: string, documentPath: string): boolean {
  const normalizedFolder = normalizeForComparison(folderPath);
  const normalizedDocument = normalizeForComparison(documentPath);

  return (
    normalizedDocument === normalizedFolder ||
    normalizedDocument.startsWith(`${normalizedFolder}/`)
  );
}

function relativeFromContainingFolder(folderPath: string, documentPath: string): string {
  if (isWindowsPath(folderPath) || isWindowsPath(documentPath)) {
    return normalizeToPosixPath(path.win32.relative(folderPath, documentPath));
  }

  return normalizeToPosixPath(path.posix.relative(folderPath, documentPath));
}

export function resolveReferencePath(
  documentPath: string,
  mode: ReferenceMode,
  workspaceFolders: readonly WorkspaceFolderLike[] = [],
): string {
  const absolutePath = normalizeToPosixPath(documentPath);

  if (mode === 'absolute') {
    return absolutePath;
  }

  const containingFolder = workspaceFolders.find((folder) =>
    isContainingFolder(folder.uri.fsPath, documentPath),
  );

  if (!containingFolder) {
    return absolutePath;
  }

  const relativePath = relativeFromContainingFolder(containingFolder.uri.fsPath, documentPath);
  return relativePath.length > 0 ? relativePath : absolutePath;
}
