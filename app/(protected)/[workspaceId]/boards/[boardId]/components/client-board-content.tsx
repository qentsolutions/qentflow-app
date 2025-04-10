"use client";

import { useState } from "react";
import BoardDocumentsPage from "../documents/page";
import DocumentDynamic from "../documents/[documentId]/page";

interface ClientBoardContentProps {
  params: {
    boardId: string;
    workspaceId: string;
  };
}

const ClientBoardContent = ({ params }: ClientBoardContentProps) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  return (
    <div className="flex h-full">
      <BoardDocumentsPage params={params} onSelectDocument={setSelectedDocumentId} />
      {selectedDocumentId && (
        <DocumentDynamic params={{ ...params, documentId: selectedDocumentId }} />
      )}
    </div>
  );
};

export default ClientBoardContent;
