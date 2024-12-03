"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAction } from "@/hooks/use-action";
import { updateCardOrder } from "@/actions/tasks/update-card-order";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { ListForm } from "./list-form";

interface ListViewProps {
  boardId: string;
  data: {
    id: string;
    title: string;
    cards: {
      id: string;
      title: string;
      order: number;
      description: string | null;
      listId: string;
      createdAt: Date;
      updatedAt: Date;
      tags?: {
        id: string;
        name: string;
      }[];
    }[];
  }[];
}

export const ListView = ({ boardId, data = [] }: ListViewProps) => {
  const cardModal = useCardModal();
  const [openLists, setOpenLists] = useState<string[]>(data.map(list => list.id));
  const [lists, setLists] = useState(data);
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    setLists(data);
  }, [data]);

  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success("Card moved successfully");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

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

  const toggleList = (listId: string) => {
    setOpenLists(prev =>
      prev.includes(listId)
        ? prev.filter(id => id !== listId)
        : [...prev, listId]
    );
  };

  const onDragEnd = (result: any) => {
    const { destination, source } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newLists = [...lists];
    const sourceList = newLists.find(list => list.id === source.droppableId);
    const destList = newLists.find(list => list.id === destination.droppableId);
    
    if (!sourceList || !destList) return;

    const [movedCard] = sourceList.cards.splice(source.index, 1);
    movedCard.listId = destination.droppableId;
    destList.cards.splice(destination.index, 0, movedCard);

    // Update order for all cards in destination list
    destList.cards.forEach((card, idx) => {
      card.order = idx;
    });

    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace not found");
      return;
    }

    setLists(newLists);
    executeUpdateCardOrder({
      boardId: boardId,
      items: destList.cards,
      workspaceId
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="space-y-6 p-4">
        {lists.map((list) => (
          <Collapsible
            key={list.id}
            open={openLists.includes(list.id)}
            onOpenChange={() => toggleList(list.id)}
            className="bg-white rounded-lg border shadow-sm"
          >
            <CollapsibleTrigger className="w-full p-4 flex items-center justify-between hover:bg-gray-50">
              <h2 className="text-lg font-semibold">{list.title}</h2>
              {openLists.includes(list.id) ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Droppable droppableId={list.id}>
                {(provided) => (
                  <div 
                    className="p-4 pt-0 space-y-3"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {list.cards.map((card, index) => (
                      <Draggable 
                        key={card.id} 
                        draggableId={card.id} 
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="group bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => cardModal.onOpen(card.id)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="space-y-3 flex-grow">
                                <h3 className="font-medium group-hover:text-blue-600 transition-colors">
                                  {card.title}
                                </h3>
                                <div className="flex gap-1.5 flex-wrap">
                                  {card.tags?.map((tag) => (
                                    <Badge
                                      key={tag.id}
                                      className={`${getRandomColor(tag.id)} text-white px-2 py-0.5 text-xs font-medium`}
                                    >
                                      {tag.name}
                                    </Badge>
                                  ))}
                                </div>
                               
                              </div>
                              <div className="flex flex-col gap-2 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  <span>{format(new Date(card.createdAt), "HH:mm")}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3.5 w-3.5" />
                                  <span>{format(new Date(card.createdAt), "MMM d")}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </CollapsibleContent>
          </Collapsible>
        ))}
        <ListForm />
      </div>
    </DragDropContext>
  );
};