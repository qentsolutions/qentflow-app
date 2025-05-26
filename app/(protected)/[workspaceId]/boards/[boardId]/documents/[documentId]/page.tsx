"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Skeleton } from "@/components/ui/skeleton";
import DocumentEditor from "../../components/board-documents/document-editor";

export default function DocumentDynamic() {
  const router = useRouter();
  const params = useParams();

  const documentId = params.documentId as string;
  const boardId = params.boardId as string;
  const workspaceId = params.workspaceId as string;

  const { data: document, isLoading: isDocumentLoading } = useQuery({
    queryKey: ["board-document", documentId],
    queryFn: () => fetcher(`/api/boards/${workspaceId}/${boardId}/documents/${documentId}`),
    enabled: !!documentId && !!boardId,
  });

  if (isDocumentLoading) {
    return (
      <div className="flex-1 p-6">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-[calc(100vh-200px)] w-full" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-muted-foreground">Document not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <DocumentEditor params={{ documentId, boardId, workspaceId }} />
    </div>
  );
}
