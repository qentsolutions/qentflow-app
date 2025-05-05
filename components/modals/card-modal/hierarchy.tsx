"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { CardWithList } from "@/types";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { fetcher } from "@/lib/fetcher";
import { useAction } from "@/hooks/use-action";
import { setCardParent } from "@/actions/cards/set-card-parent";
import { addCardRelationship } from "@/actions/cards/add-card-relationship";
import { removeCardRelationship } from "@/actions/cards/remove-card-relationship";
import { RelationshipType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, ArrowDown, AlertTriangle, Link2, ArrowUp, Plus, Search, MoreVertical, Trash } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCardModal } from "@/hooks/use-card-modal";
import { createCard } from "@/actions/tasks/create-card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { removeCardParent } from "@/actions/cards/remove-card-parent";
import { removeChildCards } from "@/actions/cards/remove-card-child";

interface HierarchyProps {
  data: CardWithList;
  readonly?: boolean;
  isAssociateCardOpen?: boolean;
  setIsAssociateCardOpen?: (open: boolean) => void;
  isChildCardOpen?: boolean;
  setIsChildCardOpen?: (open: boolean) => void;
}

export const Hierarchy = ({
  data,
  readonly = false,
  isAssociateCardOpen = false,
  setIsAssociateCardOpen = () => { },
  isChildCardOpen = false,
  setIsChildCardOpen = () => { },
}: HierarchyProps) => {
  const params = useParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const cardModal = useCardModal();
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<RelationshipType>(
    RelationshipType.RELATES_TO
  );
  const [selectedDestCardId, setSelectedDestCardId] = useState<string | null>(null);
  const [selectedChildCardId, setSelectedChildCardId] = useState<string | null>(null);
  const [isCreateNewCardOpen, setIsCreateNewCardOpen] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [newCardType, setNewCardType] = useState<"child" | "associated">("child");
  const [isCreatingCard, setIsCreatingCard] = useState(false);
  const [activeTab, setActiveTab] = useState<"create" | "link">("create");

  const { data: relationshipsData, isLoading: isLoadingRelationships } = useQuery({
    queryKey: ["card-relationships", data.id],
    queryFn: () => fetcher(`/api/cards/${data.id}/relationships`),
  });

  const { data: boardCards, isLoading: isLoadingBoardCards } = useQuery({
    queryKey: ["board-cards", params.boardId],
    queryFn: () => fetcher(`/api/boards/${currentWorkspace?.id}/${params.boardId}/cards`),
  });

  const { data: lists } = useQuery({
    queryKey: ["board-lists", params.boardId],
    queryFn: () => fetcher(`/api/boards/lists?boardId=${params.boardId}`),
    enabled: !!params.boardId,
  });

  const getValidParentOptions = () => {
    if (!boardCards) return [];

    const getDescendantIds = (cardId: string, cards: any[]): string[] => {
      const directChildren = cards.filter((c) => c.parentId === cardId);
      if (directChildren.length === 0) return [];

      const childIds = directChildren.map((c) => c.id);
      const descendantIds = directChildren.flatMap((c) => getDescendantIds(c.id, cards));

      return [...childIds, ...descendantIds];
    };

    const descendantIds = getDescendantIds(data.id, boardCards);

    return boardCards.filter((card: { id: string }) => card.id !== data.id && !descendantIds.includes(card.id));
  };

  const getValidRelationshipOptions = () => {
    if (!boardCards || !relationshipsData) return [];

    const existingRelationships = relationshipsData.relationships || [];
    const existingRelatedCardIds = existingRelationships.flatMap((rel: any) => [rel.sourceCardId, rel.destCardId]);

    return boardCards.filter((card: { id: string }) => card.id !== data.id && !existingRelatedCardIds.includes(card.id));
  };

  const { execute: executeSetParent } = useAction(setCardParent, {
    onSuccess: () => {
      toast.success("Child card added");
      setSelectedChildCardId(null);
      setIsChildCardOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["card-relationships", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeAddRelationship } = useAction(addCardRelationship, {
    onSuccess: () => {
      toast.success("Card associated successfully");
      setSelectedDestCardId(null);
      setIsAssociateCardOpen(false);
      queryClient.invalidateQueries({
        queryKey: ["card-relationships", data.id],
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeRemoveRelationship } = useAction(removeCardRelationship, {
    onSuccess: () => {
      toast.success("Card relationship removed");
      queryClient.invalidateQueries({
        queryKey: ["card-relationships", data.id],
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeCreateCard } = useAction(createCard, {
    onSuccess: (newCard) => {
      toast.success(`Card "${newCard.title}" created`);

      if (newCardType === "child") {
        // Set the new card as a child of the current card
        executeSetParent({
          cardId: newCard.id,
          parentId: data.id,
          workspaceId: currentWorkspace?.id as string,
          boardId: params.boardId as string,
        });
      } else {
        // Associate the new card with the current card
        executeAddRelationship({
          sourceCardId: data.id,
          destCardId: newCard.id,
          relationshipType: selectedRelationshipType,
          workspaceId: currentWorkspace?.id as string,
          boardId: params.boardId as string,
        });
      }

      setNewCardTitle("");
      setIsCreateNewCardOpen(false);

      // Close the respective panels
      if (newCardType === "child") {
        setIsChildCardOpen(false);
      } else {
        setIsAssociateCardOpen(false);
      }
    },
    onError: (error) => {
      toast.error(error);
      setIsCreatingCard(false);
    },
  });

  const { execute: executeRemoveParent } = useAction(removeCardParent, {
    onSuccess: () => {
      toast.success("Parent relationship removed");
      queryClient.invalidateQueries({
        queryKey: ["card-relationships", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleRemoveParentRelationship = (cardId: string) => {
    if (!currentWorkspace?.id) return;

    executeRemoveParent({
      cardId,
      workspaceId: currentWorkspace.id,
      boardId: params.boardId as string,
    });
  };

  const { execute: executeRemoveChildCards } = useAction(removeChildCards, {
    onSuccess: () => {
      toast.success("Child relationships removed");
      queryClient.invalidateQueries({
        queryKey: ["card-relationships", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleRemoveChildRelationships = (parentCardId: string) => {
    if (!currentWorkspace?.id) return;

    executeRemoveChildCards({
      parentCardId,
      workspaceId: currentWorkspace.id,
      boardId: params.boardId as string,
    });
  };



  const handleAddChildCard = () => {
    if (!currentWorkspace?.id || !selectedChildCardId) return;

    executeSetParent({
      cardId: selectedChildCardId,
      parentId: data.id,
      workspaceId: currentWorkspace.id,
      boardId: params.boardId as string,
    });
  };

  const handleAddRelationship = () => {
    if (!currentWorkspace?.id || !selectedDestCardId) return;

    executeAddRelationship({
      sourceCardId: data.id,
      destCardId: selectedDestCardId,
      relationshipType: selectedRelationshipType,
      workspaceId: currentWorkspace.id,
      boardId: params.boardId as string,
    });
  };

  const handleRemoveRelationship = (relationshipId: string) => {
    if (!currentWorkspace?.id || !relationshipId) return;

    executeRemoveRelationship({
      relationshipId,
      workspaceId: currentWorkspace.id,
      boardId: params.boardId as string,
    });
  };

  const handleCreateNewCard = () => {
    if (!newCardTitle.trim() || !lists || lists.length === 0) return;

    setIsCreatingCard(true);

    // Use the first list as default
    const defaultListId = lists[0].id;

    executeCreateCard({
      title: newCardTitle,
      listId: defaultListId,
      boardId: params.boardId as string,
      workspaceId: currentWorkspace?.id as string,
    });
  };

  const openCreateNewCardDialog = (type: "child" | "associated") => {
    setNewCardType(type);
    setIsCreateNewCardOpen(true);
  };

  const getRelationshipLabel = (type: RelationshipType) => {
    switch (type) {
      case "PARENT_CHILD":
        return "Parent/Child";
      case "DEPENDS_ON":
        return "Depends On";
      case "BLOCKED_BY":
        return "Blocked By";
      case "RELATES_TO":
        return "Relates To";
      default:
        return type;
    }
  };

  const getRelationshipIcon = (type: RelationshipType) => {
    switch (type) {
      case "PARENT_CHILD":
        return <GitBranch className="h-3 w-3" />;
      case "DEPENDS_ON":
        return <ArrowDown className="h-3 w-3" />;
      case "BLOCKED_BY":
        return <AlertTriangle className="h-3 w-3" />;
      case "RELATES_TO":
        return <Link2 className="h-3 w-3" />;
      default:
        return <Link2 className="h-3 w-3" />;
    }
  };

  const hasAssociatedCards = relationshipsData?.relationships?.some(
    (rel: any) => rel.sourceCardId === data.id || rel.destCardId === data.id
  );

  const hasChildCards = relationshipsData?.children && relationshipsData.children.length > 0;

  // Check if the card has a parent
  const hasParentCard = relationshipsData?.parent;

  if (isLoadingRelationships || isLoadingBoardCards) {
    return <Skeleton className="h-40 w-full" />;
  }

  const validParentOptions = getValidParentOptions();
  const validRelationshipOptions = getValidRelationshipOptions();

  const shouldRenderChildCard = hasChildCards || isChildCardOpen;
  const shouldRenderAssociatedCard = hasAssociatedCards || isAssociateCardOpen;
  const shouldRenderParentCard = hasParentCard;

  // Function to handle opening a related card
  const handleOpenRelatedCard = (cardId: string) => {
    // Close the current card modal
    cardModal.onClose();

    // Open the new card modal with the selected card ID
    setTimeout(() => {
      cardModal.onOpen(cardId);
    }, 100);
  };

  return (
    <>
      {(shouldRenderParentCard || shouldRenderChildCard || shouldRenderAssociatedCard) && (
        <div className="space-y-4">
          {/* Parent Card Section */}
          {shouldRenderParentCard && (
            <div className="space-y-2 mb-4">
              <p className="text-sm font-medium flex items-center text-muted-foreground">
                Parent Card
              </p>
              <div className="space-y-1.5">
                <div
                  key={relationshipsData.parent.id}
                  className="p-2 bg-background dark:bg-gray-800 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenRelatedCard(relationshipsData.parent.id);
                  }}
                >
                  <div className="flex items-center gap-x-2 overflow-hidden w-full">
                    <ArrowUp className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <p className="font-medium truncate min-w-0 flex-1">{relationshipsData.parent.title}</p>
                    <Badge className="shrink-0 ml-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                      {relationshipsData.parent.list.title}
                    </Badge>
                  </div>
                  <div className="flex items-center shrink-0 ml-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveParentRelationship(data.id);
                          }}
                        >
                          <Trash className="text-red-600" />      Remove relationship
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Child Cards Section */}
          {shouldRenderChildCard && (
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center text-muted-foreground">
                  Child Cards
                </p>

                {!isChildCardOpen && !readonly && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-none shadow-none py-0"
                    onClick={() => setIsChildCardOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                {relationshipsData?.children.map((child: any) => (
                  <div
                    key={child.id}
                    className="p-2 bg-background dark:bg-gray-800 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenRelatedCard(child.id);
                    }}
                  >
                    <div className="flex items-center gap-x-2 overflow-hidden w-full">
                      <GitBranch className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                      <p className="font-medium truncate min-w-0 flex-1">{child.title}</p>
                      <Badge className="shrink-0 ml-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                        {child.list.title}
                      </Badge>
                    </div>
                    <div className="flex items-center shrink-0 ml-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveChildRelationships(data.id);
                            }}
                          >
                            <Trash className="text-red-600" />    Remove relationship
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                {isChildCardOpen && (
                  <Card className="mt-2 border-dashed border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardContent className="p-3 pt-0">
                      <Tabs
                        defaultValue="create"
                        className="w-full"
                        onValueChange={(value) => setActiveTab(value as "create" | "link")}
                      >
                        <TabsList className="grid grid-cols-2 mb-3">
                          <TabsTrigger value="create" className="text-xs">
                            <Plus className="h-3 w-3 mr-1.5" />
                            Create New
                          </TabsTrigger>
                          <TabsTrigger value="link" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1.5" />
                            Link Existing
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="create" className="mt-0">
                          <div className="space-y-2">
                            <Input
                              placeholder="Enter card title"
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              className="h-8 text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setIsChildCardOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleCreateNewCard()}
                                disabled={!newCardTitle.trim()}
                              >
                                Create Card
                              </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="link" className="mt-0">
                          <div className="space-y-2">
                            <div className="relative">
                              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              <Select value={selectedChildCardId || ""} onValueChange={setSelectedChildCardId}>
                                <SelectTrigger className="h-8 text-xs pl-8">
                                  <SelectValue placeholder="Select existing card" />
                                </SelectTrigger>
                                <SelectContent>
                                  {validParentOptions.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                      No available cards
                                    </SelectItem>
                                  ) : (
                                    validParentOptions.map((card: any) => (
                                      <SelectItem key={card.id} value={card.id}>
                                        <span className="block">{card.title}</span>
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setIsChildCardOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={handleAddChildCard}
                                disabled={!selectedChildCardId}
                              >
                                Link Card
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Associated Cards Section */}
          {shouldRenderAssociatedCard && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center text-muted-foreground">
                  Associated Cards
                </p>

                {!isAssociateCardOpen && !readonly && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-none shadow-none py-0"
                    onClick={() => setIsAssociateCardOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="space-y-1.5">
                {relationshipsData?.relationships
                  .filter((rel: any) => rel.sourceCardId === data.id)
                  .map((rel: any) => (
                    <div
                      key={rel.id}
                      className="p-2 bg-background dark:bg-gray-800 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRelatedCard(rel.destCard.id);
                      }}
                    >
                      <div className="flex items-center gap-x-2 overflow-hidden w-full">
                        {getRelationshipIcon(rel.relationshipType)}
                        <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
                          <span className="text-muted-foreground whitespace-nowrap shrink-0">
                            {getRelationshipLabel(rel.relationshipType)}
                          </span>
                          <span className="whitespace-nowrap shrink-0">→pqzokdq</span>
                          <span className="font-medium  min-w-0">{rel.destCard.title}</span>
                        </div>
                      </div>
                      <Badge className="shrink-0 ml-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                        {rel.destCard.list.title}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 ml-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveRelationship(rel.id);
                            }}
                          >
                            <Trash className="text-red-600" />   Remove relationship
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}

                {relationshipsData?.relationships
                  .filter((rel: any) => rel.destCardId === data.id)
                  .map((rel: any) => (
                    <div
                      key={rel.id}
                      className="p-2 bg-background dark:bg-gray-800 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRelatedCard(rel.sourceCard.id);
                      }}
                    >
                      <div className="flex items-center gap-x-2 overflow-hidden w-full">
                        {getRelationshipIcon(rel.relationshipType)}
                        <div className="flex items-center gap-1.5 overflow-hidden min-w-0 flex-1">
                          <span className="text-muted-foreground min-w-0">
                            {getRelationshipLabel(rel.relationshipType)}
                          </span>
                          <span className="whitespace-nowrap shrink-0">→</span>
                          <span className="whitespace-nowrap font-medium shrink-0">
                            {rel.sourceCard.title}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-x-2 mr-4">
                        <Badge className="shrink-0 ml-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 px-2 py-0.5 text-xs">
                          {rel.sourceCard.list.title}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-3.5 w-3.5 text-gray-500" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRelationship(rel.id);
                              }}
                            >
                              <Trash className="text-red-600" />    Remove relationship
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}

                {isAssociateCardOpen && (
                  <Card className="mt-2 border-dashed border-2 border-gray-200 dark:border-gray-700 shadow-sm">
                    <CardContent className="p-3 pt-0">
                      <Tabs
                        defaultValue="create"
                        className="w-full"
                        onValueChange={(value) => setActiveTab(value as "create" | "link")}
                      >
                        <TabsList className="grid grid-cols-2 mb-3">
                          <TabsTrigger value="create" className="text-xs">
                            <Plus className="h-3 w-3 mr-1.5" />
                            Create New
                          </TabsTrigger>
                          <TabsTrigger value="link" className="text-xs">
                            <Link2 className="h-3 w-3 mr-1.5" />
                            Link Existing
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="create" className="mt-0">
                          <div className="space-y-2">
                            <div className="space-y-2">
                              <Select
                                value={selectedRelationshipType}
                                onValueChange={(value) => setSelectedRelationshipType(value as RelationshipType)}
                              >
                                <SelectTrigger className="h-8 text-xs">
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
                            <Input
                              placeholder="Enter card title"
                              value={newCardTitle}
                              onChange={(e) => setNewCardTitle(e.target.value)}
                              className="h-8 text-xs"
                            />
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setIsAssociateCardOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => {
                                  setNewCardType("associated");
                                  handleCreateNewCard();
                                }}
                                disabled={!newCardTitle.trim()}
                              >
                                Create Card
                              </Button>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="link" className="mt-0">
                          <div className="space-y-2">
                            <div className="space-y-2">
                              <Select
                                value={selectedRelationshipType}
                                onValueChange={(value) => setSelectedRelationshipType(value as RelationshipType)}
                              >
                                <SelectTrigger className="h-8 text-xs">
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
                            <div className="relative">
                              <Search className="absolute left-2 top-1.5 h-3.5 w-3.5 text-muted-foreground" />
                              <Select value={selectedDestCardId || ""} onValueChange={setSelectedDestCardId}>
                                <SelectTrigger className="h-8 text-xs pl-8">
                                  <SelectValue placeholder="Select existing card" />
                                </SelectTrigger>
                                <SelectContent>
                                  {validRelationshipOptions.length === 0 ? (
                                    <SelectItem value="none" disabled>
                                      No available cards
                                    </SelectItem>
                                  ) : (
                                    validRelationshipOptions.map((card: any) => (
                                      <SelectItem key={card.id} value={card.id}>
                                        <span>{card.title}</span>
                                      </SelectItem>
                                    ))
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => setIsAssociateCardOpen(false)}
                              >
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={handleAddRelationship}
                                disabled={!selectedDestCardId}
                              >
                                Link Card
                              </Button>
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Dialog for creating a new card */}
      <Dialog open={isCreateNewCardOpen} onOpenChange={setIsCreateNewCardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New {newCardType === "child" ? "Child" : "Associated"} Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Card Title</label>
              <Input
                placeholder="Enter card title"
                value={newCardTitle}
                onChange={(e) => setNewCardTitle(e.target.value)}
                autoFocus
              />
            </div>

            {newCardType === "associated" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Relationship Type</label>
                <Select
                  value={selectedRelationshipType}
                  onValueChange={(value) => setSelectedRelationshipType(value as RelationshipType)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relationship type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={RelationshipType.RELATES_TO}>Relates To</SelectItem>
                    <SelectItem value={RelationshipType.DEPENDS_ON}>Depends On</SelectItem>
                    <SelectItem value={RelationshipType.BLOCKED_BY}>Blocked By</SelectItem>
                    <SelectItem value={RelationshipType.PARENT_CHILD}>Parent/Child</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateNewCardOpen(false)} disabled={isCreatingCard}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewCard} disabled={!newCardTitle.trim() || isCreatingCard}>
              {isCreatingCard ? "Creating..." : "Create Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

Hierarchy.Skeleton = function HierarchySkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-x-2">
        <Skeleton className="h-5 w-5 rounded bg-neutral-200 dark:bg-gray-700" />
        <Skeleton className="h-6 w-24 bg-neutral-200 dark:bg-gray-700" />
      </div>
      <Skeleton className="w-full h-[200px] bg-neutral-200 dark:bg-gray-700" />
    </div>
  );
};
