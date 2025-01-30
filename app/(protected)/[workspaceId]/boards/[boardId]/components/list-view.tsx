"use client"

import { useCardModal } from "@/hooks/use-card-modal"
import { Badge } from "@/components/ui/badge"
import {
    ChevronDown,
    ChevronUp,
    Plus,
    TargetIcon,
    UserRound,
    Tags,
    MoreHorizontal,
    Trash,
    GripVertical,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { useAction } from "@/hooks/use-action"
import { updateCardOrder } from "@/actions/tasks/update-card-order"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { ListForm } from "./list-form"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { assignUserToCard } from "@/actions/boards/assign-user-to-card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { deleteCard } from "@/actions/tasks/delete-card"
import { list } from "postcss"
import { useParams } from "next/navigation"

interface ListViewProps {
    boardId: string
    data: {
        id: string
        title: string
        cards: {
            id: string
            title: string
            order: number
            description: string | null
            listId: string
            createdAt: Date
            updatedAt: Date
            assignedUserId?: string | null
            tags?: {
                id: string
                name: string
                color: string;
            }[]
        }[]
    }[]
    users: any
}

export const ListView = ({ boardId, users, data = [] }: ListViewProps) => {
    const cardModal = useCardModal()
    const [openLists, setOpenLists] = useState<string[]>(data.map((list) => list.id))
    const [lists, setLists] = useState(data)
    const { currentWorkspace } = useCurrentWorkspace()
    const [openAssign, setOpenAssign] = useState<string | null>(null)
    const params = useParams();

    useEffect(() => {
        setLists(data)
    }, [data])

    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess: () => {
            toast.success("Card moved successfully")
        },
        onError: (error) => {
            toast.error(error)
        },
    })

    const toggleList = (listId: string) => {
        setOpenLists((prev) => (prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]))
    }

    const onDragEnd = (result: any) => {
        const { destination, source } = result

        if (!destination) return

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return
        }

        const newLists = [...lists]
        const sourceList = newLists.find((list) => list.id === source.droppableId)
        const destList = newLists.find((list) => list.id === destination.droppableId)

        if (!sourceList || !destList) return

        const [movedCard] = sourceList.cards.splice(source.index, 1)
        movedCard.listId = destination.droppableId
        destList.cards.splice(destination.index, 0, movedCard)

        destList.cards.forEach((card, idx) => {
            card.order = idx
        })

        const workspaceId = currentWorkspace?.id
        if (!workspaceId) {
            toast.error("Workspace not found")
            return
        }

        setLists(newLists)
        executeUpdateCardOrder({
            boardId: boardId,
            items: destList.cards,
            workspaceId,
        })
    }

    const handleAssignUser = async (cardId: string, userId: string) => {
        await assignUserToCard(cardId, userId!)
        setLists((prevLists) =>
            prevLists.map((list) => ({
                ...list,
                cards: list.cards.map((card) => (card.id === cardId ? { ...card, assignedUserId: userId } : card)),
            })),
        )
        toast.success("User assigned successfully")
        setOpenAssign(null)
    }

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
            toast.error("Workspace ID is required.");
            return;
        }

        executeDeleteCard({ id: cardId, boardId: Array.isArray(params?.boardId) ? params.boardId[0] : params?.boardId || "", workspaceId });
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="space-y-6 p-2">
                {lists.map((list) => (
                    <Collapsible
                        key={list.id}
                        open={openLists.includes(list.id)}
                        onOpenChange={() => toggleList(list.id)}
                        className="rounded-lg shadow-sm border border-gray-200 overflow-hidden"
                    >
                        <CollapsibleTrigger className="bg-gray-50 border-b w-full px-6 py-4 flex items-center justify-between hover:bg-gray-100 transition-colors">
                            <div className="flex items-center gap-x-3">
                                {openLists.includes(list.id) ? (
                                    <ChevronUp className="h-5 w-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="h-5 w-5 text-gray-500" />
                                )}
                                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-x-2">
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
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b border-gray-200">
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center gap-x-2">
                                                            <TargetIcon size={14} />
                                                            Task Name
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center gap-x-2">
                                                            <Tags size={14} />
                                                            Tags
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        <div className="flex items-center gap-x-2">
                                                            <UserRound size={14} />
                                                            Assigned
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {list.cards.map((card, index) => (
                                                    <Draggable key={card.id} draggableId={card.id} index={index}>
                                                        {(provided) => (
                                                            <tr
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="group bg-background hover:bg-gray-50 transition-colors cursor-pointer"
                                                                onClick={() => cardModal.onOpen(card.id)}
                                                            >
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    <div className="flex items-center gap-x-3">
                                                                        <GripVertical size={16} className="text-gray-400" />
                                                                        <span className="text-sm font-medium text-gray-900">{card.title}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4 whitespace-nowrap">
                                                                    {card.tags?.map((tag) => (
                                                                        <Badge
                                                                            key={tag.id}
                                                                            variant={"outline"}
                                                                            style={{ backgroundColor: tag.color, color: 'white' }}
                                                                            className="mr-2"
                                                                        >
                                                                            {tag.name}
                                                                        </Badge>
                                                                    ))}
                                                                </td>

                                                                <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                                                    <Popover
                                                                        open={openAssign === card.id}
                                                                        onOpenChange={(open) => setOpenAssign(open ? card.id : null)}
                                                                    >
                                                                        <PopoverTrigger asChild>
                                                                            <Button variant="outline" size="sm" className="w-[200px] justify-start">
                                                                                {card.assignedUserId ? (
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Avatar className="h-6 w-6">
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
                                                                                        <span className="text-sm">
                                                                                            {
                                                                                                users.find(
                                                                                                    (u: { id: string | null | undefined }) =>
                                                                                                        u.id === card.assignedUserId,
                                                                                                )?.name
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                ) : (
                                                                                    <span className="text-sm text-gray-500">Assign user...</span>
                                                                                )}
                                                                            </Button>
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
                                                                            <DropdownMenuItem className="flex items-center justify-between" onClick={() => { onDelete(card.id) }}>
                                                                                Delete
                                                                                <Trash size={16} className=" text-red-500" />
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
    )
}

