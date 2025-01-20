"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { useBreadcrumbs } from "@/hooks/use-breadcrumb"
import { fetcher } from "@/lib/fetcher"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle2, Circle, Calendar, Clock, AlertCircle, ChevronRight } from "lucide-react"
import { useCardModal } from "@/hooks/use-card-modal"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

export default function MyTasksPage() {
  const { currentWorkspace } = useCurrentWorkspace()
  const { setBreadcrumbs } = useBreadcrumbs()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCard, setSelectedCard] = useState<any>(null)
  const cardModal = useCardModal()

  useEffect(() => {
    document.title = "My Tasks - QentFlow"
  }, [])

  useEffect(() => {
    setBreadcrumbs([{ label: "My Tasks" }])
  }, [setBreadcrumbs])

  const { data: assignedCards, isLoading } = useQuery({
    queryKey: ["assigned-cards", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/cards/current-user-card?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  })

  const groupedCards = assignedCards?.reduce((acc: any, card: any) => {
    const boardTitle = card.list.board.title
    if (!acc[boardTitle]) {
      acc[boardTitle] = []
    }
    acc[boardTitle].push(card)
    return acc
  }, {})

  const filteredGroupedCards = groupedCards
    ? Object.entries(groupedCards).reduce((acc: any, [boardTitle, cards]: [string, any]) => {
        const filteredCards = (cards as any[]).filter(
          (card) =>
            card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.description?.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        if (filteredCards.length > 0) {
          acc[boardTitle] = filteredCards
        }
        return acc
      }, {})
    : {}

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    )
  }

  const allCards = Object.values(filteredGroupedCards).flat()

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold mb-4">My Tasks</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9 w-full"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ScrollArea className="flex-grow">
          <AnimatePresence>
            {allCards.map((card: any) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`m-2 cursor-pointer transition-all duration-200 ${
                    selectedCard?.id === card.id ? "border-primary border-2" : ""
                  }`}
                  onClick={() => setSelectedCard(card)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold truncate">{card.title}</h3>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 mt-1 truncate">{card.list.board.title}</p>
                    <div className="flex items-center mt-2 space-x-2">
                      {card.priority && (
                        <Badge
                          variant={
                            card.priority === "HIGH"
                              ? "destructive"
                              : card.priority === "MEDIUM"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {card.priority}
                        </Badge>
                      )}
                      {card.dueDate && (
                        <Badge variant="outline" className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(card.dueDate).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {allCards.length === 0 && (
            <div className="text-center py-10">
              <AlertCircle className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">No tasks found</p>
            </div>
          )}
        </ScrollArea>
      </div>
      <div className="flex-grow bg-white p-6">
        <AnimatePresence mode="wait">
          {selectedCard ? (
            <motion.div
              key={selectedCard.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <h2 className="text-2xl font-bold mb-4">{selectedCard.title}</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{selectedCard.description || "No description provided."}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Board</p>
                      <p>{selectedCard.list.board.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">List</p>
                      <p>{selectedCard.list.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Priority</p>
                      <Badge
                        variant={
                          selectedCard.priority === "HIGH"
                            ? "destructive"
                            : selectedCard.priority === "MEDIUM"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {selectedCard.priority || "None"}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Due Date</p>
                      {selectedCard.dueDate ? (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                          {new Date(selectedCard.dueDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <p>No due date</p>
                      )}
                    </div>
                  </div>
                </div>
                {selectedCard.tasks && selectedCard.tasks.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tasks</h3>
                    <div className="space-y-2">
                      {selectedCard.tasks.map((task: any) => (
                        <div key={task.id} className="flex items-center">
                          {task.completed ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-300 mr-2" />
                          )}
                          <span className={task.completed ? "line-through text-gray-400" : ""}>{task.title}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Progress
                        value={
                          (selectedCard.tasks.filter((t: any) => t.completed).length / selectedCard.tasks.length) * 100
                        }
                        className="h-2"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedCard.tasks.filter((t: any) => t.completed).length} of {selectedCard.tasks.length} tasks
                        completed
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full flex items-center justify-center"
            >
              <div className="text-center">
                <Clock className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-600">Select a task to view details</h2>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

