"use client";

import { ViewSwitcher, ViewType } from "./view-switcher";
import { KanbanView } from "./kanban-view";
import { TableView } from "./table-view";
import { ListView } from "./list-view";
import { useState } from "react";
import BoardUsers from "./board-users";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { ChevronDown, TagIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";



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

  const { data: availableTags } = useQuery({
    queryKey: ["available-tags", boardId],
    queryFn: () => fetcher(`/api/boards/tags?boardId=${boardId}`),
  });

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
            <Popover>
              <PopoverTrigger className="ml-2 flex items-center text-sm text-gray-500 p-2 hover:bg-gray-100">
                Tags <ChevronDown size={12} className="ml-1" />
              </PopoverTrigger>
              <PopoverContent>
                {availableTags?.map((tag: any) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center space-x-3">
                      <TagIcon className="w-5 h-5" style={{ color: tag.color }} />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </div>
                ))
                }
              </PopoverContent>
            </Popover>

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