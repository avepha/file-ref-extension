package com.avepha.copyfilepathwithlinenumbers.editor

import com.intellij.openapi.editor.Editor
import com.intellij.openapi.project.Project
import com.intellij.openapi.module.ModuleManager
import com.intellij.openapi.roots.ModuleRootManager
import com.intellij.openapi.roots.ProjectFileIndex
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.vfs.VfsUtilCore
import com.intellij.openapi.vfs.VirtualFile

private fun unsupported(reason: UnsupportedEditorReason): EditorInputGuardResult {
    return EditorInputGuardResult.Unsupported(UnsupportedEditorState(reason))
}

private fun positionFromOffset(editor: Editor, offset: Int): PositionSnapshot {
    val logicalPosition = editor.offsetToLogicalPosition(offset)
    return PositionSnapshot(line = logicalPosition.line, character = logicalPosition.column)
}

private fun collectContainingRootPaths(project: Project?, file: VirtualFile): List<String> {
    if (project == null) {
        return emptyList()
    }

    val fileIndex = ProjectFileIndex.getInstance(project)
    if (!fileIndex.isInContent(file)) {
        return emptyList()
    }

    val modules = ModuleManager.getInstance(project).modules.toList()
    if (modules.isEmpty()) {
        return emptyList()
    }

    return ModuleRootManager.getInstance(modules.first())
        .contentRoots
        .asSequence()
        .plus(
            modules.asSequence()
                .drop(1)
                .flatMap { module -> ModuleRootManager.getInstance(module).contentRoots.asSequence() },
        )
        .filter { root -> VfsUtilCore.isAncestor(root, file, false) }
        .map(VirtualFile::getPath)
        .distinct()
        .sortedBy { it.replace('\\', '/').length }
        .toList()
}

fun validateEditorInput(editor: Editor?, project: Project?): EditorInputGuardResult {
    if (editor == null) {
        return unsupported(UnsupportedEditorReason.NO_ACTIVE_EDITOR)
    }

    if (editor.caretModel.caretCount != 1) {
        return unsupported(UnsupportedEditorReason.MULTI_CARET)
    }

    val documentFile = FileDocumentManager.getInstance().getFile(editor.document)
        ?: return unsupported(UnsupportedEditorReason.NO_SAVED_LOCAL_FILE)

    if (!documentFile.isInLocalFileSystem) {
        return unsupported(UnsupportedEditorReason.NO_SAVED_LOCAL_FILE)
    }

    val caret = editor.caretModel.primaryCaret
    val anchorOffset = if (caret.hasSelection()) caret.leadSelectionOffset else caret.offset

    return EditorInputGuardResult.Supported(
        EditorSnapshot(
            documentPath = documentFile.path,
            selection = SelectionSnapshot(
                anchor = positionFromOffset(editor, anchorOffset),
                active = positionFromOffset(editor, caret.offset),
            ),
            containingRootPaths = collectContainingRootPaths(project, documentFile),
        ),
    )
}
