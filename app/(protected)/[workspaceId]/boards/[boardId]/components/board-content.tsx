"use client";

import { ViewSwitcher, ViewType } from "./view-switcher";
import { KanbanView } from "./kanban-view";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { CheckIcon, Plus, RefreshCcw, Search, X, SignalHigh, Filter, SignalLow, SignalMedium, AlertTriangle, User } from "lucide-react";
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
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const router = useRouter();

  const {
    searchTerm,
    setSearchTerm,
    selectedUser,
    setSelectedUser,
    selectedTags,
    toggleTag,
    selectedPriority,
    setSelectedPriority,
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

  const filteredUsers = useMemo(
    () => users.filter((user: any) =>
      user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    ),
    [users, userSearchTerm]
  );

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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedUser) count++;
    if (selectedPriority) count++;
    if (selectedTags.length > 0) count++;
    return count;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "LOW":
        return <SignalLow className="h-4 w-4 text-green-600" />;
      case "MEDIUM":
        return <SignalMedium className="h-4 w-4 text-yellow-600" />;
      case "HIGH":
        return <SignalHigh className="h-4 w-4 text-red-600" />;
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-4 px-6">
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

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                  {getActiveFiltersCount() > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {getActiveFiltersCount()}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[800px] p-6" align="start">
                <div className="flex gap-8">
                  {/* Users Section */}
                  <div className="flex-1">
                    <div className="mb-4">
                      <h4 className="text-base font-semibold mb-3">Assigned Users</h4>
                      <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          placeholder="Search users..."
                          value={userSearchTerm}
                          className="pl-9 h-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                        />
                      </div>
                      <ScrollArea className="h-[205px]">
                        <div className="space-y-2">
                          <div
                            onClick={() => setSelectedUser(selectedUser === "unassigned" ? null : "unassigned")}
                            className={cn(
                              "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200",
                              selectedUser === "unassigned"
                                ? "bg-gray-100 text-primary"
                                : "hover:bg-secondary/80"
                            )}
                          >
                            <Avatar className="h-6 w-6 border-2 border-primary/20">
                              <AvatarFallback><User /></AvatarFallback>
                            </Avatar>
                            <span className="font-medium">Unassigned</span>
                          </div>
                          {filteredUsers.map((user: any) => (
                            <div
                              key={user.id}
                              onClick={() => setSelectedUser(user.id)}
                              className={cn(
                                "flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all duration-200",
                                selectedUser === user.id
                                  ? "bg-gray-100 text-primary"
                                  : "hover:bg-secondary/80"
                              )}
                            >
                              <Avatar className="h-6 w-6 border-2 border-primary/20">
                                <AvatarImage src={user.image} />
                                <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{user.name}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  </div>
                  <Separator orientation="vertical" className="h-auto bg-border/60" />

                  {/* Priority Section */}
                  <div className="flex-1 space-y-2">
                    <h4 className="text-base font-semibold ">Priority Level</h4>
                    <div className="space-y-2">
                      {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((priority) => (
                        <div
                          key={priority}
                          onClick={() => setSelectedPriority(selectedPriority === priority ? null : priority)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all duration-200",
                            selectedPriority === priority
                              ? "bg-gray-100"
                              : "hover:bg-secondary/50"
                          )}
                        >
                          {getPriorityIcon(priority)}
                          <span className="font-medium">{priority}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator orientation="vertical" className="h-auto bg-border/60" />

                  {/* Tags Section */}
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <h4 className="text-base font-semibold">Tags</h4>
                      <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Create New Tag</DialogTitle>
                          </DialogHeader>
                          <CreateTagForm boardId={boardId} />
                        </DialogContent>
                      </Dialog>
                    </div>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search tags..."
                        value={tagSearchTerm}
                        className="pl-9 h-9 bg-secondary/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/30"
                        onChange={(e) => setTagSearchTerm(e.target.value)}
                      />
                    </div>
                    <ScrollArea className="h-[205px] pr-4">
                      <div className="space-y-1.5">
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
                                "flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200",
                                selectedTags.includes(tag.id)
                                  ? "bg-gray-100"
                                  : "hover:bg-secondary/80"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: tag?.color || '#9b87f5' }}
                                />
                                <span className="font-medium">{tag.name}</span>
                              </div>
                              {selectedTags.includes(tag.id) && (
                                <CheckIcon className="h-4 w-4 text-primary" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </div>
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
              {selectedPriority && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-2"
                  onClick={() => setSelectedPriority(null)}
                >
                  <span>Priority: {selectedPriority}</span>
                  <X className="h-3 w-3 cursor-pointer" />
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
      <main className="w-full max-w-screen shadow-sm overflow-x-auto bg-background h-full px-2">
        {renderView()}
      </main>
    </>
  );
};