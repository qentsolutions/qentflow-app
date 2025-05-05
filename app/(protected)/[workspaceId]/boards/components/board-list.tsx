import { useEffect, useState, useMemo } from "react";
import { Search, KanbanSquare, LayoutGrid, List, Users } from "lucide-react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { BoardCard } from "./board-card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { boardTemplates } from "@/constants/board-templates";
import { CreateBoardModal } from "@/components/modals/create-board-modal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { addRecentBoard, getRecentBoards } from "@/utils/localStorage";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Dynamically force re-render
export const dynamic = "force-dynamic";

interface TemplateExplorerProps {
  onSelectTemplate: (templateId: string) => void;
}

const TemplateExplorer: React.FC<TemplateExplorerProps> = ({ onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");

  const uniqueTypes = useMemo(() => {
    const types = ["All"];
    boardTemplates.forEach((template) => {
      if (!types.includes(template.type)) {
        types.push(template.type);
      }
    });
    return types;
  }, []);

  const filteredTemplates = useMemo(() => {
    return boardTemplates.filter((template) => {
      const matchesSearch =
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "All" || template.type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType]);

  return (
    <div className="flex h-[60vh]">
      {/* Left sidebar with types */}
      <div className="w-1/4 border-r p-4">
        <h3 className="font-semibold mb-2">Types</h3>
        <ScrollArea className="h-full">
          {uniqueTypes.map((type) => (
            <button
              key={type}
              className={cn(
                "block w-full text-left px-2 py-1 rounded",
                selectedType === type ? "bg-blue-100 text-blue-800 dark:text-blue-500 dark:bg-gray-700" : "hover:bg-gray-100 dark:hover:bg-gray-700",
              )}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </ScrollArea>
      </div>

      {/* Right side with search and templates */}
      <div className="w-3/4 p-4">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="Search templates"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[calc(100%-60px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-all duration-200"
                onClick={() => onSelectTemplate(template.id)}
              >
                <div className="text-2xl mb-2">{template.icon}</div>
                <h4 className="font-medium">{template.title}</h4>
                <p className="text-sm text-gray-500">{template.description}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

interface Board {
  id: string;
  title: string;
  isMember: boolean;
  creator: {
    id: string;
    name: string;
    imageUrl: string;
  };
  memberCount: number;
  createdAt: string;
  image: string;
}

export const BoardList: React.FC = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isFirstLoad, setIsFirstLoad] = useState<boolean>(true);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState<boolean>(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [isExploreDialogOpen, setIsExploreDialogOpen] = useState<boolean>(false);
  const [recentBoardIds, setRecentBoardIds] = useState<string[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  // Initialize isCardView from localStorage
  const [isCardView, setIsCardView] = useState<boolean>(() => {
    const savedValue = localStorage.getItem('isCardView');
    return savedValue ? JSON.parse(savedValue) : false;
  });

  useEffect(() => {
    document.title = "Projects - Qentflow";
    setRecentBoardIds(getRecentBoards());
  }, []);

  useEffect(() => {
    // Save isCardView to localStorage whenever it changes
    localStorage.setItem('isCardView', JSON.stringify(isCardView));
  }, [isCardView]);

  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () => (workspaceId ? fetcher(`/api/boards?workspaceId=${workspaceId}`) : Promise.resolve([])),
    enabled: !!workspaceId,
  });

  const safeBoards = Array.isArray(boards) ? boards : [];

  const filteredBoards = useMemo(() => {
    return safeBoards.filter((board: Board) =>
      board.isMember && board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [safeBoards, searchTerm]);


  const openBoards = useMemo(() => {
    return filteredBoards.filter((board: Board) => {
      if (selectedFilter === "All") return true;
      if (selectedFilter === "Mine" && board.isMember) return true;
      if (selectedFilter === "Not Mine" && !board.isMember) return true;
      return false;
    });
  }, [filteredBoards, selectedFilter]);

  const recentBoards = useMemo(() => {
    return recentBoardIds
      .map(id => safeBoards.find((board: Board) => board.id === id))
      .filter((board): board is Board => board !== undefined && board.isMember)
      .filter((board: Board) => {
        if (selectedFilter === "All") return true;
        if (selectedFilter === "Mine" && board.isMember) return true;
        if (selectedFilter === "Not Mine" && !board.isMember) return true;
        return false;
      });
  }, [recentBoardIds, safeBoards, selectedFilter]);

  // Combine recent boards and open boards, with recent boards first
  const combinedBoards = useMemo(() => {
    const recentBoardSet = new Set(recentBoards.map(board => board.id));
    const filteredOpenBoards = openBoards.filter(board => !recentBoardSet.has(board.id));
    return [...recentBoards, ...filteredOpenBoards];
  }, [recentBoards, openBoards]);

  // Handle board click
  const handleBoardClick = (board: any) => {
    if (!board.isMember) {
      toast.error("You are not a member of this board.");
      return;
    }
    addRecentBoard(board.id);
    setRecentBoardIds(getRecentBoards());
    router.push(`/${workspaceId}/boards/${board.id}`);
  };

  // Delay showing "No boards available"
  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setIsFirstLoad(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (error) {
    return <div>Error loading boards. Please try again later.</div>;
  }

  return (
    <div className="h-full">
      <Card className="shadow-none border-none rounded-none w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">
            <div className="flex items-center mb-4 gap-x-2">
              <span className="text-2xl font-semibold flex items-center gap-x-2">
                <KanbanSquare size={24} />
                Projects
                <span
                  className={cn("text-2xl font-semibold", combinedBoards?.length > 0 ? "text-blue-600" : "text-gray-400")}
                >
                  {combinedBoards?.length || 0}
                </span>
              </span>
            </div>
          </CardTitle>
          <div className="flex items-center space-x-4">
            <Dialog open={isExploreDialogOpen} onOpenChange={setIsExploreDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Explore templates</Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl">
                <DialogHeader>
                  <DialogTitle>Explore Board Templates</DialogTitle>
                </DialogHeader>
                <TemplateExplorer
                  onSelectTemplate={(templateId) => {
                    setSelectedTemplateId(templateId);
                    setIsExploreDialogOpen(false);
                    setIsCreateBoardModalOpen(true);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {/* Template Carousel */}
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full mb-6"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {boardTemplates.slice(0, 8).map((template) => (
                <CarouselItem key={template.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/4 lg:basis-1/5">
                  <div
                    className={cn(
                      "aspect-[16/10] relative group rounded-lg border-2 border-dashed",
                      "hover:border-blue-500 transition-all duration-200",
                      "flex flex-col items-center justify-center cursor-pointer p-4 overflow-hidden ",
                      template.id === "blank" ? "bg-background dark:bg-gray-700" : "dark:bg-gray-800 bg-blue-50",
                    )}
                    onClick={() => {
                      setSelectedTemplateId(template.id);
                      setIsCreateBoardModalOpen(true);
                    }}
                  >
                    <div className="text-2xl mb-2">{template.icon}</div>
                    <p className="text-sm text-center font-medium dark:text-gray-400 text-gray-600 group-hover:text-gray-900">
                      {template.title}
                    </p>
                    <p className="text-xs text-center text-gray-500 mt-1">{template.description}</p>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute top-1/2 -left-2 transform -translate-y-1/2 bg-background hover:bg-gray-100 rounded-full p-2 shadow-md" />
            <CarouselNext className="absolute top-1/2 -right-2 transform -translate-y-1/2 bg-background hover:bg-gray-100 rounded-full p-2 shadow-md" />
          </Carousel>

          <div className="flex justify-between items-center gap-x-2 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-10 w-80"
                placeholder="Search projects"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-x-2">
              <p className="text-gray-600 text-sm">Filter by</p>
              <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Projects</SelectItem>
                  <SelectItem value="Mine">My Projects</SelectItem>
                  <SelectItem value="Not Mine">Not My Projects</SelectItem>
                </SelectContent>
              </Select>
              <Separator orientation="vertical" className="text-gray-500 h-8" />
              <div className="flex gap-x-1">
                <Button
                  variant={isCardView ? "default" : "outline"}
                  size="icon"
                  onClick={() => setIsCardView(true)}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={!isCardView ? "default" : "outline"}
                  size="icon"
                  onClick={() => setIsCardView(false)}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* All Boards */}
          <div className={cn("grid", isCardView ? "gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "grid-cols-1")}>
            {isLoading || isFirstLoad ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <Skeleton key={idx} className="h-20 my-1 rounded-md bg-gray-200 dark:bg-gray-700" />
              ))
            ) : combinedBoards.length > 0 ? (
              combinedBoards.map((board) =>
                isCardView ? (
                  <BoardCard key={board.id} board={board} onClick={() => handleBoardClick(board)} />
                ) : (
                  <div
                    key={board.id}
                    className="flex items-center p-4 border-b cursor-pointer transition hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => handleBoardClick(board)}
                  >
                    <div className="flex-shrink-0 mr-4">
                      {board.image ? (
                        <img src={board.image} alt={board.title} className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-50 to-indigo-100 flex items-center justify-center">
                          <span className="text-xl font-semibold text-indigo-500">{board.title.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900 dark:text-gray-400">{board.title}</h3>
                      <p className="text-sm text-gray-500">Created by {board.creator.name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {recentBoardIds.includes(board.id) && (
                        <div className="flex items-center space-x-1 rounded-full bg-blue-100 dark:bg-blue-400 text-blue-800 px-2 py-1">
                          <span className="text-xs font-medium">Recently opened</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 rounded-full bg-neutral-100 dark:bg-background px-2 py-1">
                        <Users className="h-3 w-3 text-neutral-600" />
                        <span className="text-xs font-medium text-neutral-600">{board.memberCount}</span>
                      </div>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="col-span-full text-center py-10 rounded-lg">
                <KanbanSquare className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-muted-foreground text-sm">No boards found</p>
              </div>
            )}
          </div>
        </CardContent>

        {/* Create Board Modal */}
        <CreateBoardModal
          isOpen={isCreateBoardModalOpen}
          onClose={() => setIsCreateBoardModalOpen(false)}
          workspaceId={workspaceId || ""}
          templateId={selectedTemplateId}
        />
      </Card>
    </div>
  );
};
