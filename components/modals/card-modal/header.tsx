import { toast } from "sonner";
import { ElementRef, useRef, useState } from "react";
import { Edit, Eye, Layout, Text } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { CardWithList } from "@/types";
import { useAction } from "@/hooks/use-action";
import { updateCard } from "@/actions/tasks/update-card";
import { Skeleton } from "@/components/ui/skeleton";
import { FormInput } from "@/components/form/form-input";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  data: CardWithList;
  readonly?: boolean;
}

export const Header = ({
  data,
  readonly = false
}: HeaderProps) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const router = useRouter();

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
      setIsEditing(false); // Change to read-only mode after successful update
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const inputRef = useRef<ElementRef<"input">>(null);
  const [title, setTitle] = useState(data.title);
  const [isEditing, setIsEditing] = useState(false); // State to toggle between modes

  const onBlur = () => {
    inputRef.current?.form?.requestSubmit();
    setIsEditing(false); // Switch to read-only mode when input loses focus
  };

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;
    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }
    if (title === data.title) {
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
    setIsEditing(true); // Switch to edit mode on click
  };

  const onExpand = () => {
    router.push(`/${currentWorkspace?.id}/boards/${params.boardId}/cards/${data.id}`)
  }

  return (
    <div className="flex items-start gap-x-3 mb-6 w-full">
      <div className="w-full">
        {readonly ? (
          <div className="flex items-center justify-between">
            <p
              className="font-semibold text-2xl px-1 text-neutral-700 dark:text-white cursor-pointer"
            >
              {title}
            </p>
            <div className="flex items-center gap-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs bg-blue-100 text-blue-700 hover:text-foreground hover:bg-blue-100 hover:text-blue-700"
              >
                read-only <Eye className="h-4 w-4" />
              </Button>
              <div className="w-[1px] h-5 bg-gray-500" />
              <Button
                variant="ghost"
                size="sm"
                onClick={onExpand}
                className="text-muted-foreground hover:text-blue-700"
              >
                Edit <Edit className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <form action={onSubmit}>
            {isEditing ? (
              <FormInput
                ref={inputRef}
                onBlur={onBlur} // Add onBlur to handle losing focus
                id="title"
                defaultValue={title}
                className="font-semibold !text-2xl px-1 text-neutral-700 dark:text-white bg-transparent border-transparent relative -left-1.5 w-[95%] focus-visible:bg-white dark:focus-visible:bg-gray-700 focus-visible:border-input mb-0.5"
              />
            ) : (
              <p
                onClick={handleEditClick}
                className="font-semibold text-2xl px-1 text-neutral-700 dark:text-white cursor-pointer"
              >
                {title}
              </p>
            )}
          </form>
        )}

      </div>
    </div>
  );
};

Header.Skeleton = function HeaderSkeleton() {
  return (
    <div className="flex items-start gap-x-3 mb-6">
      <Skeleton className="h-6 w-6 mt-1 bg-neutral-200 dark:bg-gray-700" />
      <div>
        <Skeleton className="w-24 h-6 mb-1 bg-neutral-200 dark:bg-gray-700" />
        <Skeleton className="w-12 h-4 bg-neutral-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};
