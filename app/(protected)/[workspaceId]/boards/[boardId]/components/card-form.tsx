'use client'

import { forwardRef, useRef, ElementRef, KeyboardEventHandler } from "react";
import { Plus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useEventListener, useOnClickOutside } from "usehooks-ts";
import { Button } from "@/components/ui/button";
import { FormSubmit } from "@/components/form/form-submit";
import { FormTextarea } from "@/components/form/form-textarea";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { createCard } from "@/actions/tasks/create-card";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useCardModal } from "@/hooks/use-card-modal";

interface CardFormProps {
  listId: string;
  enableEditing: () => void;
  disableEditing: () => void;
  isEditing: boolean;
}

export const CardForm = forwardRef<HTMLTextAreaElement, CardFormProps>(
  ({ listId, enableEditing, disableEditing, isEditing }, textareaRef) => {
    const params = useParams();
    const formRef = useRef<ElementRef<"form">>(null);
    const { currentWorkspace } = useCurrentWorkspace();
    const cardModal = useCardModal();

    const { execute, fieldErrors } = useAction(createCard, {
      onSuccess: (data) => {
        toast.success(`Card "${data.title}" created`);
        formRef.current?.reset();
        disableEditing();
        cardModal.onOpen(data?.id);
      },
      onError: (error) => {
        toast.error(error);
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        disableEditing();
      }
    };

    useOnClickOutside(formRef, disableEditing);
    useEventListener("keydown", onKeyDown);

    const onTextareaKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        formRef.current?.requestSubmit();
      }
    };

    const onSubmit = (formData: FormData) => {
      const title = formData.get("title") as string;
      const listId = formData.get("listId") as string;
      const boardId = params.boardId as string;
      const workspaceId = currentWorkspace?.id;

      if (!workspaceId) {
        toast.error("Workspace ID is required.");
        return;
      }

      execute({ title, listId, boardId, workspaceId });
    };

    if (isEditing) {
      return (
        <form
          ref={formRef}
          action={onSubmit}
          className="m-1 py-0.5 px-1 space-y-4"
        >
          <FormTextarea
            id="title"
            onKeyDown={onTextareaKeyDown}
            ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
            placeholder="Enter a title for this card..."
            className="bg-background dark:bg-gray-700"
            errors={fieldErrors}
          />
          <input hidden id="listId" name="listId" value={listId} />
          <div className="flex items-center gap-x-1 pb-2">
            <FormSubmit>Add card</FormSubmit>
            <Button onClick={disableEditing} size="sm" variant="ghost">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </form>
      );
    }

    return (
      <div className=" px-2 border-2 hover:border-blue-500 bg-background border-dashed mx-2 border-gray-300 dark:border-gray-700 hover:bg-background dark:hover:bg-gray-800">
        <Button
          onClick={enableEditing}
          className="h-auto px-2 py-1.5 w-full justify-center bg-background hover:bg-background dark:hover:bg-gray-800 text-muted-foreground text-sm"
          size="sm"
          variant="ghost"
        >
          <Plus className="h-4 w-4 hover:border-blue-500  border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-full" />
          Add a card
        </Button>
      </div>
    );
  }
);

CardForm.displayName = "CardForm"; // Ajoutez cette ligne pour éviter les avertissements avec React.forwardRef
