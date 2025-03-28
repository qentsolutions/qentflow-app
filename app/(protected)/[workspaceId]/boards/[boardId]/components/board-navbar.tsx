"use client";

import { Board } from "@prisma/client";
import { BoardTitleForm } from "./board-title-form";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface BoardNavbarProps {
  board: Board;
}

export const BoardNavbar = ({ board }: BoardNavbarProps) => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    setBreadcrumbs([
      { label: "Boards", href: `/${currentWorkspace?.id}/boards` },
      { label: board.title },
    ]);
  }, [board, setBreadcrumbs, currentWorkspace?.id]);

  if (!board) return null;

  return (
    <div className="flex w-full flex-col">
      <div className="flex items-center">
        <Avatar className="h-10 w-10 mr-2 border rounded-none">
          <AvatarImage
            src={board?.image || `https://avatar.vercel.sh/${board.id}.png`}
            alt={board.title}
            className="object-cover"
          />
          <AvatarFallback>{board.title.charAt(0)}</AvatarFallback>
        </Avatar>
        <BoardTitleForm data={board} />
      </div>

    </div>
  );
};


