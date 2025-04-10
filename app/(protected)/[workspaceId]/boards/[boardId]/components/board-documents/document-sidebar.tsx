"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { toast } from "sonner";
import {
    ChevronRight,
    File,
    Folder,
    FolderPlus,
    FilePlus,
    MoreVertical,
    Trash,
    Edit,
    FolderOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { createBoardDocument } from "@/actions/board-documents/create-document";
import { createBoardFolder } from "@/actions/board-documents/create-folder";
import { deleteBoardDocument } from "@/actions/board-documents/delete-document";
import { deleteBoardFolder } from "@/actions/board-documents/delete-folder";
import { renameBoardDocument } from "@/actions/board-documents/rename-document";
import { renameBoardFolder } from "@/actions/board-documents/rename-folder";

interface DocumentSidebarProps {
    params: {
        boardId: string;
        workspaceId: string;
    };
    selectedDocumentId?: string;
    onSelectDocument: (documentId: string) => void;
}

interface Document {
    id: string;
    title: string;
    folderId: string | null;
}

interface Folder {
    id: string;
    name: string;
    parentId: string | null;
}

interface DocumentsData {
    documents: Document[];
    folders: Folder[];
}

export function DocumentSidebar({ params, selectedDocumentId, onSelectDocument }: DocumentSidebarProps) {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
    const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [newDocumentTitle, setNewDocumentTitle] = useState("");
    const [newFolderName, setNewFolderName] = useState("");
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [itemToRename, setItemToRename] = useState<{ id: string; type: 'document' | 'folder'; name: string } | null>(null);
    const [newName, setNewName] = useState("");

    const { data: documentsData, isLoading } = useQuery<DocumentsData>({
        queryKey: ["board-documents", params.boardId],
        queryFn: () => fetcher(`/api/boards/${currentWorkspace?.id}/${params.boardId}/documents`),
        enabled: !!params.boardId,
    });

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };

    const handleCreateDocument = async () => {
        if (!newDocumentTitle.trim()) {
            toast.error("Document title is required");
            return;
        }

        try {
            const result = await createBoardDocument({
                title: newDocumentTitle,
                boardId: params.boardId as string,
                workspaceId: currentWorkspace?.id as string,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Document created successfully");
                queryClient.invalidateQueries({
                    queryKey: ["board-documents", params.boardId],
                });
                setNewDocumentTitle("");
                setIsCreateDocumentOpen(false);
                if (result.data?.id) {
                    onSelectDocument(result.data.id);
                }
            }
        } catch (error) {
            toast.error("Failed to create document");
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) {
            toast.error("Folder name is required");
            return;
        }

        try {
            const result = await createBoardFolder({
                name: newFolderName,
                boardId: params.boardId as string,
                workspaceId: currentWorkspace?.id as string,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Folder created successfully");
                queryClient.invalidateQueries({
                    queryKey: ["board-documents", params.boardId],
                });
                setNewFolderName("");
                setIsCreateFolderOpen(false);

                // Expand the parent folder if a subfolder was created
                if (selectedFolderId) {
                    setExpandedFolders(prev => {
                        const newSet = new Set(prev);
                        newSet.add(selectedFolderId);
                        return newSet;
                    });
                }
            }
        } catch (error) {
            toast.error("Failed to create folder");
        }
    };

    const handleDeleteDocument = async (documentId: string) => {
        try {
            const result = await deleteBoardDocument({
                id: documentId,
                boardId: params.boardId as string,
                workspaceId: currentWorkspace?.id as string,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Document deleted successfully");
                queryClient.invalidateQueries({
                    queryKey: ["board-documents", params.boardId],
                });

                // If the deleted document was selected, clear the selection
                if (selectedDocumentId === documentId) {
                    onSelectDocument(null);
                }
            }
        } catch (error) {
            toast.error("Failed to delete document");
        }
    };

    const handleDeleteFolder = async (folderId: string) => {
        try {
            const result = await deleteBoardFolder({
                id: folderId,
                boardId: params.boardId as string,
                workspaceId: currentWorkspace?.id as string,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Folder deleted successfully");
                queryClient.invalidateQueries({
                    queryKey: ["board-documents", params.boardId],
                });
            }
        } catch (error) {
            toast.error("Failed to delete folder");
        }
    };

    const handleRenameItem = () => {
        if (!itemToRename || !newName.trim()) return;

        if (itemToRename.type === 'document') {
            renameBoardDocument({
                id: itemToRename.id,
                title: newName,
                boardId: params.boardId as string,
                workspaceId: currentWorkspace?.id as string,
            }).then((result) => {
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Document renamed successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["board-documents", params.boardId],
                    });
                    setIsRenameDialogOpen(false);
                }
            }).catch(() => {
                toast.error("Failed to rename document");
            });
        } else {
            renameBoardFolder({
                id: itemToRename.id,
                name: newName,
                boardId: params.boardId as string,
                workspaceId: currentWorkspace?.id as string,
            }).then((result) => {
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success("Folder renamed successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["board-documents", params.boardId],
                    });
                    setIsRenameDialogOpen(false);
                }
            }).catch(() => {
                toast.error("Failed to rename folder");
            });
        }
    };

    const openRenameDialog = (id: string, type: 'document' | 'folder', currentName: string) => {
        setItemToRename({ id, type, name: currentName });
        setNewName(currentName);
        setIsRenameDialogOpen(true);
    };

    const renderFolderContents = (folderId: string | null, level = 0) => {
        const folders = documentsData?.folders.filter(f => f.parentId === folderId) || [];
        const documents = documentsData?.documents.filter(d => d.folderId === folderId) || [];

        return (
            <>
                {folders.map((folder) => (
                    <div key={folder.id} className="mb-1">
                        <div
                            className={cn(
                                "flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer",
                                level > 0 && `ml-${level * 4}`
                            )}
                        >
                            <div
                                className="flex items-center gap-2 flex-1"
                                onClick={() => toggleFolder(folder.id)}
                            >
                                <ChevronRight
                                    className={cn(
                                        "h-4 w-4 transition-transform",
                                        expandedFolders.has(folder.id) && "transform rotate-90"
                                    )}
                                />
                                {expandedFolders.has(folder.id) ? (
                                    <FolderOpen className="h-4 w-4 text-yellow-500" />
                                ) : (
                                    <Folder className="h-4 w-4 text-yellow-500" />
                                )}
                                <span className="text-sm truncate">{folder.name}</span>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFolderId(folder.id);
                                            setIsCreateDocumentOpen(true);
                                        }}
                                    >
                                        <FilePlus className="h-4 w-4 mr-2" />
                                        New Document
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFolderId(folder.id);
                                            setIsCreateFolderOpen(true);
                                        }}
                                    >
                                        <FolderPlus className="h-4 w-4 mr-2" />
                                        New Folder
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openRenameDialog(folder.id, 'folder', folder.name);
                                        }}
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteFolder(folder.id);
                                        }}
                                        className="text-red-600"
                                    >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {expandedFolders.has(folder.id) && (
                            <div className="ml-4">
                                {renderFolderContents(folder.id, level + 1)}
                            </div>
                        )}
                    </div>
                ))}

                {documents.map((document) => (
                    <div
                        key={document.id}
                        className={cn(
                            "flex items-center justify-between py-1 px-2 rounded-md hover:bg-gray-100 cursor-pointer",
                            selectedDocumentId === document.id && "bg-blue-50",
                            level > 0 && `ml-${level * 4}`
                        )}
                    >
                        <div
                            className="flex items-center gap-2 flex-1"
                            onClick={() => onSelectDocument(document.id)}
                        >
                            <File className="h-4 w-4 text-blue-500 ml-6" />
                            <span className="text-sm truncate">{document.title}</span>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openRenameDialog(document.id, 'document', document.title);
                                    }}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Rename
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteDocument(document.id);
                                    }}
                                    className="text-red-600"
                                >
                                    <Trash className="h-4 w-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </>
        );
    };

    return (
        <div className="w-64 border-r h-full bg-white overflow-y-auto">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Documents</h3>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSelectedFolderId(null);
                                setIsCreateDocumentOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                        >
                            <FilePlus className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setSelectedFolderId(null);
                                setIsCreateFolderOpen(true);
                            }}
                            className="h-8 w-8 p-0"
                        >
                            <FolderPlus className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="p-2">
                {isLoading ? (
                    <div className="flex items-center justify-center h-20">
                        <p className="text-sm text-gray-500">Loading documents...</p>
                    </div>
                ) : documentsData && (documentsData.folders.length > 0 || documentsData.documents.length > 0) ? (
                    renderFolderContents(null)
                ) : (
                    <div className="flex flex-col items-center justify-center h-40 text-center">
                        <File className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 mb-2">No documents yet</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedFolderId(null);
                                setIsCreateDocumentOpen(true);
                            }}
                            className="text-xs"
                        >
                            Create your first document
                        </Button>
                    </div>
                )}
            </div>

            {/* Create Document Dialog */}
            <Dialog open={isCreateDocumentOpen} onOpenChange={setIsCreateDocumentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Document</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Document Title"
                            value={newDocumentTitle}
                            onChange={(e) => setNewDocumentTitle(e.target.value)}
                            className="mb-4"
                        />
                        <p className="text-sm text-gray-500">
                            {selectedFolderId
                                ? "This document will be created in the selected folder."
                                : "This document will be created at the root level."}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateDocumentOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateDocument}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Create Folder Dialog */}
            <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder="Folder Name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            className="mb-4"
                        />
                        <p className="text-sm text-gray-500">
                            {selectedFolderId
                                ? "This folder will be created as a subfolder."
                                : "This folder will be created at the root level."}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateFolder}>
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Rename {itemToRename?.type === 'document' ? 'Document' : 'Folder'}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Input
                            placeholder={itemToRename?.type === 'document' ? "Document Title" : "Folder Name"}
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleRenameItem}>
                            Rename
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
