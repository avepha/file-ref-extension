package com.avepha.copyfilepathwithlinenumbers.editor

const val DEFAULT_UNSUPPORTED_MESSAGE = "No saved local text file is active"

enum class UnsupportedEditorReason {
    NO_ACTIVE_EDITOR,
    NO_SAVED_LOCAL_FILE,
    MULTI_CARET,
}

data class UnsupportedEditorState(
    val reason: UnsupportedEditorReason,
    val message: String = DEFAULT_UNSUPPORTED_MESSAGE,
)

data class PositionSnapshot(
    val line: Int,
    val character: Int,
)

data class SelectionSnapshot(
    val anchor: PositionSnapshot,
    val active: PositionSnapshot,
)

data class EditorSnapshot(
    val documentPath: String,
    val selection: SelectionSnapshot,
    val containingRootPaths: List<String>,
)

sealed interface EditorInputGuardResult {
    val ok: Boolean

    data class Supported(val value: EditorSnapshot) : EditorInputGuardResult {
        override val ok: Boolean = true
    }

    data class Unsupported(val error: UnsupportedEditorState) : EditorInputGuardResult {
        override val ok: Boolean = false
    }
}
