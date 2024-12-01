"use client";

import { BoardList } from "./components/board-list";


const BoardPage = () => {

  return (
    <div className="w-full mb-20">
      <div className="px-2 md:px-4 w-full">
          <BoardList />
      </div>
    </div>
  );
};

export default BoardPage;
