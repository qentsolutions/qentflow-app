'use client';

import { Notification as PrismaNotification } from '@prisma/client';
import { NotificationCard } from './notification-card';
import { useState } from 'react';
import { useParams } from 'next/navigation';

interface Notification extends PrismaNotification {
  workspaceName: string;
}

interface NotificationListProps {
  notifications: Notification[];
  onUpdate?: () => void;
  showWorkspace?: boolean;
}

export function NotificationList({ notifications: initialNotifications, onUpdate, showWorkspace = false }: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const params = useParams();

 
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-400">
        No notifications
      </div>
    );
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
          isInvitation={notification.isInvitation}
          onDelete={() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
            onUpdate?.();
          }}
          onMarkAsRead={() => {
            setNotifications(prev =>
              prev.map(n =>
                n.id === notification.id ? { ...n, read: true } : n
              )
            );
            onUpdate?.();
          }}
          onMarkAsUnRead={() => {
            setNotifications(prev =>
              prev.map(n =>
                n.id === notification.id ? { ...n, read: false } : n
              )
            );
            onUpdate?.();
          }}
          showWorkspace={showWorkspace}
        />
      ))}
    </div>
  );
}