"use client";

import { toast } from "sonner";
import { ElementRef, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/tasks/update-card";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

import { Skeleton } from "@/components/ui/skeleton";
import { FormInput } from "@/components/form/form-input";
import { Button } from "@/components/ui/button";
import { Edit, Expand, Eye, Maximize2, Minimize2 } from 'lucide-react'; // Importez Minimize2
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCardModal } from "@/hooks/use-card-modal";

interface HeaderProps {
  data: CardWithList;
  readonly?: boolean;
  boardId: string;
  isMaximized?: boolean; // Ajoutez cette ligne pour l'état isMaximized
  onToggleMaximize?: () => void; // Ajoutez cette ligne pour la fonction de rappel
}

export const Header = ({
  data,
  readonly = false,
  boardId,
  isMaximized, // Ajoutez cette ligne
  onToggleMaximize // Ajoutez cette ligne
}: HeaderProps) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const router = useRouter();
  const cardModal = useCardModal();

  const { execute } = useAction(updateCard, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["card", data.id]
      });

      queryClient.invalidateQueries({
        queryKey: ["card-logs", data.id]
      });

      queryClient.invalidateQueries({
        queryKey: ["card-comments", data.id]
      });

      toast.success(`Renamed to "${data.title}"`);
      setTitle(data.title);
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const inputRef = useRef<ElementRef<"input">>(null);
  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);

  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
  };

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const workspaceId = currentWorkspace?.id;

    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }

    if (title === data.title) {
      setIsEditing(false);
      return;
    }

    execute({
      title,
      boardId,
      id: data.id,
      workspaceId
    });
  };

  const handleEditClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  };

  const onExpand = () => {
    cardModal.onClose();
    router.push(`/${currentWorkspace?.id}/boards/${boardId}/cards/${data.id}`);
  };

  return (
    <div className="w-full ml-4">
      {readonly ? (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">
            {title}
          </h2>
          <div className="flex items-center gap-x-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1 bg-blue-100 text-blue-500 hover:bg-blue-100 hover:text-blue-500"
            >
              <Eye className="h-3.5 w-3.5 text-blue-500" />
              Read-only
            </Button>
            <div className="w-px h-5 bg-border" />
            <Button
              variant="outline"
              size="sm"
              onClick={onExpand}
              className="text-xs gap-1"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={onToggleMaximize} // Appelez la fonction de rappel ici
                className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {isMaximized ? (
                  <Minimize2 className="h-4 w-4" /> // Utilisez l'icône Minimize2 si isMaximized est true
                ) : (
                  <Maximize2 className="h-4 w-4" /> // Utilisez l'icône Maximize2 sinon
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{isMaximized ? "Minimize card" : "Expand card"}</p>
            </TooltipContent>
          </Tooltip>
          <form action={onSubmit}>
            {isEditing ? (
              <FormInput
                ref={inputRef}
                onBlur={onBlur}
                id="title"
                defaultValue={title}
                className="font-semibold text-xl px-1 py-1 h-auto bg-transparent focus-visible:bg-background border-none focus-visible:ring-1 w-full"
              />
            ) : (
              <div className="flex items-center gap-x-2">
                <h2
                  onClick={handleEditClick}
                  className="font-semibold text-xl ml-2 px-1 py-1 w-full cursor-text hover:bg-accent/50 rounded transition"
                >
                  {title}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditClick}
                  className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

Header.Skeleton = function HeaderSkeleton() {
  return (
    <div className="w-full ml-4">
      <Skeleton className="w-1/3 h-8 bg-neutral-200 dark:bg-gray-700" />
    </div>
  );
};
