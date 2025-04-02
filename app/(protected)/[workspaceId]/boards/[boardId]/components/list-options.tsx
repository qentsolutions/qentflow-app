"use client";

import { toast } from "sonner";
import { List } from "@prisma/client";
import { ElementRef, useRef } from "react";
import { Copy, MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-action";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { deleteList } from "@/actions/tasks/delete-list";
import { copyList } from "@/actions/tasks/copy-list";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface ListOptionsProps {
  data: List;
  onAddCard: () => void;
}

export const ListOptions = ({ data, onAddCard }: ListOptionsProps) => {
  const closeRef = useRef<ElementRef<"button">>(null);
  const { currentWorkspace } = useCurrentWorkspace();

  const { execute: executeDelete } = useAction(deleteList, {
    onSuccess: (data) => {
      toast.success(`List "${data.title}" deleted`);
      closeRef.current?.click();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeCopy } = useAction(copyList, {
    onSuccess: (data) => {
      toast.success(`List "${data.title}" copied`);
      closeRef.current?.click();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onDelete = () => {
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }

    executeDelete({ id: data.id, boardId: data.boardId, workspaceId });
  };

  const onCopy = (formData: FormData) => {
    const id = formData.get("id") as string;
    const boardId = formData.get("boardId") as string;
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    executeCopy({ id, boardId, workspaceId });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="ghost">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-2" side="bottom" align="start">
        <button
          onClick={onAddCard}
          className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
        >
          <PlusCircle className="text-gray-700" size={14} />
          <span className="text-sm">Add card</span>
        </button>
        <form action={onCopy}>
          <input hidden name="id" id="id" value={data.id} />
          <input hidden name="boardId" id="boardId" value={data.boardId} />
          <button
            type="submit"
            className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
          >
            <Copy className="text-gray-700" size={14} />
            <span className="text-sm">Copy list</span>
          </button>
        </form>
        <Separator />
        <Dialog>
          <DialogTrigger asChild>
            <button
              className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
            >
              <Trash2 className="text-red-500" size={14} />
              <span className="text-sm">Delete list</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-800">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete the list &apos;{data.title}&apos;? All the cards contained in this list will also be deleted. This action cannot be undone.
              </p>
            </div>
            <DialogFooter>
              <DialogClose>
                <Button variant="ghost" onClick={() => closeRef.current?.click()}>
                  Cancel
                </Button>
              </DialogClose>
              <Button variant="destructive" onClick={onDelete}>
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PopoverContent>
    </Popover>
  );
};
