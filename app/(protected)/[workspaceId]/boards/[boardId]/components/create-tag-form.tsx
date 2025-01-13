"use client";

import { ElementRef, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { createTag } from "@/actions/tasks/create-tag";
import { useAction } from "@/hooks/use-action";
import { useQueryClient } from "@tanstack/react-query";
import { PlusCircle } from "lucide-react";

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
      setTagColor("#3B82F6");
    },
    onError: (error) => {
      toast.error(error || "Failed to create tag");
    },
  });

  const formRef = useRef<ElementRef<"form">>(null);
  const inputRef = useRef<ElementRef<"input">>(null);

  const [tagName, setTagName] = useState("");
  const [tagColor, setTagColor] = useState("#3B82F6");

  const onSubmit = (formData: FormData) => {
    const name = formData.get("tagName") as string;
    const color = formData.get("tagColor") as string || tagColor;

    if (!name) {
      toast.error("Tag name is required.");
      return;
    }

    execute({ name, boardId, color });
  };

  return (
    <form 
      action={onSubmit} 
      ref={formRef} 
      className="flex flex-col sm:flex-row items-center gap-4 p-6 bg-white rounded-lg shadow-sm border border-gray-100"
    >
      <div className="flex items-center gap-4 w-full">
        <FormInput
          ref={inputRef}
          id="tagName"
          defaultValue={tagName}
          onChange={(e) => setTagName(e.target.value)}
          placeholder="Enter tag name"
          className="flex-1 text-lg px-4 py-2 bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 border border-gray-200 rounded-lg transition-all"
        />
        
        <div className="relative">
          <input
            type="color"
            id="tagColor"
            name="tagColor"
            value={tagColor}
            onChange={(e) => setTagColor(e.target.value)}
            className="w-12 h-12 p-0 rounded-lg cursor-pointer border border-gray-200 transition-all hover:border-purple-400"
          />
          <div 
            className="absolute inset-0 pointer-events-none rounded-lg"
            style={{ boxShadow: `0 0 0 2px ${tagColor}33` }}
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm flex items-center gap-2 group"
      >
        <PlusCircle className="w-5 h-5 transition-transform group-hover:rotate-90" />
        Create Tag
      </Button>
    </form>
  );
};

export default CreateTagForm;