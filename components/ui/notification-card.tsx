"use client"

import { AlertCircle, Bell, BellOff, Check, ExternalLink, Share, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { enUS } from "date-fns/locale"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { deleteNotification } from "@/actions/notifications/delete-notification"
import { markNotificationAsRead } from "@/actions/notifications/read-notification"
import { markNotificationAsUnread } from "@/actions/notifications/unread-notification"
import { useQueryClient } from "@tanstack/react-query"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { useRouter } from "next/navigation"

interface NotificationCardProps {
  id: string
  message: string
  createdAt: Date
  link?: string | null
  isRead: boolean
  workspaceName: string
  onDelete?: () => void
  onMarkAsRead?: () => void
  onMarkAsUnRead?: () => void
  showWorkspace?: boolean
  isInvitation?: boolean
  metadata?: {
    type: "card_created" | "comment_added" | "card_updated" | "task_completed" | "mention"
    cardId?: string
    boardId?: string
    commentId?: string
  }
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
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { currentWorkspace } = useCurrentWorkspace()
  const queryClient = useQueryClient()
  const router = useRouter()

  const handleMarkAsRead = async () => {
    if (isRead || isLoading) return

    setIsLoading(true)
    try {
      const result = await markNotificationAsRead(id)
      if (result.success) {
        onMarkAsRead?.()
        toast.success("Notification marked as read")
        queryClient.invalidateQueries({
          queryKey: ["notifications", currentWorkspace?.id],
        })
      } else {
        toast.error("Error marking notification as read")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsUnRead = async () => {
    if (!isRead || isLoading) return

    setIsLoading(true)
    try {
      const result = await markNotificationAsUnread(id)
      if (result.success) {
        onMarkAsUnRead?.()
        toast.success("Notification marked as unread")
        queryClient.invalidateQueries({
          queryKey: ["notifications", currentWorkspace?.id],
        })
      } else {
        toast.error("Error marking notification as unread")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (isDeleting) return

    setIsDeleting(true)
    try {
      const result = await deleteNotification(id)
      if (result.success) {
        onDelete?.()
        toast.success("Notification deleted")
        queryClient.invalidateQueries({
          queryKey: ["notifications", currentWorkspace?.id],
        })
      } else {
        toast.error("Error deleting notification")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClick = () => {
    if (!metadata || !currentWorkspace) return

    const baseUrl = `/${currentWorkspace.id}/boards/${metadata.boardId}`

    switch (metadata.type) {
      case "card_created":
      case "card_updated":
      case "comment_added":
      case "mention":
        if (metadata.cardId) {
          router.push(`${baseUrl}/cards/${metadata.cardId}`)
        }
        break
      case "task_completed":
        if (metadata.cardId) {
          router.push(`${baseUrl}/cards/${metadata.cardId}?tab=tasks`)
        }
        break
      default:
        break
    }

    // Mark as read when clicked
    if (!isRead) {
      handleMarkAsRead()
    }
  }

  // Determine if notification is clickable
  const isClickable = metadata && currentWorkspace

  // Get icon based on notification type
  const getNotificationIcon = () => {
    if (!metadata) return <Bell className="w-4 h-4" />

    switch (metadata.type) {
      case "card_created":
        return <Share className="w-4 h-4" />
      case "comment_added":
        return <AlertCircle className="w-4 h-4" />
      case "card_updated":
        return <Bell className="w-4 h-4" />
      case "task_completed":
        return <Check className="w-4 h-4" />
      case "mention":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  return (
    <div
      className={`
      relative px-4 py-3
      ${isRead ? 'bg-white' : 'bg-blue-50'}
      ${isHovered ? (isRead ? 'bg-gray-50' : 'bg-blue-100') : ''}
      ${isClickable || link ? 'cursor-pointer' : 'cursor-default'}
      ${(isClickable || link) && isHovered ? 'ring-2 ring-blue-200 shadow-sm' : ''}
      transition-all duration-200
    `}
      onClick={() => {
        if (isClickable) {
          handleClick();
        } else if (link) {
          window.location.href = link;
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Left border indicator for unread */}
      {!isRead && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
      )}

      <div className="flex items-start gap-3">
        {/* Icon with appropriate background */}
        <div className={`
        flex-shrink-0 rounded-full p-2 mt-1
        ${isRead
            ? 'bg-gray-100 text-gray-600'
            : 'bg-blue-200 text-blue-700'}
      `}>
          {getNotificationIcon()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Message with appropriate styling - now with hover effect */}
          <p className={`
          text-sm font-medium
          ${isRead ? 'text-gray-700' : 'text-blue-800'}
          ${(isClickable || link) && isHovered ? 'underline decoration-1 underline-offset-2' : ''}
        `}>
            {message}
          </p>

          {/* Metadata row */}
          <div className="flex items-center gap-2 mt-1.5">
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

            {/* Clickable indicator with arrow icon */}
            {(isClickable || link) && isHovered && (
              <span className="text-xs text-blue-600 font-medium flex items-center ml-auto">
                {link ? 'Open' : 'View details'}
                <ExternalLink className="h-3 w-3 ml-1" />
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className={`
        absolute right-3 top-3 flex gap-1 
        ${isHovered ? 'opacity-100' : 'opacity-0'}
        transition-opacity duration-200
      `}>
          <Button
            variant="ghost"
            size="icon"
            className={`
            h-7 w-7 rounded-full border shadow-sm
            ${isRead
                ? 'bg-white hover:bg-blue-50 border-gray-200'
                : 'bg-blue-100 hover:bg-blue-200 border-blue-200'}
          `}
            onClick={(e) => {
              e.stopPropagation();
              isRead ? handleMarkAsUnRead() : handleMarkAsRead();
            }}
            title={isRead ? "Mark as unread" : "Mark as read"}
          >
            {isRead ? (
              <BellOff className="h-3.5 w-3.5 text-gray-600" />
            ) : (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 bg-white hover:bg-red-50 rounded-full border border-gray-200 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            title="Delete notification"
          >
            <X className="h-3.5 w-3.5 text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

