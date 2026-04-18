package com.avepha.copyfilepathwithlinenumbers.editor

import com.intellij.openapi.application.runWriteAction
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.editor.LogicalPosition
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileTypes.PlainTextFileType
import com.intellij.openapi.vfs.LocalFileSystem
import com.intellij.testFramework.PsiTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.intellij.testFramework.LightVirtualFile
import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.writeText
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertTrue

class EditorInputGuardsTest : BasePlatformTestCase() {
    fun testSupportedLocalEditorReturnsImmutableSnapshot() {
        val editor = openProjectFile("content/example.txt", "first line\nsecond line\nthird line\n")
        val caret = editor.caretModel.primaryCaret
        caret.moveToOffset(editor.document.getLineStartOffset(1) + 2)
        caret.setSelection(
            editor.document.getLineStartOffset(0) + 1,
            editor.document.getLineStartOffset(1) + 2,
        )

        val result = validateEditorInput(editor, project)

        assertTrue(result.ok)
        val supported = assertIs<EditorInputGuardResult.Supported>(result)
        assertTrue(supported.value.documentPath.replace('\\', '/').endsWith("/content/example.txt"))
        assertEquals(PositionSnapshot(line = 0, character = 1), supported.value.selection.anchor)
        assertEquals(PositionSnapshot(line = 1, character = 2), supported.value.selection.active)
        assertTrue(supported.value.containingRootPaths.isNotEmpty())
    }

    fun testNullEditorReturnsDefaultUnsupportedMessage() {
        val result = validateEditorInput(null, project)

        assertFalse(result.ok)
        val unsupported = assertIs<EditorInputGuardResult.Unsupported>(result)
        assertEquals(UnsupportedEditorReason.NO_ACTIVE_EDITOR, unsupported.error.reason)
        assertEquals(DEFAULT_UNSUPPORTED_MESSAGE, unsupported.error.message)
    }

    fun testEditorWithoutSavedLocalFileReturnsDefaultUnsupportedMessage() {
        val ephemeralEditor = createEphemeralEditor("ephemeral text")

        try {
            val result = validateEditorInput(ephemeralEditor, project)

            assertFalse(result.ok)
            val unsupported = assertIs<EditorInputGuardResult.Unsupported>(result)
            assertEquals(UnsupportedEditorReason.NO_SAVED_LOCAL_FILE, unsupported.error.reason)
            assertEquals(DEFAULT_UNSUPPORTED_MESSAGE, unsupported.error.message)
        } finally {
            releaseEditor(ephemeralEditor)
        }
    }

    fun testNonLocalVirtualFileIsRejected() {
        val virtualFile = LightVirtualFile("scratch.txt", PlainTextFileType.INSTANCE, "temporary")
        val document = FileDocumentManager.getInstance().getDocument(virtualFile)
            ?: error("expected LightVirtualFile document")
        val editor = EditorFactory.getInstance().createEditor(document, project, virtualFile, false)

        try {
            val result = validateEditorInput(editor, project)

            assertFalse(result.ok)
            val unsupported = assertIs<EditorInputGuardResult.Unsupported>(result)
            assertEquals(UnsupportedEditorReason.NO_SAVED_LOCAL_FILE, unsupported.error.reason)
        } finally {
            releaseEditor(editor)
        }
    }

    fun testMultiCaretEditorsAreRejectedExplicitly() {
        val editor = openProjectFile("content/multicaret.txt", "one\ntwo\nthree\n")
        runWriteAction {
            editor.caretModel.addCaret(LogicalPosition(1, 0), false)
        }

        val result = validateEditorInput(editor, project)

        assertFalse(result.ok)
        val unsupported = assertIs<EditorInputGuardResult.Unsupported>(result)
        assertEquals(UnsupportedEditorReason.MULTI_CARET, unsupported.error.reason)
    }

    fun testNestedProjectRootsAreCapturedAsPlainPaths() {
        val nestedRoot = myFixture.tempDirFixture.findOrCreateDir("content/modules/nested-root")
        runWriteAction {
            PsiTestUtil.addContentRoot(module, nestedRoot)
        }
        val editor = openProjectFile("content/modules/nested-root/src/Feature.kt", "class Feature\n")

        val result = validateEditorInput(editor, project)

        assertTrue(result.ok)
        val supported = assertIs<EditorInputGuardResult.Supported>(result)
        assertTrue(
            supported.value.containingRootPaths.size >= 2,
            "nested-root scenarios should retain both the broader project root and the nested content root",
        )
        assertTrue(
            supported.value.containingRootPaths.all { root ->
                isAncestorPath(root, supported.value.documentPath)
            },
        )
        assertTrue(
            supported.value.containingRootPaths.any { root ->
                root.replace('\\', '/').endsWith("/content/modules/nested-root")
            },
        )
    }

    fun testOutOfProjectLocalFilesRemainValidWithEmptyContainingRoots() {
        val outsideFile = Path.of(myFixture.tempDirPath)
            .resolve("external/outside.txt")
            .also { it.parent.createDirectories() }
            .also { it.writeText("outside project") }
        val virtualFile = LocalFileSystem.getInstance()
            .refreshAndFindFileByNioFile(outsideFile)
            ?: error("expected temp file virtual file")
        val document = FileDocumentManager.getInstance().getDocument(virtualFile)
            ?: error("expected local file document")
        val editor = EditorFactory.getInstance().createEditor(document, project, virtualFile, false)

        try {
            val result = validateEditorInput(editor, project)

            assertTrue(result.ok)
            val supported = assertIs<EditorInputGuardResult.Supported>(result)
            assertTrue(supported.value.documentPath.endsWith(".txt"))
            assertEquals(emptyList<String>(), supported.value.containingRootPaths)
        } finally {
            releaseEditor(editor)
        }
    }

    private fun openProjectFile(relativePath: String, content: String): Editor {
        myFixture.addFileToProject(relativePath, content)
        val virtualFile = myFixture.findFileInTempDir(relativePath)
            ?: error("expected temp dir file for $relativePath")
        myFixture.openFileInEditor(virtualFile)
        return myFixture.editor
    }

    private fun createEphemeralEditor(content: String): Editor {
        val document = EditorFactory.getInstance().createDocument(content)
        return EditorFactory.getInstance().createEditor(document, project)
    }

    private fun releaseEditor(editor: Editor) {
        runWriteAction {
            EditorFactory.getInstance().releaseEditor(editor)
        }
    }

    private fun isAncestorPath(rootPath: String, filePath: String): Boolean {
        val normalizedRoot = rootPath.replace('\\', '/').trimEnd('/')
        val normalizedFile = filePath.replace('\\', '/')
        return normalizedFile == normalizedRoot || normalizedFile.startsWith("$normalizedRoot/")
    }
}
