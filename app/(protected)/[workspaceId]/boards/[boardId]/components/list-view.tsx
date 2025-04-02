"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Plus, TargetIcon, UserRound, Tags, MoreHorizontal, Trash, GripVertical, Calendar, MessageSquare, Paperclip, CheckSquare, SignalLow, SignalMedium, SignalHigh, AlertTriangle, Signal, Flag, Copy } from 'lucide-react';
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useAction } from "@/hooks/use-action";
import { updateCardOrder } from "@/actions/tasks/update-card-order";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { ListForm } from "./list-form";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { assignUserToCard } from "@/actions/boards/assign-user-to-card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { deleteCard } from "@/actions/tasks/delete-card";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { createNotification } from "@/actions/notifications/create-notification";
import { useCurrentUser } from "@/hooks/use-current-user";
import { copyCard } from "@/actions/tasks/copy-card";
import CardActions from "./card-actions";
import { ListWithCards } from "@/types";

interface ListViewProps {
    boardId: string;
    data: ListWithCards[];
    users: any;
    visibleFields: {
        title: boolean;
        priority: boolean;
        assignee: boolean;
        tags: boolean;
        dueDate: boolean;
        tasks: boolean;
    };
}

export const ListView = ({ boardId, users, data = [], visibleFields }: ListViewProps) => {
    const cardModal = useCardModal();
    const [openLists, setOpenLists] = useState<string[]>(data.map((list) => list.id));
    const [lists, setLists] = useState<ListWithCards[]>(data);
    const { currentWorkspace } = useCurrentWorkspace();
    const [openAssign, setOpenAssign] = useState<string | null>(null);
    const params = useParams();
    const currentUser = useCurrentUser();

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

    const toggleList = (listId: string) => {
        setOpenLists((prev) => (prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]));
    };

    const onDragEnd = (result: any) => {
        const { destination, source } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const newLists = [...lists];
        const sourceList = newLists.find((list) => list.id === source.droppableId);
        const destList = newLists.find((list) => list.id === destination.droppableId);
        if (!sourceList || !destList) return;
        const [movedCard] = sourceList.cards.splice(source.index, 1);
        movedCard.listId = destination.droppableId;
        destList.cards.splice(destination.index, 0, movedCard);
        destList.cards.forEach((card: any, idx: any) => {
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
            workspaceId,
        });
    };

    const handleAssignUser = async (cardId: string, userId: string) => {
        await assignUserToCard(cardId, userId!);
        const card = lists.flatMap(list => list.cards).find(card => card.id === cardId);
        await createNotification(
            userId || "",
            params?.workspaceId as string,
            `${currentUser?.name} has assigned you to a card : ${card?.title} !`,
            `/${params?.workspaceId}/boards/${params.boardId}/cards/${cardId}`
        );
        setLists((prevLists) =>
            prevLists.map((list) => ({
                ...list,
                cards: list.cards.map((card: any) => (card.id === cardId ? { ...card, assignedUserId: userId } : card)),
            })),
        );
        toast.success("User assigned successfully");
        setOpenAssign(null);
    };

    const { execute: executeCopyCard, isLoading: isLoadingCopy } = useAction(copyCard, {
        onSuccess: (data) => {
            toast.success(`Card "${data.title}" copied`);
            cardModal.onClose();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onCopy = (cardId: string) => {
        const workspaceId = currentWorkspace?.id;
        if (!workspaceId) {
            toast.error("Workspace ID is required.");
            return;
        }
        const boardId = Array.isArray(params.boardId) ? params.boardId[0] : params.boardId || "";
        executeCopyCard({
            id: cardId,
            boardId,
            workspaceId,
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
        const workspaceId = currentWorkspace?.id;

        if (!workspaceId) {
            toast.error("Workspace ID is required");
            return;
        }
        executeDeleteCard({
            id: cardId,
            boardId: Array.isArray(params?.boardId) ? params.boardId[0] : params?.boardId || "",
            workspaceId,
        });
    };

    const PriorityIcon = (priority: string | null) => {
        if (!priority) {
            return null;
        }
        if (priority === "LOW") {
            return <Flag className="text-green-500" size={14} />;
        }
        if (priority === "MEDIUM") {
            return <Flag className="text-yellow-500" size={14} />;
        }
        if (priority === "HIGH") {
            return <Flag className="text-red-500" size={14} />;
        }
        if (priority === "CRITICAL") {
            return <AlertTriangle className="text-red-500" size={14} />;
        }
        return null;
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-6 p-2">
                {lists.map((list) => (
                    <Collapsible
                        key={list.id}
                        open={openLists.includes(list.id)}
                        onOpenChange={() => toggleList(list.id)}
                        className="rounded-lg shadow-sm border border-gray-200 overflow-hidden bg-white dark:bg-gray-900"
                    >
                        <CollapsibleTrigger className="bg-gray-50 dark:bg-gray-800 border-b w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-x-3">
                                {openLists.includes(list.id) ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                                <h2 className="text-background text-lg font-semibold text-gray-800 flex items-center gap-x-2">
                                    {list.title}
                                    <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                                        {list.cards.length}
                                    </span>
                                </h2>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <Droppable droppableId={list.id}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} className="w-full">
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="border-b border-gray-200 bg-gray-50 dark:bg-gray-800">
                                                    {visibleFields.title && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[250px] border-r border-gray-100 last:border-r-0">
                                                            <div className="flex items-center gap-x-2">
                                                                <TargetIcon size={14} />
                                                                Title
                                                            </div>
                                                        </th>
                                                    )}
                                                    {visibleFields.priority && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[100px] border-r border-gray-100 last:border-r-0">
                                                            <div className="flex items-center gap-x-2">
                                                                <Flag size={14} />
                                                                Priority
                                                            </div>
                                                        </th>
                                                    )}
                                                    {visibleFields.assignee && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px] border-r border-gray-100 last:border-r-0">
                                                            <div className="flex items-center gap-x-2">
                                                                <UserRound size={14} />
                                                                Assigned
                                                            </div>
                                                        </th>
                                                    )}
                                                    {visibleFields.dueDate && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px] border-r border-gray-100 last:border-r-0">
                                                            <div className="flex items-center gap-x-2">
                                                                <Calendar size={14} />
                                                                Due Date
                                                            </div>
                                                        </th>
                                                    )}
                                                    {visibleFields.tasks && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px] border-r border-gray-100 last:border-r-0">
                                                            <div className="flex items-center gap-x-2">
                                                                <CheckSquare size={14} />
                                                                Tasks
                                                            </div>
                                                        </th>
                                                    )}
                                                    {visibleFields.tags && (
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px] border-r border-gray-100 last:border-r-0">
                                                            <div className="flex items-center gap-x-2">
                                                                <Tags size={14} />
                                                                Tags
                                                            </div>
                                                        </th>
                                                    )}
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {list.cards.map((card: any, index: any) => {
                                                    return (
                                                        <Draggable key={card.id} draggableId={card.id} index={index}>
                                                            {(provided) => (
                                                                <tr
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    {...provided.dragHandleProps}
                                                                    className="group bg-background hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                                                                    onClick={() => cardModal.onOpen(card.id)}
                                                                >
                                                                    {visibleFields.title && (
                                                                        <td className="py-4 border-r border-gray-100 last:border-r-0 w-[250px]">
                                                                            <div className="flex items-center gap-x-3 pl-2">
                                                                                <GripVertical size={16} className="text-gray-400 flex-shrink-0" />
                                                                                <span className="text-sm font-medium text-gray-900 line-clamp-2 overflow-hidden">
                                                                                    {card.title}
                                                                                </span>
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    {visibleFields.priority && (
                                                                        <td className="px-6 py-4 border-r border-gray-100 last:border-r-0 w-[100px]">
                                                                            <div className="mr-1 flex items-center justify-center">
                                                                                <Tooltip>
                                                                                    <TooltipTrigger>
                                                                                        {PriorityIcon(card?.priority)}
                                                                                    </TooltipTrigger>
                                                                                    <TooltipContent className="flex items-center justify-center">
                                                                                        {card.priority}
                                                                                    </TooltipContent>
                                                                                </Tooltip>
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    {visibleFields.assignee && (
                                                                        <td className="px-6 py-4 border-r border-gray-100 last:border-r-0 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                                            <Popover
                                                                                open={openAssign === card.id}
                                                                                onOpenChange={(open) => setOpenAssign(open ? card.id : null)}
                                                                            >
                                                                                <PopoverTrigger asChild>
                                                                                    {card.assignedUserId ? (
                                                                                        <div className="flex items-center justify-center gap-2">
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <Avatar className="h-8 w-8 border">
                                                                                                        <AvatarImage
                                                                                                            src={
                                                                                                                users.find(
                                                                                                                    (u: { id: string | null | undefined }) =>
                                                                                                                        u.id === card.assignedUserId,
                                                                                                                )?.image || ""
                                                                                                            }
                                                                                                        />
                                                                                                        <AvatarFallback>
                                                                                                            {users.find(
                                                                                                                (u: { id: string | null | undefined }) =>
                                                                                                                    u.id === card.assignedUserId,
                                                                                                            )?.name?.[0] || <UserRound size={12} />}
                                                                                                        </AvatarFallback>
                                                                                                    </Avatar>
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent>
                                                                                                    <span className="text-sm">
                                                                                                        {
                                                                                                            users.find(
                                                                                                                (u: { id: string | null | undefined }) =>
                                                                                                                    u.id === card.assignedUserId,
                                                                                                            )?.name
                                                                                                        }
                                                                                                    </span>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div className="flex items-center justify-center">
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger>
                                                                                                    <Avatar className="h-8 w-8 border">
                                                                                                        <AvatarFallback>
                                                                                                            <UserRound size={16} />
                                                                                                        </AvatarFallback>
                                                                                                    </Avatar>
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent>
                                                                                                    <p className="text-sm">
                                                                                                        Assign user
                                                                                                    </p>
                                                                                                </TooltipContent>
                                                                                            </Tooltip>
                                                                                        </div>
                                                                                    )}
                                                                                </PopoverTrigger>
                                                                                <PopoverContent className="w-[200px] p-0">
                                                                                    <div className="py-2">
                                                                                        {users.map((user: any) => (
                                                                                            <button
                                                                                                key={user.id}
                                                                                                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                                                                                                onClick={() => handleAssignUser(card.id, user.id)}
                                                                                            >
                                                                                                <Avatar className="h-6 w-6">
                                                                                                    <AvatarImage src={user.image || ""} />
                                                                                                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                                                                                                </Avatar>
                                                                                                {user.name}
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                        </td>
                                                                    )}
                                                                    {visibleFields.dueDate && (
                                                                        <td className="px-6 py-4 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
                                                                            {card.dueDate && (
                                                                                <div className="flex items-center text-sm text-gray-600">
                                                                                    <Calendar className="h-4 w-4 mr-2" />
                                                                                    {format(new Date(card.dueDate), "MMM d, yyyy")}
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                    {visibleFields.tasks && (
                                                                        <td className="px-6 py-4 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
                                                                            {card.tasks && card.tasks.length > 0 && (
                                                                                <div className="flex flex-col gap-1">
                                                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                                        <span>
                                                                                            {card.tasks.filter((t: any) => t.completed).length}/{card.tasks.length}
                                                                                        </span>
                                                                                    </div>
                                                                                    <Progress
                                                                                        value={
                                                                                            (card.tasks.filter((task: any) => task.completed).length /
                                                                                                card.tasks.length) *
                                                                                            100
                                                                                        }
                                                                                        className="h-1.5"
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                        </td>
                                                                    )}
                                                                    {visibleFields.tags && (
                                                                        <td className="px-6 py-4 border-r border-gray-100 last:border-r-0 whitespace-nowrap">
                                                                            <div className="flex gap-1.5 flex-wrap">
                                                                                {card.tags?.map((tag: any) => (
                                                                                    <Badge
                                                                                        key={tag.id}
                                                                                        className={`text-white`}
                                                                                        style={{ backgroundColor: tag?.color || "#ff0000" }}
                                                                                    >
                                                                                        {tag.name}
                                                                                    </Badge>
                                                                                ))}
                                                                            </div>
                                                                        </td>
                                                                    )}
                                                                    <td
                                                                        className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <DropdownMenu>
                                                                            <DropdownMenuTrigger asChild>
                                                                                <Button variant="ghost" size="sm">
                                                                                    <MoreHorizontal size={16} />
                                                                                </Button>
                                                                            </DropdownMenuTrigger>
                                                                            <DropdownMenuContent align="end">
                                                                                <CardActions data={card} lists={lists} setOrderedData={setLists} />
                                                                            </DropdownMenuContent>
                                                                        </DropdownMenu>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </Draggable>
                                                    );
                                                })}
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
