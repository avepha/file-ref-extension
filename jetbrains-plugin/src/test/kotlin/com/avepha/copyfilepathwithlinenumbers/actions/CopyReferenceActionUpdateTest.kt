package com.avepha.copyfilepathwithlinenumbers.actions

import com.intellij.openapi.actionSystem.ActionPlaces
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnAction
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.actionSystem.DataContext
import com.intellij.openapi.actionSystem.Presentation
import com.intellij.openapi.actionSystem.impl.SimpleDataContext
import com.intellij.openapi.application.runWriteAction
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.editor.EditorFactory
import com.intellij.openapi.editor.LogicalPosition
import com.intellij.openapi.fileEditor.FileDocumentManager
import com.intellij.openapi.fileTypes.PlainTextFileType
import com.intellij.testFramework.LightVirtualFile
import com.intellij.testFramework.fixtures.BasePlatformTestCase
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class CopyReferenceActionUpdateTest : BasePlatformTestCase() {
    fun testSupportedSavedEditorsEnableBothCopyActionsOnBackgroundThread() {
        val editor = openProjectFile("content/example.txt", "alpha\nbeta\ngamma\n")

        registeredActions().forEach { action ->
            assertEquals(ActionUpdateThread.BGT, action.actionUpdateThread)
            val presentation = updatePresentation(action, editor)
            assertTrue(presentation.isVisible, "supported editors should keep ${action.javaClass.simpleName} visible")
            assertTrue(presentation.isEnabled, "supported editors should keep ${action.javaClass.simpleName} enabled")
        }
    }

    fun testMissingEditorHidesBothCopyActions() {
        registeredActions().forEach { action ->
            val presentation = updatePresentation(action, null)
            assertFalse(presentation.isVisible, "missing editors should hide ${action.javaClass.simpleName}")
            assertFalse(presentation.isEnabled, "missing editors should disable ${action.javaClass.simpleName}")
        }
    }

    fun testUnsupportedEditorStatesFollowSharedGuardRules() {
        val multiCaretEditor = openProjectFile("content/multi-caret.txt", "one\ntwo\nthree\n")
        runWriteAction {
            multiCaretEditor.caretModel.addCaret(LogicalPosition(1, 0), false)
        }

        val lightFile = LightVirtualFile("scratch.txt", PlainTextFileType.INSTANCE, "temporary")
        val lightDocument = FileDocumentManager.getInstance().getDocument(lightFile)
            ?: error("expected LightVirtualFile document")
        val nonLocalEditor = EditorFactory.getInstance().createEditor(lightDocument, project, lightFile, false)

        try {
            listOf(multiCaretEditor, nonLocalEditor).forEach { editor ->
                registeredActions().forEach { action ->
                    val presentation = updatePresentation(action, editor)
                    assertFalse(
                        presentation.isVisible,
                        "unsupported editors should hide ${action.javaClass.simpleName}",
                    )
                    assertFalse(
                        presentation.isEnabled,
                        "unsupported editors should disable ${action.javaClass.simpleName}",
                    )
                }
            }
        } finally {
            runWriteAction {
                EditorFactory.getInstance().releaseEditor(nonLocalEditor)
            }
        }
    }

    private fun registeredActions(): List<CopyReferenceAction> {
        return listOf(
            CopyAbsoluteReferenceAction(),
            CopyRelativeReferenceAction(),
        )
    }

    private fun updatePresentation(action: AnAction, editor: Editor?): Presentation {
        val presentation = action.templatePresentation.clone()
        val dataContext = createDataContext(editor)
        val event = AnActionEvent.createFromDataContext(ActionPlaces.EDITOR_POPUP, presentation, dataContext)
        action.update(event)
        return presentation
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
}
