"use client";

import { Card, Tag, User } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { UserPlus, User as UserIcon, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { assignUserToCard } from "@/actions/boards/assign-user-to-card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    index?: number;
  };
  index: number;
  users: User[];
}

export const CardItem = ({ data, index, users }: CardItemProps) => {
  const cardModal = useCardModal();
  const [assignedUserState, setAssignedUserState] = useState<User | null>(null);

  // Synchroniser l'état avec les données du serveur
  useEffect(() => {
    const assignedUser = users.find(user => user.id === data.assignedUserId) || null;
    setAssignedUserState(assignedUser);
  }, [data.assignedUserId, users]);

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

  function getRandomColor(id: string): string {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
          role="button"
          onClick={() => cardModal.onOpen(data.id)}
          className="border bg-white dark:bg-gray-700 rounded-lg shadow-sm hover:border-black"
        >
          <div className="p-3 space-y-3">
            <div className="flex items-start gap-x-2 gap-y-2 flex-wrap">
              {data?.tags?.map((tag: Tag) => (
                <Badge
                  key={tag.id}
                  className={`${getRandomColor(tag.id)} text-white`}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            <p className="text-sm font-medium">{data.title}</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-1 text-muted-foreground text-xs">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>

              </div>
              <Popover>
                <PopoverTrigger onClick={(e) => e.stopPropagation()} asChild>
                  <button className="hover:opacity-75 transition">
                    {assignedUserState ? (
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={assignedUserState.image || ""} />
                        <AvatarFallback className="text-gray-500 text-sm">
                          {assignedUserState.name?.charAt(0) || <UserIcon className="h-2 w-2" />}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-gray-500 text-sm">
                          <UserPlus size={12} />
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
                        <Avatar className="h-6 w-6">
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
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};