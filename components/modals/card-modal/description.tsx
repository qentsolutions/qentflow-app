"use client";

import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useState, useRef, useEffect, ElementRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useEventListener } from "usehooks-ts";

import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/tasks/update-card";
import { CardWithList } from "@/types";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlignLeft } from 'lucide-react';

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Color from "@tiptap/extension-color";
import TextStyle from "@tiptap/extension-text-style";
import FontSize from "tiptap-extension-font-size";
import RichTextEditor from "./components/rich-text-editor";

interface DescriptionProps {
  data: CardWithList;
  readonly?: boolean;
}

export const Description = ({ data, readonly = false }: DescriptionProps) => {
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
      setDescription(updatedData.description || "");
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
    <Card className="shadow-none border bg-card">
      <CardContent className="py-5 px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <AlignLeft className="h-5 w-5 mr-2" /> 
            Description
          </h3>
          
          {!readonly && !isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={enableEditing}
              className="text-xs"
            >
              Edit
            </Button>
          )}
        </div>
        
        {readonly ? (
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <EditorContent
              editor={readOnlyEditor}
              className="min-h-[100px]"
            />
          </div>
        ) : (
          <>
            {isEditing ? (
              <form onSubmit={onSubmit} ref={formRef} className="space-y-4">
                <RichTextEditor content={description} onChange={setDescription} />
                <div className="flex items-center gap-x-2">
                  <Button
                    type="submit"
                    size="sm"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={disableEditing}
                    size="sm"
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div 
                onClick={enableEditing}
                className="prose prose-sm max-w-none dark:prose-invert min-h-[100px] p-4 rounded-md border cursor-pointer hover:bg-accent/50 transition"
              >
                <EditorContent
                  editor={readOnlyEditor}
                />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

Description.Skeleton = function DescriptionSkeleton() {
  return (
    <Card className="shadow-none border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-5 w-5 rounded bg-neutral-200 dark:bg-gray-700" />
          <Skeleton className="h-6 w-24 bg-neutral-200 dark:bg-gray-700" />
        </div>
        <Skeleton className="w-full h-[120px] bg-neutral-200 dark:bg-gray-700" />
      </CardContent>
    </Card>
  );
};
