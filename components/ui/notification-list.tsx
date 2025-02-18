'use client';

import { Notification as PrismaNotification } from '@prisma/client';
import { NotificationCard } from './notification-card';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

interface Notification extends PrismaNotification {
  workspaceName: string;
  metadata?: {
    type: 'card_created' | 'comment_added' | 'card_updated' | 'task_completed' | 'mention';
    cardId?: string;
    boardId?: string;
    commentId?: string;
  };
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
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="bg-gray-100 rounded-full p-3 mb-4">
          <Bell className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 font-medium">No notifications yet</p>
        <p className="text-xs text-gray-400 mt-1">
          We&apos;ll notify you when something important happens
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <div className="space-y-3 p-2">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            id={notification.id}
            message={notification.message}
            link={notification.link}
            createdAt={new Date(notification.createdAt)}
            isRead={notification.read}
            workspaceName={notification.workspaceName}
            isInvitation={notification.isInvitation}
            metadata={notification.metadata}
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
    </AnimatePresence>
  );
}