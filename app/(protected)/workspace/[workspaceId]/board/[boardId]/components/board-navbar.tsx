"use client";

import { Board } from "@prisma/client";
import { BoardTitleForm } from "./board-title-form";
import { BoardOptions } from "./board-options";

interface BoardNavbarProps {
  board: Board;
}

export const BoardNavbar = ({ board }: BoardNavbarProps) => {
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