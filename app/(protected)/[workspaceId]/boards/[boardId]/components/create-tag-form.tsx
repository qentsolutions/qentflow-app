"use client";

import { ElementRef, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { createTag } from "@/actions/tasks/create-tag";
import { useAction } from "@/hooks/use-action";
import { useQueryClient } from "@tanstack/react-query";

interface CreateTagFormProps {
  boardId: string;
}

const CreateTagForm = ({ boardId }: CreateTagFormProps) => {
  const queryClient = useQueryClient();

  const { execute } = useAction(createTag, {
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["available-tags", boardId],
      });
      toast.success("Tag created successfully!");
      setTagName(""); 
    },
    onError: (error) => {
      toast.error(error || "Failed to create tag");
    },
  });

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [tagName, setTagName] = useState("");

  const onSubmit = (formData: FormData) => {
    const name = formData.get("tagName") as string;
    if (!name) {
      toast.error("Tag name is required.");
      return;
    }

    execute({ name, boardId });
  };

  const onBlur = () => {
    formRef.current?.requestSubmit();
  };

  return (
    <form action={onSubmit} ref={formRef} className="flex items-center gap-2 p-4">
      <FormInput
        ref={inputRef}
        id="tagName"
        onBlur={onBlur}
        defaultValue={tagName}
        onChange={(e) => setTagName(e.target.value)}
        placeholder="Enter tag name"
        className="text-lg px-[7px] py-1 w-56 h-9 bg-gray-50 focus-visible:outline-none focus-visible:ring-transparent border"
      />
      <Button
        type="submit"
        className="h-auto px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Tag
      </Button>
    </form>
  );
};

export default CreateTagForm;
