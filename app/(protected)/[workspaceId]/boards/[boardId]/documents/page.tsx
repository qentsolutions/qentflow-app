"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { DocumentSidebar } from "../components/board-documents/document-sidebar";
import { File, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBoardDocument } from "@/actions/board-documents/create-document";
import { toast } from "sonner";

export default function BoardDocumentsPage() {
    const params = useParams();
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();
    const { setBreadcrumbs } = useBreadcrumbs();
    const boardId = params.boardId as string;
    const workspaceId = params.workspaceId as string;

    const { data: boardData } = useQuery({
        queryKey: ["board", boardId],
        queryFn: () => fetcher(`/api/boards/title?boardId=${boardId}`),
    });

    useEffect(() => {
        if (boardData) {
            setBreadcrumbs([
                { label: "Boards", href: `/${currentWorkspace?.id}/boards` },
                { label: boardData.title, href: `/${currentWorkspace?.id}/boards/${boardId}` },
                { label: "Documents" },
            ]);
        }
    }, [boardData, setBreadcrumbs, currentWorkspace?.id, boardId]);

    const handleSelectDocument = (documentId: string) => {
        router.push(`/${workspaceId}/boards/${boardId}/documents/${documentId}`);
    };

    const handleCreateDocument = async () => {
        try {
            const result = await createBoardDocument({
                title: "Untitled Document",
                boardId: boardId,
                workspaceId: currentWorkspace?.id as string,
            });

            if (result.error) {
                toast.error(result.error);
            } else if (result.data?.id) {
                router.push(`/${workspaceId}/boards/${boardId}/documents/${result.data.id}`);
            }
        } catch (error) {
            toast.error("Failed to create document");
        }
    };

    return (
        <div className="flex h-full">
            <DocumentSidebar
                onSelectDocument={handleSelectDocument}
            />
            <div className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="text-center max-w-md">
                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Board Documents</h2>
                    <p className="text-gray-500 mb-6">
                        Create and manage documents related to this board. Select a document from the sidebar or create a new one.
                    </p>
                    <Button onClick={handleCreateDocument}>
                        Create New Document
                    </Button>
                </div>
            </div>
        </div>
    );
}