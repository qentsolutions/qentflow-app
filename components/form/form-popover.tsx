"use client";

import { ElementRef, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { FormInput } from "./form-input";
import { FormSubmit } from "./form-submit";
import { createBoard } from "@/actions/tasks/create-board";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from 'lucide-react';

interface FormPopoverProps {
  children: React.ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  workspaceId: string;
}

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
      toast.success("Project created successfully!");
      closeRef.current?.click();
      router.push(`/${workspaceId}/boards/${data.id}`);
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  const onSubmit = (formData: FormData) => {
    const title = formData.get("title") as string;
    execute({
      title,
      workspaceId,
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-center text-gray-800">
            Create New Board
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            Add a new board to organize your projects and tasks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={(e) => {
          e.preventDefault();
          onSubmit(new FormData(e.currentTarget));
        }} className="space-y-6 mt-4">
          <FormInput
            id="title"
            label=""
            type="text"
            errors={fieldErrors}
            className="text-sm focus-visible:ring-blue-400"
            placeholder="Enter board title"
          />
          <FormSubmit className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:text-white text-white transition-colors duration-200 flex items-center justify-center gap-2 py-2 rounded-md">
            <PlusCircle className="w-5 h-5" />
            Create Board
          </FormSubmit>
        </form>
      </DialogContent>
    </Dialog>
  );
};