"use client";

import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { BoardList } from "./components/board-list";
import { useEffect } from "react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";


const BoardPage = () => {
  const { setBreadcrumbs } = useBreadcrumbs();
  const { currentWorkspace } = useCurrentWorkspace();

  useEffect(() => {
    setBreadcrumbs([{ label: "Boards", href: `${currentWorkspace?.id}/boards` }]);
  }, [setBreadcrumbs]);

  return (
    <div className="w-full mb-20">
      <div className="px-2 md:px-4 w-full">
        <BoardList />
      </div>
    </div>
  );
};

export default BoardPage;
