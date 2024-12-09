"use client";

import { ElementRef, useRef, useState } from "react";
import { toast } from "sonner";
import { Board } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/components/form/form-input";
import { updateBoard } from "@/actions/tasks/update-board";
import { useAction } from "@/hooks/use-action";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface BoardTitleFormProps {
  data: Board;
}

export const BoardTitleForm = ({ data }: BoardTitleFormProps) => {
  
  return (
    <Button
      variant="default"
      className="bg-transparent text-lg font-bold shadow-none hover:bg-white text-gray-700  h-auto w-auto p-1"
    >
      {data.title}
    </Button>
  );
};