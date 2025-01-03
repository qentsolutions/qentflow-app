'use client'

import { Notification as PrismaNotification } from '@prisma/client'
import { NotificationCard } from './notification-card'
import { useState } from 'react'


interface Notification extends PrismaNotification {
    workspaceName: string
}

interface NotificationListProps {
    notifications: Notification[]
    onUpdate?: () => void
    showWorkspace?: boolean
}

export function NotificationList({ notifications: initialNotifications, onUpdate, showWorkspace = false }: NotificationListProps) {
    const [notifications, setNotifications] = useState(initialNotifications)

    if (notifications.length === 0) {
        return (
            <div className="p-4 text-center text-sm text-gray-400">
                No notifications
            </div>
        )
    }

    const handleDelete = (notificationId: string) => {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
        onUpdate?.()
    }

    const handleMarkAsRead = (notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
        ))
        onUpdate?.()
    }

    const handleMarkAsUnRead = (notificationId: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: false } : n
        ))
        onUpdate?.()
    }

    return (
        <div className="space-y-2 p-2">
            {notifications.map((notification) => (
                <NotificationCard
                    key={notification.id}
                    id={notification.id}
                    message={notification.message}
                    createdAt={new Date(notification.createdAt)}
                    isRead={notification.read}
                    workspaceName={notification.workspaceName}
                    onDelete={() => handleDelete(notification.id)}
                    onMarkAsRead={() => handleMarkAsRead(notification.id)}
                    onMarkAsUnRead={() => handleMarkAsUnRead(notification.id)}
                    showWorkspace={showWorkspace}
                />
            ))}
        </div>
    )
}

