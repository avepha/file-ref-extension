package com.avepha.copyfilepathwithlinenumbers.platform

import com.avepha.copyfilepathwithlinenumbers.reference.ReferenceMode
import com.intellij.notification.NotificationGroupManager
import com.intellij.notification.NotificationType
import com.intellij.openapi.project.Project

const val FILE_REFERENCE_NOTIFICATION_GROUP_ID = "Copy File Path with Line Numbers"
const val ABSOLUTE_SUCCESS_MESSAGE = "Copied absolute file path with line numbers"
const val RELATIVE_SUCCESS_MESSAGE = "Copied relative file path with line numbers"

fun interface FileReferenceNotificationService {
    fun notify(project: Project?, type: NotificationType, message: String)
}

private object BalloonNotificationService : FileReferenceNotificationService {
    override fun notify(project: Project?, type: NotificationType, message: String) {
        NotificationGroupManager.getInstance()
            .getNotificationGroup(FILE_REFERENCE_NOTIFICATION_GROUP_ID)
            .createNotification(message, type)
            .notify(project)
    }
}

object FileReferenceNotifications {
    private var notificationService: FileReferenceNotificationService = BalloonNotificationService

    fun successMessageFor(mode: ReferenceMode): String {
        return if (mode == ReferenceMode.ABSOLUTE) {
            ABSOLUTE_SUCCESS_MESSAGE
        } else {
            RELATIVE_SUCCESS_MESSAGE
        }
    }

    fun showSuccess(project: Project?, mode: ReferenceMode): String {
        val message = successMessageFor(mode)
        notificationService.notify(project, NotificationType.INFORMATION, message)
        return message
    }

    fun showFailure(project: Project?, message: String): String {
        notificationService.notify(project, NotificationType.ERROR, message)
        return message
    }

    internal fun setNotificationServiceForTests(service: FileReferenceNotificationService) {
        notificationService = service
    }

    internal fun resetTestServices() {
        notificationService = BalloonNotificationService
    }
}
