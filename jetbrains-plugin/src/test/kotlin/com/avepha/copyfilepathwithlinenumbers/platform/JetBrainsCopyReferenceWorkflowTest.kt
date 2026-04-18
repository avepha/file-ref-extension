package com.avepha.copyfilepathwithlinenumbers.platform

import com.avepha.copyfilepathwithlinenumbers.reference.ReferenceMode
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.application.runWriteAction
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import com.intellij.testFramework.PsiTestUtil
import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.writeText
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertIs
import kotlin.test.assertTrue

class JetBrainsCopyReferenceWorkflowTest : BasePlatformTestCase() {
    override fun setUp() {
        super.setUp()
        FileReferenceNotifications.setNotificationServiceForTests { _, _, _ -> }
    }

    override fun tearDown() {
        JetBrainsCopyReferenceWorkflow.resetTestServices()
        FileReferenceNotifications.resetTestServices()
        super.tearDown()
    }

    fun testAbsoluteCopyWritesFinalAbsoluteReferenceToClipboard() {
        val clipboard = RecordingClipboard()
        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(clipboard)
        val editor = openProjectFile("content/src/Feature.kt", "first\nsecond\nthird\n")
        editor.caretModel.moveToOffset(editor.document.getLineStartOffset(1) + 1)

        val result = JetBrainsCopyReferenceWorkflow.execute(project, editor, ReferenceMode.ABSOLUTE)

        val success = assertIs<CopyReferenceSuccess>(result)
        assertTrue(success.ok)
        assertTrue(success.value.replace('\\', '/').endsWith("/content/src/Feature.kt:2"))
        assertEquals(listOf(success.value), clipboard.writes)
    }

    fun testRelativeCopyUsesContainingProjectRootWhenAvailable() {
        val clipboard = RecordingClipboard()
        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(clipboard)
        val nestedRoot = myFixture.tempDirFixture.findOrCreateDir("content")
        runWriteAction {
            PsiTestUtil.addContentRoot(module, nestedRoot)
        }
        val editor = openProjectFile("content/src/Relative.kt", "line one\nline two\n")

        val result = JetBrainsCopyReferenceWorkflow.execute(project, editor, ReferenceMode.RELATIVE)

        val success = assertIs<CopyReferenceSuccess>(result)
        assertEquals("src/Relative.kt:1", success.value)
        assertEquals(ReferenceMode.RELATIVE, success.effectiveMode)
        assertEquals(listOf("src/Relative.kt:1"), clipboard.writes)
    }

    fun testRelativeCopyFallsBackToAbsoluteOutsideProjectRoots() {
        val clipboard = RecordingClipboard()
        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(clipboard)
        val outsideEditor = openOutsideProjectFile("external/Outside.kt", "outside project\n")

        val result = JetBrainsCopyReferenceWorkflow.execute(project, outsideEditor, ReferenceMode.RELATIVE)

        val success = assertIs<CopyReferenceSuccess>(result)
        assertEquals(ReferenceMode.ABSOLUTE, success.effectiveMode)
        assertTrue(success.value.replace('\\', '/').endsWith("/external/Outside.kt:1"))
        assertEquals(listOf(success.value), clipboard.writes)
    }

    fun testUnsupportedEditorsAndClipboardFailuresReturnStructuredFailuresWithoutClipboardMutation() {
        val clipboard = RecordingClipboard()
        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(clipboard)

        val unsupportedResult = JetBrainsCopyReferenceWorkflow.execute(project, null, ReferenceMode.ABSOLUTE)

        val unsupported = assertIs<CopyReferenceFailure>(unsupportedResult)
        assertFalse(unsupported.ok)
        assertEquals(CopyReferenceFailureReason.UNSUPPORTED_EDITOR, unsupported.reason)
        assertEquals("No saved local text file is active", unsupported.message)
        assertTrue(clipboard.writes.isEmpty(), "unsupported editors must not mutate the clipboard")

        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(FailingClipboard())
        val editor = openProjectFile("content/src/Failure.kt", "clipboard failure\n")

        val failureResult = JetBrainsCopyReferenceWorkflow.execute(project, editor, ReferenceMode.ABSOLUTE)

        val failure = assertIs<CopyReferenceFailure>(failureResult)
        assertFalse(failure.ok)
        assertEquals(CopyReferenceFailureReason.CLIPBOARD_WRITE_FAILED, failure.reason)
        assertEquals("Failed to copy file path with line numbers", failure.message)
    }

    private fun openProjectFile(relativePath: String, content: String): Editor {
        myFixture.addFileToProject(relativePath, content)
        val virtualFile = myFixture.findFileInTempDir(relativePath)
            ?: error("expected temp dir file for $relativePath")
        myFixture.openFileInEditor(virtualFile)
        return myFixture.editor
    }

    private fun openOutsideProjectFile(relativePath: String, content: String): Editor {
        val file = Path.of(myFixture.tempDirPath)
            .resolve(relativePath)
            .also { it.parent.createDirectories() }
            .also { it.writeText(content) }
        val virtualFile = getVirtualFile(file)
            ?: error("expected local file for $relativePath")
        myFixture.openFileInEditor(virtualFile)
        return myFixture.editor
    }

    private fun getVirtualFile(file: Path) = com.intellij.openapi.vfs.LocalFileSystem.getInstance()
        .refreshAndFindFileByNioFile(file)

    private class RecordingClipboard : ClipboardService {
        val writes = mutableListOf<String>()

        override fun writeText(value: String) {
            writes += value
        }
    }

    private class FailingClipboard : ClipboardService {
        override fun writeText(value: String) {
            throw IllegalStateException("clipboard unavailable")
        }
    }
}
