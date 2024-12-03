"use client";

import { ViewSwitcher, ViewType } from "./view-switcher";
import { KanbanView } from "./kanban-view";
import { TableView } from "./table-view";
import { ListView } from "./list-view";
import { useState } from "react";

interface BoardContentProps {
  boardId: string;
  lists: any[]; // Remplacer any[] par le bon type quand disponible
}

export const BoardContent = ({ boardId, lists }: BoardContentProps) => {
  const [selectedView, setSelectedView] = useState<ViewType>("kanban");

  const renderView = () => {
    switch (selectedView) {
      case "kanban":
        return <KanbanView boardId={boardId} data={lists} />;
      case "table":
        return <TableView boardId={boardId} />;
      case "list":
        return <ListView boardId={boardId} />;
      default:
        return <KanbanView boardId={boardId} data={lists} />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-end gap-4 mb-4">
        <ViewSwitcher 
          selectedView={selectedView}
          onViewChange={setSelectedView}
        />
      </div>
      <main className="w-full max-w-screen bg-[#f2f5f9] border overflow-x-auto">
        {renderView()}
      </main>
    </>
  );
};