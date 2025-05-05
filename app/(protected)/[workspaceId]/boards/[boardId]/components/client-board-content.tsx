"use client"

import { type ElementRef, useEffect, useRef, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/fetcher"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createBoardDocument } from "@/actions/board-documents/create-document"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import DocumentsView from "../documents/page"
import DocumentEditor from "./board-documents/document-editor"

interface ClientBoardContentProps {
  params: {
    boardId: string
    workspaceId: string
  }
}

const ClientBoardContent = ({ params }: ClientBoardContentProps) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null)
  const contentRef = useRef<ElementRef<"div">>(null)
  const queryClient = useQueryClient()
  const { currentWorkspace } = useCurrentWorkspace()

  // Fetch documents to ensure we have the latest data
  const { data: documentsData, refetch } = useQuery({
    queryKey: ["board-documents", params.boardId],
    queryFn: () => fetcher(`/api/boards/${params.workspaceId}/${params.boardId}/documents`),
    enabled: !!params.boardId,
  })

  // Handle document selection
  const handleSelectDocument = (documentId: string | null) => {
    setSelectedDocumentId(documentId)
  }

  // Create a new document
  const handleCreateDocument = async () => {
    try {
      const result = await createBoardDocument({
        title: "Untitled Document",
        boardId: params.boardId,
        workspaceId: currentWorkspace?.id as string,
      })

      if (result.error) {
        toast.error(result.error)
      } else if (result.data?.id) {
        // Invalidate the documents query to refresh the list
        queryClient.invalidateQueries({
          queryKey: ["board-documents", params.boardId],
        })

        // Select the newly created document
        setSelectedDocumentId(result.data.id)
        toast.success("Document created successfully")
      }
    } catch (error) {
      toast.error("Failed to create document")
    }
  }

  // Scroll to top when changing documents
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0
    }
  }, [selectedDocumentId])

  return (
    <div className="flex h-[82vh] bg-background">
      <div className="flex flex-col h-full">
        <DocumentsView
          onSelectDocument={handleSelectDocument}
          selectedDocumentId={selectedDocumentId}
          onCreateDocument={handleCreateDocument}
          refetchDocuments={refetch}
          documentsData={documentsData}
        />
      </div>

      <div ref={contentRef} className="flex-1 overflow-y-auto bg-background border-l">
        {selectedDocumentId ? (
          <DocumentEditor
            params={{
              ...params,
              documentId: selectedDocumentId,
            }}
            key={selectedDocumentId}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center max-w-md p-8">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <PlusCircle className="h-8 w-8 text-gray-500" />
              </div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">Create a new document</h3>
              <p className="text-gray-500 mb-6">
                Start writing, organizing, and sharing your ideas in a beautiful document
              </p>
              <Button onClick={handleCreateDocument} size="lg" className="px-6">
                New Document
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientBoardContent
