"use client";

import { ViewSwitcher, ViewType } from "./view-switcher";
import { KanbanView } from "./kanban-view";
import { TableView } from "./table-view";
import { ListView } from "./list-view";
import { useState, useCallback } from "react";
import BoardUsers from "./board-users";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { ChevronDown, TagIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface BoardContentProps {
  boardId: string;
  lists: any;
  users: any;
}

export const BoardContent = ({ boardId, lists, users }: BoardContentProps) => {
  const [selectedView, setSelectedView] = useState<ViewType>("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // Fonction pour filtrer les listes en fonction du terme de recherche et de l'utilisateur sélectionné
  const getFilteredLists = useCallback(() => {
    return lists.map((list: any) => ({
      ...list,
      cards: list.cards.filter((card: any) => {
        const matchesSearch = card.title
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesUser = selectedUser
          ? card.assignedUserId === selectedUser
          : true;
        return matchesSearch && matchesUser;
      }),
    }));
  }, [lists, searchTerm, selectedUser]);

  const { data: availableTags } = useQuery({
    queryKey: ["available-tags", boardId],
    queryFn: () => fetcher(`/api/boards/tags?boardId=${boardId}`),
  });

  // Gestionnaire pour la sélection d'un utilisateur
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

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <Input
              type="text"
              placeholder="Search cards..."
              className="w-full px-4 py-2 text-sm text-gray-800 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring focus:ring-blue-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedUser(null);
                    }}
                    className="ml-1"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
            <BoardUsers 
              boardId={boardId} 
              users={users} 
              onUserSelect={handleUserSelect}
              selectedUser={selectedUser}
            />
            <Popover>
              <PopoverTrigger className="ml-2 flex items-center text-sm text-gray-500 p-2 hover:bg-gray-100">
                Tags <ChevronDown size={12} className="ml-1" />
              </PopoverTrigger>
              <PopoverContent>
                {availableTags?.map((tag: any) => (
                  <div
                    key={tag.id}
                    className="flex items-center justify-between py-1 rounded-md"
                  >
                    <div className="flex items-center text-sm space-x-3">
                      <TagIcon size={14} />
                      <span className="font-medium">{tag.name}</span>
                    </div>
                  </div>
                ))}
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
