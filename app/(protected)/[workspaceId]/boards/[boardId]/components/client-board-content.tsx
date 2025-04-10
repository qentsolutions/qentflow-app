"use client";

import { ElementRef, useEffect, useRef, useState } from "react";
import BoardDocumentsPage from "../documents/page";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import DocumentDynamic from "../documents/[documentId]/page";

interface ClientBoardContentProps {
  params: {
    boardId: string;
    workspaceId: string;
  };
}

const ClientBoardContent = ({ params }: ClientBoardContentProps) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const contentRef = useRef<ElementRef<"div">>(null);

  // Fetch documents to ensure we have the latest data
  const { data: documentsData } = useQuery({
    queryKey: ["board-documents", params.boardId],
    queryFn: () => fetcher(`/api/boards/${params.workspaceId}/${params.boardId}/documents`),
    enabled: !!params.boardId,
  });

  // Handle document selection
  const handleSelectDocument = (documentId: string | null) => {
    setSelectedDocumentId(documentId);
  };

  // Scroll to top when changing documents
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [selectedDocumentId]);

  return (
    <div className="flex h-full">
      <BoardDocumentsPage 
        onSelectDocument={handleSelectDocument} 
        selectedDocumentId={selectedDocumentId}
      />
      <div ref={contentRef} className="flex-1 overflow-y-auto">
        {selectedDocumentId ? (
          <DocumentDynamic 
            params={{ 
              ...params, 
              documentId: selectedDocumentId 
            }} 
            key={selectedDocumentId} // Important: Add key to force re-render
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-600">Select a document to view</h3>
              <p className="text-sm text-gray-500 mt-2">Choose a document from the sidebar or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBoardContent;