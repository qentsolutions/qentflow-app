"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { updateDocument } from "@/actions/documents/update-document";

interface DocumentHeaderProps {
  document: any;
}

export function DocumentHeader({ document }: DocumentHeaderProps) {
  const [title, setTitle] = useState(document.title);
  const [isEditing, setIsEditing] = useState(false);
  const { currentWorkspace } = useCurrentWorkspace();

  const handleUpdateTitle = async () => {
    try {
      const result = await updateDocument({
        id: document.id,
        title,
        workspaceId: currentWorkspace?.id as string,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      setIsEditing(false);
      toast.success("Title updated");
    } catch (error) {
      toast.error("Failed to update title");
    }
  };

  return (
    <div className="border-b px-4 py-2">
      <div className="max-w-4xl mx-auto">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold"
            />
            <Button onClick={handleUpdateTitle}>Save</Button>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <h1
            className="text-2xl font-bold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
            onClick={() => setIsEditing(true)}
          >
            {document.title}
          </h1>
        )}
      </div>
    </div>
  );
}