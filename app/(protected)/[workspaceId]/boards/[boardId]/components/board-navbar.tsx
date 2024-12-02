"use client";

import { Board } from "@prisma/client";
import { BoardTitleForm } from "./board-title-form";
import { BoardOptions } from "./board-options";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useEffect } from "react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

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
  }, [board, setBreadcrumbs]);


  if (!board) return null;

  
  return (
    <div className="flex items-center" >
      <BoardTitleForm data={board} />
      <div className="ml-2">
        <BoardOptions boardId={board.id} />
      </div>
    </div>
  );
};