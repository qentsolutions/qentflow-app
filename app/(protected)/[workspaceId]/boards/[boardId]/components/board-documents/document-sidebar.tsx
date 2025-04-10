"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/fetcher"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { toast } from "sonner"
import {
  ChevronRight,
  File,
  Folder,
  FolderPlus,
  FilePlus,
  MoreHorizontal,
  Trash,
  Edit,
  FolderOpen,
  Loader2,
  Plus,
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createBoardDocument } from "@/actions/board-documents/create-document"
import { createBoardFolder } from "@/actions/board-documents/create-folder"
import { deleteBoardDocument } from "@/actions/board-documents/delete-document"
import { deleteBoardFolder } from "@/actions/board-documents/delete-folder"
import { renameBoardDocument } from "@/actions/board-documents/rename-document"
import { renameBoardFolder } from "@/actions/board-documents/rename-folder"
import { updateBoardDocument } from "@/actions/board-documents/update-document"
import { DndContext, DragOverlay, MouseSensor, TouchSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core"
import { restrictToWindowEdges } from "@dnd-kit/modifiers"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"

interface DocumentSidebarProps {
  selectedDocumentId?: string | null
  onSelectDocument: (documentId: string) => void
  onCreateDocument?: () => void
  refetchDocuments?: () => void
}

interface Document {
  id: string
  title: string
  folderId: any
}

interface FolderType {
  id: string
  name: string
  parentId: any
}

interface DocumentsData {
  documents: Document[]
  folders: FolderType[]
}

// Draggable Document Component
const DraggableDocument = ({
  document,
  isSelected,
  onSelect,
  onRename,
  onDelete,
}: {
  document: Document
  isSelected: boolean
  onSelect: () => void
  onRename: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `document-${document.id}`,
    data: {
      type: "document",
      document,
    },
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : "auto",
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer group document-item transition-colors duration-200",
        isSelected && "bg-gray-100",
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-1.5 flex-1">
        <div className="w-3.5"></div> {/* Spacer to align with folders */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 opacity-0 group-hover:opacity-60 drag-handle"
          title="Drag to move document"
        >
          <GripVertical className="h-3 w-3 text-gray-400" />
        </div>
        <File className="h-3.5 w-3.5 text-gray-500" />
        <span className="text-sm truncate text-gray-700">{document.title}</span>
      </div>

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onRename(e)
          }}
          className="h-6 w-6 p-0 hover:bg-gray-100"
          title="Rename document"
        >
          <Edit className="h-3 w-3 text-gray-500" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(e)
          }}
          className="h-6 w-6 p-0 hover:bg-red-50 text-red-500"
          title="Delete document"
        >
          <Trash className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

// Droppable Folder Component
const DroppableFolder = ({
  folder,
  isExpanded,
  onToggle,
  onRename,
  onDelete,
  onAddDocument,
  onAddFolder,
  children,
  dropTargetId, // Add dropTargetId as a prop
}: {
  folder: FolderType
  isExpanded: boolean
  onToggle: (e: React.MouseEvent) => void
  onRename: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  onAddDocument: (e: React.MouseEvent) => void
  onAddFolder: (e: React.MouseEvent) => void
  children?: React.ReactNode
  dropTargetId: string | null // Add dropTargetId type
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `folder-${folder.id}`,
    data: {
      type: "folder",
      folder,
    },
  })

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : "auto",
  }

  // Check if this folder is the current drop target
  const isDropTarget = dropTargetId === folder.id

  return (
    <div ref={setNodeRef} style={style} className="mb-0.5">
      <div
        className={cn(
          "flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-100 group transition-all duration-200",
          isDropTarget && "bg-blue-50 border border-blue-200 shadow-sm",
        )}
        onClick={(e) => e.stopPropagation()} // Prevent click from bubbling
      >
        <div className="flex items-center gap-1.5 flex-1" onClick={onToggle}>
          <ChevronRight
            className={cn("h-3.5 w-3.5 text-gray-400 transition-transform", isExpanded && "transform rotate-90")}
          />
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 -ml-1 opacity-0 group-hover:opacity-60"
          >
            <GripVertical className="h-3 w-3 text-gray-400" />
          </div>
          {isExpanded ? (
            <FolderOpen className={cn("h-3.5 w-3.5", isDropTarget ? "text-blue-500" : "text-gray-500")} />
          ) : (
            <Folder className={cn("h-3.5 w-3.5", isDropTarget ? "text-blue-500" : "text-gray-500")} />
          )}
          <span className={cn("text-sm truncate", isDropTarget ? "text-blue-600 font-medium" : "text-gray-700")}>
            {folder.name}
          </span>
        </div>

        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <Button
            variant="ghost"
            size="sm"
            onClick={onAddDocument}
            className="h-6 w-6 p-0 hover:bg-blue-50 hover:text-blue-500"
            title="Add document to this folder"
          >
            <Plus className="h-3 w-3 text-gray-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3.5 w-3.5 text-gray-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onAddDocument} className="text-xs">
                <FilePlus className="h-3.5 w-3.5 mr-2" />
                New Document
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddFolder} className="text-xs">
                <FolderPlus className="h-3.5 w-3.5 mr-2" />
                New Folder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onRename} className="text-xs">
                <Edit className="h-3.5 w-3.5 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-xs text-red-600">
                <Trash className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isExpanded && <div className={cn("ml-3", isDropTarget && "border-l-2 border-blue-100 pl-1")}>{children}</div>}
    </div>
  )
}

export function DocumentSidebar({
  selectedDocumentId,
  onSelectDocument,
  onCreateDocument,
  refetchDocuments,
}: DocumentSidebarProps) {
  const { currentWorkspace } = useCurrentWorkspace()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false)
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false)
  const [newDocumentTitle, setNewDocumentTitle] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [itemToRename, setItemToRename] = useState<{ id: string; type: "document" | "folder"; name: string } | null>(
    null,
  )
  const [newName, setNewName] = useState("")
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeItem, setActiveItem] = useState<any | null>(null)
  const [dropTargetId, setDropTargetId] = useState<string | null>(null) // Declare dropTargetId here
  const params = useParams()
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Configure DnD sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 250ms delay before drag starts on touch
        tolerance: 5, // 5px movement tolerance
      },
    }),
  )

  const {
    data: documentsData,
    isLoading,
    refetch,
  } = useQuery<DocumentsData>({
    queryKey: ["board-documents", params.boardId],
    queryFn: () => fetcher(`/api/boards/${currentWorkspace?.id}/${params.boardId}/documents`),
    enabled: !!params.boardId && !!currentWorkspace?.id,
  })

  // Expand parent folders when a document is selected
  useEffect(() => {
    if (selectedDocumentId && documentsData) {
      const selectedDoc = documentsData.documents.find((doc) => doc.id === selectedDocumentId)
      if (selectedDoc && selectedDoc.folderId) {
        // Find all parent folders recursively
        const expandParentFolders = (folderId: string) => {
          setExpandedFolders((prev) => {
            const newSet = new Set(prev)
            newSet.add(folderId)
            return newSet
          })

          const folder = documentsData.folders.find((f) => f.id === folderId)
          if (folder && folder.parentId) {
            expandParentFolders(folder.parentId)
          }
        }

        expandParentFolders(selectedDoc.folderId)
      }
    }
  }, [selectedDocumentId, documentsData])

  const toggleFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setExpandedFolders((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(folderId)) {
        newSet.delete(folderId)
      } else {
        newSet.add(folderId)
      }
      return newSet
    })
  }

  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim()) {
      toast.error("Document title is required")
      return
    }

    try {
      const result = await createBoardDocument({
        title: newDocumentTitle,
        boardId: params.boardId as string,
        workspaceId: currentWorkspace?.id as string,
        folderId: selectedFolderId ?? undefined,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Document created successfully")
        await refetch()
        if (refetchDocuments) refetchDocuments()
        setNewDocumentTitle("")
        setIsCreateDocumentOpen(false)
        if (result.data?.id) {
          onSelectDocument(result.data.id)
        }
      }
    } catch (error) {
      toast.error("Failed to create document")
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required")
      return
    }

    try {
      const result = await createBoardFolder({
        name: newFolderName,
        boardId: params.boardId as string,
        workspaceId: currentWorkspace?.id as string,
        parentId: selectedFolderId ?? undefined,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Folder created successfully")
        await refetch()
        if (refetchDocuments) refetchDocuments()
        setNewFolderName("")
        setIsCreateFolderOpen(false)

        // Expand the parent folder if a subfolder was created
        if (selectedFolderId) {
          setExpandedFolders((prev) => {
            const newSet = new Set(prev)
            newSet.add(selectedFolderId)
            return newSet
          })
        }
      }
    } catch (error) {
      toast.error("Failed to create folder")
    }
  }

  const handleDeleteDocument = async (documentId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const result = await deleteBoardDocument({
        id: documentId,
        boardId: params.boardId as string,
        workspaceId: currentWorkspace?.id as string,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Document deleted successfully")
        await refetch()
        if (refetchDocuments) refetchDocuments()

        // If the deleted document was selected, clear the selection
        if (selectedDocumentId === documentId) {
          onSelectDocument(null as any)
        }
      }
    } catch (error) {
      toast.error("Failed to delete document")
    }
  }

  const handleDeleteFolder = async (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const result = await deleteBoardFolder({
        id: folderId,
        boardId: params.boardId as string,
        workspaceId: currentWorkspace?.id as string,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Folder deleted successfully")
        await refetch()
        if (refetchDocuments) refetchDocuments()

        // If any document in the deleted folder was selected, clear the selection
        if (selectedDocumentId) {
          const selectedDoc = documentsData?.documents.find((doc) => doc.id === selectedDocumentId)
          if (
            selectedDoc &&
            (selectedDoc.folderId === folderId ||
              documentsData?.folders.find((f) => f.parentId === folderId)?.id === selectedDoc.folderId)
          ) {
            onSelectDocument(null as any)
          }
        }
      }
    } catch (error) {
      toast.error("Failed to delete folder")
    }
  }

  const openRenameDialog = (id: string, type: "document" | "folder", currentName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setItemToRename({ id, type, name: currentName })
    setNewName(currentName)
    setIsRenameDialogOpen(true)
  }

  const handleRenameItem = async () => {
    if (!itemToRename || !newName.trim()) return

    try {
      if (itemToRename.type === "document") {
        const result = await renameBoardDocument({
          id: itemToRename.id,
          title: newName,
          boardId: params.boardId as string,
          workspaceId: currentWorkspace?.id as string,
        })

        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Document renamed successfully")
          await refetch()
          if (refetchDocuments) refetchDocuments()
          setIsRenameDialogOpen(false)
        }
      } else {
        const result = await renameBoardFolder({
          id: itemToRename.id,
          name: newName,
          boardId: params.boardId as string,
          workspaceId: currentWorkspace?.id as string,
        })

        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Folder renamed successfully")
          await refetch()
          if (refetchDocuments) refetchDocuments()
          setIsRenameDialogOpen(false)
        }
      }
    } catch (error) {
      toast.error(`Failed to rename ${itemToRename.type}`)
    }
  }

  // Handle drag start
  const handleDragStart = (event: any) => {
    const { active } = event
    setActiveId(active.id)

    // Extract the dragged item data
    if (active.id.startsWith("document-")) {
      const documentId = active.id.replace("document-", "")
      const document = documentsData?.documents.find((doc) => doc.id === documentId)
      if (document) {
        setActiveItem({ type: "document", data: document })
      }
    } else if (active.id.startsWith("folder-")) {
      const folderId = active.id.replace("folder-", "")
      const folder = documentsData?.folders.find((f) => f.id === folderId)
      if (folder) {
        setActiveItem({ type: "folder", data: folder })
      }
    }
  }

  // Handle drag over
  const handleDragOver = (event: any) => {
    const { over } = event

    if (over) {
      // Clear any existing timeout
      if (dropTimeoutRef.current) {
        clearTimeout(dropTimeoutRef.current)
      }

      // If hovering over a folder, set it as the drop target and expand it after a delay
      if (over.id.startsWith("folder-")) {
        const folderId = over.id.replace("folder-", "")
        setDropTargetId(folderId)

        // Auto-expand folder after hovering for a moment
        dropTimeoutRef.current = setTimeout(() => {
          setExpandedFolders((prev) => {
            const newSet = new Set(prev)
            newSet.add(folderId)
            return newSet
          })
        }, 800) // 800ms delay before auto-expanding
      } else {
        setDropTargetId(over.id)
      }
    } else {
      setDropTargetId(null)
    }
  }

  // Handle drag end
  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    // Clear state
    setActiveId(null)
    setActiveItem(null)
    setDropTargetId(null)

    // Clear any pending timeouts
    if (dropTimeoutRef.current) {
      clearTimeout(dropTimeoutRef.current)
      dropTimeoutRef.current = null
    }

    if (over && active.id !== over.id) {
      // Handle dropping a document into a folder
      if (active.id.startsWith("document-") && over.id.startsWith("folder-")) {
        const documentId = active.id.replace("document-", "")
        const folderId = over.id.replace("folder-", "")

        try {
          // Find the document
          const document = documentsData?.documents.find((doc) => doc.id === documentId)
          if (!document) return

          // Update the document's folderId
          const result = await updateBoardDocument({
            id: documentId,
            title: document.title,
            boardId: params.boardId as string,
            workspaceId: currentWorkspace?.id as string,
          })

          if (result.error) {
            toast.error(result.error)
          } else {
            toast.success("Document moved successfully")
            await refetch()
            if (refetchDocuments) refetchDocuments()

            // Expand the target folder
            setExpandedFolders((prev) => {
              const newSet = new Set(prev)
              newSet.add(folderId)
              return newSet
            })
          }
        } catch (error) {
          toast.error("Failed to move document")
        }
      }

      // Handle dropping a document to root (no folder)
      if (active.id.startsWith("document-") && over.id === "root-drop-area") {
        const documentId = active.id.replace("document-", "")

        try {
          // Find the document
          const document = documentsData?.documents.find((doc) => doc.id === documentId)
          if (!document) return

          // Update the document's folderId to null
          const result = await updateBoardDocument({
            id: documentId,
            title: document.title,
            boardId: params.boardId as string,
            workspaceId: currentWorkspace?.id as string,
          })

          if (result.error) {
            toast.error(result.error)
          } else {
            toast.success("Document moved to root")
            await refetch()
            if (refetchDocuments) refetchDocuments()
          }
        } catch (error) {
          toast.error("Failed to move document")
        }
      }

      // Handle dropping a folder into another folder (nesting)
      if (active.id.startsWith("folder-") && over.id.startsWith("folder-")) {
        const sourceFolderId = active.id.replace("folder-", "")
        const targetFolderId = over.id.replace("folder-", "")

        // Prevent dropping a folder into itself or its descendants
        const isDescendant = (parentId: string, childId: string): boolean => {
          if (parentId === childId) return true

          const folder = documentsData?.folders.find((f) => f.id === childId)
          if (!folder || !folder.parentId) return false

          return isDescendant(parentId, folder.parentId)
        }

        if (isDescendant(sourceFolderId, targetFolderId)) {
          toast.error("Cannot move a folder into itself or its subfolders")
          return
        }

        try {
          // Find the folder
          const folder = documentsData?.folders.find((f) => f.id === sourceFolderId)
          if (!folder) return

          // Update the folder's parentId
          const result = await renameBoardFolder({
            id: sourceFolderId,
            name: folder.name,
            boardId: params.boardId as string,
            workspaceId: currentWorkspace?.id as string,
          })

          if (result.error) {
            toast.error(result.error)
          } else {
            toast.success("Folder moved successfully")
            await refetch()
            if (refetchDocuments) refetchDocuments()

            // Expand the target folder
            setExpandedFolders((prev) => {
              const newSet = new Set(prev)
              newSet.add(targetFolderId)
              return newSet
            })
          }
        } catch (error) {
          toast.error("Failed to move folder")
        }
      }

      // Handle dropping a folder to root
      if (active.id.startsWith("folder-") && over.id === "root-drop-area") {
        const folderId = active.id.replace("folder-", "")

        try {
          // Find the folder
          const folder = documentsData?.folders.find((f) => f.id === folderId)
          if (!folder) return

          // Update the folder's parentId to null
          const result = await renameBoardFolder({
            id: folderId,
            name: folder.name,
            boardId: params.boardId as string,
            workspaceId: currentWorkspace?.id as string,
          })

          if (result.error) {
            toast.error(result.error)
          } else {
            toast.success("Folder moved to root")
            await refetch()
            if (refetchDocuments) refetchDocuments()
          }
        } catch (error) {
          toast.error("Failed to move folder")
        }
      }
    }
  }

  // Function to render folders and their contents recursively
  const renderFolderContents = (folderId: string | null, level = 0) => {
    if (!documentsData) return null

    const folders = documentsData.folders.filter((f) => f.parentId === folderId)
    const documents = documentsData.documents.filter((d) => d.folderId === folderId)

    // Get all item IDs for this level for SortableContext
    const itemIds = [...folders.map((folder) => `folder-${folder.id}`), ...documents.map((doc) => `document-${doc.id}`)]

    return (
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        {folders.map((folder) => (
          <DroppableFolder
            key={folder.id}
            folder={folder}
            isExpanded={expandedFolders.has(folder.id)}
            onToggle={(e) => toggleFolder(folder.id, e)}
            onRename={(e) => openRenameDialog(folder.id, "folder", folder.name, e)}
            onDelete={(e) => handleDeleteFolder(folder.id, e)}
            onAddDocument={(e) => {
              e.stopPropagation()
              setSelectedFolderId(folder.id)
              setIsCreateDocumentOpen(true)
            }}
            onAddFolder={(e) => {
              e.stopPropagation()
              setSelectedFolderId(folder.id)
              setIsCreateFolderOpen(true)
            }}
            dropTargetId={dropTargetId} // Pass dropTargetId as a prop
          >
            {renderFolderContents(folder.id, level + 1)}
          </DroppableFolder>
        ))}

        {documents.map((document) => (
          <DraggableDocument
            key={document.id}
            document={document}
            isSelected={selectedDocumentId === document.id}
            onSelect={() => onSelectDocument(document.id)}
            onRename={(e) => openRenameDialog(document.id, "document", document.title, e)}
            onDelete={(e) => handleDeleteDocument(document.id, e)}
          />
        ))}
      </SortableContext>
    )
  }

  // Render the drag overlay
  const renderDragOverlay = () => {
    if (!activeItem) return null

    if (activeItem.type === "document") {
      return (
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-md shadow-lg border border-blue-200 max-w-[200px]">
          <File className="h-4 w-4 text-blue-500" />
          <span className="text-sm truncate text-gray-700 font-medium">{activeItem.data.title}</span>
        </div>
      )
    }

    if (activeItem.type === "folder") {
      return (
        <div className="flex items-center gap-1.5 bg-white p-2 rounded-md shadow-lg border border-blue-200 max-w-[200px]">
          <Folder className="h-4 w-4 text-blue-500" />
          <span className="text-sm truncate text-gray-700 font-medium">{activeItem.data.name}</span>
        </div>
      )
    }

    return null
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToWindowEdges]}
    >
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedFolderId(null)
                setIsCreateFolderOpen(true)
              }}
              className="h-7 w-7 p-0"
            >
              <FolderPlus className="h-3.5 w-3.5 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (onCreateDocument) {
                  onCreateDocument()
                } else {
                  setSelectedFolderId(null)
                  setIsCreateDocumentOpen(true)
                }
              }}
              className="h-7 w-7 p-0"
            >
              <FilePlus className="h-3.5 w-3.5 text-gray-500" />
            </Button>
          </div>
        </div>

        <div className="px-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
              <p className="text-xs text-gray-400 ml-2">Loading...</p>
            </div>
          ) : documentsData && (documentsData.folders.length > 0 || documentsData.documents.length > 0) ? (
            <div
              id="root-drop-area"
              className={cn(
                "min-h-[50px] rounded-md transition-colors p-1",
                dropTargetId === "root-drop-area"
                  ? "bg-blue-50 border-2 border-dashed border-blue-200"
                  : "border-2 border-transparent",
              )}
            >
              {/* Zone de dépôt racine avec indication visuelle */}
              {activeId && (
                <div className="text-xs text-blue-500 mb-2 font-medium flex items-center justify-center h-6 rounded bg-blue-50 opacity-70">
                  <span>Déposer ici pour déplacer à la racine</span>
                </div>
              )}
              {renderFolderContents(null)}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-center p-4">
              <File className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500 mb-3">No documents yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (onCreateDocument) {
                    onCreateDocument()
                  } else {
                    setSelectedFolderId(null)
                    setIsCreateDocumentOpen(true)
                  }
                }}
                className="text-xs h-8"
              >
                Create your first document
              </Button>
            </div>
          )}
        </div>

        {/* Create Document Dialog */}
        <Dialog open={isCreateDocumentOpen} onOpenChange={setIsCreateDocumentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Document Title"
                value={newDocumentTitle}
                onChange={(e) => setNewDocumentTitle(e.target.value)}
                className="mb-4"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                {selectedFolderId
                  ? "This document will be created in the selected folder."
                  : "This document will be created at the root level."}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsCreateDocumentOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateDocument}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Folder Dialog */}
        <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Folder Name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mb-4"
                autoFocus
              />
              <p className="text-xs text-gray-500">
                {selectedFolderId
                  ? "This folder will be created as a subfolder."
                  : "This folder will be created at the root level."}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateFolder}>
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rename Dialog */}
        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Rename {itemToRename?.type === "document" ? "Document" : "Folder"}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder={itemToRename?.type === "document" ? "Document Title" : "Folder Name"}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleRenameItem}>
                Rename
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Drag Overlay */}
        <DragOverlay
          modifiers={[restrictToWindowEdges]}
          dropAnimation={{
            duration: 200,
            easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
          }}
        >
          {activeId ? renderDragOverlay() : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
}
