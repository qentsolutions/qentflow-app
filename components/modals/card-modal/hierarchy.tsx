import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import type { CardWithList } from "@/types"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { fetcher } from "@/lib/fetcher"
import { useAction } from "@/hooks/use-action"
import { setCardParent } from "@/actions/cards/set-card-parent"
import { addCardRelationship } from "@/actions/cards/add-card-relationship"
import { removeCardRelationship } from "@/actions/cards/remove-card-relationship"
import { RelationshipType } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { GitBranch, ArrowDown, AlertTriangle, Link2, X, ExternalLink } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface HierarchyProps {
  data: CardWithList
  readonly?: boolean
  isAssociateCardOpen?: boolean
  setIsAssociateCardOpen?: (open: boolean) => void
  isChildCardOpen?: boolean
  setIsChildCardOpen?: (open: boolean) => void
}

export const Hierarchy = ({
  data,
  readonly = false,
  isAssociateCardOpen = false,
  setIsAssociateCardOpen = () => { },
  isChildCardOpen = false,
  setIsChildCardOpen = () => { },
}: HierarchyProps) => {
  const params = useParams()
  const { currentWorkspace } = useCurrentWorkspace()
  const queryClient = useQueryClient()
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<RelationshipType>(
    RelationshipType.RELATES_TO,
  )
  const [selectedDestCardId, setSelectedDestCardId] = useState<string | null>(null)
  const [selectedChildCardId, setSelectedChildCardId] = useState<string | null>(null)

  const { data: relationshipsData, isLoading: isLoadingRelationships } = useQuery({
    queryKey: ["card-relationships", data.id],
    queryFn: () => fetcher(`/api/cards/${data.id}/relationships`),
  })

  const { data: boardCards, isLoading: isLoadingBoardCards } = useQuery({
    queryKey: ["board-cards", params.boardId],
    queryFn: () => fetcher(`/api/boards/${currentWorkspace?.id}/${params.boardId}/cards`),
  })

  const getValidParentOptions = () => {
    if (!boardCards) return []

    const getDescendantIds = (cardId: string, cards: any[]): string[] => {
      const directChildren = cards.filter((c) => c.parentId === cardId)
      if (directChildren.length === 0) return []

      const childIds = directChildren.map((c) => c.id)
      const descendantIds = directChildren.flatMap((c) => getDescendantIds(c.id, cards))

      return [...childIds, ...descendantIds]
    }

    const descendantIds = getDescendantIds(data.id, boardCards)

    return boardCards.filter((card: { id: string }) => card.id !== data.id && !descendantIds.includes(card.id))
  }

  const getValidRelationshipOptions = () => {
    if (!boardCards || !relationshipsData) return []

    const existingRelationships = relationshipsData.relationships || []
    const existingRelatedCardIds = existingRelationships.flatMap((rel: any) => [rel.sourceCardId, rel.destCardId])

    return boardCards.filter((card: { id: string }) => card.id !== data.id && !existingRelatedCardIds.includes(card.id))
  }

  const { execute: executeSetParent } = useAction(setCardParent, {
    onSuccess: () => {
      toast.success("Child card added")
      setSelectedChildCardId(null)
      setIsChildCardOpen(false)
      queryClient.invalidateQueries({
        queryKey: ["card-relationships", data.id],
      })
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      })
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const { execute: executeAddRelationship } = useAction(addCardRelationship, {
    onSuccess: () => {
      toast.success("Card associated successfully")
      setSelectedDestCardId(null)
      setIsAssociateCardOpen(false)
      queryClient.invalidateQueries({
        queryKey: ["card-relationships", data.id],
      })
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const { execute: executeRemoveRelationship } = useAction(removeCardRelationship, {
    onSuccess: () => {
      toast.success("Card relationship removed")
      queryClient.invalidateQueries({
        queryKey: ["card-relationships", data.id],
      })
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const handleAddChildCard = () => {
    if (!currentWorkspace?.id || !selectedChildCardId) return

    executeSetParent({
      cardId: selectedChildCardId,
      parentId: data.id,
      workspaceId: currentWorkspace.id,
      boardId: params.boardId as string,
    })
  }

  const handleAddRelationship = () => {
    if (!currentWorkspace?.id || !selectedDestCardId) return

    executeAddRelationship({
      sourceCardId: data.id,
      destCardId: selectedDestCardId,
      relationshipType: selectedRelationshipType,
      workspaceId: currentWorkspace.id,
      boardId: params.boardId as string,
    })
  }

  const handleRemoveRelationship = (relationshipId: string) => {
    if (!currentWorkspace?.id) return

    executeRemoveRelationship({
      relationshipId,
      workspaceId: currentWorkspace.id,
      boardId: params.boardId as string,
    })
  }

  const getRelationshipLabel = (type: RelationshipType) => {
    switch (type) {
      case "PARENT_CHILD":
        return "Parent/Child"
      case "DEPENDS_ON":
        return "Depends On"
      case "BLOCKED_BY":
        return "Blocked By"
      case "RELATES_TO":
        return "Relates To"
      default:
        return type
    }
  }

  const getRelationshipIcon = (type: RelationshipType) => {
    switch (type) {
      case "PARENT_CHILD":
        return <GitBranch className="h-3 w-3" />
      case "DEPENDS_ON":
        return <ArrowDown className="h-3 w-3" />
      case "BLOCKED_BY":
        return <AlertTriangle className="h-3 w-3" />
      case "RELATES_TO":
        return <Link2 className="h-3 w-3" />
      default:
        return <Link2 className="h-3 w-3" />
    }
  }

  const hasAssociatedCards = relationshipsData?.relationships?.some(
    (rel: any) => rel.sourceCardId === data.id || rel.destCardId === data.id,
  )

  const hasChildCards = relationshipsData?.children && relationshipsData.children.length > 0

  if (isLoadingRelationships || isLoadingBoardCards) {
    return <Skeleton className="h-40 w-full" />
  }

  const validParentOptions = getValidParentOptions()
  const validRelationshipOptions = getValidRelationshipOptions()

  const shouldRenderChildCard = hasChildCards || isChildCardOpen
  const shouldRenderAssociatedCard = hasAssociatedCards || isAssociateCardOpen

  return (
    <>
      {(shouldRenderChildCard || shouldRenderAssociatedCard) && (
        <div className="space-y-4">
          {shouldRenderChildCard && (
            <div className="space-y-2 mb-4">
              <h3 className="text-sm font-medium flex items-center text-muted-foreground">
                <GitBranch size={14} className="mr-1.5 shrink-0" /> Child Cards
              </h3>
              <div className="space-y-1.5">
                {relationshipsData?.children.map((child: any) => (
                  <div
                    key={child.id}
                    className="p-2 bg-white dark:bg-gray-800 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-x-2 overflow-hidden w-full">
                      <GitBranch className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <p className="font-medium truncate min-w-0 flex-1">{child.title}</p>
                      <Badge className="shrink-0 ml-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                        {child.list.title}
                      </Badge>
                    </div>
                    <div className="flex items-center shrink-0 ml-2">
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                {isChildCardOpen && (
                  <div className="flex items-center mt-2  dark:bg-gray-800/50 p-2 rounded-md">
                    <div className="flex-1 gap-2">
                      <Select value={selectedChildCardId || ""} onValueChange={setSelectedChildCardId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a card" />
                        </SelectTrigger>
                        <SelectContent>
                          {validParentOptions.length === 0 ? (
                            <SelectItem value="none" disabled>
                              No available cards
                            </SelectItem>
                          ) : (
                            validParentOptions.map((card: any) => (
                              <SelectItem key={card.id} value={card.id}>
                                <span className="truncate block max-w-[200px]">{card.title}</span>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={handleAddChildCard}
                      disabled={!selectedChildCardId}
                      className="ml-2 h-8 w-8 p-0 flex items-center justify-center"
                      variant="outline"
                    >
                      <span>+</span>
                    </Button>
                    <Button
                      onClick={() => setIsChildCardOpen(false)}
                      className="ml-2 h-8 w-8 p-0 flex items-center justify-center"
                      variant="outline"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
          {shouldRenderAssociatedCard && (
            <div className="space-y-2 mt-4">
              <h3 className="text-sm font-medium flex items-center text-muted-foreground">
                <Link2 size={14} className="mr-1.5 shrink-0" /> Associated Cards
              </h3>
              <div className="space-y-1.5">
                {relationshipsData?.relationships
                  .filter((rel: any) => rel.sourceCardId === data.id)
                  .map((rel: any) => (
                    <div
                      key={rel.id}
                      className="p-2 bg-white dark:bg-gray-800 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-x-2 overflow-hidden w-full">
                        {getRelationshipIcon(rel.relationshipType)}
                        <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
                          <span className="text-muted-foreground whitespace-nowrap shrink-0">
                            {getRelationshipLabel(rel.relationshipType)}
                          </span>
                          <span className="whitespace-nowrap shrink-0">→</span>
                          <span className="font-medium truncate min-w-0">{rel.destCard.title}</span>
                        </div>
                      </div>
                      <Badge className="shrink-0 ml-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                        {rel.destCard.list.title}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 shrink-0 ml-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRemoveRelationship(rel.id)
                        }}
                      >
                        <X className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  ))}

                {relationshipsData?.relationships
                  .filter((rel: any) => rel.destCardId === data.id)
                  .map((rel: any) => (
                    <div
                      key={rel.id}
                      className="p-2 bg-white dark:bg-gray-800 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-x-2 overflow-hidden w-full">
                        {getRelationshipIcon(rel.relationshipType)}
                        <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
                          <span className="text-muted-foreground min-w-0">
                            {getRelationshipLabel(rel.relationshipType)}
                          </span>
                          <span className="whitespace-nowrap shrink-0">→</span>
                          <span className="whitespace-nowrap font-medium truncate shrink-0">
                            {rel.sourceCard.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-x-2 mr-4">
                        <Badge className="shrink-0 ml-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                          {rel.sourceCard.list.title}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveRelationship(rel.id)
                          }}
                        >
                          <X className="h-3.5 w-3.5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}

                {isAssociateCardOpen && (
                  <div className="space-y-2 mt-2  dark:bg-gray-800/50 p-2 rounded-md">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <Select
                          value={selectedRelationshipType}
                          onValueChange={(value) => setSelectedRelationshipType(value as RelationshipType)}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Relationship type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value={RelationshipType.RELATES_TO}>Relates To</SelectItem>
                            <SelectItem value={RelationshipType.DEPENDS_ON}>Depends On</SelectItem>
                            <SelectItem value={RelationshipType.BLOCKED_BY}>Blocked By</SelectItem>
                            <SelectItem value={RelationshipType.PARENT_CHILD}>Parent/Child</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="flex-1">
                        <Select value={selectedDestCardId || ""} onValueChange={setSelectedDestCardId}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Select a card" />
                          </SelectTrigger>
                          <SelectContent>
                            <div className="p-2 sticky top-0 bg-white dark:bg-gray-950 z-10">
                              <Input
                                placeholder="Search cards..."
                                className="h-8"
                                onChange={(e) => {
                                  // This would be implemented with actual filtering logic
                                }}
                              />
                            </div>
                            {validRelationshipOptions.length === 0 ? (
                              <SelectItem value="none" disabled>
                                No available cards
                              </SelectItem>
                            ) : (
                              validRelationshipOptions.map((card: any) => (
                                <SelectItem key={card.id} value={card.id}>
                                  <span className="truncate block max-w-[200px]">{card.title}</span>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        onClick={handleAddRelationship}
                        disabled={!selectedDestCardId}
                        className="h-8 w-8 p-0 flex items-center justify-center"
                        variant="outline"
                      >
                        <span>+</span>
                      </Button>
                      <Button
                        onClick={() => setIsAssociateCardOpen(false)}
                        className=" h-8 w-8 p-0 flex items-center justify-center"
                        variant="outline"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

Hierarchy.Skeleton = function HierarchySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-x-2">
        <Skeleton className="h-5 w-5 rounded bg-neutral-200 dark:bg-gray-700" />
        <Skeleton className="h-6 w-24 bg-neutral-200 dark:bg-gray-700" />
      </div>
      <Skeleton className="w-full h-[200px] bg-neutral-200 dark:bg-gray-700" />
    </div>
  )
}
