package com.avepha.copyfilepathwithlinenumbers.platform

import com.avepha.copyfilepathwithlinenumbers.reference.ReferenceMode
import com.intellij.notification.NotificationType
import kotlin.test.Test
import kotlin.test.assertEquals

class FileReferenceNotificationsTest {
    @Test
    fun absoluteAndRelativeSuccessMessagesStayProductConsistent() {
        val service = RecordingNotificationService()
        FileReferenceNotifications.setNotificationServiceForTests(service)

        val absoluteMessage = FileReferenceNotifications.showSuccess(null, ReferenceMode.ABSOLUTE)
        val relativeMessage = FileReferenceNotifications.showSuccess(null, ReferenceMode.RELATIVE)

        assertEquals(ABSOLUTE_SUCCESS_MESSAGE, absoluteMessage)
        assertEquals(RELATIVE_SUCCESS_MESSAGE, relativeMessage)
        assertEquals(
            listOf(
                RecordedNotification(NotificationType.INFORMATION, ABSOLUTE_SUCCESS_MESSAGE),
                RecordedNotification(NotificationType.INFORMATION, RELATIVE_SUCCESS_MESSAGE),
            ),
            service.notifications,
        )

        FileReferenceNotifications.resetTestServices()
    }

    @Test
    fun relativeFallbackUsesAbsoluteSuccessMessage() {
        val service = RecordingNotificationService()
        FileReferenceNotifications.setNotificationServiceForTests(service)

        val message = FileReferenceNotifications.showSuccess(null, ReferenceMode.ABSOLUTE)

        assertEquals(ABSOLUTE_SUCCESS_MESSAGE, message)
        assertEquals(
            listOf(RecordedNotification(NotificationType.INFORMATION, ABSOLUTE_SUCCESS_MESSAGE)),
            service.notifications,
        )

        FileReferenceNotifications.resetTestServices()
    }

    @Test
    fun failureMessagesStayShortAndUseErrorSeverity() {
        val service = RecordingNotificationService()
        FileReferenceNotifications.setNotificationServiceForTests(service)

        val unsupportedMessage = FileReferenceNotifications.showFailure(null, "No saved local text file is active")
        val clipboardMessage = FileReferenceNotifications.showFailure(null, "Failed to copy file path with line numbers")

        assertEquals("No saved local text file is active", unsupportedMessage)
        assertEquals("Failed to copy file path with line numbers", clipboardMessage)
        assertEquals(
            listOf(
                RecordedNotification(NotificationType.ERROR, "No saved local text file is active"),
                RecordedNotification(NotificationType.ERROR, "Failed to copy file path with line numbers"),
            ),
            service.notifications,
        )

        FileReferenceNotifications.resetTestServices()
    }
}

data class RecordedNotification(
    val type: NotificationType,
    val message: String,
)

private class RecordingNotificationService : FileReferenceNotificationService {
    val notifications = mutableListOf<RecordedNotification>()

    override fun notify(project: com.intellij.openapi.project.Project?, type: NotificationType, message: String) {
        notifications += RecordedNotification(type, message)
    }
}
