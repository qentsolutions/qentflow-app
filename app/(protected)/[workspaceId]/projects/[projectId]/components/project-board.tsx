"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormPopover } from "@/components/form/form-popover";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { BoardCard } from "../../../boards/components/board-card";

interface ProjectBoardsProps {
    project: any;
}

export function ProjectBoards({ project }: ProjectBoardsProps) {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Project Boards</h2>
                <FormPopover workspaceId={currentWorkspace?.id || ""}>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Board
                    </Button>
                </FormPopover>
            </div>

            {project.boards && project.boards.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {project.boards.map((board: any) => (
                        <BoardCard
                            key={board.id}
                            board={{
                                id: board.id,
                                title: board.title,
                                createdAt: board.createdAt,
                                memberCount: board.User?.length || 0,
                                isMember: true,
                                creator: {
                                    id: board.createdById,
                                    name: "Creator",
                                    imageUrl: "",
                                },
                                image: board.image,
                            }}
                            onClick={() => router.push(`/${currentWorkspace?.id}/boards/${board.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No boards yet</p>
                    <FormPopover workspaceId={currentWorkspace?.id || ""}>
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