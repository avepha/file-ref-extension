package com.avepha.copyfilepathwithlinenumbers.reference

import com.avepha.copyfilepathwithlinenumbers.editor.PositionSnapshot
import com.avepha.copyfilepathwithlinenumbers.editor.SelectionSnapshot

sealed interface NormalizedLineOutput {
    data class Line(val line: Int) : NormalizedLineOutput
    data class Range(val startLine: Int, val endLine: Int) : NormalizedLineOutput
}

private fun comparePositions(left: PositionSnapshot, right: PositionSnapshot): Int {
    return when {
        left.line != right.line -> left.line - right.line
        else -> left.character - right.character
    }
}

private fun orderSelection(selection: SelectionSnapshot): Pair<PositionSnapshot, PositionSnapshot> {
    return if (comparePositions(selection.anchor, selection.active) <= 0) {
        selection.anchor to selection.active
    } else {
        selection.active to selection.anchor
    }
}

fun normalizeSelectionLines(selection: SelectionSnapshot): NormalizedLineOutput {
    val (start, end) = orderSelection(selection)

    if (comparePositions(start, end) == 0) {
        return NormalizedLineOutput.Line(start.line + 1)
    }

    val normalizedEndLine = if (end.character == 0 && end.line > start.line) end.line - 1 else end.line
    val startLine = start.line + 1
    val endLine = normalizedEndLine + 1

    return if (startLine == endLine) {
        NormalizedLineOutput.Line(startLine)
    } else {
        NormalizedLineOutput.Range(startLine = startLine, endLine = endLine)
    }
}

fun formatNormalizedLine(output: NormalizedLineOutput): String {
    return when (output) {
        is NormalizedLineOutput.Line -> output.line.toString()
        is NormalizedLineOutput.Range -> "${output.startLine}-${output.endLine}"
    }
}
