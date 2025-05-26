"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, X } from "lucide-react"
import { DocumentSidebar } from "../components/board-documents/document-sidebar"



const DocumentsView = ({
    onSelectDocument,
    selectedDocumentId,
    onCreateDocument,
    refetchDocuments,
    documentsData,
}: any) => {
    const [searchQuery, setSearchQuery] = useState("")
    const [isSearching, setIsSearching] = useState(false)
    const [filteredDocuments, setFilteredDocuments] = useState<any[]>([])

    useEffect(() => {
        if (documentsData && searchQuery) {
            const allDocs = documentsData.documents || []
            const filtered = allDocs.filter((doc: any) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
            setFilteredDocuments(filtered)
        } else {
            setFilteredDocuments([])
        }
    }, [searchQuery, documentsData])

    return (
        <div className="w-64 h-full flex flex-col bg-background">
            <div className="p-3 border-b flex flex-col gap-2">


                {isSearching ? (
                    <div className="flex items-center gap-1">
                        <Input
                            placeholder="Search documents..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-8 text-sm"
                            autoFocus
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setSearchQuery("")
                                setIsSearching(false)
                            }}
                            className="h-7 w-7"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSearching(true)}
                        className="justify-start text-gray-500 h-8 text-sm"
                    >
                        <Search className="h-3.5 w-3.5 mr-2" />
                        Search documents...
                    </Button>
                )}
            </div>

            {searchQuery ? (
                <div className="flex-1 overflow-y-auto p-2">
                    <p className="text-xs text-gray-500 px-2 py-1">Search results</p>
                    {filteredDocuments.length > 0 ? (
                        filteredDocuments.map((doc) => (
                            <div
                                key={doc.id}
                                className={`flex items-center px-2 py-1.5 rounded-md cursor-pointer text-sm ${selectedDocumentId === doc.id ? "bg-gray-100" : "hover:bg-gray-50"
                                    }`}
                                onClick={() => onSelectDocument(doc.id)}
                            >
                                <span className="truncate">{doc.title}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-4 text-sm text-gray-500">No documents found</div>
                    )}
                </div>
            ) : (
                <DocumentSidebar
                    onSelectDocument={onSelectDocument}
                    selectedDocumentId={selectedDocumentId}
                    onCreateDocument={onCreateDocument}
                    refetchDocuments={refetchDocuments}
                />
            )}
        </div>
    )
}

export default DocumentsView
