"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { DocumentSidebar } from "../../components/board-documents/document-sidebar";
import { DocumentEditor } from "../../components/board-documents/document-editor";
import { Skeleton } from "@/components/ui/skeleton";

export default function BoardDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const { setBreadcrumbs } = useBreadcrumbs();
  const documentId = params.documentId as string;
  const boardId = params.boardId as string;
  const workspaceId = params.workspaceId as string;

  const { data: document, isLoading: isDocumentLoading } = useQuery({
    queryKey: ["board-document", documentId],
    queryFn: () => fetcher(`/api/boards/${workspaceId}/${boardId}/documents/${documentId}`),
    enabled: !!documentId && !!boardId,
  });

  const { data: boardData } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => fetcher(`/api/boards/title?boardId=${boardId}`),
  });

  useEffect(() => {
    if (boardData && document) {
      setBreadcrumbs([
        { label: "Boards", href: `/${currentWorkspace?.id}/boards` },
        { label: boardData.title, href: `/${currentWorkspace?.id}/boards/${boardId}` },
        { label: "Documents", href: `/${currentWorkspace?.id}/boards/${boardId}/documents` },
        { label: document.title },
      ]);
    }
  }, [boardData, document, setBreadcrumbs, currentWorkspace?.id, boardId]);

  const handleSelectDocument = (docId: string) => {
    router.push(`/${workspaceId}/boards/${boardId}/documents/${docId}`);
  };

  if (isDocumentLoading) {
    return (
      <div className="flex h-full">
        <div className="w-64 border-r">
          <Skeleton className="h-full" />
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-10 w-1/3 mb-6" />
          <Skeleton className="h-[calc(100vh-200px)] w-full" />
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex h-full">
        <DocumentSidebar 
          selectedDocumentId={documentId}
          onSelectDocument={handleSelectDocument}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Document not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <DocumentSidebar 
        selectedDocumentId={documentId}
        onSelectDocument={handleSelectDocument}
      />
      <div className="flex-1 overflow-y-auto">
        <DocumentEditor document={document} />
      </div>
    </div>
  );
}