"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteBoard } from "@/actions/tasks/delete-board";
import { useAction } from "@/hooks/use-action";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface BoardOptionsProps {
  boardId: string;
}

export const BoardOptions = ({ boardId }: BoardOptionsProps) => {
  const { currentWorkspace } = useCurrentWorkspace();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { execute, isLoading } = useAction(deleteBoard, {
    onSuccess: () => {
      toast.success("Board deleted successfully");
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onDelete = () => {
    if (!currentWorkspace?.id) {
      toast.error("Workspace ID is required.");
      return;
    }
    execute({ id: boardId, workspaceId: currentWorkspace.id });
  };

  return (
    <div className="flex items-center justify-between mb-2">
      <div>
        <label className="text-sm font-medium text-gray-700">Delete the board</label>
        <p className="text-sm text-gray-500">
          Permanently delete this board with all its tasks. This action cannot be undone.
        </p>
      </div>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4" /> Delete
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the board? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? "Deleting..." : "Delete Board"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setIsDialogOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
