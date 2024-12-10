"use client";

import { ElementRef, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { FormInput } from "./form-input";
import { FormSubmit } from "./form-submit";
import { createBoard } from "@/actions/tasks/create-board";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "../ui/dialog";
import { PlusCircle } from "lucide-react";

interface FormPopoverProps {
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  workspaceId: string;
};

export const FormPopover = ({
  children,
  side = "bottom",
  align,
  sideOffset = 0,
  workspaceId,
}: FormPopoverProps) => {
  const router = useRouter();
  const closeRef = useRef<ElementRef<"button">>(null);
  const { currentWorkspace } = useCurrentWorkspace();

  const { execute, fieldErrors } = useAction(createBoard, {
    onSuccess: (data) => {
      toast.success("Board created!");
      closeRef.current?.click();
      router.push(`/${workspaceId}/boards/${data.id}`);
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;

    execute({ title, workspaceId });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent
        className="w-80 pt-3"
      >
        <DialogTitle>
          <div className="text-xl mt-4 font-medium text-center text-neutral-600 pb-4">
            Create board
          </div>
        </DialogTitle>

        <form action={onSubmit} className="space-y-4">
          <div className="space-y-4">
            <FormInput
              id="title"
              label=""
              type="text"
              errors={fieldErrors}
              className="text-xs font-normal"
              placeholder="Board title"
            />
          </div>
          <FormSubmit className="w-full bg-blue-500 text-white">
            <PlusCircle /> Create
          </FormSubmit>
        </form>
      </DialogContent>
    </Dialog>
  );
};
