"use client";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { BoardList } from "./components/board-list";
import { useEffect } from "react";

const BoardPage = () => {
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Boards" }]);
  }, [setBreadcrumbs]);

  return (
    <div className="w-full h-[calc(100vh-70px)]">
      <div className="p-2 w-full">
        <BoardList />
      </div>
    </div>
  );
};

export default BoardPage;
