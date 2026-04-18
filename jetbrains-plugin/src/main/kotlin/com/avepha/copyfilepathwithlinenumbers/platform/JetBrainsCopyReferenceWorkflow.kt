package com.avepha.copyfilepathwithlinenumbers.platform

import com.avepha.copyfilepathwithlinenumbers.editor.EditorInputGuardResult
import com.avepha.copyfilepathwithlinenumbers.editor.validateEditorInput
import com.avepha.copyfilepathwithlinenumbers.reference.ReferenceMode
import com.avepha.copyfilepathwithlinenumbers.reference.buildFileReference
import com.intellij.openapi.editor.Editor
import com.intellij.openapi.ide.CopyPasteManager
import com.intellij.openapi.project.Project
import java.awt.datatransfer.StringSelection

enum class CopyReferenceFailureReason {
    UNSUPPORTED_EDITOR,
    CLIPBOARD_WRITE_FAILED,
}

sealed interface CopyReferenceExecutionResult {
    val ok: Boolean
}

data class CopyReferenceSuccess(
    val value: String,
    val effectiveMode: ReferenceMode,
) : CopyReferenceExecutionResult {
    override val ok: Boolean = true
}

data class CopyReferenceFailure(
    val reason: CopyReferenceFailureReason,
    val message: String,
) : CopyReferenceExecutionResult {
    override val ok: Boolean = false
}

fun interface ClipboardService {
    fun writeText(value: String)
}

private object SystemClipboardService : ClipboardService {
    override fun writeText(value: String) {
        CopyPasteManager.getInstance().setContents(StringSelection(value))
    }
}

object JetBrainsCopyReferenceWorkflow {
    private var clipboardService: ClipboardService = SystemClipboardService

    fun execute(
        project: Project?,
        editor: Editor?,
        mode: ReferenceMode,
    ): CopyReferenceExecutionResult {
        val guardResult = validateEditorInput(editor, project)
        if (guardResult is EditorInputGuardResult.Unsupported) {
            val failure = CopyReferenceFailure(
                reason = CopyReferenceFailureReason.UNSUPPORTED_EDITOR,
                message = guardResult.error.message,
            )
            FileReferenceNotifications.showFailure(project, failure.message)
            return failure
        }

        guardResult as EditorInputGuardResult.Supported
        val reference = buildFileReference(
            snapshot = guardResult.value,
            mode = mode,
        )

        return try {
            clipboardService.writeText(reference.value)
            val success = CopyReferenceSuccess(
                value = reference.value,
                effectiveMode = reference.effectiveMode,
            )
            FileReferenceNotifications.showSuccess(project, success.effectiveMode)
            success
        } catch (_: Exception) {
            val failure = CopyReferenceFailure(
                reason = CopyReferenceFailureReason.CLIPBOARD_WRITE_FAILED,
                message = "Failed to copy file path with line numbers",
            )
            FileReferenceNotifications.showFailure(project, failure.message)
            failure
        }
    }

    internal fun setClipboardServiceForTests(service: ClipboardService) {
        clipboardService = service
    }

    internal fun resetTestServices() {
        clipboardService = SystemClipboardService
    }
}
