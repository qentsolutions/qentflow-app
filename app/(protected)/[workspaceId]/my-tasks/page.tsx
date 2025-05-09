"use client"
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowUpDown,
  Filter,
  Tag,
  KanbanSquare,
  X,
  ChevronRight,
  LayoutDashboard,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import CardPage from "../boards/[boardId]/cards/[cardId]/page";
import { useMediaQuery } from "usehooks-ts";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type TaskCardProps = {
  list: {
    board: {
      title: string;
      id: string;
    };
  };
  tags?: any[];
  tasks?: any[];
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  priority?: string;
  title: string;
  description?: string;
  id: string;
};

const getPriorityBadge = (priority: string | null) => {
  if (!priority) return null

  const colors: Record<string, { bg: string; text: string }> = {
    LOW: { bg: "bg-green-100", text: "text-green-500" },
    MEDIUM: { bg: "bg-orange-100", text: "text-orange-600" },
    HIGH: { bg: "bg-red-100", text: "text-red-600" },
    CRITICAL: { bg: "bg-red-200", text: "text-red-600" },
  }

  const style = colors[priority] || { bg: "bg-gray-100", text: "text-gray-500" }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}
    >
      {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
    </span>
  )
}

const getPriorityColor = (priority: string | null) => {
  switch (priority) {
    case "LOW":
      return "bg-green-50 border-green-200 text-green-700";
    case "MEDIUM":
      return "bg-yellow-50 border-yellow-200 text-yellow-700";
    case "HIGH":
      return "bg-orange-50 border-orange-200 text-orange-700";
    case "CRITICAL":
      return "bg-red-50 border-red-200 text-red-700";
    default:
      return "bg-gray-50 border-gray-200 text-gray-700";
  }
};

export default function MyTasksPage() {
  const { currentWorkspace } = useCurrentWorkspace();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCard, setSelectedCard] = useState<TaskCardProps | null>(null);
  const [sortByDueDate, setSortByDueDate] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showMobileDetail, setShowMobileDetail] = useState(false);
  const [taskDetails, setTaskDetails] = useState<{ [key: string]: TaskCardProps }>({});
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    document.title = "My Tasks - Task Manager";
  }, []);

  useEffect(() => {
    setBreadcrumbs([{ label: "My Tasks" }]);
  }, [setBreadcrumbs]);

  useEffect(() => {
    if (selectedCard) {
      document.title = `Task: ${selectedCard.title} - Task Manager`;
    }
  }, [selectedCard]);

  const { data: assignedCards, isLoading } = useQuery({
    queryKey: ["assigned-cards", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/cards/current-user-card?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  useEffect(() => {
    if (assignedCards) {
      const details = assignedCards.reduce((acc: any, card: any) => {
        acc[card.id] = card;
        return acc;
      }, {});
      setTaskDetails(details);
    }
  }, [assignedCards]);

  const groupedCards = useMemo(() => {
    return assignedCards?.reduce((acc: any, card: any) => {
      const boardTitle = card.list.board.title;
      if (!acc[boardTitle]) {
        acc[boardTitle] = [];
      }
      acc[boardTitle].push(card);
      return acc;
    }, {});
  }, [assignedCards]);

  const filteredGroupedCards = useMemo(() => {
    return groupedCards
      ? Object.entries(groupedCards).reduce((acc: any, [boardTitle, cards]: [string, any]) => {
        const filteredCards = (cards as any[]).filter((card) => {
          const matchesSearch =
            card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.description?.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesBoards = selectedBoards.length === 0 || selectedBoards.includes(card.list.board.title);
          const matchesTags =
            selectedTags.length === 0 || card.tags?.some((tag: any) => selectedTags.includes(tag.name));

          return matchesSearch && matchesBoards && matchesTags;
        });
        if (filteredCards.length > 0) {
          acc[boardTitle] = filteredCards;
        }
        return acc;
      }, {})
      : {};
  }, [groupedCards, searchTerm, selectedBoards, selectedTags]);

  const allCards = useMemo(() => Object.values(filteredGroupedCards).flat(), [filteredGroupedCards]);

  const displayedCards = useMemo(() => {
    return selectedBoards.length
      ? allCards.filter((card) => selectedBoards.includes((card as TaskCardProps).list.board.title))
      : allCards;
  }, [allCards, selectedBoards]);

  const sortedCards = useMemo(() => {
    return sortByDueDate
      ? [...displayedCards].sort((a: any, b: any) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      })
      : displayedCards;
  }, [displayedCards, sortByDueDate]);

  const allTags = useMemo(() => {
    return Array.from(
      new Set(assignedCards?.flatMap((card: any) => card.tags?.map((tag: any) => tag.name)).filter(Boolean)),
    );
  }, [assignedCards]);

  const toggleTagSelection = useCallback((tag: string) => {
    setSelectedTags((prevSelected) =>
      prevSelected.includes(tag) ? prevSelected.filter((t) => t !== tag) : [...prevSelected, tag],
    );
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchTerm("");
    setSelectedBoards([]);
    setSelectedTags([]);
    setSortByDueDate(false);
  }, []);

  const formatDate = useCallback((dateString?: string) => {
    if (!dateString) return null;

    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    if (taskDate.getTime() === today.getTime()) {
      return "Today";
    } else if (taskDate.getTime() === tomorrow.getTime()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
  }, []);

  const getTaskProgress = useCallback((card: TaskCardProps) => {
    if (!card.tasks || card.tasks.length === 0) return 0;
    return Math.round((card.tasks.filter((t) => t.completed).length / card.tasks.length) * 100);
  }, []);

  const activeFiltersCount = selectedBoards.length + selectedTags.length + (sortByDueDate ? 1 : 0);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Mobile view - Task list */}
      {isMobile && !showMobileDetail && (
        <div className="flex max-h-screen w-full flex-col bg-background">
          <div className="border-b p-4">
            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-2xl font-bold">My Tasks</h1>
              <Popover>
                <PopoverTrigger asChild>
                  <Button size="sm" variant="outline" className="h-9 gap-1">
                    <Filter className="h-4 w-4" />
                    {activeFiltersCount > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {activeFiltersCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72">
                  <FilterContent
                    sortByDueDate={sortByDueDate}
                    setSortByDueDate={setSortByDueDate}
                    groupedCards={groupedCards}
                    selectedBoards={selectedBoards}
                    setSelectedBoards={setSelectedBoards}
                    allTags={allTags}
                    selectedTags={selectedTags}
                    toggleTagSelection={toggleTagSelection}
                    clearAllFilters={clearAllFilters}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            <AnimatePresence>
              {sortedCards.length > 0 ? (
                sortedCards.map((card: any) => (
                  <TaskCard
                    key={card.id}
                    card={card}
                    isSelected={false}
                    onClick={() => {
                      setSelectedCard(taskDetails[card.id]);
                      setShowMobileDetail(true);
                    }}
                    formatDate={formatDate}
                    getTaskProgress={getTaskProgress}
                    getPriorityColor={getPriorityColor}
                    getPriorityIcon={getPriorityBadge}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </AnimatePresence>
          </ScrollArea>
        </div>
      )}

      {/* Mobile view - Task detail */}
      {isMobile && showMobileDetail && selectedCard && (
        <div className="flex h-full w-full flex-col bg-background">
          <div className="flex items-center border-b p-4">
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => setShowMobileDetail(false)}>
              <ChevronRight className="h-5 w-5 rotate-180" />
            </Button>
            <h1 className="truncate text-lg font-medium">{selectedCard.title}</h1>
          </div>
          <div className="flex-1 overflow-auto">
            <CardPage
              params={{
                cardId: selectedCard.id,
                workspaceId: currentWorkspace?.id || "",
                boardId: selectedCard.list.board.id,
              }}
              readonly={true}
              key={selectedCard.id} // Add key to ensure the component is updated
            />
          </div>
        </div>
      )}

      {/* Desktop view */}
      {!isMobile && (
        <>
          {/* Fix the "My Tasks" section */}
          <div className="w-1/3 flex-shrink-0 border-r bg-background h-screen">
            <div className="border-b p-4">
              <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">My Tasks</h1>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9 text-muted-foreground">
                      <X className="mr-1 h-4 w-4" />
                      Clear
                    </Button>
                  )}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button size="sm" variant="outline" className="h-9 gap-1">
                        <Filter className="h-4 w-4" />
                        {activeFiltersCount > 0 && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                            {activeFiltersCount}
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72">
                      <FilterContent
                        sortByDueDate={sortByDueDate}
                        setSortByDueDate={setSortByDueDate}
                        groupedCards={groupedCards}
                        selectedBoards={selectedBoards}
                        setSelectedBoards={setSelectedBoards}
                        allTags={allTags}
                        selectedTags={selectedTags}
                        toggleTagSelection={toggleTagSelection}
                        clearAllFilters={clearAllFilters}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Search tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="h-full px-2 py-2 max-h-[85vh]">
              <AnimatePresence>
                {sortedCards.length > 0 ? (
                  sortedCards.map((card: any) => (
                    <TaskCard
                      key={card.id}
                      card={card}
                      isSelected={selectedCard?.id === card.id}
                      onClick={() => setSelectedCard(taskDetails[card.id])}
                      formatDate={formatDate}
                      getTaskProgress={getTaskProgress}
                      getPriorityColor={getPriorityColor}
                      getPriorityIcon={getPriorityBadge}
                    />
                  ))
                ) : (
                  <EmptyState />
                )}
              </AnimatePresence>
            </ScrollArea>
          </div>

          {/* Scrollable task detail section */}
          <div className="flex-1 h-screen bg-background overflow-y-auto">
            {selectedCard ? (
              <CardPage
                params={{
                  cardId: selectedCard.id,
                  workspaceId: currentWorkspace?.id || "",
                  boardId: selectedCard.list.board.id,
                }}
                readonly={true}
                key={selectedCard.id} // Add key to ensure the component is updated
              />
            ) : (
              <EmptyDetailState />
            )}
          </div>
        </>
      )}
    </div>
  );
}

MyTasksPage.displayName = "MyTasksPage";

const TaskCard = ({
  card,
  isSelected,
  onClick,
  formatDate,
  getTaskProgress,
  getPriorityColor,
  getPriorityIcon,
}: {
  card: TaskCardProps;
  isSelected: boolean;
  onClick: () => void;
  formatDate: (date?: string) => string | null;
  getTaskProgress: (card: TaskCardProps) => number;
  getPriorityColor: (priority: string | null) => string;
  getPriorityIcon: (priority: string | null) => JSX.Element | null;
}) => {
  const progress = getTaskProgress(card);
  const dueDate = formatDate(card.dueDate);
  const isOverdue = card.dueDate && new Date(card.dueDate) < new Date() && progress < 100;
  const { currentWorkspace } = useCurrentWorkspace();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      layout
    >
      <Card
        className={cn(
          "mb-3 overflow-hidden transition-all hover:shadow-md m-2 cursor-pointer",
          isSelected ? "ring-2 ring-blue-500" : "ring-0",
        )}
        onClick={onClick}
      >
        <CardContent className="p-0">
          <div className="flex flex-col">
            <div className="flex items-center justify-between border-b p-3">
              <Link href={`/${currentWorkspace?.id}/boards/${card.list.board.id}`}>
                <Badge variant="outline" className="bg-background font-normal hover:bg-gray-100">
                  <LayoutDashboard className="mr-1 h-3.5 w-3.5 text-muted-foreground" />
                  {card.list.board.title}
                </Badge>
              </Link>

              {card.priority && (
                <Badge variant="outline" className={cn("font-normal border-none")}>
                  {getPriorityIcon(card.priority)}
                </Badge>
              )}
            </div>

            <div className="p-3">
              <h3 className="mb-2 font-medium">{card.title}</h3>

              {card.tags && card.tags.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {card.tags.map((tag: any) => (
                    <Badge
                      key={tag.id}
                      className="text-xs font-normal"
                      style={{
                        backgroundColor: `${tag.color}`,
                        color: `white`,
                        borderColor: `${tag.color}40`,
                      }}
                      variant="outline"
                    >
                      {tag.name}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center justify-between">
                {card.tasks && card.tasks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className={`h-full rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {card.tasks.filter((t: any) => t.completed).length}/{card.tasks.length}
                    </span>
                  </div>
                )}

                <Tooltip>
                  <TooltipTrigger>
                    {dueDate && (
                      <Badge
                        variant="outline"
                        className={cn("font-normal", isOverdue ? "bg-red-50 text-red-600 border-red-200" : "bg-background")}
                      >
                        <Calendar className="mr-1 h-3 w-3" />
                        {dueDate}
                      </Badge>
                    )}
                  </TooltipTrigger>
                  <TooltipContent>
                    <Calendar className="mr-1 h-3 w-3" />
                    <span> Due date : {dueDate}</span>
                  </TooltipContent>
                </Tooltip>

              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

TaskCard.displayName = "TaskCard";

function EmptyState() {
  return (
    <div className="flex h-[calc(100vh-180px)] flex-col items-center justify-center p-4 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-1 text-xl font-medium">No tasks found</h3>
      <p className="mb-4 max-w-md text-muted-foreground">
        Try adjusting your filters or search criteria to find what you&apos;re looking for.
      </p>
      <Button variant="outline" size="sm">
        Clear filters
      </Button>
    </div>
  );
}

EmptyState.displayName = "EmptyState";

function EmptyDetailState() {
  return (
    <div className="flex h-full flex-col items-center justify-center p-4 text-center">
      <div className="mb-4 rounded-full bg-primary/10 p-3">
        <Clock className="h-8 w-8 text-primary" />
      </div>
      <h3 className="mb-1 text-xl font-medium">Select a task</h3>
      <p className="max-w-md text-muted-foreground">Choose a task from the list to view its details</p>
    </div>
  );
}

EmptyDetailState.displayName = "EmptyDetailState";

function FilterContent({
  sortByDueDate,
  setSortByDueDate,
  groupedCards,
  selectedBoards,
  setSelectedBoards,
  allTags,
  selectedTags,
  toggleTagSelection,
  clearAllFilters,
}: {
  sortByDueDate: boolean;
  setSortByDueDate: (value: boolean) => void;
  groupedCards: any;
  selectedBoards: string[];
  setSelectedBoards: (value: string[]) => void;
  allTags: any[];
  selectedTags: string[];
  toggleTagSelection: (tag: string) => void;
  clearAllFilters: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Filters</h4>
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-0 text-muted-foreground">
          Clear all
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <h5 className="flex items-center text-sm font-medium">
          <Calendar className="mr-2 h-4 w-4" /> Date
        </h5>
        <Button
          variant={sortByDueDate ? "secondary" : "outline"}
          size="sm"
          onClick={() => setSortByDueDate(!sortByDueDate)}
          className="w-full justify-start"
        >
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {sortByDueDate ? "Clear Sort" : "Sort by Due Date"}
        </Button>
      </div>

      <Separator />

      <div className="space-y-2">
        <h5 className="flex items-center text-sm font-medium">
          <KanbanSquare className="mr-2 h-4 w-4" /> Boards
        </h5>
        <div className="grid grid-cols-1 gap-2">
          {Object.keys(groupedCards || {}).map((board) => (
            <div key={board} className="flex items-center space-x-2">
              <Checkbox
                id={`board-${board}`}
                checked={selectedBoards.includes(board)}
                onCheckedChange={() =>
                  setSelectedBoards(
                    selectedBoards.includes(board)
                      ? selectedBoards.filter((b) => b !== board)
                      : [...selectedBoards, board],
                  )
                }
              />
              <Label htmlFor={`board-${board}`} className="text-sm">
                {board}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h5 className="flex items-center text-sm font-medium">
          <Tag className="mr-2 h-4 w-4" /> Tags
        </h5>
        <div className="grid grid-cols-1 gap-2">
          {allTags.map((tag) => {
            const tagString = String(tag);
            return (
              <div key={tagString} className="flex items-center space-x-2">
                <Checkbox
                  id={`tag-${tagString}`}
                  checked={selectedTags.includes(tagString)}
                  onCheckedChange={() => toggleTagSelection(tagString)}
                />
                <Label htmlFor={`tag-${tagString}`} className="text-sm">
                  {tagString}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

FilterContent.displayName = "FilterContent";
