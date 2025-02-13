"use client";

import { Tag, User } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserPlus, User as UserIcon, UserX, MessageSquareText, ArrowDown, ArrowRight, ArrowUp, AlertTriangle, SignalLow, SignalMedium, SignalHigh, Paperclip } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { assignUserToCard } from "@/actions/boards/assign-user-to-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface CommentCountResponse {
  commentCount: number;
  attachmentsCount: number;
}

interface CardItemProps {
  data: {
    id: string;
    title: string;
    order: number;
    description: string | null;
    listId: string;
    createdAt: Date;
    updatedAt: Date;
    assignedUserId?: string | null;
    tags?: Tag[];
    priority: string | null;
    index?: number;
    tasks?: {
      id: string;
      completed: boolean;
    }[];
  };
  index: number;
  users: User[];
}

export const CardItem = ({ data, index, users }: CardItemProps) => {
  const cardModal = useCardModal();
  const [assignedUserState, setAssignedUserState] = useState<User | null>(null);

  useEffect(() => {
    const assignedUser = users.find(user => user.id === data.assignedUserId) || null;
    setAssignedUserState(assignedUser);
  }, [data.assignedUserId, users]);

  const { data: commentsData } = useQuery<CommentCountResponse>({
    queryKey: ["card-comments", data?.id],
    queryFn: () => fetcher(`/api/cards/${data?.id}/comments/count-in-card`),
  });

  const handleAssignUser = async (userId: string | null) => {
    try {
      await assignUserToCard(data.id, userId || "null");

      if (userId === null) {
        setAssignedUserState(null);
        toast.success("User unassigned from card");
      } else {
        const assignedUser = users.find(user => user.id === userId) || null;
        setAssignedUserState(assignedUser);
        toast.success("User assigned to card");
      }
    } catch (error) {
      toast.error("Failed to update user assignment");
    }
  };

  const PriorityIcon = (priority: string | null) => {
    if (!priority) {
      return null; // Si priority est null, ne rien afficher
    }
    if (priority === "LOW") {
      return <SignalLow className="text-green-500" size={25} />;
    }
    if (priority === "MEDIUM") {
      return <SignalMedium className="text-yellow-500" size={24} />;
    }
    if (priority === "HIGH") {
      return <SignalHigh className="text-orange-500" size={24} />;
    }
    if (priority === "CRITICAL") {
      return <AlertTriangle className="text-red-500" size={16} />;
    }
    return null; // Si aucune correspondance, ne rien afficher
  };


  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className="border bg-background dark:bg-gray-700 rounded-lg shadow-sm hover:border-blue-600 z-50 m-1"
        >
          <div className="p-3 space-y-3">
            <div className="flex items-start gap-x-2 gap-y-2 flex-wrap">
              {data?.tags?.map((tag: Tag) => (
                <Badge
                  key={tag.id}
                  className={`text-white`}
                  style={{ backgroundColor: tag?.color || '#ff0000' }}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <p className="text-sm font-medium">{data.title}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-1 text-muted-foreground text-xs">
                <MessageSquareText size={14} /> {commentsData ? commentsData?.commentCount : 0}
                <Paperclip className="ml-2" size={14} /> {commentsData ? commentsData?.attachmentsCount : 0}
              </div>
              <div className="flex items-center justify-center">
                <div className="mr-1 flex items-center justify-center">
                  <Tooltip>
                    <TooltipTrigger>
                      {PriorityIcon(data.priority)}
                    </TooltipTrigger>
                    <TooltipContent className="flex items-center justify-center">
                      {data.priority}
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Tooltip>
                  <TooltipTrigger>
                    <Popover>
                      <PopoverTrigger onClick={(e) => e.stopPropagation()} asChild>
                        <button className="hover:opacity-75 transition">
                          {assignedUserState ? (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={assignedUserState.image || ""} />
                              <AvatarFallback className="text-gray-500 text-sm">
                                {assignedUserState.name?.charAt(0) || <UserIcon className="h-2 w-2" />}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-gray-500 text-sm">
                                <UserPlus size={16} />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-50 p-2"
                        side="bottom"
                        align="end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ScrollArea className="h-28">
                          <div className="space-y-2">
                            <button
                              onClick={() => handleAssignUser(null)}
                              className="w-full flex items-center gap-x-2 hover:bg-slate-100 p-2 rounded-md transition"
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="text-gray-500">
                                  <UserX className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">Not assigned</span>
                              {!assignedUserState && (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-green-500 ml-auto"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              )}
                            </button>

                            {users.map((user) => (
                              <button
                                key={user.id}
                                onClick={() => handleAssignUser(user.id)}
                                className="w-full flex items-center gap-x-2 hover:bg-slate-100 p-2 rounded-md transition"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={user?.image || ""} />
                                  <AvatarFallback className="text-gray-500">
                                    {user.name?.charAt(0) || <UserIcon className="h-2 w-2" />}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{user.name}</span>
                                {assignedUserState?.id === user.id && (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 text-green-500 ml-auto"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    {assignedUserState ? (
                      <p>{assignedUserState?.name}</p>
                    ) : (<></>)}
                  </TooltipContent>
                </Tooltip>

              </div>
            </div>
          </div>
          {data.tasks && data.tasks.length > 0 && (
            <div>
              <Tooltip>
                <TooltipTrigger>
                  <Progress
                    value={
                      (data.tasks.filter(task => task.completed).length / data.tasks.length) * 100
                    }
                    className="h-1 w-[calc(100%-4px)] mx-auto"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  {data.tasks.filter(task => task.completed).length}/{data.tasks.length} tasks
                </TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};