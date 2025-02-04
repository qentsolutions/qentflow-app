"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { updateBoard } from "@/actions/tasks/update-board";
import { deleteBoard } from "@/actions/tasks/delete-board";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UploadBoardImage from "./board-image";

interface GeneralSettingsProps {
  boardId: string;
  boardTitle: string;
  createdById: string;
}

export const GeneralSettings = ({ boardId, boardTitle, createdById }: GeneralSettingsProps) => {
  const [title, setTitle] = useState(boardTitle);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { currentWorkspace } = useCurrentWorkspace();
  const currentUser = useCurrentUser();

  const isCreator = currentUser?.id === createdById;

  const { execute: executeUpdate } = useAction(updateBoard, {
    onSuccess: (data) => {
      toast.success(`Board "${data.title}" updated!`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeDelete } = useAction(deleteBoard, {
    onSuccess: () => {
      toast.success("Board deleted successfully");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentWorkspace?.id || !isCreator) return;

    executeUpdate({
      title,
      id: boardId,
      workspaceId: currentWorkspace.id,
    });
  };

  const onDelete = () => {
    if (!currentWorkspace?.id || !isCreator) return;

    executeDelete({
      id: boardId,
      workspaceId: currentWorkspace.id,
    });
  };

  return (
    <div className="p-6">
      <p className="text-sm font-medium text-gray-700 mb-2">Board Image Background</p>
      <UploadBoardImage boardId={boardId} workspaceId={currentWorkspace?.id || ""} />
      <form onSubmit={onSubmit} className="space-y-4 mt-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Board Name</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            placeholder="Enter board name"
            disabled={!isCreator}
          />
        </div>
        {isCreator && (
          <Button type="submit" className="bg-blue-500 text-white">
            Save Changes
          </Button>
        )}
      </form>

      <Separator className="my-6" />

      {isCreator && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Delete the board</label>
              <p className="text-sm text-gray-500">
                Permanently delete this board with all its tasks. This action cannot be undone.
              </p>
            </div>
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">Delete Board</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Board</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this board? This action cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button
                    variant="destructive"
                    onClick={onDelete}
                    className="w-full sm:w-auto"
                  >
                    Delete Board
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      )}
    </div>
  );
};