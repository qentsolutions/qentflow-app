"use client";

import { Board } from "@prisma/client";
import { Button } from "@/components/ui/button";

interface BoardTitleFormProps {
  data: Board;
}

export const BoardTitleForm = ({ data }: BoardTitleFormProps) => {
  
  return (
    <Button
      variant="default"
      className="bg-transparent text-lg font-bold shadow-none text-gray-700 hover:bg-transparent dark:text-white h-auto w-auto p-1"
    >
      {data.title}
    </Button>
  );
};