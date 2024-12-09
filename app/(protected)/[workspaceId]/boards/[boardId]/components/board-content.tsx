"use client";

import { ViewSwitcher, ViewType } from "./view-switcher";
import { KanbanView } from "./kanban-view";
import { TableView } from "./table-view";
import { ListView } from "./list-view";
import { useState } from "react";
import BoardUsers from "./board-users";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { ChevronDown, TagIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBoardFilters } from "@/hooks/use-board-filters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface BoardContentProps {
  boardId: string;
  lists: any;
  users: any;
}

export const BoardContent = ({ boardId, lists, users }: BoardContentProps) => {
  const [selectedView, setSelectedView] = useState<ViewType>("kanban");

  const {
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    selectedTags,
    toggleTag,
    getFilteredLists,
  } = useBoardFilters({ lists });

  const { data: availableTags } = useQuery({
    queryKey: ["available-tags", boardId],
    queryFn: () => fetcher(`/api/boards/tags?boardId=${boardId}`),
  });

  const handleUserSelect = (userId: string) => {
    setSelectedUser(selectedUser === userId ? null : userId);
  };

  const renderView = () => {
    const filteredLists = getFilteredLists();

    switch (selectedView) {
      case "kanban":
        return <KanbanView boardId={boardId} data={filteredLists} users={users} />;
      case "table":
        return <TableView boardId={boardId} data={filteredLists} />;
      case "list":
        return <ListView boardId={boardId} data={filteredLists} />;
      default:
        return <KanbanView boardId={boardId} data={filteredLists} users={users} />;
    }
  };

  function getRandomColor(id: string): string {
    const colors = [
      "bg-red-500",
      "bg-green-500",
      "bg-blue-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = id
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search cards..."
              className="w-52 px-4 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <BoardUsers
              boardId={boardId}
              users={users}
              onUserSelect={handleUserSelect}
              selectedUser={selectedUser}
            />
            <Popover>
              <PopoverTrigger className="ml-2 flex items-center text-sm text-gray-500 p-2 hover:bg-gray-100 rounded-md">
                <TagIcon className="mr-2 h-4 w-4" />
                Tags
                <ChevronDown size={12} className="ml-1" />
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <ScrollArea className="h-72">
                  <div className="space-y-2">
                    {availableTags?.map((tag: any) => (
                      <div
                        key={tag.id}
                        className={cn(
                          "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                          selectedTags.includes(tag.id) ? "bg-gray-100" : "hover:bg-gray-50"
                        )}
                        onClick={() => toggleTag(tag.id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            getRandomColor(tag.id)
                          )} />
                          <span className="text-sm font-medium">{tag.name}</span>
                        </div>
                        {selectedTags.includes(tag.id) && (
                          <CheckIcon className="h-4 w-4 text-blue-500" />
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
            <div className="flex items-center gap-2">
              {selectedUser && users.find((u: any) => u.id === selectedUser) && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => setSelectedUser(null)}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={users.find((u: any) => u.id === selectedUser)?.image}
                      alt={users.find((u: any) => u.id === selectedUser)?.name}
                    />
                    <AvatarFallback>
                      {users.find((u: any) => u.id === selectedUser)?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>Filtered by user</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedUser(null)} />
                </Badge>
              )}
              {selectedTags.map((tagId) => {
                const tag = availableTags?.find((t: any) => t.id === tagId);
                if (!tag) return null;
                return (
                  <Badge
                    key={tagId}
                    variant="secondary"
                    className={cn(
                      "flex items-center cursor-pointer gap-2 hover:bg-black",
                      getRandomColor(tagId)
                    )}
                  >
                    <span className="text-white">{tag.name}</span>
                    <X
                      className="h-3 w-3 cursor-pointer text-white"
                      onClick={() => toggleTag(tagId)}
                    />
                  </Badge>
                );
              })}
            </div>
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

import { CheckIcon } from "@radix-ui/react-icons";
