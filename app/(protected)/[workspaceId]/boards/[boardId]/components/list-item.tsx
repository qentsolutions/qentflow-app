"use client";
import { ElementRef, useRef, useState } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import { ListWithCards } from "@/types";
import { CardForm } from "./card-form";
import { CardItem } from "./card-item";
import { ListHeader } from "./list-header";
import { ContextMenu, ContextMenuContent, ContextMenuTrigger } from "@/components/ui/context-menu";
import CardActions from "./card-actions";

interface ListItemProps {
  data: ListWithCards;
  index: number;
  users: any;
}

export const ListItem = ({ data, index, users }: ListItemProps) => {
  const textareaRef = useRef<ElementRef<"textarea">>(null);
  const [isEditing, setIsEditing] = useState(false);

  const disableEditing = () => {
    setIsEditing(false);
  };

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      textareaRef.current?.focus();
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
                            <CardItem
                              index={index}
                              data={{
                                ...card,
                                _count: {
                                  comments: card._count.comments,
                                  attachments: card._count.attachments,
                                },
                              }}
                              users={users}
                            />
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <CardActions data={card} />
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
