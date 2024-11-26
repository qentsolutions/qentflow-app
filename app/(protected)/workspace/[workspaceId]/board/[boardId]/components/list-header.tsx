import { toast } from "sonner";
import { List } from "@prisma/client";
import { useEventListener } from "usehooks-ts";
import { useState, useRef, ElementRef } from "react";

import { useAction } from "@/hooks/use-action";
import { FormInput } from "@/components/form/form-input";
import { ListOptions } from "./list-options";
import { updateList } from "@/actions/tasks/update-list";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface ListWithCards extends List {
  cards: { id: string }[]; // Définir la structure des cartes
}

interface ListHeaderProps {
  data: ListWithCards;
  onAddCard: () => void;
}

export const ListHeader = ({ data, onAddCard }: ListHeaderProps) => {
  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false);
  const { currentWorkspace } = useCurrentWorkspace();

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const enableEditing = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    });
  };

  const disableEditing = () => {
    setIsEditing(false);
  };

  const { execute } = useAction(updateList, {
    onSuccess: (data) => {
      toast.success(`Renamed to "${data.title}"`);
      setTitle(data.title);
      disableEditing();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const handleSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const id = formData.get("id") as string;
    const boardId = formData.get("boardId") as string;
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }

    if (title === data.title) {
      return disableEditing();
    }

    execute({
      title,
      id,
      boardId,
      workspaceId,
    });
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      formRef.current?.requestSubmit();
    }
  };

  useEventListener("keydown", onKeyDown);

  return (
    <div className="pt-2 pb-1 px-2 text-sm font-semibold flex justify-between items-center">
      <div className="flex-1 flex items-center gap-x-2">
        {isEditing ? (
          <form ref={formRef} action={handleSubmit} className="flex-1 px-[2px]">
            <input hidden id="id" name="id" value={data.id} />
            <input hidden id="boardId" name="boardId" value={data.boardId} />
            <FormInput
              ref={inputRef}
              onBlur={onBlur}
              id="title"
              placeholder="Enter list title.."
              defaultValue={title}
              className="text-sm px-[7px] py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition truncate bg-transparent focus:bg-white"
            />
            <button type="submit" hidden />
          </form>
        ) : (
          <div
            onClick={enableEditing}
            className="w-full text-sm px-2.5 py-1 h-7 font-medium border-transparent flex items-center"
          >
            {title}
            <span className="ml-2 flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-500 text-xs font-bold rounded-full">
              {data.cards.length}
            </span>
          </div>
        )}
      </div>
      <ListOptions onAddCard={onAddCard} data={data} />
    </div>
  );
};
