"use client";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useState, useRef, ElementRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventListener } from "usehooks-ts";
import { TextAlignLeftIcon } from "@radix-ui/react-icons";
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/tasks/update-card";
import { CardWithList } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import RichTextEditor from "./components/rich-text-editor";
interface DescriptionProps {
  data: CardWithList;
}
export const Description = ({
  data
}: DescriptionProps) => {
  const params = useParams();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();
  const [description, setDescription] = useState(data.description || "");
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);
  const enableEditing = () => {
    setIsEditing(true);
  }
  const disableEditing = () => {
    setIsEditing(false);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      disableEditing();
    }
  };
  useEventListener("keydown", onKeyDown);
  const { execute } = useAction(updateCard, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["card", data.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", data.id]
      });
      toast.success(`Card "${data.title}" updated`);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;
    
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    
    execute({
      id: data.id,
      description,
      boardId,
      workspaceId,
    });
  }
  return (
    <div className="flex items-start gap-x-3 w-full">
      <div className="w-full">
        <span className="flex items-center font-bold text-lg mb-6">
          <TextAlignLeftIcon className="mr-2" /> Description
        </span>
        {isEditing ? (
          <form
            onSubmit={onSubmit}
            ref={formRef}
            className="space-y-2"
          >
            <RichTextEditor
              content={description}
              onChange={setDescription}
            />
            <div className="flex items-center gap-x-2">
              <Button
                type="submit"
                className="bg-blue-500 text-white hover:bg-blue-700 hover:text-white"
              >
                Save
              </Button>
              <Button
                type="button"
                onClick={disableEditing}
                size="sm"
                variant="ghost"
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <div
            onClick={enableEditing}
            role="button"
            className="bg-gray-50 min-h-[200px] border text-sm font-medium py-3 px-3.5 rounded-md"
            dangerouslySetInnerHTML={{ __html: description || "Add a more detailed description..." }}
          />
        )}
      </div>
    </div>
  );
};
Description.Skeleton = function DescriptionSkeleton() {
  return (
    <div className="flex items-start gap-x-3 w-full">
      <Skeleton className="h-6 w-6 bg-neutral-200" />
      <div className="w-full">
        <Skeleton className="w-24 h-6 mb-2 bg-neutral-200" />
        <Skeleton className="w-full h-[78px] bg-neutral-200" />
      </div>
    </div>
  );
};