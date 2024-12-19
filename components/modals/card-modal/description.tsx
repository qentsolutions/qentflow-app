"use client";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect, ElementRef } from "react";
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
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontSize from "tiptap-extension-font-size";

interface DescriptionProps {
  data: CardWithList;
}

export const Description = ({ data }: DescriptionProps) => {
  const params = useParams();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();
  const [description, setDescription] = useState(data.description || "");
  const [isEditing, setIsEditing] = useState(false);
  const formRef = useRef<ElementRef<"form">>(null);

  const enableEditing = () => setIsEditing(true);
  const disableEditing = () => setIsEditing(false);

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") disableEditing();
  };
  useEventListener("keydown", onKeyDown);

  const { execute } = useAction(updateCard, {
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({
        queryKey: ["card", updatedData.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", updatedData.id],
      });
      toast.success(`Card "${updatedData.title}" updated`);
      setDescription(updatedData.description || ""); // Update description
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
  };

  const readOnlyEditor = useEditor({
    extensions: [
      StarterKit,
      Color.configure({ types: [TextStyle.name] }),
      TextStyle,
      FontSize.configure({ types: ["textStyle"] }),
    ],
    content: description || "Add a more detailed description...",
    editable: false,
    parseOptions: {
      preserveWhitespace: true,
    },
  });

  // Update readOnlyEditor when description changes
  useEffect(() => {
    if (readOnlyEditor && description) {
      readOnlyEditor.commands.setContent(description);
    }
  }, [description, readOnlyEditor]);

  return (
    <div className="flex items-start gap-x-3 w-full">
      <div className="w-full">
        <span className="flex items-center font-bold text-lg mb-4">
          <TextAlignLeftIcon className="mr-2" /> Description
        </span>
        {isEditing ? (
          <form onSubmit={onSubmit} ref={formRef} className="space-y-2">
            <RichTextEditor content={description} onChange={setDescription} />
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
          <EditorContent
            onClick={enableEditing}
            editor={readOnlyEditor}
            className="prose max-w-none p-4 bg-gray-50 rounded-lg border cursor-pointer"
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
