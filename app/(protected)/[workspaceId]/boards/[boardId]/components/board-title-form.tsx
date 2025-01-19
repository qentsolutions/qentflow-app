"use client";

import { Board } from "@prisma/client";
import { Button } from "@/components/ui/button";

interface BoardTitleFormProps {
  data: Board;
}

export const BoardTitleForm = ({ data }: BoardTitleFormProps) => (
  <Button
    variant="default"
    className="text-xl font-bold text-gray-700 dark:text-white p-1 bg-transparent hover:bg-transparent shadow-none"
  >
    {data.title}
  </Button>
);
