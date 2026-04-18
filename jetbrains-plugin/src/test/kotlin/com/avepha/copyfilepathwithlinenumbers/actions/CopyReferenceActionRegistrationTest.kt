package com.avepha.copyfilepathwithlinenumbers.actions

import java.io.InputStream
import javax.xml.parsers.DocumentBuilderFactory
import kotlin.test.Test
import kotlin.test.assertContains
import kotlin.test.assertEquals
import kotlin.test.assertNotNull
import kotlin.test.assertTrue
import org.w3c.dom.Element

private data class RegisteredAction(
    val id: String,
    val actionClass: String,
    val text: String,
    val description: String,
    val synonyms: List<String>,
    val abbreviations: List<String>,
    val groups: List<String>,
    val keymaps: List<String>,
)

class CopyReferenceActionRegistrationTest {
    @Test
    fun pluginDescriptorRegistersAbsoluteAndRelativeCopyActions() {
        val descriptorStream = javaClass.getResourceAsStream("/META-INF/plugin.xml")
        assertNotNull(descriptorStream, "plugin.xml should be available on the test classpath")

        val actions = parseActions(descriptorStream)
        val absoluteAction = actions["com.avepha.copyfilepathwithlinenumbers.copyAbsoluteReference"]
        val relativeAction = actions["com.avepha.copyfilepathwithlinenumbers.copyRelativeReference"]

        assertNotNull(absoluteAction, "absolute copy action should be registered")
        assertNotNull(relativeAction, "relative copy action should be registered")

        assertEquals(
            "com.avepha.copyfilepathwithlinenumbers.actions.CopyAbsoluteReferenceAction",
            absoluteAction.actionClass,
        )
        assertEquals(
            "com.avepha.copyfilepathwithlinenumbers.actions.CopyRelativeReferenceAction",
            relativeAction.actionClass,
        )
        assertEquals("Copy Absolute File Path with Line Numbers", absoluteAction.text)
        assertEquals("Copy Relative File Path with Line Numbers", relativeAction.text)
        assertTrue(
            absoluteAction.description.contains("absolute file path with line numbers"),
            "absolute action description should describe absolute copy behavior",
        )
        assertTrue(
            relativeAction.description.contains("project-relative file path with line numbers"),
            "relative action description should describe relative copy behavior",
        )

        listOf(absoluteAction, relativeAction).forEach { action ->
            assertContains(action.groups, "EditorPopupMenu")
            assertContains(action.groups, "ToolsMenu")
            assertContains(action.keymaps, "\$default")
            assertContains(action.keymaps, "Mac OS X 10.5+")
            assertTrue(action.synonyms.isNotEmpty(), "registered actions should include search aliases")
            assertTrue(action.abbreviations.isNotEmpty(), "registered actions should include abbreviations")
        }
    }

    private fun parseActions(stream: InputStream): Map<String, RegisteredAction> {
        val document = DocumentBuilderFactory.newInstance()
            .newDocumentBuilder()
            .parse(stream)

        val actionNodes = document.getElementsByTagName("action")

        return buildMap(actionNodes.length) {
            for (index in 0 until actionNodes.length) {
                val actionElement = actionNodes.item(index) as? Element ?: continue

                val id = actionElement.getAttribute("id")
                if (id.isBlank()) {
                    continue
                }

                val children = actionElement.childNodes
                val synonyms = mutableListOf<String>()
                val abbreviations = mutableListOf<String>()
                val groups = mutableListOf<String>()
                val keymaps = mutableListOf<String>()

                for (childIndex in 0 until children.length) {
                    val child = children.item(childIndex) as? Element ?: continue
                    when (child.tagName) {
                        "synonym" -> synonyms += child.getAttribute("text")
                        "abbreviation" -> abbreviations += child.getAttribute("value")
                        "add-to-group" -> groups += child.getAttribute("group-id")
                        "keyboard-shortcut" -> keymaps += child.getAttribute("keymap")
                    }
                }

                put(
                    id,
                    RegisteredAction(
                        id = id,
                        actionClass = actionElement.getAttribute("class"),
                        text = actionElement.getAttribute("text"),
                        description = actionElement.getAttribute("description"),
                        synonyms = synonyms,
                        abbreviations = abbreviations,
                        groups = groups,
                        keymaps = keymaps,
                    ),
                )
            }
        }
    }
}
