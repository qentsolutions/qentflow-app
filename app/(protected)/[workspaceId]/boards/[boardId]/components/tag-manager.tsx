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
  const [newTagColor, setNewTagColor] = useState("#3B82F6"); // Couleur par défaut
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
      setNewTagColor("#3B82F6"); // Réinitialiser la couleur
    },
    onError: (error) => {
      toast.error(error || "Failed to create tag");
    },
  });

  const { execute: executeDeleteTag } = useAction(deleteTag, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["available-tags", boardId] });
      toast.success("Tag deleted successfully!");
    },
    onError: (error) => {
      toast.error(error || "Failed to delete tag");
    },
  });

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;

    executeCreateTag({
      name: newTagName,
      color: newTagColor,
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

  return (
    <div className="p-6 space-y-6">
      {/* Formulaire pour créer un tag */}
      <form onSubmit={handleCreateTag} className="flex gap-2 items-center">
        <Input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          placeholder="Enter tag name"
          className="flex-1"
        />
        <input
          type="color"
          value={newTagColor}
          onChange={(e) => setNewTagColor(e.target.value)}
          className="w-10 h-10 border cursor-pointer"
        />
        <Button type="submit" className="bg-blue-500 text-white">
          Add Tag
        </Button>
      </form>

      {/* Liste des tags existants */}
      <div className="space-y-4">
        {tags?.map((tag: any) => (
          <div
            key={tag.id}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <Badge
                style={{ backgroundColor: tag.color }}
                className="text-white px-3 py-1 rounded"
              >
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
