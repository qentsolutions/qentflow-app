"use client";

import { toast } from "sonner";
import { Copy, Trash, Check, Plus, X, PlusCircle, Info, Pencil, UserPlus, ChevronDown, UserRound, Tags, Pen } from 'lucide-react';
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCardModal } from "@/hooks/use-card-modal";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addTagToCard } from "@/actions/tasks/add-tag-to-card";
import { Badge } from "@/components/ui/badge";
import { removeTagFromCard } from "@/actions/tasks/delete-tag-from-card";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { User } from "next-auth";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { assignUserToCard } from "@/actions/boards/assign-user-to-card";
import { UserIcon, UserX } from 'lucide-react';
import { cn } from "@/lib/utils";
import { createNotification } from "@/actions/notifications/create-notification";
import { useCurrentUser } from "@/hooks/use-current-user";

interface MainComponentProps {
  data: CardWithList;
  availableTags: { id: string; name: string; color: string }[];
  readonly?: boolean;
}

export const TagsComponent = ({
  data,
  availableTags,
  readonly = false,
}: MainComponentProps) => {
  const params = useParams();
  const cardModal = useCardModal();
  const { currentWorkspace } = useCurrentWorkspace();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const currentUser = useCurrentUser();
  const [assignedUser, setAssignedUser] = useState<User | null>(null);
  const [linkedTags, setLinkedTags] = useState<string[]>(data.tags.map(tag => tag.name));
  const boardId = params.boardId as string;

  const { data: usersInBoard, isLoading: isLoadingUsers, isError: isErrorUsers } = useQuery({
    queryKey: ["usersInBoard", boardId],
    queryFn: () => fetcher(`/api/boards/assigned-user?boardId=${boardId}`),
  });

  useEffect(() => {
    const assignedState = Array.isArray(usersInBoard) ? usersInBoard.find((user: { id: string | null; }) => user.id === data.assignedUserId) : null;
    setAssignedUser(assignedState);
  }, [data.assignedUserId, usersInBoard]);

  const {
    execute: executeAddTagToCard,
    isLoading: isLoadingAddTag,
  } = useAction(addTagToCard, {
    onSuccess: () => {
      toast.success("Tag added to card successfully");

      if (selectedTag) {
        const newTag = availableTags.find(tag => tag.id === selectedTag)?.name;

        if (newTag && !linkedTags.includes(newTag)) {
          setLinkedTags(prevTags => [...prevTags, newTag]);
        }
      }

      setSelectedTag(null);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const {
    execute: executeRemoveTagFromCard,
    isLoading: isLoadingRemoveTag,
  } = useAction(removeTagFromCard, {
    onSuccess: () => {
      toast.success("Tag removed from card successfully");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onAddTag = (value: string) => {
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;

    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    if (!value) {
      toast.error("Please select a tag to add.");
      return;
    }

    executeAddTagToCard({
      cardId: data.id,
      tagId: value,
      boardId,
      workspaceId,
    });
  };

  useEffect(() => {
    if (selectedTag && !linkedTags.includes(selectedTag)) {
      const newTag = availableTags.find(tag => tag.id === selectedTag)?.name;
      if (newTag && !linkedTags.includes(newTag)) {
        setLinkedTags(prevTags => [...prevTags, newTag]);
      }
    }
  }, [selectedTag, availableTags, linkedTags]);

  const onRemoveTag = (tagId: string) => {
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;

    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }

    executeRemoveTagFromCard({
      cardId: data.id,
      tagId,
      boardId,
      workspaceId,
    });

    setLinkedTags((prevTags) => prevTags.filter((tag) => availableTags.find((t) => t.name === tag)?.id !== tagId));
  };

  const handleAssignUser = async (userId: string | null) => {
    try {
      await assignUserToCard(data.id, userId!);
      await createNotification(
        userId || "",
        params?.workspaceId as string,
        `${currentUser?.name} has assigned you to a card : ${data?.title} !`,
        `/${params?.workspaceId}/boards/${params.boardId}/cards/${data?.id}`
      );
      const newAssignedUser = userId ? usersInBoard.find((user: User) => user.id === userId) : null;
      setAssignedUser(newAssignedUser);
      toast.success(userId ? "User assigned to card" : "User unassigned from card");
    } catch (error) {
      toast.error("Failed to update user assignment");
    }
  };

  if (isLoadingUsers) {
    return <Skeleton className="h-6 w-full" />;
  }

  if (isErrorUsers) {
    return <p>Failed to load board users.</p>;
  }

  return (
    <Card className="mt-4 shadow-none">
      <CardContent className="h-full pb-8">
        <div className="space-y-2 mt-4">
          {readonly ? (
            <></>
          ) : (
            <div>
              <p className="text-lg font-semibold flex items-center gap-x-2 mb-2 "><UserRound size={16} /> Assigned</p>
              <Select
                value={assignedUser?.id || "none"}
                onValueChange={(value) => handleAssignUser(value === "none" ? null : value)}
                disabled={readonly}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {assignedUser ? (
                      <div className="flex items-center gap-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={assignedUser.image || ""} />
                          <AvatarFallback>{assignedUser.name?.charAt(0) || <UserIcon className="h-4 w-4" />}</AvatarFallback>
                        </Avatar>
                        <span>{assignedUser.name}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-x-2 ml-1">
                        <UserPlus className="h-4 w-4" />
                        <span>Assign User</span>
                      </div>)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <div className="flex items-center gap-x-2 ml-1">
                      <UserX className="h-4 w-4" />
                      <span>Unassign</span>
                    </div>
                  </SelectItem>
                  {Array.isArray(usersInBoard) && usersInBoard.map((user: User) => (
                    <SelectItem key={user.id!} value={user.id!}>
                      <div className="flex items-center gap-x-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={user.image || ""} />
                          <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <div className="flex items-center">
              <p className="text-lg font-semibold mt-2 flex items-center gap-x-2"><Tags size={16} /> Tags</p>
              {!readonly && (
                <Tooltip>
                  <TooltipTrigger>
                    <Info size={14} className="ml-2 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm text-muted-foreground">
                      Add tags to categorize your cards.
                    </p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div
              className={`relative rounded-md ${readonly ? 'bg-background' : 'bg-gray-50 border p-2 mx-1'}  dark:bg-gray-700 cursor-pointer group ${isEditMode ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => !readonly && setIsEditMode((prev) => !prev)}
            >
              <div className="flex flex-wrap gap-2">
                {linkedTags.length === 0 ? (
                  <span className="text-gray-400 text-xs">Add tags</span>
                ) : (
                  linkedTags.map((tagName) => {
                    const tag = availableTags.find((t) => t.name === tagName);
                    if (!tag) return null;

                    return (
                      <Badge
                        key={tag.id}
                        className={`relative flex items-center group`}
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        {!readonly && (
                          <button
                            className="absolute -right-2 -top-2 h-4 w-4 bg-background rounded-full flex items-center justify-center shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveTag(tag.id);
                            }}
                          >
                            <X size={10} className="text-black" />
                          </button>
                        )}
                      </Badge>
                    );
                  })
                )}
              </div>

              {!readonly && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="flex items-center justify-center text-gray-400 hover:text-gray-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditMode((prev) => !prev);
                    }}
                  >
                    {isEditMode ? <Check size={14} /> : <Pencil size={14} />}
                  </button>
                </div>
              )}
            </div>

            {isEditMode && !readonly && (
              <Select
                value={selectedTag || ""}
                onValueChange={(value) => {
                  setSelectedTag(value);
                  onAddTag(value);
                }}
                disabled={isLoadingAddTag}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  <Separator />
                  {availableTags.length > 0 ? (
                    <div>
                      {availableTags.map((tag: any) => (
                        <SelectItem key={tag.id} value={tag.id} className="hover:bg-gray-50">
                          <div className="flex items-center">
                            <div
                              className={cn(
                                `w-2 h-2 rounded-full mr-2`,
                              )}
                              style={{ backgroundColor: tag?.color || '#ff0000' }}
                            />
                            {tag.name}
                            {linkedTags.includes(tag.name) && <Check className="ml-2 h-4 w-4 text-green-500" />}
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ) : (
                    <SelectItem value="no-tags" disabled>
                      <div className="flex items-center justify-center">
                        No tags available
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

TagsComponent.Skeleton = function TagsComponent() {
  return (
    <div className="space-y-4 mt-2">
      <Skeleton className="w-20 h-4 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
      <Skeleton className="w-full h-12 bg-neutral-200" />
    </div>
  );
};
