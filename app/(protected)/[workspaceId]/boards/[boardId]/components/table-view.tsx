"use client"

import { useCardModal } from "@/hooks/use-card-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  CheckSquare,
  AlertTriangle,
  UserRound,
  MoreHorizontal,
  Trash,
  Flag,
  GripVertical,
  Copy,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteCard } from "@/actions/tasks/delete-card"
import { useAction } from "@/hooks/use-action"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { copyCard } from "@/actions/tasks/copy-card"

interface TableViewProps {
  boardId: string
  users: any
  data: {
    id: string
    title: string
    cards: {
      id: string
      title: string
      order: number
      listId: string
      createdAt: Date
      priority: string
      updatedAt: Date
      assignedUserId?: string | null
      tags?: {
        id: string
        name: string
        color: string
      }[]
      tasks?: {
        id: string
        completed: boolean
      }[]
      startDate?: Date | null
      dueDate?: Date | null
    }[]
  }[]
  visibleFields: {
    title: boolean
    priority: boolean
    assignee: boolean
    dueDate: boolean
    tasks: boolean
    tags: boolean
  }
}

export const TableView = ({ data, visibleFields, users }: TableViewProps) => {
  const cardModal = useCardModal()
  const { currentWorkspace } = useCurrentWorkspace()
  const params = useParams()

  const allCards = data.flatMap((list) =>
    list.cards.map((card) => ({
      ...card,
      listTitle: list.title,
    })),
  )

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

  const PriorityIcon = (priority: string | null) => {
    if (!priority) {
      return null // Si priority est null, ne rien afficher
    }
    if (priority === "LOW") {
      return <Flag className="text-green-500" size={14} />
    }
    if (priority === "MEDIUM") {
      return <Flag className="text-yellow-500" size={14} />
    }
    if (priority === "HIGH") {
      return <Flag className="text-red-500" size={14} />
    }
    if (priority === "CRITICAL") {
      return <AlertTriangle className="text-red-500" size={14} />
    }
    return null // Si aucune correspondance, ne rien afficher
  }

  const { execute: executeDeleteCard } = useAction(deleteCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" deleted`)
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const onDelete = (cardId: string) => {
    const workspaceId = currentWorkspace?.id

    if (!workspaceId) {
      toast.error("Workspace ID is required.")
      return
    }

    executeDeleteCard({
      id: cardId,
      boardId: Array.isArray(params?.boardId) ? params.boardId[0] : params?.boardId || "",
      workspaceId,
    })
  }

  return (
    <div className="space-y-4 p-4">
      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        <Table className="border-collapse">
          <TableHeader className="bg-gray-50">
            <TableRow className="border-b border-gray-200">
              {visibleFields.title && (
                <TableHead className="font-semibold w-[180px] border-r border-gray-100 last:border-r-0 py-3">
                  Title
                </TableHead>
              )}
              {visibleFields.priority && (
                <TableHead className="font-semibold w-[120px] border-r border-gray-100 last:border-r-0 py-3 text-center">
                  Priority
                </TableHead>
              )}
              {visibleFields.assignee && (
                <TableHead className="font-semibold w-[120px] border-r border-gray-100 last:border-r-0 py-3 text-center">
                  Assigned To
                </TableHead>
              )}
              {visibleFields.dueDate && (
                <TableHead className="font-semibold w-[150px] border-r border-gray-100 last:border-r-0 py-3">
                  Due Date
                </TableHead>
              )}
              {visibleFields.tasks && (
                <TableHead className="font-semibold w-[150px] border-r border-gray-100 last:border-r-0 py-3">
                  Tasks
                </TableHead>
              )}
              {visibleFields.tags && (
                <TableHead className="font-semibold w-[180px] border-r border-gray-100 last:border-r-0 py-3">
                  Tags
                </TableHead>
              )}
              <TableHead className="font-semibold w-[80px] py-3 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCards.map((card) => {
              return (
                <TableRow
                  key={card.id}
                  className="cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                  onClick={() => cardModal.onOpen(card.id)}
                >
                  {visibleFields.title && (
                    <TableCell className="px-6 py-4 border-r border-gray-100 last:border-r-0 w-[180px]">
                      <div className="flex items-center gap-x-3">
                        <GripVertical size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900 line-clamp-2 overflow-hidden">
                          {card.title}
                        </span>
                      </div>
                    </TableCell>
                  )}
                  {visibleFields.priority && (
                    <TableCell className="px-6 py-4 border-r border-gray-100 last:border-r-0 w-[120px] text-center">
                      <div className="flex items-center justify-center">
                        <Tooltip>
                          <TooltipTrigger>{PriorityIcon(card?.priority)}</TooltipTrigger>
                          <TooltipContent className="flex items-center justify-center">{card.priority}</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  )}
                  {visibleFields.assignee && (
                    <TableCell className="px-6 py-4 border-r border-gray-100 last:border-r-0 w-[120px] text-center">
                      {card.assignedUserId && (
                        <Tooltip>
                          <TooltipTrigger>
                            <Avatar className="h-6 w-6 mx-auto">
                              <AvatarImage
                                src={
                                  users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)
                                    ?.image || ""
                                }
                              />
                              <AvatarFallback>
                                {users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)
                                  ?.name?.[0] || <UserRound size={12} />}
                              </AvatarFallback>
                            </Avatar>
                          </TooltipTrigger>
                          <TooltipContent>
                            {users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)?.name ||
                              ""}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.dueDate && (
                    <TableCell className="px-6 py-4 border-r border-gray-100 last:border-r-0 w-[150px]">
                      {card.dueDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          {format(new Date(card.dueDate), "MMM d, yyyy")}
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.tasks && (
                    <TableCell className="px-6 py-4 border-r border-gray-100 last:border-r-0 w-[150px]">
                      {card.tasks && card.tasks.length > 0 && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4" />
                            <span className="text-sm">
                              {card.tasks.filter((t) => t.completed).length}/{card.tasks.length}
                            </span>
                          </div>
                          <Progress
                            value={(card.tasks.filter((task) => task.completed).length / card.tasks.length) * 100}
                            className="h-1.5"
                          />
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.tags && (
                    <TableCell className="px-6 py-4 border-r border-gray-100 last:border-r-0 w-[180px]">
                      <div className="flex flex-wrap gap-1">
                        {card.tags?.map((tag) => (
                          <Badge key={tag.id} className="text-white" style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  )}
                  <TableCell
                    className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium w-[80px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => { onCopy(card.id) }}
                          disabled={isLoadingCopy}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          <span>Duplicate</span>
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => onDelete(card.id)}
                        >
                          <Trash size={16} className="text-red-500 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

