"use client";

import { toast } from "sonner";
import { List } from "@prisma/client";
import { ElementRef, useRef } from "react";
import { Copy, Delete, MoreHorizontal, PlusCircle, Trash } from "lucide-react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-action";
import { Button } from "@/components/ui/button";

import { FormSubmit } from "@/components/form/form-submit";
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
      <PopoverContent className="px-0 w-40" side="bottom" align="start">
        <div className="text-sm font-medium text-center text-neutral-600 pb-4">
          List actions
        </div>
        <Separator />
        <Button
          onClick={onAddCard}
          className="rounded-none w-full h-auto p-2 px-5 justify-between font-normal text-sm"
          variant="ghost"
        >
          Add card <PlusCircle className="text-gray-500" />
        </Button>
        <form action={onCopy}>
          <input hidden name="id" id="id" value={data.id} />
          <input hidden name="boardId" id="boardId" value={data.boardId} />
          <Button
            variant="ghost"
            className="rounded-none w-full h-auto p-2 px-5 justify-between font-normal text-sm"
          >
            Copy list <Copy className="text-gray-500" />
          </Button>
        </form>
        <Dialog>
          <DialogTrigger asChild>
            <Button
              className="rounded-none w-full h-auto p-2 px-5 justify-between font-normal text-sm"
              variant="ghost"
            >
              Delete list <Trash className="text-gray-500" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-800">
                Confirm Deletion
              </h2>
              <p className="text-sm text-gray-600 mt-2">
                <p className="text-sm text-gray-600 mt-2">
                  Are you sure you want to delete the list &quot;{data.title}&quot;? All the cards contained in this list will also be deleted. This action cannot be undone.
                </p>
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
        <Separator />
      </PopoverContent>
    </Popover>
  );
};
