"use client"

import type { Tag, User } from "@prisma/client"
import { Draggable } from "@hello-pangea/dnd"
import { useCardModal } from "@/hooks/use-card-modal"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { UserPlus, UserIcon, UserX, MessageSquareText, AlertTriangle, Paperclip, Flag, Check } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { assignUserToCard } from "@/actions/boards/assign-user-to-card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/fetcher"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { createNotification } from "@/actions/notifications/create-notification"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useParams } from "next/navigation"
import { cn } from "@/lib/utils"

interface CommentCountResponse {
  commentCount: number
  attachmentsCount: number
}

interface CardItemProps {
  data: {
    id: string
    title: string
    order: number
    description: string | null
    listId: string
    createdAt: Date
    updatedAt: Date
    assignedUserId?: string | null
    tags?: Tag[]
    priority: string | null
    index?: number
    tasks?: {
      id: string
      completed: boolean
    }[]
  }
  index: number
  users: User[]
}

export const CardItem = ({ data, index, users }: CardItemProps) => {
  const cardModal = useCardModal()
  const [assignedUserState, setAssignedUserState] = useState<User | null>(null)
  const currentUser = useCurrentUser()
  const params = useParams()

  useEffect(() => {
    const assignedUser = users.find((user) => user.id === data.assignedUserId) || null
    setAssignedUserState(assignedUser)
  }, [data.assignedUserId, users])

  const { data: commentsData } = useQuery<CommentCountResponse>({
    queryKey: ["card-comments", data?.id],
    queryFn: () => fetcher(`/api/cards/${data?.id}/comments/count-in-card`),
  })

  const handleAssignUser = async (userId: string | null) => {
    try {
      await assignUserToCard(data.id, userId || "null")

      if (userId) {
        await createNotification(
          userId,
          params?.workspaceId as string,
          `${currentUser?.name} has assigned you to a card: ${data?.title}!`,
          `/${params?.workspaceId}/boards/${params.boardId}/cards/${data?.id}`,
        )
      }

      if (userId === null) {
        setAssignedUserState(null)
        toast.success("User unassigned from card")
      } else {
        const assignedUser = users.find((user) => user.id === userId) || null
        setAssignedUserState(assignedUser)
        toast.success("User assigned to card")
      }
    } catch (error) {
      toast.error("Failed to update user assignment")
    }
  }

  const getPriorityDetails = (priority: string | null) => {
    if (!priority) return { icon: null, color: "" }

    switch (priority) {
      case "LOW":
        return {
          icon: <Flag className="text-emerald-500" size={14} />,
          color: "text-emerald-500",
        }
      case "MEDIUM":
        return {
          icon: <Flag className="text-amber-500" size={14} />,
          color: "text-amber-500",
        }
      case "HIGH":
        return {
          icon: <Flag className="text-rose-500" size={14} />,
          color: "text-rose-500",
        }
      case "CRITICAL":
        return {
          icon: <AlertTriangle className="text-red-600" size={14} />,
          color: "text-red-600",
        }
      default:
        return { icon: null, color: "" }
    }
  }

  const priorityDetails = getPriorityDetails(data.priority)
  const completedTasks = data.tasks?.filter((task) => task.completed).length || 0
  const totalTasks = data.tasks?.length || 0
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className="group relative border border-border/40 bg-card dark:bg-gray-800 rounded-lg 
                    shadow-sm hover:shadow-md transition-all duration-200 
                    hover:border-primary/60 z-50 overflow-hidden"
        >
          {/* Priority indicator strip */}
          {data.priority && (
            <div
              className={cn(
                "absolute top-0 left-0 w-1 h-full",
                data.priority === "LOW" && "bg-emerald-500",
                data.priority === "MEDIUM" && "bg-amber-500",
                data.priority === "HIGH" && "bg-rose-500",
                data.priority === "CRITICAL" && "bg-red-600",
              )}
            />
          )}

          <div className="pt-3 px-3 pb-1 space-y-3">
            {/* Tags */}
            {data?.tags && data.tags.length > 0 && (
              <div className="flex items-start gap-1.5 flex-wrap">
                {data.tags.map((tag: Tag) => (
                  <Badge
                    key={tag.id}
                    className="text-[10px] font-medium py-0 h-5 text-white"
                    style={{ backgroundColor: tag?.color || "#ff0000" }}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h3 className="text-sm font-medium line-clamp-2 text-foreground">{data.title}</h3>

            {/* Footer with metadata */}
            <div className="flex items-center justify-between pt-1">
              {/* Left side - Comments & Attachments */}
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Tooltip>
                  <TooltipTrigger>
                    {(commentsData?.commentCount ?? 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquareText size={13} />
                        <span>{commentsData?.commentCount ?? 0}</span>
                      </div>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {(commentsData?.commentCount ?? 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <MessageSquareText size={13} />
                        <span>
                          {commentsData?.commentCount} {commentsData?.commentCount === 1 ? "comment" : "comments"}
                        </span>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger>
                    {(commentsData?.attachmentsCount ?? 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <Paperclip size={13} />
                        <span>
                          {commentsData?.attachmentsCount}
                        </span>
                      </div>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    {(commentsData?.attachmentsCount ?? 0) > 0 && (
                      <div className="flex items-center gap-1">
                        <Paperclip size={13} />
                        <span>
                          {commentsData?.attachmentsCount}{" "}
                          {commentsData?.attachmentsCount === 1 ? "attachment" : "attachments"}
                        </span>
                      </div>
                    )}                  </TooltipContent>
                </Tooltip>


              </div>

              {/* Right side - Priority & Assignee */}
              <div className="flex items-center gap-2">
                {/* Priority */}
                {priorityDetails.icon && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="cursor-help">{priorityDetails.icon}</div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className={cn("text-xs font-medium", priorityDetails.color)}>
                        {data.priority}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}

                {/* Assignee */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Popover>
                        <PopoverTrigger onClick={(e) => e.stopPropagation()} asChild>
                          <button className="hover:opacity-75 transition focus:outline-none">
                            {assignedUserState ? (
                              <Avatar className="h-6 w-6 border-2 border-background">
                                <AvatarImage
                                  src={assignedUserState.image || ""}
                                  alt={assignedUserState.name || "User"}
                                />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                  {assignedUserState.name?.charAt(0) || <UserIcon className="h-3 w-3" />}
                                </AvatarFallback>
                              </Avatar>
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground/50 flex items-center justify-center hover:border-primary/50 transition-colors">
                                <UserPlus size={12} className="text-muted-foreground" />
                              </div>
                            )}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-56 p-2"
                          side="bottom"
                          align="end"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ScrollArea className="h-[180px]">
                            <div className="space-y-1">
                              <button
                                onClick={() => handleAssignUser(null)}
                                className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
                              >
                                <div className="h-7 w-7 rounded-full border border-dashed border-muted-foreground/50 flex items-center justify-center">
                                  <UserX className="h-3.5 w-3.5 text-muted-foreground" />
                                </div>
                                <span className="text-sm">Not assigned</span>
                                {!assignedUserState && <Check className="h-4 w-4 text-primary ml-auto" />}
                              </button>

                              {users.map((user) => (
                                <button
                                  key={user.id}
                                  onClick={() => handleAssignUser(user.id)}
                                  className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
                                >
                                  <Avatar className="h-7 w-7">
                                    <AvatarImage src={user?.image || ""} alt={user.name || "User"} />
                                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                      {user.name?.charAt(0) || <UserIcon className="h-3 w-3" />}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm truncate">{user.name}</span>
                                  {assignedUserState?.id === user.id && (
                                    <Check className="h-4 w-4 text-primary ml-auto" />
                                  )}
                                </button>
                              ))}
                            </div>
                          </ScrollArea>
                        </PopoverContent>
                      </Popover>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {assignedUserState ? assignedUserState.name : "Assign user"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>

          {totalTasks > 0 && (
            <div className="flex items-center gap-2 px-3 pb-1">
              <div className="relative flex-1 h-1 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                  className={cn(
                    "h-full transition-all duration-300 ease-out rounded-full",
                    progressPercentage === 100 ? "bg-green-500" : "bg-blue-600",
                  )}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                {completedTasks}/{totalTasks}
              </span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  )
}

