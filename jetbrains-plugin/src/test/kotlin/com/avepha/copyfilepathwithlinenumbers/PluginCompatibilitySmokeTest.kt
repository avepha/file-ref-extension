package com.avepha.copyfilepathwithlinenumbers

import java.io.InputStream
import javax.xml.parsers.DocumentBuilderFactory
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertEquals
import kotlin.test.assertTrue
import org.w3c.dom.Element

class PluginCompatibilitySmokeTest {
    @Test
    fun pluginDescriptorDeclaresPlatformCompatibilityOnly() {
        val descriptorStream = javaClass.getResourceAsStream("/META-INF/plugin.xml")
        assertNotNull(descriptorStream, "plugin.xml should be available on the test classpath")

        val dependencies = parseDependencies(descriptorStream)

        assertTrue(
            "com.intellij.modules.platform" in dependencies,
            "plugin.xml should declare com.intellij.modules.platform compatibility",
        )
        assertFalse("com.intellij.java" in dependencies, "plugin.xml should stay product-agnostic in Phase 4")
        assertFalse(
            "com.intellij.modules.lang" in dependencies,
            "plugin.xml should avoid extra product-level module dependencies in Phase 4",
        )
    }

    @Test
    fun pluginDescriptorRegistersNotificationBalloonGroupForCopyResults() {
        val descriptorStream = javaClass.getResourceAsStream("/META-INF/plugin.xml")
        assertNotNull(descriptorStream, "plugin.xml should be available on the test classpath")

        val notificationGroup = parseNotificationGroup(descriptorStream)
        assertNotNull(notificationGroup, "plugin.xml should register a notification group for copy feedback")
        assertEquals("Copy File Path with Line Numbers", notificationGroup.getAttribute("id"))
        assertEquals("BALLOON", notificationGroup.getAttribute("displayType"))
    }

    private fun parseDependencies(stream: InputStream): List<String> {
        val document = DocumentBuilderFactory.newInstance()
            .newDocumentBuilder()
            .parse(stream)

        val dependsNodes = document.getElementsByTagName("depends")

        return buildList(dependsNodes.length) {
            for (index in 0 until dependsNodes.length) {
                add(dependsNodes.item(index).textContent.trim())
            }
        }
    }

    private fun parseNotificationGroup(stream: InputStream): Element? {
        val document = DocumentBuilderFactory.newInstance()
            .newDocumentBuilder()
            .parse(stream)

        val notificationGroups = document.getElementsByTagName("notificationGroup")
        return notificationGroups.item(0) as? Element
    }
}
