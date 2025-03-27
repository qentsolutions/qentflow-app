"use client";

import { ElementRef, useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { ListWithCards } from "@/types";
import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { ListHeader } from "./list-header";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Trash2 } from "lucide-react";
import { deleteCard } from "@/actions/tasks/delete-card";
import { useAction } from "@/hooks/use-action";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { copyCard } from "@/actions/tasks/copy-card";

interface ListItemProps {
  data: ListWithCards;
  index: number;
  users: any;
}

export const ListItem = ({ data, index, users }: ListItemProps) => {
  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);
  const params = useParams();
  const { currentWorkspace } = useCurrentWorkspace();

  const disableEditing = () => {
    setIsEditing(false);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
    });
  };

  const { execute: executeDeleteCard } = useAction(deleteCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" deleted`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onDelete = (cardId: string) => {
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }

    executeDeleteCard({
      id: cardId,
      boardId,
      workspaceId,
    });
  };

  const {
    execute: executeCopyCard,
    isLoading: isLoadingCopy,
  } = useAction(copyCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" copied`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onCopy = (cardId: string) => {
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    executeCopyCard({
      id: cardId,
      boardId,
      workspaceId,
    });
  };

  return (
    <Draggable draggableId={data.id} index={index}>
      {(provided) => (
        <ContextMenu>
          <ContextMenuTrigger>
            <li
              {...provided.draggableProps}
              ref={provided.innerRef}
              className="shrink-0 h-full w-[320px] select-none"
            >
              <div
                {...provided.dragHandleProps}
                className="w-full rounded-xl bg-background border pb-6 shadow-md"
              >
                <ListHeader onAddCard={enableEditing} data={data} />
                <CardForm
                  listId={data.id}
                  isEditing={isEditing}
                  enableEditing={enableEditing}
                  disableEditing={disableEditing}
                />
                <Droppable droppableId={data.id} type="card">
                  {(provided) => (
                    <ol
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "mx-1 px-1 py-0.5 flex flex-col gap-y-2",
                        data.cards.length > 0 ? "mt-2" : "mt-0",
                        "max-h-[59vh] overflow-y-auto"
                      )}
                    >
                      {data.cards.map((card, index) => (
                        <ContextMenu key={card.id}>
                          <ContextMenuTrigger>
                            <CardItem index={index} data={card} users={users} />
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem
                              onClick={() => {
                                onCopy(card.id);
                              }}
                              className="w-full justify-start"
                            >
                              Duplicate
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem
                              onClick={() => {
                                onDelete(card.id);
                              }}
                            >
                              Delete
                              <ContextMenuShortcut>
                                <Trash2 size={14} className="text-red-500" />
                              </ContextMenuShortcut>
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                      {provided.placeholder}
                    </ol>
                  )}
                </Droppable>
              </div>
            </li>
          </ContextMenuTrigger>
        </ContextMenu>
      )}
    </Draggable>
  );
};
