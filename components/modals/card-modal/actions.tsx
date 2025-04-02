import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useAction } from "@/hooks/use-action";
import { copyCard } from "@/actions/tasks/copy-card";
import { deleteCard } from "@/actions/tasks/delete-card";
import { useCardModal } from "@/hooks/use-card-modal";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import type { CardWithList, ListWithCards } from "@/types";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { Copy, Expand, MoreHorizontal, MoreVertical, Trash } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import CardActions from "@/app/(protected)/[workspaceId]/boards/[boardId]/components/card-actions";

interface ActionsProps {
  card: CardWithList;
  readonly?: boolean;
  boardId: string;
  lists: ListWithCards[];
  setOrderedData: (data: ListWithCards[]) => void;
}

export const Actions = ({ card, boardId, readonly = false, lists, setOrderedData }: ActionsProps) => {
  const params = useParams();
  const router = useRouter();
  const cardModal = useCardModal();
  const { currentWorkspace } = useCurrentWorkspace();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const { execute: executeCopyCard, isLoading: isLoadingCopy } = useAction(copyCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" copied`);
      cardModal.onClose();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeDeleteCard, isLoading: isLoadingDelete } = useAction(deleteCard, {
    onSuccess: (data) => {
      toast.success(`Card "${data.title}" deleted`);
      cardModal.onClose();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onCopy = () => {
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    executeCopyCard({
      id: card?.id,
      boardId,
      workspaceId,
    });
  };

  const onDelete = () => {
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    executeDeleteCard({
      id: card?.id,
      boardId,
      workspaceId,
    });
  };

  const onExpand = () => {
    cardModal.onClose();
    router.push(`/${currentWorkspace?.id}/boards/${boardId}/cards/${card.id}`);
  };

  if (readonly) return null;

  return (
    <div className="flex items-center gap-1 mr-6">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={onExpand}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Expand className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">Expand card</p>
        </TooltipContent>
      </Tooltip>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="transition p-1 rounded-lg hover:bg-gray-100"
            onClick={(e) => e.stopPropagation()} // Stop propagation to prevent card click
          >
            <MoreVertical size={16} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40 p-2" side="bottom" align="end">
          <CardActions data={card} lists={lists} setOrderedData={setOrderedData} hideOptions={true} />
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Delete card</h2>
            <p className="text-muted-foreground">
              Are you sure you want to delete this card? This action is irreversible.
            </p>
            <div className="flex items-center gap-2 pt-4">
              <Button
                onClick={onDelete}
                disabled={isLoadingDelete}
                variant="destructive"
                className="w-full"
              >
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
