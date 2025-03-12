"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, FileText, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { ResourceSelector } from "./resource-selector";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { addBoardToProject } from "@/actions/projects/add-board-to-project";
import { addDocumentToProject } from "@/actions/projects/add-document-to-project";

interface ProjectResourcesProps {
    project: any;
}

export function ProjectResources({ project }: ProjectResourcesProps) {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();
    const [isSelectingBoards, setIsSelectingBoards] = useState(false);
    const [isSelectingDocuments, setIsSelectingDocuments] = useState(false);

    const { execute: executeAddBoard } = useAction(addBoardToProject, {
        onSuccess: () => {
            toast.success("Board added to project");
            setIsSelectingBoards(false);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeAddDocument } = useAction(addDocumentToProject, {
        onSuccess: () => {
            toast.success("Document added to project");
            setIsSelectingDocuments(false);
            router.refresh();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const handleAddBoard = async (boardId: string) => {
        if (!currentWorkspace?.id) return;

        await executeAddBoard({
            boardId,
            projectId: project.id,
            workspaceId: currentWorkspace.id,
        });
    };

    const handleAddDocument = async (documentId: string) => {
        if (!currentWorkspace?.id) return;

        await executeAddDocument({
            documentId,
            projectId: project.id,
            workspaceId: currentWorkspace.id,
        });
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Boards</h3>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSelectingBoards(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Board
                    </Button>
                </div>

                <div className="space-y-2">
                    {project.boards?.map((board: any) => (
                        <div
                            key={board.id}
                            className="p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                            onClick={() => router.push(`/${currentWorkspace?.id}/boards/${board.id}`)}
                        >
                            <div className="flex items-center gap-3">
                                <LayoutGrid className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{board.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <ResourceSelector
                    isOpen={isSelectingBoards}
                    onClose={() => setIsSelectingBoards(false)}
                    projectId={project.id}
                    type="board"
                    onSelect={handleAddBoard}
                    selectedResources={project.boards?.map((b: any) => b.id) || []}
                />
            </Card>

            <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <h3 className="text-lg font-semibold">Documents</h3>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSelectingDocuments(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Document
                    </Button>
                </div>

                <div className="space-y-2">
                    {project.documents?.map((document: any) => (
                        <div
                            key={document.id}
                            className="p-3 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                            onClick={() => router.push(`/${currentWorkspace?.id}/documents/${document.id}`)}
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-blue-600" />
                                <span className="font-medium">{document.title}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <ResourceSelector
                    isOpen={isSelectingDocuments}
                    onClose={() => setIsSelectingDocuments(false)}
                    projectId={project.id}
                    type="document"
                    onSelect={handleAddDocument}
                    selectedResources={project.documents?.map((d: any) => d.id) || []}
                />
            </Card>
        </div>
    );
}