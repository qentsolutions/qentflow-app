"use client"

import { useCardModal } from "@/hooks/use-card-modal"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  CheckSquare,
  UserRound,
  MoreVertical,
  Trash2,
  Archive,
  Copy,
  ArrowRightToLine,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { deleteCard } from "@/actions/tasks/delete-card"
import { useAction } from "@/hooks/use-action"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { copyCard } from "@/actions/tasks/copy-card"
import { archiveCard } from "@/actions/tasks/archived-card"
import { unarchiveCard } from "@/actions/tasks/unarchived-card"
import { updateCardOrder } from "@/actions/tasks/update-card-order"
import CardActions from "./card-actions"
import type { ListWithCards } from "@/types"
import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"

interface TableViewProps {
  boardId: string
  data: ListWithCards[]
  users: any
  visibleFields: {
    title: boolean
    priority: boolean
    assignee: boolean
    tags: boolean
    startDate: boolean
    dueDate: boolean
    tasks: boolean
  }
}

export const TableView = ({ data, visibleFields, users, boardId }: TableViewProps) => {
  const cardModal = useCardModal()
  const { currentWorkspace } = useCurrentWorkspace()
  const params = useParams()
  const [lists, setLists] = useState<ListWithCards[]>(data)
  const [selectedCards, setSelectedCards] = useState<string[]>([])
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [allCards, setAllCards] = useState<any[]>([])

  useEffect(() => {
    setLists(data)
    const cards = data.flatMap((list) =>
      list.cards.map((card) => ({
        ...card,
        listTitle: list.title,
        listId: list.id,
      })),
    )
    setAllCards(cards)
  }, [data])

  const { execute: executeCopyCard } = useAction(copyCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" copied`)
      setSelectedCards([])
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const { execute: executeArchiveCard } = useAction(archiveCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" archived`)
      setSelectedCards((prev) => prev.filter((id) => id !== data.id))
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const { execute: executeUnarchiveCard } = useAction(unarchiveCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" unarchived`)
      setSelectedCards((prev) => prev.filter((id) => id !== data.id))
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
    onSuccess: () => {
      toast.success(`Cards moved to next lists`)
      setSelectedCards([])
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const { execute: executeDeleteCard } = useAction(deleteCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" deleted`)
      setSelectedCards((prev) => prev.filter((id) => id !== data.id))
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const handleBulkDelete = () => {
    if (selectedCards.length === 0) return

    const workspaceId = currentWorkspace?.id
    if (!workspaceId) {
      toast.error("Workspace ID is required")
      return
    }

    // Confirmation before bulk delete
    if (confirm(`Are you sure you want to delete ${selectedCards.length} card(s)?`)) {
      selectedCards.forEach((cardId) => {
        executeDeleteCard({
          id: cardId,
          boardId: Array.isArray(params?.boardId) ? params.boardId[0] : params?.boardId || "",
          workspaceId,
        })
      })
    }
  }

  const handleBulkCopy = () => {
    if (selectedCards.length === 0) return

    const workspaceId = currentWorkspace?.id
    if (!workspaceId) {
      toast.error("Workspace ID is required")
      return
    }

    const boardId = Array.isArray(params.boardId) ? params.boardId[0] : params.boardId || ""

    selectedCards.forEach((cardId) => {
      executeCopyCard({
        id: cardId,
        boardId,
        workspaceId,
      })
    })

    toast.success(`${selectedCards.length} card(s) duplicated`)
  }

  const handleBulkArchive = () => {
    if (selectedCards.length === 0) return

    const workspaceId = currentWorkspace?.id
    if (!workspaceId) {
      toast.error("Workspace ID is required")
      return
    }

    const boardId = Array.isArray(params.boardId) ? params.boardId[0] : params.boardId || ""

    selectedCards.forEach((cardId) => {
      executeArchiveCard({
        cardId: cardId,
        boardId,
        workspaceId,
      })
    })
  }

  const getPriorityBadge = (priority: string | null) => {
    if (!priority) return null

    const colors: Record<string, { bg: string; text: string }> = {
      LOW: { bg: "bg-green-100", text: "text-green-500" },
      MEDIUM: { bg: "bg-orange-100", text: "text-orange-600" },
      HIGH: { bg: "bg-red-100", text: "text-red-600" },
      CRITICAL: { bg: "bg-red-200", text: "text-red-600" },
    }

    const style = colors[priority] || { bg: "bg-gray-100", text: "text-gray-500" }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}
      >
        {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
      </span>
    )
  }

  const handleBulkMoveToNextList = () => {
    if (selectedCards.length === 0) return

    const workspaceId = currentWorkspace?.id
    if (!workspaceId) {
      toast.error("Workspace ID is required")
      return
    }

    const boardId = Array.isArray(params.boardId) ? params.boardId[0] : params.boardId || ""

    // Group cards by their current list
    const cardsByList: Record<string, string[]> = {}

    selectedCards.forEach((cardId) => {
      const card = allCards.find((card) => card.id === cardId)
      if (card) {
        if (!cardsByList[card.listId]) {
          cardsByList[card.listId] = []
        }
        cardsByList[card.listId].push(cardId)
      }
    })

    // Process each list's cards
    Object.entries(cardsByList).forEach(([listId, cardIds]) => {
      const currentListIndex = lists.findIndex((list) => list.id === listId)
      const nextListId = lists[currentListIndex + 1]?.id

      if (!nextListId) {
        toast.error(`No next list available for some cards`)
        return
      }

      const sourceList = lists[currentListIndex]
      const destList = lists[currentListIndex + 1]

      if (!sourceList || !destList) return

      if (!sourceList.cards) {
        sourceList.cards = []
      }

      if (!destList.cards) {
        destList.cards = []
      }

      // Move each card
      cardIds.forEach((cardId) => {
        const cardIndex = sourceList.cards.findIndex((card) => card.id === cardId)
        if (cardIndex !== -1) {
          const [movedCard] = sourceList.cards.splice(cardIndex, 1)
          movedCard.listId = nextListId
          destList.cards.push(movedCard)
        }
      })

      // Update order
      sourceList.cards.forEach((card, idx) => {
        card.order = idx
      })

      destList.cards.forEach((card, idx) => {
        card.order = idx
      })

      // Update the lists state
      setLists((prevLists) =>
        prevLists.map((list) => {
          if (list.id === sourceList.id) return sourceList
          if (list.id === destList.id) return destList
          return list
        }),
      )

      // Execute the update
      executeUpdateCardOrder({
        boardId: boardId,
        items: destList.cards,
        workspaceId,
      })
    })
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 p-4">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
          <Table className="border-collapse">
            <TableHeader className="bg-gray-50/50">
              <TableRow className="border-b border-gray-100">
                <TableHead className="font-medium text-gray-500 w-[40px] border-r border-gray-50 last:border-r-0 py-4 px-4">
                  <Checkbox
                    checked={allCards.length > 0 && allCards.every((card) => selectedCards.includes(card.id))}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCards(allCards.map((card) => card.id))
                      } else {
                        setSelectedCards([])
                      }
                    }}
                  />
                </TableHead>
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
                    Assigned
                  </TableHead>
                )}
                {visibleFields.startDate && (
                  <TableHead className="font-medium text-gray-500 w-[150px] border-r border-gray-50 last:border-r-0 py-4 px-6">
                    Start Date
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
                    onMouseEnter={() => setHoveredRow(card.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell
                      className="px-4 py-2 border-r border-gray-50 last:border-r-0 w-[40px]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div
                        className={`${hoveredRow === card.id || selectedCards.includes(card.id) ? "opacity-100" : "opacity-0"} group-hover:opacity-100 transition-opacity`}
                      >
                        <Checkbox
                          checked={selectedCards.includes(card.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCards((prev) => [...prev, card.id])
                            } else {
                              setSelectedCards((prev) => prev.filter((id) => id !== card.id))
                            }
                          }}
                        />
                      </div>
                    </TableCell>
                    {visibleFields.title && (
                      <TableCell
                        className="px-6 py-2 border-r border-gray-50 last:border-r-0 w-[250px]"
                        onClick={() => cardModal.onOpen(card.id)}
                      >
                        <div className="flex items-center gap-x-3">
                          <span className="text-sm font-medium text-gray-900 line-clamp-2">{card.title}</span>
                        </div>
                      </TableCell>
                    )}
                    {visibleFields.priority && (
                      <TableCell
                        className="px-6 py-2 border-r border-gray-50 last:border-r-0 w-[120px] text-center"
                        onClick={() => cardModal.onOpen(card.id)}
                      >
                        <div className="flex items-center justify-center">
                          <Tooltip>
                            <TooltipTrigger>{getPriorityBadge(card?.priority)}</TooltipTrigger>
                            <TooltipContent className="flex items-center justify-center bg-white border border-gray-100 shadow-md text-xs font-medium">
                              {card.priority}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    )}
                    {visibleFields.assignee && (
                      <TableCell
                        className="px-6 py-2 border-r border-gray-50 last:border-r-0 w-[120px] text-center"
                        onClick={() => cardModal.onOpen(card.id)}
                      >
                        {card.assignedUserId && (
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
                        )}
                      </TableCell>
                    )}
                    {visibleFields.startDate && (
                      <TableCell
                        className="px-6 py-2 border-r border-gray-50 last:border-r-0 w-[150px]"
                        onClick={() => cardModal.onOpen(card.id)}
                      >
                        {card.startDate && (
                          <span
                            className={`text-sm ${new Date(card.startDate) < new Date() ? "text-red-500" : "text-gray-600"}`}
                          >
                            <div className="flex items-center text-s">
                              {format(new Date(card.startDate), "MMM d, yyyy")}
                            </div>
                          </span>
                        )}
                      </TableCell>
                    )}
                    {visibleFields.dueDate && (
                      <TableCell
                        className="px-6 py-2 border-r border-gray-50 last:border-r-0 w-[150px]"
                        onClick={() => cardModal.onOpen(card.id)}
                      >
                        {card.dueDate && (
                          <div className="flex items-center text-sm ">
                            <span
                              className={`text-sm ${new Date(card.dueDate) < new Date() ? "text-red-500" : "text-gray-600"}`}
                            >
                              {format(new Date(card.dueDate), "MMM d, yyyy")}
                            </span>
                          </div>
                        )}
                      </TableCell>
                    )}
                    {visibleFields.tasks && (
                      <TableCell
                        className="px-6 py-2 border-r border-gray-50 last:border-r-0 w-[150px]"
                        onClick={() => cardModal.onOpen(card.id)}
                      >
                        {card?.tasks && card.tasks.length > 0 && (
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              <CheckSquare className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {card.tasks.filter((t: any) => t.completed).length}/{card.tasks.length}
                              </span>
                            </div>
                            <Progress
                              value={
                                (card.tasks.filter((task: any) => task.completed).length / card.tasks.length) * 100
                              }
                              className="h-1.5 bg-gray-100"
                            />
                          </div>
                        )}
                      </TableCell>
                    )}
                    {visibleFields.tags && (
                      <TableCell
                        className="px-6 py-2 border-r border-gray-50 last:border-r-0 w-[180px]"
                        onClick={() => cardModal.onOpen(card.id)}
                      >
                        <div className="flex flex-wrap gap-1.5">
                          {card.tags?.map((tag: any) => (
                            <Badge
                              key={tag.id}
                              className="text-white text-xs font-medium px-2 py-0.5"
                              style={{ backgroundColor: tag.color || "#ff0000" }}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                    )}
                    <TableCell
                      className="px-6 py-2 whitespace-nowrap text-center text-sm font-medium w-[80px]"
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

      {/* Action bar that appears when items are selected */}
      {selectedCards.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50">
          <div className="flex flex-col bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-opacity-20 bg-black">
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white bg-opacity-20">
                  <span className="text-xs font-bold">{selectedCards.length}</span>
                </div>
                <span className="text-sm font-medium">cards selected</span>
              </div>
              <button className="text-white/70 hover:text-white" onClick={() => setSelectedCards([])}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-4 divide-x divide-blue-500/30">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700/50 rounded-none h-14 px-4 flex flex-col items-center justify-center gap-1"
                onClick={handleBulkMoveToNextList}
              >
                <ArrowRightToLine size={16} />
                <span className="text-xs">Move</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700/50 rounded-none h-14 px-4 flex flex-col items-center justify-center gap-1"
                onClick={handleBulkCopy}
              >
                <Copy size={16} />
                <span className="text-xs">Duplicate</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-blue-700/50 rounded-none h-14 px-4 flex flex-col items-center justify-center gap-1"
                onClick={handleBulkArchive}
              >
                <Archive size={16} />
                <span className="text-xs">Archive</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-red-600/70 rounded-none h-14 px-4 flex flex-col items-center justify-center gap-1"
                onClick={handleBulkDelete}
              >
                <Trash2 size={16} />
                <span className="text-xs">Delete</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </TooltipProvider>
  )
}

