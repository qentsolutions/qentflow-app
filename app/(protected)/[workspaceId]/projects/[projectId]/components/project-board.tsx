import { useRouter } from "next/navigation";
import { Plus, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormPopover } from "@/components/form/form-popover";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { BoardCard } from "../../../boards/components/board-card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addBoardToProject } from "@/actions/projects/add-board-to-project";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetcher } from "@/lib/fetcher";
import { useState } from "react";

interface ProjectBoardsProps {
    project: any;
    onUpdate: () => void;
}

export function ProjectBoards({ project, onUpdate }: ProjectBoardsProps) {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch all boards from workspace
    const { data: allBoards } = useQuery({
        queryKey: ["boards", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/boards?workspaceId=${currentWorkspace?.id}`),
    });

    console.log("All Boards:", allBoards);
    console.log("Project Boards:", project.boards);

    // Filter out boards that are already in the project
    const availableBoards = allBoards?.filter(
        (board: any) => !project.boards.some((projectBoard: any) => projectBoard.id === board.id)
    );

    console.log("Available Boards:", availableBoards);

    const handleBoardClick = (boardId: string) => {
        router.push(`/${currentWorkspace?.id}/boards/${boardId}`);
    };

    const handleAssociateBoard = async (boardId: string) => {
        try {
            await addBoardToProject({
                boardId,
                projectId: project.id,
                workspaceId: currentWorkspace?.id || "",
            });

            queryClient.invalidateQueries({
                queryKey: ["project", project.id],
            });
            onUpdate();
            toast.success("Board associated with project");
        } catch (error) {
            toast.error("Failed to associate board");
        }
    };

    const filteredBoards = availableBoards?.filter((board: any) =>
        board.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Project Boards</h2>
                <div className="flex gap-2">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Associate Board
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Associate Existing Board</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search boards..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <ScrollArea className="h-[300px]">
                                    <div className="space-y-2">
                                        {filteredBoards?.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center p-4">
                                                No available boards found
                                            </p>
                                        ) : (
                                            filteredBoards?.map((board: any) => (
                                                <div
                                                    key={board.id}
                                                    className="flex items-center justify-between p-3 hover:bg-muted rounded-lg"
                                                >
                                                    <span className="font-medium">{board.title}</span>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAssociateBoard(board.id)}
                                                    >
                                                        Associate
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <FormPopover
                        workspaceId={currentWorkspace?.id || ""}
                        projectId={project.id}
                    >
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Create Board
                        </Button>
                    </FormPopover>
                </div>
            </div>

            {project.boards && project.boards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {project.boards.map((board: any) => {
                        console.log("Board Data:", board);
                        return (
                            <BoardCard
                                key={board.id}
                                board={{
                                    id: board.id,
                                    title: board.title,
                                    createdAt: board.createdAt,
                                    memberCount: board.memberCount || 0,
                                    isMember: true,
                                    creator: {
                                        id: board.createdById,
                                        name: "Creator",
                                        imageUrl: "",
                                    },
                                    image: board.image,
                                }}
                                onClick={() => handleBoardClick(board.id)}
                            />
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No boards yet</p>
                    <FormPopover
                        workspaceId={currentWorkspace?.id || ""}
                        projectId={project.id}
                    >
                        <Button className="mt-4">
                            <Plus className="h-4 w-4 mr-2" />
                            Create your first board
                        </Button>
                    </FormPopover>
                </div>
            )}
        </div>
    );
}
