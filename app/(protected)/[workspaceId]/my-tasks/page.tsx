"use client";
import { useEffect, useState } from "react";
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
  AlertCircle,
  AlertTriangle,
  ArrowUpDown,
  Filter,
  Tag,
  KanbanSquare,
  Flag,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import CardPage from "../boards/[boardId]/cards/[cardId]/page";

const getPriorityIcon = (priority: string | null) => {
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

type Card = {
  list: {
    board: {
      title: string;
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

export default function MyTasksPage() {
  const { currentWorkspace } = useCurrentWorkspace();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCard, setSelectedCard] = useState<any>(null);
  const [sortByDueDate, setSortByDueDate] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]); // Nouveaux tags sélectionnés

  useEffect(() => {
    document.title = "My Tasks - QentFlow";
  }, []);

  useEffect(() => {
    setBreadcrumbs([{ label: "My Tasks" }]);
  }, [setBreadcrumbs]);

  const { data: assignedCards, isLoading } = useQuery({
    queryKey: ["assigned-cards", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/cards/current-user-card?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  const groupedCards = assignedCards?.reduce((acc: any, card: any) => {
    const boardTitle = card.list.board.title;
    if (!acc[boardTitle]) {
      acc[boardTitle] = [];
    }
    acc[boardTitle].push(card);
    return acc;
  }, {});

  const filteredGroupedCards = groupedCards
    ? Object.entries(groupedCards).reduce((acc: any, [boardTitle, cards]: [string, any]) => {
      const filteredCards = (cards as any[]).filter((card) => {
        const matchesSearch =
          card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBoards =
          selectedBoards.length === 0 || selectedBoards.includes(card.list.board.title);
        const matchesTags =
          selectedTags.length === 0 ||
          card.tags?.some((tag: any) => selectedTags.includes(tag.name));

        return matchesSearch && matchesBoards && matchesTags;
      });
      if (filteredCards.length > 0) {
        acc[boardTitle] = filteredCards;
      }
      return acc;
    }, {})
    : {};

  const boardNames = Object.keys(groupedCards || {});
  const allCards = Object.values(filteredGroupedCards).flat();
  const displayedCards = selectedBoards.length
    ? allCards.filter((card) =>
      selectedBoards.includes((card as Card).list.board.title)
    )
    : allCards;

  const sortedCards = sortByDueDate
    ? [...displayedCards].sort((a: any, b: any) => {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    })
    : displayedCards;

  if (isLoading) {
    return (
      <div className="flex h-screen ">
        {/* Left Panel */}
        <div className="w-1/3 h-full bg-gray-100 m-4 rounded"></div>

        {/* Right Panel */}
        <div className="flex-1 h-full bg-gray-100 m-4 rounded"></div>
      </div>
    );
  }

  const allTags = Array.from(
    new Set(
      assignedCards
        ?.flatMap((card: any) => card.tags?.map((tag: any) => tag.name)) // Récupère les noms des tags
        .filter(Boolean) // Exclure les valeurs nulles
    )
  );

  const toggleTagSelection = (tag: string) => {
    setSelectedTags((prevSelected) =>
      prevSelected.includes(tag)
        ? prevSelected.filter((t) => t !== tag) // Supprimer si déjà sélectionné
        : [...prevSelected, tag] // Ajouter sinon
    );
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedBoards([]);
    setSelectedTags([]);
    setSortByDueDate(false);
  };

  return (
    <div className="flex bg-gradient-to-br from-gray-50 to-gray-100 h-[calc(100vh-70px)]">
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col shadow-lg">
        <div className="p-6 border-b border-gray-200 space-y-4">
          <p className="text-3xl font-bold text-gray-800">My Tasks</p>
          <div className="flex items-center gap-x-1 w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10 w-full bg-gray-50 border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {selectedBoards.length > 0 || selectedTags.length > 0 || sortByDueDate ? (
                      <span className="ml-2 flex items-center justify-center rounded-full bg-blue-500 text-white text-xs w-6 h-6">
                        {selectedBoards.length + selectedTags.length + (sortByDueDate ? 1 : 0)}
                      </span>
                    ) : null}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-sm">Filters</h4>
                      <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-auto p-0 text-muted-foreground">
                        Clear all
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <h5 className="font-medium text-sm flex items-center">
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
                      <h5 className="font-medium text-sm flex items-center">
                        <KanbanSquare className="mr-2 h-4 w-4" /> Boards
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.keys(groupedCards || {}).map((board) => (
                          <div key={board} className="flex items-center space-x-2">
                            <Checkbox
                              id={`board-${board}`}
                              checked={selectedBoards.includes(board)}
                              onCheckedChange={() =>
                                setSelectedBoards(
                                  selectedBoards.includes(board)
                                    ? selectedBoards.filter((b) => b !== board)
                                    : [...selectedBoards, board]
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
                      <h5 className="font-medium text-sm flex items-center">
                        <Tag className="mr-2 h-4 w-4" /> Tags
                      </h5>
                      <div className="grid grid-cols-2 gap-2">
                        {allTags.map((tag) => {
                          const tagString = String(tag); // Convertir en chaîne si nécessaire
                          return (
                            <div key={tagString} className="flex items-center space-x-2">
                              <Checkbox
                                id={`tag-${tagString}`}
                                checked={selectedTags.includes(tagString)}
                                onCheckedChange={() => toggleTagSelection(tagString)}
                              />
                              <Label htmlFor={`tag-${tagString}`}>{tagString}</Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-grow">
          <AnimatePresence>
            {sortedCards.map((card: any) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <Card
                  className={`m-3 cursor-pointer transition-all duration-200 hover:shadow-md ${selectedCard?.id === card.id ? "border-primary border-2" : ""
                    }`}
                  onClick={() => setSelectedCard(card)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-end items-start mb-2">
                      <Badge
                        variant="outline"
                        className="bg-gray-50 text-gray-600 mb-2"
                        style={{
                          borderLeft: `4px solid`,
                          paddingLeft: "8px",
                        }}
                      >
                        {card.list.board.title}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1 my-2">
                      {card.tags &&
                        card.tags.length > 0 &&
                        card.tags.map((tag: any) => (
                          <Badge
                            key={tag.id}
                            className="text-xs"
                            style={{
                              backgroundColor: tag.color,
                              color: "white",
                            }}
                          >
                            {tag.name}
                          </Badge>
                        ))}
                    </div>
                    <p className="font-semibold text-lg mb-2 text-gray-800">{card.title}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center w-full justify-between space-x-2">
                        <div className="flex items-center">
                          {card.priority && (
                            <Badge
                              variant={"outline"}
                              className="flex items-center border-none"
                            >
                              {getPriorityIcon(card.priority)}
                            </Badge>
                          )}
                          {card.dueDate && (
                            <Badge variant="outline" className="flex items-center text-xs bg-gray-50">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(card.dueDate).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <div>
                          {card.tasks && card.tasks.length > 0 && (
                            <Badge variant="outline" className="flex items-center text-xs bg-gray-50">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              {card.tasks.filter((t: any) => t.completed).length}/{card.tasks.length}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          {sortedCards.length === 0 && (
            <div className="text-center py-10">
              <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 text-lg">No tasks found</p>
            </div>
          )}
        </ScrollArea>
      </div>
      {selectedCard ? (
        <div className="bg-background w-full">
          <CardPage
            params={{
              cardId: selectedCard.id,
              workspaceId: currentWorkspace?.id || "",
              boardId: selectedCard.list.board.id,
            }}
            readonly={true}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full flex items-center justify-center"
        >
          <div className="text-center">
            <Clock className="h-20 w-20 mx-auto text-gray-300 mb-6" />
            <h2 className="text-3xl font-semibold text-gray-600">Select a task to view details</h2>
          </div>
        </motion.div>
      )}
    </div>
  );
}
