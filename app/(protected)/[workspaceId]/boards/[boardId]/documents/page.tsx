"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { DocumentSidebar } from "../components/board-documents/document-sidebar";
import { File, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createBoardDocument } from "@/actions/board-documents/create-document";
import { toast } from "sonner";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface BoardDocumentsPageProps {
  params: {
    boardId: string;
    workspaceId: string;
  };
  onSelectDocument: (documentId: string) => void;
}

export default function BoardDocumentsPage({ params, onSelectDocument }: BoardDocumentsPageProps) {
  const router = useRouter();
  const { currentWorkspace } = useCurrentWorkspace();
  const boardId = params.boardId as string;
  const workspaceId = params.workspaceId as string;

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
        onSelectDocument(result.data.id);
      }
    } catch (error) {
      toast.error("Failed to create document");
    }
  };

  return (
    <div className="flex h-full">
      <DocumentSidebar params={params} onSelectDocument={handleSelectDocument} />
    </div>
  );
}
