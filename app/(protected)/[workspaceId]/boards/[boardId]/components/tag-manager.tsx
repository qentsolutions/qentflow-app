// app/(protected)/[workspaceId]/boards/[boardId]/components/settings/tag-manager.tsx
"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAction } from "@/hooks/use-action";
import { createTag } from "@/actions/tasks/create-tag";
import { deleteTag } from "@/actions/tasks/delete-tag";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Badge } from "@/components/ui/badge";

interface TagManagerProps {
  boardId: string;
}

export const TagManager = ({ boardId }: TagManagerProps) => {
  const [newTagName, setNewTagName] = useState("");
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  const { data: tags } = useQuery({
    queryKey: ["available-tags", boardId],
    queryFn: () => fetcher(`/api/boards/tags?boardId=${boardId}`),
  });

  const { execute: executeCreateTag } = useAction(createTag, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-tags", boardId] });
      toast.success("Tag created successfully!");
      setNewTagName("");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const { execute: executeDeleteTag } = useAction(deleteTag, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-tags", boardId] });
      toast.success("Tag deleted successfully!");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    executeCreateTag({
      name: newTagName,
      boardId,
    });
  };

  const handleDeleteTag = (tagId: string) => {
    if (!currentWorkspace?.id) return;

    executeDeleteTag({
      id: tagId,
      boardId,
      workspaceId: currentWorkspace.id,
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
    const index = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  return (
    <div className="p-6 space-y-6">
      <form onSubmit={handleCreateTag} className="flex gap-2">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Enter tag name"
          className="flex-1"
        />
        <Button type="submit" className="bg-blue-500 text-white">
          Add Tag
        </Button>
      </form>

      <div className="space-y-4">
        {tags?.map((tag: any) => (
          <div
            key={tag.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Badge className={`${getRandomColor(tag.id)} text-white`}>
                {tag.name}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700"
              onClick={() => handleDeleteTag(tag.id)}
            >
              Delete
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
