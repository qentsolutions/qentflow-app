"use client";
import { ViewSwitcher, type ViewType } from "./view-switcher";
import { KanbanView } from "./kanban-view";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import {
  RefreshCcw,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  User,
  Plus,
  CheckIcon,
  Settings2,
  Flag,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useBoardFilters } from "@/hooks/use-board-filters";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ListView } from "./list-view";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateTagForm from "./create-tag-form";
import { TableView } from "./table-view";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BoardContentProps {
  boardId: string;
  lists: any;
  users: any;
}

export const BoardContent = ({ boardId, lists, users }: BoardContentProps) => {
  // Récupérer la vue sauvegardée depuis le localStorage ou utiliser "kanban" par défaut
  const initialView = typeof window !== "undefined" ? localStorage.getItem("selectedView") || "kanban" : "kanban";
  const [selectedView, setSelectedView] = useState<ViewType>(initialView as ViewType);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
  const [isArchived, setIsArchived] = useState(false); // Nouvel état pour le filtre "Archived"
  const router = useRouter();

  // Add state for visible fields
  const [visibleFields, setVisibleFields] = useState({
    title: true,
    priority: true,
    assignee: true,
    startDate: true,
    dueDate: true,
    tasks: true,
    tags: true,
  });

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
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
  } = useBoardFilters({ lists, isArchived }); // Passer isArchived au hook

  const { data: availableTags } = useQuery({
    queryKey: ["available-tags", boardId],
    queryFn: () => fetcher(`/api/boards/tags?boardId=${boardId}`),
  });

  const filteredTags = useMemo(
    () => availableTags?.filter((tag: any) => tag.name.toLowerCase().includes(tagSearchTerm.toLowerCase())),
    [availableTags, tagSearchTerm]
  );

  const filteredUsers = useMemo(
    () => users.filter((user: any) => user.name.toLowerCase().includes(userSearchTerm.toLowerCase())),
    [users, userSearchTerm]
  );

  const renderView = () => {
    const filteredLists = getFilteredLists();

    if (selectedView === "kanban") {
      return <KanbanView boardId={boardId} data={filteredLists} users={users} />;
    }
    if (selectedView === "list") {
      return <ListView boardId={boardId} data={filteredLists} users={users} visibleFields={visibleFields} />;
    }
    if (selectedView === "table") {
      return <TableView boardId={boardId} data={filteredLists} visibleFields={visibleFields} users={users} />;
    }
    return <KanbanView boardId={boardId} data={filteredLists} users={users} />;
  };

  const RefreshPage = () => {
    router.refresh();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedUser) count++;
    if (selectedPriority) count++;
    if (selectedTags.length > 0) count++;
    if (isArchived) count++; // Ajouter le filtre "Archived" au compteur
    return count;
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "LOW":
        return <Flag className="h-4 w-4 text-green-500" />;
      case "MEDIUM":
        return <Flag className="h-4 w-4 text-yellow-500" />;
      case "HIGH":
        return <Flag className="h-4 w-4 text-red-500" />;
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const handleSort = (newSortBy: string) => {
    if (sortBy === newSortBy) {
      if (sortDirection === "desc") {
        setSortBy(null);
        setSortDirection("asc");
      } else {
        setSortDirection("desc");
      }
    } else {
      setSortBy(newSortBy);
      setSortDirection("asc");
    }
  };

  const sortOptions = [
    { label: "Start Date", value: "startDate" },
    { label: "Due Date", value: "dueDate" },
  ];

  const toggleField = (field: keyof typeof visibleFields) => {
    setVisibleFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const clearSelectedTags = () => {
    selectedTags.forEach((tagId) => toggleTag(tagId));
  };

  const clearAllFilters = () => {
    setSelectedUser(null);
    setSelectedPriority(null);
    setSearchTerm("");
    clearSelectedTags(); // Réinitialise les tags sélectionnés
    setIsArchived(false); // Réinitialiser le filtre "Archived"
  };

  // Sauvegarder la vue sélectionnée dans le localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedView", selectedView);
    }
  }, [selectedView]);

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cards..."
              className="w-[250px] pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3 gap-1">
                <Filter className="h-4 w-4" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-1 px-1 hover:bg-blue-500 py-0 text-xs bg-blue-500 text-white">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[600px] p-4" align="start">
              <div className="grid grid-cols-3 gap-4">
                {/* Users Section */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Assigned Users</h4>
                  <Input
                    placeholder="Search users..."
                    value={userSearchTerm}
                    className="mb-2 h-8 text-sm"
                    onChange={(e) => setUserSearchTerm(e.target.value)}
                  />
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-1">
                      <div
                        onClick={() => setSelectedUser(selectedUser === "unassigned" ? null : "unassigned")}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm",
                          selectedUser === "unassigned" ? "bg-secondary" : "hover:bg-secondary/50"
                        )}
                      >
                        <User className="h-4 w-4" />
                        <span>Unassigned</span>
                      </div>
                      {filteredUsers.map((user: any) => (
                        <div
                          key={user.id}
                          onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
                          className={cn(
                            "flex items-center gap-2 p-2 rounded-md cursor-pointer text-sm",
                            selectedUser === user.id ? "bg-blue-50" : "hover:bg-secondary/50"
                          )}
                        >
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={user.image} />
                            <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Priority Section */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Priority Level</h4>
                  <div className="space-y-1">
                    {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((priority) => (
                      <div
                        key={priority}
                        onClick={() => setSelectedPriority(selectedPriority === priority ? null : priority)}
                        className={cn(
                          "flex items-center gap-2 p-2 rounded-md font-normal cursor-pointer text-sm",
                          selectedPriority === priority ? "bg-blue-50" : "hover:bg-secondary/50"
                        )}
                      >
                        {getPriorityIcon(priority)}
                        <span>{priority}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tags Section */}
                <div>
                  <div className="flex justify-between mb-2">
                    <h4 className="text-sm font-semibold">Tags</h4>
                    <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <CreateTagForm boardId={boardId} />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <Input
                    placeholder="Search tags..."
                    value={tagSearchTerm}
                    className="mb-2 h-8 text-sm"
                    onChange={(e) => setTagSearchTerm(e.target.value)}
                  />
                  <ScrollArea className="h-[180px]">
                    <div className="space-y-1">
                      {filteredTags?.length === 0 ? (
                        <div className="text-center p-2 text-sm text-muted-foreground">No tags found</div>
                      ) : (
                        filteredTags?.map((tag: any) => (
                          <div
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={cn(
                              "flex items-center justify-between p-2 rounded-md cursor-pointer text-sm",
                              selectedTags.includes(tag.id) ? "bg-blue-50" : "hover:bg-secondary/50"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag?.color || "#9b87f5" }}
                              />
                              <span>{tag.name}</span>
                            </div>
                            {selectedTags.includes(tag.id) && <CheckIcon className="h-4 w-4 text-primary" />}
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>

                {/* Archived Section */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Archived</h4>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="archived"
                      checked={isArchived}
                      onCheckedChange={() => setIsArchived(!isArchived)}
                    />
                    <label htmlFor="archived" className="text-sm">
                      Archived
                    </label>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3 gap-1 p-4">
                <ArrowUpDown className="h-4 w-4" />
                Sort
                {sortBy && (
                  <Badge variant="secondary" className="bg-blue-50 ml-1 px-1 py-0 text-xs">
                    {sortBy}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0" align="start">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm ml-1">Sort by</p>
                  <ArrowUpDown className="h-4 w-4" />
                </div>
                <Separator className="my-2" />
                <div className="space-y-1">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      className={cn(
                        "w-full justify-between font-normal",
                        sortBy === option.value && "bg-blue-50 text-accent-foreground"
                      )}
                      onClick={() => handleSort(option.value)}
                    >
                      {option.label}
                      {sortBy === option.value &&
                        (sortDirection === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />)}
                    </Button>
                  ))}
                </div>
              </div>
            </PopoverContent>
          </Popover>
          {getActiveFiltersCount() > 0 && (
            <Button variant="outline" size="sm" className="h-9 px-3 gap-1" onClick={clearAllFilters}>
              Clear All Filters
            </Button>
          )}
          {(selectedView === "list" || selectedView === "table") && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 px-3 gap-1">
                  <Settings2 className="h-4 w-4" />
                  Fields
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px]" align="start">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm ml-1">Visible Fields</p>
                    <Settings2 className="h-4 w-4" />
                  </div>
                  <Separator className="my-2" />
                  <div className="space-y-2">
                    {Object.entries(visibleFields).map(([field, isVisible]) => (
                      <div key={field} className="flex items-center space-x-2">
                        <Switch
                          id={field}
                          checked={isVisible}
                          onCheckedChange={() => toggleField(field as keyof typeof visibleFields)}
                        />
                        <label htmlFor={field} className="text-sm capitalize">
                          {field.replace(/([A-Z])/g, " $1").trim()}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ViewSwitcher selectedView={selectedView} onViewChange={setSelectedView} />
          <Tooltip>
            <TooltipTrigger>
              <Button onClick={RefreshPage} variant="outline" size="icon" className="h-9 w-9 mt-2">
                <RefreshCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              Refresh
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <main className="w-full max-w-screen shadow-sm overflow-x-auto bg-background h-[75vh] px-2 mt-4">
        {renderView()}
      </main>
    </>
  );
};
