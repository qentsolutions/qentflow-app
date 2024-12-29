"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, Calendar, ChevronDown, ChevronUp, Plus, Text, Tags, TargetIcon, UserRound, UserIcon, EllipsisVertical, Trash } from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
            assignedUserId?: string | null;
            tags?: {
                id: string;
                name: string;
            }[];
        }[];
    }[];
    users: any;
}

export const ListView = ({ boardId, users, data = [] }: ListViewProps) => {
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
                        className="bg-white rounded-lg border-2 border-gray-100"
                    >
                        <CollapsibleTrigger className="w-full p-4 flex items-center bg-gray-50 justify-between hover:bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-x-2">
                                {openLists.includes(list.id) ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                                <h2 className="text-lg font-semibold flex items-center gap-x-1">
                                    {list.title}
                                    <span className="ml-1 flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-500 text-xs font-bold rounded-full">
                                        {list.cards.length}
                                    </span>
                                </h2>
                            </div>
                            <Plus size={14} className="text-gray-700" />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <Droppable droppableId={list.id}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="w-full"
                                    >
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="p-4 text-left font-medium text-gray-500"><div className="flex items-center gap-x-1"><TargetIcon size={14} /> Task Name</div></th>
                                                    <th className="p-4 text-left font-medium text-gray-500"><div className="flex items-center gap-x-1"><UserRound size={14} /> Assigned</div></th>
                                                    <th className="p-4 text-left font-medium text-gray-500"><div className="flex items-center gap-x-1"><Tags size={14} /> Tags</div></th>
                                                    <th className="p-4 text-left font-medium text-gray-500"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {list.cards.map((card, index) => (
                                                    <Draggable
                                                        key={card.id}
                                                        draggableId={card.id}
                                                        index={index}
                                                    >
                                                        {(provided) => (
                                                            <tr
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="group hover:bg-gray-50 bg-white cursor-pointer border-b border-gray-200"
                                                                onClick={() => cardModal.onOpen(card.id)}
                                                            >
                                                                <td className="px-4 py-2 border-r border-gray-200"> {/* Bordure à droite de chaque cellule */}
                                                                    <div className="font-medium">{card.title}</div>
                                                                </td>

                                                                <td className="px-4 py-2 border-r border-gray-200"> {/* Bordure à droite de chaque cellule */}
                                                                    <div className="flex">
                                                                        <td className="p-4">
                                                                            <div className="flex items-center gap-2">
                                                                                {card.assignedUserId ? (
                                                                                    users.map((user: any) =>
                                                                                        user.id === card.assignedUserId ? (
                                                                                            <Tooltip key={user.id}>
                                                                                                <TooltipTrigger>
                                                                                                    <Avatar className="h-6 w-6">
                                                                                                        <AvatarImage src={user.image || ""} />
                                                                                                        <AvatarFallback className="text-gray-500 text-sm">
                                                                                                            {user?.name?.charAt(0) || <UserIcon className="h-2 w-2" />}
                                                                                                        </AvatarFallback>
                                                                                                    </Avatar>
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent>
                                                                                                    <p>{user?.name}</p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>

                                                                                        ) : null
                                                                                    )
                                                                                ) : (
                                                                                    <Tooltip>
                                                                                        <TooltipTrigger>
                                                                                            <Avatar className="h-6 w-6">
                                                                                                <AvatarFallback className="text-gray-500 text-sm">
                                                                                                    <UserRound size={12} />
                                                                                                </AvatarFallback>
                                                                                            </Avatar>
                                                                                        </TooltipTrigger>
                                                                                        <TooltipContent>
                                                                                            Unassigned
                                                                                        </TooltipContent>
                                                                                    </Tooltip>

                                                                                )}
                                                                            </div>
                                                                        </td>

                                                                    </div>
                                                                </td>

                                                                <td className="px-4 py-2 border-r border-gray-200"> {/* Bordure à droite de chaque cellule */}
                                                                    <Badge
                                                                        variant={card.tags?.[0]?.name === "High" ? "destructive" : "default"}
                                                                    >
                                                                        {card.tags?.[0]?.name || "Medium"}
                                                                    </Badge>
                                                                </td>
                                                                <td onClick={(e) => e.stopPropagation()}>
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger className="p-4 w-full flex items-center justify-center">
                                                                            <EllipsisVertical size={20} />
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent>
                                                                            <DropdownMenuItem className="flex items-center justify-between">
                                                                                Delete <Trash />
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </td>
                                                            </tr>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                            </tbody>
                                        </table>
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