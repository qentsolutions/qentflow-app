// app/(protected)/[workspaceId]/boards/[boardId]/components/settings/general-settings.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { updateBoard } from "@/actions/tasks/update-board";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { BoardOptions } from "./board-options";
import { Separator } from "@/components/ui/separator";

interface GeneralSettingsProps {
  boardId: string;
  boardTitle: string;
}

export const GeneralSettings = ({ boardId, boardTitle }: GeneralSettingsProps) => {
  const [title, setTitle] = useState(boardTitle);
  const { currentWorkspace } = useCurrentWorkspace();

  const { execute } = useAction(updateBoard, {
    onSuccess: (data) => {
      toast.success(`Board "${data.title}" updated!`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentWorkspace?.id) return;

    execute({
      title,
      id: boardId,
      workspaceId: currentWorkspace.id,
    });
  };

  return (
    <div className="p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">Board Name</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1"
            placeholder="Enter board name"
          />
        </div>
        <Button type="submit" className="bg-blue-500 text-white">
          Save Changes
        </Button>
      </form>
      <Separator className="my-6" />
      <BoardOptions boardId={boardId} />
    </div>
  );
};
