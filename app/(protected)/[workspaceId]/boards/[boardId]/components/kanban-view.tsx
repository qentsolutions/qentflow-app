"use client";
import { useEffect, useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { ListForm } from "./list-form";
import { ListItem } from "./list-item";
import { updateListOrder } from "@/actions/tasks/update-list-order";
import { updateCardOrder } from "@/actions/tasks/update-card-order";
import { ListWithCards } from "@/types";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface ListContainerProps {
  data: ListWithCards[];
  boardId: string;
  users: any;
}

function reorder<T>(list: T[], startIndex: number, endIndex: number) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

export const KanbanView = ({ data, boardId, users }: ListContainerProps) => {
  const [orderedData, setOrderedData] = useState(data);
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    setOrderedData(data);
  }, [data]);

  const { execute: executeUpdateListOrder } = useAction(updateListOrder, {
    onSuccess: () => {
      toast.success("Lists reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success("Cards reordered");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onDragEnd = (result: any) => {
    const { destination, source, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "list") {
      const items = reorder(orderedData, source.index, destination.index).map(
        (item, index) => ({ ...item, order: index })
      );
      const workspaceId = currentWorkspace?.id;
      if (!workspaceId) {
        toast.error("Workspace not found");
        return;
      }

      setOrderedData(items);
      executeUpdateListOrder({ items, boardId, workspaceId });
    }

    if (type === "card") {
      let newOrderedData = [...orderedData];

      const sourceList = newOrderedData.find(
        (list) => list.id === source.droppableId
      );
      const destList = newOrderedData.find(
        (list) => list.id === destination.droppableId
      );

      if (!sourceList || !destList) return;

      if (!sourceList.cards) {
        sourceList.cards = [];
      }

      if (!destList.cards) {
        destList.cards = [];
      }

      if (source.droppableId === destination.droppableId) {
        const reorderedCards = reorder(
          sourceList.cards,
          source.index,
          destination.index
        );

        reorderedCards.forEach((card, idx) => {
          card.order = idx;
        });

        sourceList.cards = reorderedCards;
        const workspaceId = currentWorkspace?.id;
        if (!workspaceId) {
          toast.error("Workspace not found");
          return;
        }

        setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          boardId: boardId,
          items: reorderedCards,
          workspaceId
        });
      } else {

        const [movedCard] = sourceList.cards.splice(source.index, 1);

        movedCard.listId = destination.droppableId;

        destList.cards.splice(destination.index, 0, movedCard);

        sourceList.cards.forEach((card, idx) => {
          card.order = idx;
        });

        destList.cards.forEach((card, idx) => {
          card.order = idx;
        });
        const workspaceId = currentWorkspace?.id;
        if (!workspaceId) {
          toast.error("Workspace not found");
          return;
        }
        setOrderedData(newOrderedData);
        executeUpdateCardOrder({
          boardId: boardId,
          items: destList.cards,
          workspaceId
        });
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full pb-6 p-2 md:max-w-6xl px-4"
          >
            {orderedData.map((list, index) => (
              <ListItem key={list.id} index={index} data={list} users={users} lists={orderedData} setOrderedData={setOrderedData} />
            ))}
            {provided.placeholder}
            <ListForm />
            <div className="flex-shrink-0 w-1" />
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
