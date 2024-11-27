import { toast } from "sonner";
import { Copy, Trash, Check, Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { copyCard } from "@/actions/tasks/copy-card";
import { deleteCard } from "@/actions/tasks/delete-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCardModal } from "@/hooks/use-card-modal";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addTagToCard } from "@/actions/tasks/add-tag-to-card";
import { Badge } from "@/components/ui/badge"; // Importer le composant Badge
import { removeTagFromCard } from "@/actions/tasks/delete-tag-from-card";
import { Card, CardContent } from "@/components/ui/card";

interface ActionsProps {
  data: CardWithList;
  availableTags: { id: string; name: string }[]; // Tags disponibles dans le board
}

export const Actions = ({
  data,
  availableTags,
}: ActionsProps) => {
  const params = useParams();
  const cardModal = useCardModal();
  const { currentWorkspace } = useCurrentWorkspace();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // Gérer l'état des tags associés à la carte
  const [linkedTags, setLinkedTags] = useState<string[]>(data.tags.map(tag => tag.name));
  const [isSelectVisible, setIsSelectVisible] = useState(false);


  const {
    execute: executeCopyCard,
    isLoading: isLoadingCopy,
  } = useAction(copyCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" copied`);
      cardModal.onClose();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const {
    execute: executeDeleteCard,
    isLoading: isLoadingDelete,
  } = useAction(deleteCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" deleted`);
      cardModal.onClose();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const {
    execute: executeAddTagToCard,
    isLoading: isLoadingAddTag,
  } = useAction(addTagToCard, {
    onSuccess: () => {
      toast.success("Tag added to card successfully");

      if (selectedTag) {
        // Trouver le nom du tag à partir de l'ID sélectionné
        const newTag = availableTags.find(tag => tag.id === selectedTag)?.name;

        if (newTag && !linkedTags.includes(newTag)) {
          // Ajouter le tag en temps réel à la liste des tags associés
          setLinkedTags(prevTags => [...prevTags, newTag]);
        }
      }

      // Réinitialiser le champ de sélection après ajout
      setSelectedTag(null);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const {
    execute: executeRemoveTagFromCard, // Nouvelle action pour détacher un tag
    isLoading: isLoadingRemoveTag,
  } = useAction(removeTagFromCard, {
    onSuccess: () => {
      toast.success("Tag removed from card successfully");
    },
    onError: (error) => {
      toast.error(error);
    },
  });


  const onCopy = () => {
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    executeCopyCard({
      id: data.id,
      boardId,
      workspaceId,
    });
  };

  const onDelete = () => {
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    executeDeleteCard({
      id: data.id,
      boardId,
      workspaceId,
    });
  };

  const onAddTag = (value: string) => {
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;

    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    if (!value) {
      toast.error("Please select a tag to add.");
      return;
    }

    // Ajouter le tag sélectionné immédiatement après la sélection
    executeAddTagToCard({
      cardId: data.id,
      tagId: value,
      boardId,
      workspaceId,
    });
  };

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
    // Utiliser l'ID du tag pour calculer un index unique
    const index = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  // Gérer les changements dans la sélection de tag
  useEffect(() => {
    if (selectedTag && !linkedTags.includes(selectedTag)) {
      const newTag = availableTags.find(tag => tag.id === selectedTag)?.name;
      if (newTag && !linkedTags.includes(newTag)) {
        setLinkedTags(prevTags => [...prevTags, newTag]);
      }
    }
  }, [selectedTag, availableTags, linkedTags]);


  const onRemoveTag = (tagId: string) => {
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;

    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }

    executeRemoveTagFromCard({
      cardId: data.id,
      tagId,
      boardId,
      workspaceId,
    });

    // Mettre à jour la liste des tags en temps réel
    setLinkedTags((prevTags) => prevTags.filter((tag) => availableTags.find((t) => t.name === tag)?.id !== tagId));
  };


  return (
    <Card className="mt-4 shadow-none">
      <CardContent>
        <div className="space-y-4 mt-4">
          <div>
            <p className="text-lg font-semibold my-2">Tags</p>
            <div
              className={`border rounded-md p-2 cursor-pointer ${isEditMode ? "ring-2 ring-blue-500" : ""}`}
              onClick={() => setIsEditMode((prev) => !prev)} // Toggle l'état
            >
              <div className="flex flex-wrap gap-2">
                {linkedTags.length === 0 ? (
                  <span className="text-gray-400 text-xs">Add tags</span>
                ) : (
                  linkedTags.map((tag) => {
                    const tagId = availableTags.find((t) => t.name === tag)?.id || "";
                    return (
                      <Badge
                        key={tagId}
                        className={`relative flex items-center ${getRandomColor(tagId)} group`}
                      >
                        {tag}
                        <button
                          className="absolute -right-2 -top-2 h-4 w-4 bg-white rounded-full flex items-center justify-center shadow-lg border opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveTag(tagId);
                          }}
                        >
                          <X className="h-3 w-3 text-red-500" />
                        </button>
                      </Badge>
                    );
                  })
                )}
              </div>

            </div>
            {isEditMode && (
              <Select
                value={selectedTag || ""}
                onValueChange={(value) => {
                  setSelectedTag(value);
                  onAddTag(value);
                }}
                disabled={isLoadingAddTag}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Select a tag" />
                </SelectTrigger>
                <SelectContent>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.id}>
                      <div className="flex items-center">
                        {tag.name}
                        {linkedTags.includes(tag.name) && <Check className="ml-2 h-4 w-4 text-green-500" />}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

          </div>
          <p className="text-lg font-semibold">Actions</p>
          <Button
            onClick={onCopy}
            disabled={isLoadingCopy}
            variant="outline"
            className="w-full justify-start"
            size="default"
          >
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Dialog>
            <DialogTrigger className="w-full">
              <Button
                variant="outline"
                className="w-full justify-start"
                size="default"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </DialogTrigger>
            <DialogContent>
              <p className="text-base text-muted-foreground mb-4">
                Are you sure you want to delete this card? This action is irreversible.
              </p>
              <div className="flex items-center">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  disabled={isLoadingDelete}
                  variant="destructive"
                  className="w-full justify-center mr-8"
                  size="default"
                >
                  <Trash className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <DialogClose className="w-full">
                  <Button
                    variant="outline"
                    className="w-full justify-center cursor-pointer"
                    size="default"
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          </Dialog>
        </div >
        </CardContent>
    </Card>
  );
};

Actions.Skeleton = function ActionsSkeleton() {
  return (
    <div className="space-y-4 mt-2">
      <Skeleton className="w-20 h-4 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
      <Skeleton className="w-full h-8 bg-neutral-200" />
      <Skeleton className="w-full h-12 bg-neutral-200" />
    </div>
  );
};