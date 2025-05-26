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
  FileText,
  Move,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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
    zIndex: isDragging ? 1000 : "auto",
  }

  return (
    <TooltipProvider>
      <div
        ref={setNodeRef}
        style={style}
        className={cn(
          "group relative flex items-center gap-2 py-1 px-1 rounded-lg hover:bg-accent/50 cursor-pointer transition-all duration-200 border border-transparent",
          isSelected && "bg-accent border-accent-foreground/20 shadow-sm",
          isDragging && "shadow-lg border-primary/30",
        )}
        onClick={onSelect}
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 transition-opacity p-1 -ml-1 hover:bg-accent rounded"
          title="Drag to move document"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>

        {/* Document Icon */}
        <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />

        {/* Document Title with Tooltip for long names */}
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs font-medium truncate flex-1 min-w-0 text-foreground">{document.title}</span>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <p className="break-words">{document.title}</p>
          </TooltipContent>
        </Tooltip>

        {/* Action Buttons */}
        {/* Action menu – caché jusqu’au hover */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-accent"
                onClick={(e) => e.stopPropagation()}  // ne pas sélectionner le doc
                title="Actions"
              >
                <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onRename(e)
                }}
                className="text-xs"
              >
                <Edit className="h-3 w-3 mr-2" />
                Rename
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(e)
                }}
                className="text-xs text-destructive"
              >
                <Trash className="h-3 w-3 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        {/* Drop indicator when dragging */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg pointer-events-none" />
        )}
      </div>
    </TooltipProvider>
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
  dropTargetId,
  documentCount = 0,
}: {
  folder: FolderType
  isExpanded: boolean
  onToggle: (e: React.MouseEvent) => void
  onRename: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  onAddDocument: (e: React.MouseEvent) => void
  onAddFolder: (e: React.MouseEvent) => void
  children?: React.ReactNode
  dropTargetId: string | null
  documentCount?: number
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
    zIndex: isDragging ? 1000 : "auto",
  }

  const isDropTarget = dropTargetId === folder.id

  return (
    <TooltipProvider>
      <div ref={setNodeRef} style={style} className="mb-1">
        <div
          className={cn(
            "group relative flex items-center gap-2 py-2 px-3 mx-1 rounded-lg hover:bg-accent/50 transition-all duration-200 border border-transparent",
            isDropTarget && "bg-primary/10 border-primary/30 shadow-sm ring-1 ring-primary/20",
            isDragging && "shadow-lg border-primary/30",
          )}
        >
          {/* Expand/Collapse Button */}
          {/* Icône dossier / chevron */}
          <div
            onClick={onToggle}
            className="relative h-4 w-4 flex-shrink-0 cursor-pointer"
            title={isExpanded ? 'Réduire' : 'Développer'}
          >
            {/* Dossier fermé (devient transparent au survol) */}
            <Folder
              className={cn(
                'h-4 w-4 transition-opacity duration-200',
                isDropTarget ? 'text-primary' : 'text-amber-500',
                'group-hover:opacity-0',
                isExpanded && 'hidden',
              )}
            />

            {/* Dossier ouvert (affiché quand isExpanded) */}
            <FolderOpen
              className={cn(
                'h-4 w-4 transition-opacity duration-200',
                isDropTarget ? 'text-primary' : 'text-amber-500',
                !isExpanded && 'hidden',
                'group-hover:opacity-0',
              )}
            />

            {/* Chevron : invisible → visible au hover (et pivoté si le dossier est ouvert) */}
            <ChevronRight
              className={cn(
                'absolute inset-0 h-4 w-4 text-muted-foreground transition-opacity duration-200',
                'opacity-0 group-hover:opacity-100',
                isExpanded && 'rotate-90', // facultatif : 90 ° quand le dossier est ouvert
              )}
            />
          </div>


          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-60 transition-opacity p-1 hover:bg-accent rounded"
            title="Drag to move folder"
          >
            <GripVertical className="h-3 w-3 text-muted-foreground" />
          </div>

          {/* Folder Name with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <span
                className={cn(
                  "text-xs font-medium truncate flex-1 min-w-0 cursor-pointer",
                  isDropTarget ? "text-primary font-semibold" : "text-foreground",
                )}
                onClick={onToggle}
              >
                {folder.name}
              </span>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="break-words">{folder.name}</p>
              {documentCount > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {documentCount} document{documentCount !== 1 ? "s" : ""}
                </p>
              )}
            </TooltipContent>
          </Tooltip>

          {/* Document Count Badge */}
          {documentCount > 0 && (
            <Badge variant="secondary" className="text-xs h-5 px-1.5 flex-shrink-0">
              {documentCount}
            </Badge>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddDocument}
              className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
              title="Add document to this folder"
            >
              <Plus className="h-3 w-3" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-accent"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onAddDocument} className="text-xs">
                  <FilePlus className="h-3 w-3 mr-2" />
                  New Document
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onAddFolder} className="text-xs">
                  <FolderPlus className="h-3 w-3 mr-2" />
                  New Subfolder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRename} className="text-xs">
                  <Edit className="h-3 w-3 mr-2" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-xs text-destructive">
                  <Trash className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Drop indicator */}
          {isDropTarget && (
            <div className="absolute inset-0 bg-primary/5 border-2 border-dashed border-primary rounded-lg pointer-events-none" />
          )}
        </div>

        {/* Children with improved indentation */}
        {isExpanded && <div className="ml-6 mt-1 border-l border-border/50 pl-2">{children}</div>}
      </div>
    </TooltipProvider>
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
  const [dropTargetId, setDropTargetId] = useState<string | null>(null)
  const params = useParams()
  const dropTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Configure DnD sensors with better touch support
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
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

  // Auto-expand folders containing selected document
  useEffect(() => {
    if (selectedDocumentId && documentsData) {
      const selectedDoc = documentsData.documents.find((doc) => doc.id === selectedDocumentId)
      if (selectedDoc && selectedDoc.folderId) {
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

  // Helper function to count documents in a folder (including subfolders)
  const getDocumentCount = (folderId: string): number => {
    if (!documentsData) return 0

    const directDocuments = documentsData.documents.filter((doc) => doc.folderId === folderId).length
    const subfolders = documentsData.folders.filter((folder) => folder.parentId === folderId)
    const subfolderDocuments = subfolders.reduce((count, subfolder) => count + getDocumentCount(subfolder.id), 0)

    return directDocuments + subfolderDocuments
  }

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

        // Auto-expand the parent folder
        if (selectedFolderId) {
          setExpandedFolders((prev) => new Set(prev).add(selectedFolderId))
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

        // Auto-expand the parent folder
        if (selectedFolderId) {
          setExpandedFolders((prev) => new Set(prev).add(selectedFolderId))
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

  const handleDragStart = (event: any) => {
    const { active } = event
    setActiveId(active.id)

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

  const handleDragOver = (event: any) => {
    const { over } = event

    if (over) {
      if (dropTimeoutRef.current) {
        clearTimeout(dropTimeoutRef.current)
      }

      if (over.id.startsWith("folder-")) {
        const folderId = over.id.replace("folder-", "")
        setDropTargetId(folderId)

        // Auto-expand folder after hovering
        dropTimeoutRef.current = setTimeout(() => {
          setExpandedFolders((prev) => {
            const newSet = new Set(prev)
            newSet.add(folderId)
            return newSet
          })
        }, 800)
      } else {
        setDropTargetId(over.id)
      }
    } else {
      setDropTargetId(null)
    }
  }

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    setActiveId(null)
    setActiveItem(null)
    setDropTargetId(null)

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
          const document = documentsData?.documents.find((doc) => doc.id === documentId)
          if (!document) return

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

      // Handle dropping a document to root
      if (active.id.startsWith("document-") && over.id === "root-drop-area") {
        const documentId = active.id.replace("document-", "")

        try {
          const document = documentsData?.documents.find((doc) => doc.id === documentId)
          if (!document) return

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

      // Handle folder nesting
      if (active.id.startsWith("folder-") && over.id.startsWith("folder-")) {
        const sourceFolderId = active.id.replace("folder-", "")
        const targetFolderId = over.id.replace("folder-", "")

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
          const folder = documentsData?.folders.find((f) => f.id === sourceFolderId)
          if (!folder) return

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
    }
  }

  const renderFolderContents = (folderId: string | null, level = 0) => {
    if (!documentsData) return null

    const folders = documentsData.folders.filter((f) => f.parentId === folderId)
    const documents = documentsData.documents.filter((d) => d.folderId === folderId)

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
            dropTargetId={dropTargetId}
            documentCount={getDocumentCount(folder.id)}
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

  const renderDragOverlay = () => {
    if (!activeItem) return null

    if (activeItem.type === "document") {
      return (
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg shadow-xl border border-primary/30 max-w-[250px]">
          <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm font-medium truncate text-foreground">{activeItem.data.title}</span>
          <Move className="h-3 w-3 text-muted-foreground flex-shrink-0" />
        </div>
      )
    }

    if (activeItem.type === "folder") {
      return (
        <div className="flex items-center gap-2 bg-background p-3 rounded-lg shadow-xl border border-primary/30 max-w-[250px]">
          <Folder className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <span className="text-sm font-medium truncate text-foreground">{activeItem.data.name}</span>
          <Move className="h-3 w-3 text-muted-foreground flex-shrink-0" />
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
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header with action buttons */}
        <div className="flex items-center justify-end p-1 border-b bg-background/50 backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFolderId(null)
                      setIsCreateFolderOpen(true)
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <FolderPlus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new folder</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
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
                    className="h-8 w-8 p-0"
                  >
                    <FilePlus className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Create new document</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading documents...</p>
                </div>
              </div>
            ) : documentsData && (documentsData.folders.length > 0 || documentsData.documents.length > 0) ? (
              <div
                id="root-drop-area"
                className={cn(
                  "min-h-[100px] rounded-lg transition-all duration-200 p-2",
                  dropTargetId === "root-drop-area"
                    ? "bg-primary/5 border-2 border-dashed border-primary/30"
                    : "border-2 border-transparent",
                )}
              >
                {/* Root drop indicator */}
                {activeId && dropTargetId === "root-drop-area" && (
                  <div className="text-xs text-primary mb-3 font-medium flex items-center justify-center h-8 rounded-md bg-primary/10 border border-primary/20">
                    <Move className="h-3 w-3 mr-1" />
                    <span>Drop here to move to root level</span>
                  </div>
                )}
                {renderFolderContents(null)}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center p-6">
                <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="text-sm font-medium text-foreground mb-2">No documents yet</h4>
                <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">
                  Create your first document or folder to get started organizing your content.
                </p>
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
                  <FilePlus className="h-3 w-3 mr-1" />
                  Create Document
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Create Document Dialog */}
        <Dialog open={isCreateDocumentOpen} onOpenChange={setIsCreateDocumentOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <Input
                placeholder="Enter document title..."
                value={newDocumentTitle}
                onChange={(e) => setNewDocumentTitle(e.target.value)}
                className="mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateDocument()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {selectedFolderId
                  ? "This document will be created in the selected folder."
                  : "This document will be created at the root level."}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsCreateDocumentOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateDocument} disabled={!newDocumentTitle.trim()}>
                Create Document
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
                placeholder="Enter folder name..."
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="mb-4"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">
                {selectedFolderId
                  ? "This folder will be created as a subfolder."
                  : "This folder will be created at the root level."}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsCreateFolderOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Create Folder
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
                placeholder={itemToRename?.type === "document" ? "Enter document title..." : "Enter folder name..."}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameItem()
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setIsRenameDialogOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleRenameItem} disabled={!newName.trim()}>
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
