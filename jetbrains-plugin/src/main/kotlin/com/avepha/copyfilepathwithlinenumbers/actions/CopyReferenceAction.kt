package com.avepha.copyfilepathwithlinenumbers.actions

import com.avepha.copyfilepathwithlinenumbers.editor.EditorInputGuardResult
import com.avepha.copyfilepathwithlinenumbers.editor.validateEditorInput
import com.avepha.copyfilepathwithlinenumbers.platform.JetBrainsCopyReferenceWorkflow
import com.avepha.copyfilepathwithlinenumbers.reference.ReferenceMode
import com.intellij.openapi.actionSystem.ActionUpdateThread
import com.intellij.openapi.actionSystem.AnActionEvent
import com.intellij.openapi.actionSystem.CommonDataKeys
import com.intellij.openapi.project.DumbAwareAction

abstract class CopyReferenceAction : DumbAwareAction() {
    protected abstract val mode: ReferenceMode

    override fun getActionUpdateThread(): ActionUpdateThread = ActionUpdateThread.BGT

    override fun update(event: AnActionEvent) {
        // Reuse the shared guard so action visibility never drifts from execution-time validation.
        val result = validateEditorInput(
            editor = event.getData(CommonDataKeys.EDITOR),
            project = event.project,
        )
        val isSupported = result is EditorInputGuardResult.Supported
        event.presentation.isEnabledAndVisible = isSupported
    }

    override fun actionPerformed(event: AnActionEvent) {
        JetBrainsCopyReferenceWorkflow.execute(
            project = event.project,
            editor = event.getData(CommonDataKeys.EDITOR),
            mode = mode,
        )
    }
}
