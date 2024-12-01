"use client";

import { toast } from "sonner";
import { MoreHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { deleteBoard } from "@/actions/tasks/delete-board";
import { useAction } from "@/hooks/use-action";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface BoardOptionsProps {
  boardId: string;
}

export const BoardOptions = ({ boardId }: BoardOptionsProps) => {
  const { currentWorkspace } = useCurrentWorkspace();


  const { execute, isLoading } = useAction(deleteBoard, {
    onError: (error) => {
      toast.error(error);
    }
  });

  const onDelete = () => {
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {

      toast.error("Workspace ID is required.");
    }
    execute({ id: boardId, workspaceId: workspaceId! });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button className="h-auto w-auto p-2" variant="outline">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="px-0 pt-3 pb-3"
        side="bottom"
        align="start"
      >
        <div className="text-sm font-medium text-center text-neutral-600 pb-4">
          Board actions
        </div>
        <Button
          variant="ghost"
          onClick={onDelete}
          disabled={isLoading}
          className="rounded-none w-full h-auto p-2 px-5 justify-start font-normal text-sm"
        >
          Delete this board
        </Button>
      </PopoverContent>
    </Popover>
  );
};