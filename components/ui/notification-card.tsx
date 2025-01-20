'use client';

import { AlertCircle, Bell, BellOff, BellPlus, Check, Trash2, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { deleteNotification } from '@/actions/notifications/delete-notification';
import { markNotificationAsRead } from '@/actions/notifications/read-notification';
import { markNotificationAsUnread } from '@/actions/notifications/unread-notification';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/hooks/use-current-workspace';

interface NotificationCardProps {
  id: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  workspaceName: string;
  onDelete?: () => void;
  onMarkAsRead?: () => void;
  onMarkAsUnRead?: () => void;
  showWorkspace?: boolean;
  isInvitation?: boolean;

}

export function NotificationCard({
  id,
  message,
  createdAt,
  isRead = false,
  workspaceName,
  onDelete,
  onMarkAsRead,
  onMarkAsUnRead,
  showWorkspace = false,
}: NotificationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentWorkspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();

  const handleMarkAsRead = async () => {
    if (isRead || isLoading) return;

    setIsLoading(true);
    try {
      const result = await markNotificationAsRead(id);
      if (result.success) {
        onMarkAsRead?.();
        toast.success("Notification marked as read");
        queryClient.invalidateQueries({
          queryKey: ["notifications", currentWorkspace?.id],
        });
      } else {
        toast.error("Error marking notification as read");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsUnRead = async () => {
    if (!isRead || isLoading) return;

    setIsLoading(true);
    try {
      const result = await markNotificationAsUnread(id);
      if (result.success) {
        onMarkAsUnRead?.();
        toast.success("Notification marked as unread");
        queryClient.invalidateQueries({
          queryKey: ["notifications", currentWorkspace?.id],
        });
      } else {
        toast.error("Error marking notification as unread");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      const result = await deleteNotification(id);
      if (result.success) {
        onDelete?.();
        toast.success("Notification deleted");
        queryClient.invalidateQueries({
          queryKey: ["notifications", currentWorkspace?.id],
        });
      } else {
        toast.error("Error deleting notification");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className={`
        group relative flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer
        ${isRead ? 'bg-gray-50' : 'bg-blue-50'}
      `}
    >
      <div className="mt-1">
        <AlertCircle className={`w-5 h-5 ${isRead ? 'text-gray-400' : 'text-blue-500'}`} />
      </div>
      <div className="flex-1 min-w-0 pr-12">
        <p className="text-sm text-gray-900">{message}</p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(createdAt, {
            addSuffix: true,
            locale: enUS
          })}
        </p>
        {showWorkspace && (
          <p className="text-xs text-gray-600 mt-1">
            Workspace: {workspaceName}
          </p>
        )}
     
      </div>
      <div
        className={`
          absolute right-0 top-0 bottom-0 w-10 flex flex-col opacity-0 transition-opacity
          group-hover:opacity-100
        `}
      >
        <Button
          variant="ghost"
          size="icon"
          className={`h-1/2 w-full rounded-none rounded-tr-lg bg-blue-500 hover:bg-blue-500 ${isRead ? 'hover:bg-blue-400' : 'hover:bg-blue-500'}`}
          onClick={isRead ? handleMarkAsUnRead : handleMarkAsRead}
        >
          {isRead ? (
            <BellOff className={`h-4 w-4 ${isRead ? 'text-gray-400' : 'text-white'}`} />
          ) : (
            <BellPlus className={`h-4 w-4 ${isRead ? 'text-gray-400' : 'text-white'}`} />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-1/2 w-full rounded-none rounded-br-lg border-t border-gray-200 bg-red-400 hover:bg-red-400"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <X className="h-4 w-4 text-white" />
        </Button>
      </div>
    </div>
  );
}