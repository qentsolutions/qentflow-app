"use client"

import { useCardModal } from "@/hooks/use-card-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Calendar, CheckSquare, AlertTriangle, UserRound, MoreHorizontal, Flag, GripVertical, MoreVertical } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteCard } from "@/actions/tasks/delete-card"
import { useAction } from "@/hooks/use-action"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { copyCard } from "@/actions/tasks/copy-card"
import CardActions from "./card-actions"
import type { ListWithCards } from "@/types"
import { useState } from "react"

interface TableViewProps {
  boardId: string
  data: ListWithCards[]
  users: any
  visibleFields: {
    title: boolean
    priority: boolean
    assignee: boolean
    tags: boolean
    dueDate: boolean
    tasks: boolean
  }
}

export const TableView = ({ data, visibleFields, users }: TableViewProps) => {
  const cardModal = useCardModal()
  const { currentWorkspace } = useCurrentWorkspace()
  const params = useParams()
  const [lists, setLists] = useState<ListWithCards[]>(data)

  const allCards = data.flatMap((list) =>
    list.cards.map((card) => ({
      ...card,
      listTitle: list.title,
    })),
  )

  const { execute: executeCopyCard } = useAction(copyCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" copied`)
      cardModal.onClose()
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const onCopy = (cardId: string) => {
    const workspaceId = currentWorkspace?.id
    if (!workspaceId) {
      toast.error("Workspace ID is required.")
      return
    }
    const boardId = Array.isArray(params.boardId) ? params.boardId[0] : params.boardId || ""

    executeCopyCard({
      id: cardId,
      boardId,
      workspaceId,
    })
  }

  const PriorityIcon = (priority: string | null) => {
    if (!priority) {
      return null
    }
    if (priority === "LOW") {
      return <Flag className="text-emerald-500" size={14} />
    }
    if (priority === "MEDIUM") {
      return <Flag className="text-amber-500" size={14} />
    }
    if (priority === "HIGH") {
      return <Flag className="text-rose-500" size={14} />
    }
    if (priority === "CRITICAL") {
      return <AlertTriangle className="text-rose-600" size={14} />
    }
    return null
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
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <Table className="border-collapse">
          <TableHeader className="bg-gray-50/50">
            <TableRow className="border-b border-gray-100">
              {visibleFields.title && (
                <TableHead className="font-medium text-gray-500 w-[180px] border-r border-gray-50 last:border-r-0 py-4 px-6">
                  Title
                </TableHead>
              )}
              {visibleFields.priority && (
                <TableHead className="font-medium text-gray-500 w-[120px] border-r border-gray-50 last:border-r-0 py-4 px-6 text-center">
                  Priority
                </TableHead>
              )}
              {visibleFields.assignee && (
                <TableHead className="font-medium text-gray-500 w-[120px] border-r border-gray-50 last:border-r-0 py-4 px-6 text-center">
                  Assigned To
                </TableHead>
              )}
              {visibleFields.dueDate && (
                <TableHead className="font-medium text-gray-500 w-[150px] border-r border-gray-50 last:border-r-0 py-4 px-6">
                  Due Date
                </TableHead>
              )}
              {visibleFields.tasks && (
                <TableHead className="font-medium text-gray-500 w-[150px] border-r border-gray-50 last:border-r-0 py-4 px-6">
                  Tasks
                </TableHead>
              )}
              {visibleFields.tags && (
                <TableHead className="font-medium text-gray-500 w-[180px] border-r border-gray-50 last:border-r-0 py-4 px-6">
                  Tags
                </TableHead>
              )}
              <TableHead className="font-medium text-gray-500 w-[80px] py-4 px-6 text-center"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCards.map((card) => {
              return (
                <TableRow
                  key={card.id}
                  className="cursor-pointer hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-b-0"
                  onClick={() => cardModal.onOpen(card.id)}
                >
                  {visibleFields.title && (
                    <TableCell className="px-6 py-5 border-r border-gray-50 last:border-r-0 w-[250px]">
                      <div className="flex items-center gap-x-3">
                        <span className="text-sm font-medium text-gray-900">{card.title}</span>
                      </div>
                    </TableCell>
                  )}
                  {visibleFields.priority && (
                    <TableCell className="px-6 py-5 border-r border-gray-50 last:border-r-0 w-[120px] text-center">
                      <div className="flex items-center justify-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>{PriorityIcon(card?.priority)}</TooltipTrigger>
                            <TooltipContent className="flex items-center justify-center bg-white border border-gray-100 shadow-md text-xs font-medium">
                              {card.priority}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  )}
                  {visibleFields.assignee && (
                    <TableCell className="px-6 py-5 border-r border-gray-50 last:border-r-0 w-[120px] text-center">
                      {card.assignedUserId && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Avatar className="h-7 w-7 mx-auto ring-2 ring-white shadow-sm">
                                <AvatarImage
                                  src={
                                    users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)
                                      ?.image || ""
                                  }
                                />
                                <AvatarFallback className="bg-gray-100 text-gray-600">
                                  {users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)
                                    ?.name?.[0] || <UserRound size={12} />}
                                </AvatarFallback>
                              </Avatar>
                            </TooltipTrigger>
                            <TooltipContent className="bg-white border border-gray-100 shadow-md text-xs font-medium">
                              {users.find((u: { id: string | null | undefined }) => u.id === card.assignedUserId)
                                ?.name || ""}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.dueDate && (
                    <TableCell className="px-6 py-5 border-r border-gray-50 last:border-r-0 w-[150px]">
                      {card.dueDate && (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          {format(new Date(card.dueDate), "MMM d, yyyy")}
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.tasks && (
                    <TableCell className="px-6 py-5 border-r border-gray-50 last:border-r-0 w-[150px]">
                      {card?.tasks && card.tasks.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              {card.tasks.filter((t) => t.completed).length}/{card.tasks.length}
                            </span>
                          </div>
                          <Progress
                            value={(card.tasks.filter((task) => task.completed).length / card.tasks.length) * 100}
                            className="h-1.5 bg-gray-100"
                          />
                        </div>
                      )}
                    </TableCell>
                  )}
                  {visibleFields.tags && (
                    <TableCell className="px-6 py-5 border-r border-gray-50 last:border-r-0 w-[180px]">
                      <div className="flex flex-wrap gap-1.5">
                        {card.tags?.map((tag) => (
                          <Badge
                            key={tag.id}
                            className="text-white text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: tag.color || "#ff0000" }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  )}
                  <TableCell
                    className="px-6 py-5 whitespace-nowrap text-center text-sm font-medium w-[80px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full">
                          <MoreVertical size={16} className="text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white border border-gray-100 shadow-lg rounded-xl p-1.5"
                      >
                        <CardActions data={card} lists={lists} setOrderedData={setLists} />
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

