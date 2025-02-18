'use client';

import { AlertCircle, Bell, BellOff, BellPlus, Check, ExternalLink, Share, Trash2, X } from 'lucide-react';
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
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface NotificationCardProps {
  id: string;
  message: string;
  createdAt: Date;
  link?: string | null;
  isRead: boolean;
  workspaceName: string;
  onDelete?: () => void;
  onMarkAsRead?: () => void;
  onMarkAsUnRead?: () => void;
  showWorkspace?: boolean;
  isInvitation?: boolean;
  metadata?: {
    type: 'card_created' | 'comment_added' | 'card_updated' | 'task_completed' | 'mention';
    cardId?: string;
    boardId?: string;
    commentId?: string;
  };
}

export function NotificationCard({
  id,
  message,
  createdAt,
  link,
  isRead = false,
  workspaceName,
  onDelete,
  onMarkAsRead,
  onMarkAsUnRead,
  showWorkspace = false,
  isInvitation = false,
  metadata,
}: NotificationCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { currentWorkspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const router = useRouter();

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

  const handleClick = () => {
    if (!metadata || !currentWorkspace) return;

    const baseUrl = `/${currentWorkspace.id}/boards/${metadata.boardId}`;

    switch (metadata.type) {
      case 'card_created':
      case 'card_updated':
      case 'comment_added':
      case 'mention':
        if (metadata.cardId) {
          router.push(`${baseUrl}/cards/${metadata.cardId}`);
        }
        break;
      case 'task_completed':
        if (metadata.cardId) {
          router.push(`${baseUrl}/cards/${metadata.cardId}?tab=tasks`);
        }
        break;
      default:
        break;
    }

    // Mark as read when clicked
    if (!isRead) {
      handleMarkAsRead();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        group relative flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer
        ${isRead ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'}
        border border-transparent hover:border-blue-200
        transform hover:-translate-y-1 hover:shadow-md
        duration-200
      `}
      onClick={handleClick}
    >
      <div className="mt-1">
        <div className={`rounded-full p-2 ${isRead ? 'bg-gray-200' : 'bg-blue-200'}`}>
          <AlertCircle className={`w-4 h-4 ${isRead ? 'text-gray-600' : 'text-blue-600'}`} />
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${isRead ? 'text-gray-600' : 'text-blue-800'} font-medium`}>
          {message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(createdAt, {
              addSuffix: true,
              locale: enUS
            })}
          </p>
          {showWorkspace && (
            <>
              <span className="text-gray-300">•</span>
              <p className="text-xs text-gray-600 font-medium">
                {workspaceName}
              </p>
            </>
          )}
        </div>
      </div>
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {link != null && (
          <Link href={link || ""}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 bg-white hover:bg-gray-100 rounded-full"
            >
              <ExternalLink className="h-4 w-4 text-blue-500" />
            </Button>
          </Link>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white hover:bg-gray-100 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            isRead ? handleMarkAsUnRead() : handleMarkAsRead();
          }}
        >
          {isRead ? (
            <BellOff className="h-4 w-4 text-gray-500" />
          ) : (
            <BellPlus className="h-4 w-4 text-blue-500" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-white hover:bg-red-100 rounded-full"
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <X className="h-4 w-4 text-red-500" />
        </Button>
      </div>
    </motion.div>
  );
}