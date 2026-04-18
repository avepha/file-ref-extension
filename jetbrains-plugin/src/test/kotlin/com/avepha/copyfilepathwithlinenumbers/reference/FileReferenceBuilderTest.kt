package com.avepha.copyfilepathwithlinenumbers.reference

import com.avepha.copyfilepathwithlinenumbers.editor.EditorSnapshot
import com.avepha.copyfilepathwithlinenumbers.editor.PositionSnapshot
import com.avepha.copyfilepathwithlinenumbers.editor.SelectionSnapshot
import kotlin.test.Test
import kotlin.test.assertEquals

class FileReferenceBuilderTest {
    @Test
    fun absoluteModeBuildsLineReference() {
        val result = buildFileReference(
            snapshot = snapshot(
                documentPath = "/repo/src/File.kt",
                selection = SelectionSnapshot(
                    anchor = PositionSnapshot(line = 2, character = 4),
                    active = PositionSnapshot(line = 2, character = 4),
                ),
            ),
            mode = ReferenceMode.ABSOLUTE,
        )

        assertEquals("/repo/src/File.kt:3", result.value)
        assertEquals(ReferenceMode.ABSOLUTE, result.effectiveMode)
    }

    @Test
    fun absoluteModeBuildsRangeReference() {
        val result = buildFileReference(
            snapshot = snapshot(
                documentPath = "/repo/src/File.kt",
                selection = SelectionSnapshot(
                    anchor = PositionSnapshot(line = 1, character = 2),
                    active = PositionSnapshot(line = 4, character = 0),
                ),
            ),
            mode = ReferenceMode.ABSOLUTE,
        )

        assertEquals("/repo/src/File.kt:2-4", result.value)
    }

    @Test
    fun relativeModeBuildsProjectRelativeLineReference() {
        val result = buildFileReference(
            snapshot = snapshot(
                documentPath = "/repo/packages/core/src/File.kt",
                selection = SelectionSnapshot(
                    anchor = PositionSnapshot(line = 0, character = 0),
                    active = PositionSnapshot(line = 0, character = 0),
                ),
                containingRootPaths = listOf("/repo", "/repo/packages/core"),
            ),
            mode = ReferenceMode.RELATIVE,
        )

        assertEquals("src/File.kt:1", result.value)
        assertEquals(ReferenceMode.RELATIVE, result.effectiveMode)
    }

    @Test
    fun relativeModeBuildsProjectRelativeRangeReference() {
        val result = buildFileReference(
            snapshot = snapshot(
                documentPath = "/repo/packages/core/src/File.kt",
                selection = SelectionSnapshot(
                    anchor = PositionSnapshot(line = 3, character = 2),
                    active = PositionSnapshot(line = 6, character = 1),
                ),
                containingRootPaths = listOf("/repo", "/repo/packages/core"),
            ),
            mode = ReferenceMode.RELATIVE,
        )

        assertEquals("src/File.kt:4-7", result.value)
        assertEquals(ReferenceMode.RELATIVE, result.effectiveMode)
    }

    @Test
    fun relativeModeFallsBackToAbsoluteAndReportsEffectiveMode() {
        val result = buildFileReference(
            snapshot = snapshot(
                documentPath = "C:\\repo\\outside\\File.kt",
                selection = SelectionSnapshot(
                    anchor = PositionSnapshot(line = 7, character = 0),
                    active = PositionSnapshot(line = 7, character = 0),
                ),
                containingRootPaths = emptyList(),
            ),
            mode = ReferenceMode.RELATIVE,
        )

        assertEquals("C:/repo/outside/File.kt:8", result.value)
        assertEquals(ReferenceMode.ABSOLUTE, result.effectiveMode)
    }

    private fun snapshot(
        documentPath: String,
        selection: SelectionSnapshot,
        containingRootPaths: List<String> = emptyList(),
    ): EditorSnapshot {
        return EditorSnapshot(
            documentPath = documentPath,
            selection = selection,
            containingRootPaths = containingRootPaths,
        )
    }
}
