"use client";

import { ElementRef, useRef, useState } from "react";
import { toast } from "sonner"; // Si tu utilises un système de notification
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { createTag } from "@/actions/tasks/create-tag";
import { useAction } from "@/hooks/use-action";

interface CreateTagFormProps {
  boardId: string;
}

const CreateTagForm = ({ boardId }: CreateTagFormProps) => {
  const { execute } = useAction(createTag, {
    onSuccess: () => {
      toast.success("Tag created successfully!");
      setTagName(""); // Réinitialise le champ
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
    <form action={onSubmit} ref={formRef} className="flex items-center gap-2">
      <FormInput
        ref={inputRef}
        id="tagName"
        onBlur={onBlur}
        defaultValue={tagName}
        onChange={(e) => setTagName(e.target.value)}
        placeholder="Enter tag name"
        className="text-lg px-[7px] py-1 h-7 bg-gray-50 focus-visible:outline-none focus-visible:ring-transparent border"
      />
      <Button
        type="submit"
        className="h-auto px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Create Tag
      </Button>
    </form>
  );
};

export default CreateTagForm;
