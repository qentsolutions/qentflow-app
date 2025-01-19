"use client";

import { ViewSwitcher, ViewType } from "./view-switcher";
import { KanbanView } from "./kanban-view";
import { useState, useMemo } from "react";
import BoardUsers from "./board-users";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { CheckIcon, ChevronDown, Plus, RefreshCcw, Search, TagIcon, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useBoardFilters } from "@/hooks/use-board-filters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import CreateTagForm from "./create-tag-form";
import { ListView } from "./list-view";
import { useRouter } from "next/navigation";

interface BoardContentProps {
  boardId: string;
  lists: any;
  users: any;
}

export const BoardContent = ({ boardId, lists, users }: BoardContentProps) => {
  const [selectedView, setSelectedView] = useState<ViewType>("kanban");
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const router = useRouter();

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

  const selectedUserData = useMemo(
    () => users.find((user: any) => user.id === selectedUser),
    [selectedUser, users]
  );

  const filteredTags = useMemo(
    () => availableTags?.filter((tag: any) =>
      tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())
    ),
    [availableTags, tagSearchTerm]
  );

  const handleUserSelect = (userId: string) => {
    setSelectedUser(selectedUser === userId ? null : userId);
  };

  const renderView = () => {
    const filteredLists = getFilteredLists();
    return selectedView === "kanban" ? (
      <KanbanView boardId={boardId} data={filteredLists} users={users} />
    ) : (
      <ListView boardId={boardId} data={filteredLists} users={users} />
    );
  };

  const RefreshPage = () => {
    router.refresh();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search card title..."
                className="w-[300px] pl-9 bg-background focus-visible:ring-blue-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <BoardUsers
              boardId={boardId}
              users={users}
              onUserSelect={handleUserSelect}
              selectedUser={selectedUser}
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <TagIcon className="h-4 w-4 text-gray-500" />
                  Tags
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="start">
                <div className="p-3 border-b">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search tags..."
                      value={tagSearchTerm}
                      className="h-8 focus-visible:ring-blue-400"
                      onChange={(e) => setTagSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <ScrollArea className="h-44">
                  <div className="p-2">
                    {filteredTags?.length === 0 ? (
                      <div className="text-center p-4 text-sm text-muted-foreground">
                        No tags found
                      </div>
                    ) : (
                      filteredTags?.map((tag: any) => (
                        <div
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={cn(
                            "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                            selectedTags.includes(tag.id)
                              ? "bg-secondary"
                              : "hover:bg-secondary/50"
                          )}
                        >
                          <div className={`flex items-center gap-2`}>
                            <div
                              className={cn(`w-2 h-2 rounded-full`)}
                              style={{ backgroundColor: tag?.color || '#ff0000' }}
                            />
                            <span className="text-sm font-medium">{tag.name}</span>
                          </div>
                          {selectedTags.includes(tag.id) && (
                            <CheckIcon className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <Separator />
                <div className="p-2">
                  <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <Plus className="mr-2 h-4 w-4" />
                        Create new tag
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="flex items-center justify-center flex-col">
                      <DialogHeader>
                        <DialogTitle className="my-2">Create New Tag</DialogTitle>
                      </DialogHeader>
                      <CreateTagForm boardId={boardId} />
                    </DialogContent>
                  </Dialog>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 flex-wrap">
              {selectedUserData && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => setSelectedUser(null)}
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage
                      src={selectedUserData?.image}
                      alt={selectedUserData?.name}
                    />
                    <AvatarFallback>
                      {selectedUserData?.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>Filtered by user</span>
                  <X className="h-3 w-3 cursor-pointer" onClick={() => setSelectedUser(null)} />
                </Badge>
              )}
              {selectedTags.map((tagId) => {
                const tag = availableTags?.find((t: any) => t.id === tagId);
                return tag ? (
                  <Badge
                    key={tagId}
                    className={cn("flex items-center gap-2 text-white")}
                    style={{ backgroundColor: tag?.color || '#ff0000' }}
                  >
                    {tag.name}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-white/80"
                      onClick={() => toggleTag(tagId)}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>
        </div>
        <ViewSwitcher
          selectedView={selectedView}
          onViewChange={setSelectedView}
        />
        <Button onClick={RefreshPage} variant="outline">
          <RefreshCcw />
        </Button>
      </div>
      <main className="w-full max-w-screen shadow-sm overflow-x-auto bg-background border">
        {renderView()}
      </main>
    </>
  );
};
