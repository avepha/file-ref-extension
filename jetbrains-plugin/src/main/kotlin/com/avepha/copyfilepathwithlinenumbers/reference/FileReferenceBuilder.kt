package com.avepha.copyfilepathwithlinenumbers.reference

import com.avepha.copyfilepathwithlinenumbers.editor.EditorSnapshot

data class FileReferenceResult(
    val value: String,
    val effectiveMode: ReferenceMode,
)

fun buildFileReference(snapshot: EditorSnapshot, mode: ReferenceMode): FileReferenceResult {
    val pathOutput = resolveReferencePath(
        documentPath = snapshot.documentPath,
        mode = mode,
        containingRootPaths = snapshot.containingRootPaths,
    )
    val lineOutput = formatNormalizedLine(normalizeSelectionLines(snapshot.selection))
    val effectiveMode = if (
        mode == ReferenceMode.RELATIVE &&
        pathOutput == normalizeToPosixPath(snapshot.documentPath)
    ) {
        ReferenceMode.ABSOLUTE
    } else {
        mode
    }

    return FileReferenceResult(
        value = "$pathOutput:$lineOutput",
        effectiveMode = effectiveMode,
    )
}
