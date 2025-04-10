"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { DocumentSidebar } from "../components/board-documents/document-sidebar";
import { File, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBoardDocument } from "@/actions/board-documents/create-document";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";



const BoardDocumentsPage= ({ onSelectDocument, selectedDocumentId }:any) => {
  const router = useRouter();
  const params = useParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const boardId = params.boardId as string;
  const workspaceId = params.workspaceId as string;

  // Fetch documents data
  const { data: documentsData, isLoading, refetch } = useQuery({
    queryKey: ["board-documents", boardId],
    queryFn: () => fetcher(`/api/boards/${workspaceId}/${boardId}/documents`),
    enabled: !!boardId && !!workspaceId,
  });

  const handleSelectDocument = (documentId: string) => {
    onSelectDocument(documentId);
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
        // Invalidate the documents query to refresh the list
        queryClient.invalidateQueries({
          queryKey: ["board-documents", boardId],
        });

        // Select the newly created document
        onSelectDocument(result.data.id);
        toast.success("Document created successfully");
      }
    } catch (error) {
      toast.error("Failed to create document");
    }
  };

  return (
    <div className="flex h-full">
      <DocumentSidebar
        onSelectDocument={handleSelectDocument}
        selectedDocumentId={selectedDocumentId}
        onCreateDocument={handleCreateDocument}
        refetchDocuments={refetch}
      />
    </div>
  );
};

export default BoardDocumentsPage;
