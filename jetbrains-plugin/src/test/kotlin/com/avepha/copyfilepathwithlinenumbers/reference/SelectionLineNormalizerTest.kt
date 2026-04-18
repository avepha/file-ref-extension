package com.avepha.copyfilepathwithlinenumbers.reference

import com.avepha.copyfilepathwithlinenumbers.editor.PositionSnapshot
import com.avepha.copyfilepathwithlinenumbers.editor.SelectionSnapshot
import kotlin.test.Test
import kotlin.test.assertEquals

class SelectionLineNormalizerTest {
    @Test
    fun zeroWidthCaretFormatsAsSingleLine() {
        assertEquals(
            NormalizedLineOutput.Line(3),
            normalizeSelectionLines(
                SelectionSnapshot(
                    anchor = PositionSnapshot(line = 2, character = 4),
                    active = PositionSnapshot(line = 2, character = 4),
                ),
            ),
        )
    }

    @Test
    fun sameLineSelectionCollapsesToSingleLine() {
        val output = normalizeSelectionLines(
            SelectionSnapshot(
                anchor = PositionSnapshot(line = 4, character = 2),
                active = PositionSnapshot(line = 4, character = 9),
            ),
        )

        assertEquals(NormalizedLineOutput.Line(5), output)
        assertEquals("5", formatNormalizedLine(output))
    }

    @Test
    fun reversedSelectionProducesOrderedRange() {
        val output = normalizeSelectionLines(
            SelectionSnapshot(
                anchor = PositionSnapshot(line = 8, character = 5),
                active = PositionSnapshot(line = 5, character = 1),
            ),
        )

        assertEquals(NormalizedLineOutput.Range(startLine = 6, endLine = 9), output)
        assertEquals("6-9", formatNormalizedLine(output))
    }

    @Test
    fun endColumnZeroCollapsesToPreviousLine() {
        val output = normalizeSelectionLines(
            SelectionSnapshot(
                anchor = PositionSnapshot(line = 2, character = 3),
                active = PositionSnapshot(line = 4, character = 0),
            ),
        )

        assertEquals(NormalizedLineOutput.Range(startLine = 3, endLine = 4), output)
        assertEquals("3-4", formatNormalizedLine(output))
    }
}
