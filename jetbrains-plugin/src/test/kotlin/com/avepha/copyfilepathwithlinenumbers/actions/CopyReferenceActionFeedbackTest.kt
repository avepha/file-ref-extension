package com.avepha.copyfilepathwithlinenumbers.actions

import com.avepha.copyfilepathwithlinenumbers.platform.ABSOLUTE_SUCCESS_MESSAGE
import com.avepha.copyfilepathwithlinenumbers.platform.ClipboardService
import com.avepha.copyfilepathwithlinenumbers.platform.FileReferenceNotifications
import com.avepha.copyfilepathwithlinenumbers.platform.FileReferenceNotificationService
import com.avepha.copyfilepathwithlinenumbers.platform.JetBrainsCopyReferenceWorkflow
import com.avepha.copyfilepathwithlinenumbers.platform.RecordedNotification
import com.avepha.copyfilepathwithlinenumbers.platform.RELATIVE_SUCCESS_MESSAGE
import com.intellij.notification.NotificationType
import com.intellij.openapi.actionSystem.ActionPlaces
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.actionSystem.DataContext
import com.intellij.openapi.actionSystem.impl.SimpleDataContext
import com.intellij.openapi.editor.Editor
import com.intellij.testFramework.PsiTestUtil
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.writeText
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import com.intellij.openapi.application.runWriteAction

class CopyReferenceActionFeedbackTest : BasePlatformTestCase() {
    override fun tearDown() {
        JetBrainsCopyReferenceWorkflow.resetTestServices()
        FileReferenceNotifications.resetTestServices()
        super.tearDown()
    }

    fun testSuccessfulActionsWriteClipboardAndEmitMatchingSuccessFeedback() {
        val clipboard = RecordingClipboard()
        val notifications = RecordingNotifications()
        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(clipboard)
        FileReferenceNotifications.setNotificationServiceForTests(notifications)

        val nestedRoot = myFixture.tempDirFixture.findOrCreateDir("content")
        runWriteAction {
            PsiTestUtil.addContentRoot(module, nestedRoot)
        }

        val absoluteEditor = openProjectFile("content/src/Absolute.kt", "alpha\nbeta\n")
        performAction(CopyAbsoluteReferenceAction(), absoluteEditor)

        val relativeEditor = openProjectFile("content/src/Relative.kt", "alpha\nbeta\n")
        performAction(CopyRelativeReferenceAction(), relativeEditor)

        assertEquals(2, clipboard.writes.size)
        assertTrue(clipboard.writes[0].replace('\\', '/').endsWith("/content/src/Absolute.kt:1"))
        assertEquals("src/Relative.kt:1", clipboard.writes[1])
        assertEquals(
            listOf(
                RecordedNotification(NotificationType.INFORMATION, ABSOLUTE_SUCCESS_MESSAGE),
                RecordedNotification(NotificationType.INFORMATION, RELATIVE_SUCCESS_MESSAGE),
            ),
            notifications.messages,
        )
    }

    fun testRelativeFallbackUsesAbsoluteSuccessMessage() {
        val clipboard = RecordingClipboard()
        val notifications = RecordingNotifications()
        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(clipboard)
        FileReferenceNotifications.setNotificationServiceForTests(notifications)

        val outsideEditor = openOutsideProjectFile("external/Fallback.kt", "outside\n")
        performAction(CopyRelativeReferenceAction(), outsideEditor)

        assertEquals(1, clipboard.writes.size)
        assertTrue(clipboard.writes.single().replace('\\', '/').endsWith("/external/Fallback.kt:1"))
        assertEquals(
            listOf(RecordedNotification(NotificationType.INFORMATION, ABSOLUTE_SUCCESS_MESSAGE)),
            notifications.messages,
        )
    }

    fun testFailuresEmitErrorFeedbackWithoutOverwritingClipboard() {
        val clipboard = RecordingClipboard()
        val notifications = RecordingNotifications()
        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(clipboard)
        FileReferenceNotifications.setNotificationServiceForTests(notifications)

        performAction(CopyAbsoluteReferenceAction(), null)

        JetBrainsCopyReferenceWorkflow.setClipboardServiceForTests(FailingClipboard())
        val editor = openProjectFile("content/src/Failure.kt", "boom\n")
        performAction(CopyAbsoluteReferenceAction(), editor)

        assertTrue(clipboard.writes.isEmpty(), "failure paths should not mutate the recording clipboard")
        assertEquals(
            listOf(
                RecordedNotification(NotificationType.ERROR, "No saved local text file is active"),
                RecordedNotification(NotificationType.ERROR, "Failed to copy file path with line numbers"),
            ),
            notifications.messages,
        )
    }

    private fun performAction(action: AnAction, editor: Editor?) {
        val event = AnActionEvent.createFromDataContext(
            ActionPlaces.EDITOR_POPUP,
            action.templatePresentation.clone(),
            createDataContext(editor),
        )
        action.actionPerformed(event)
    }

    private fun createDataContext(editor: Editor?): DataContext {
        val builder = SimpleDataContext.builder()
            .add(CommonDataKeys.PROJECT, project)
        if (editor != null) {
            builder.add(CommonDataKeys.EDITOR, editor)
        }
        return builder.build()
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
        val virtualFile = com.intellij.openapi.vfs.LocalFileSystem.getInstance()
            .refreshAndFindFileByNioFile(file)
            ?: error("expected local file for $relativePath")
        myFixture.openFileInEditor(virtualFile)
        return myFixture.editor
    }
}

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

private class RecordingNotifications : FileReferenceNotificationService {
    val messages = mutableListOf<RecordedNotification>()

    override fun notify(project: com.intellij.openapi.project.Project?, type: NotificationType, message: String) {
        messages += RecordedNotification(type, message)
    }
}
