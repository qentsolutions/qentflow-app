"use client";

import { ViewSwitcher, ViewType } from "./view-switcher";
import { KanbanView } from "./kanban-view";
import { TableView } from "./table-view";
import { ListView } from "./list-view";
import { useState } from "react";
import BoardUsers from "./board-users";



interface BoardContentProps {
  boardId: string;
  lists: any;
  users: any;
}

export const BoardContent = ({ boardId, lists, users }: BoardContentProps) => {
  const [selectedView, setSelectedView] = useState<ViewType>("kanban");

  const renderView = () => {
    switch (selectedView) {
      case "kanban":
        return <KanbanView boardId={boardId} data={lists} users={users} />;
      case "table":
        return <TableView boardId={boardId} data={lists} />;
      case "list":
        return <ListView boardId={boardId} data={lists} />;
      default:
        return <KanbanView boardId={boardId} data={lists} users={users} />;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search"
              className="w-full px-4 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
            />
            <BoardUsers boardId={boardId} users={users} />
            {/* display the list of name of all users */}
          </div>
        </div>
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