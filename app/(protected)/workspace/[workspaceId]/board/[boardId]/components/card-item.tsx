"use client";

import { Card, Tag } from "@prisma/client";
import { Draggable } from "@hello-pangea/dnd";
import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { format } from "date-fns";

interface CardWithTags extends Card {
  tags: Tag[]; // Inclure les tags associés
  index: number;
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
    tags?: Tag[];  // Les tags peuvent être optionnels si ce n'est pas toujours fourni
    index?: number; // L'index peut être optionnel si ce n'est pas toujours fourni
  };
  index: number;
}

export const CardItem = ({ data, index }: CardItemProps) => {
  const cardModal = useCardModal();

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
    // Génère un index basé sur l'ID
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
          className="truncate border bg-white rounded-lg shadow-sm hover:border-black"
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
                {format(new Date(data.createdAt), "MMM d")}
              </div>
              <Avatar className="h-6 w-6">
              </Avatar>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};