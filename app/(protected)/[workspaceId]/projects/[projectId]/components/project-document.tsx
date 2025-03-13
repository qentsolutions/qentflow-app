"use client";

import { useRouter } from "next/navigation";
import { Plus, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { DocumentCard } from "../../../documents/components/document-card";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addDocumentToProject } from "@/actions/projects/add-document-to-project";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-action";
import { createDocument } from "@/actions/documents/create-document";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Search } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { fetcher } from "@/lib/fetcher";

interface ProjectDocumentsProps {
    project: any;
    onUpdate: () => void;
}

export function ProjectDocuments({ project, onUpdate }: ProjectDocumentsProps) {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch all documents from workspace
    const { data: allDocuments } = useQuery({
        queryKey: ["documents", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/documents?workspaceId=${currentWorkspace?.id}`),
    });

    // Filter out documents that are already in the project
    const availableDocuments = allDocuments?.filter(
        (doc: any) => !project.documents.some((projectDoc: any) => projectDoc.id === doc.id)
    );

    const { execute: executeCreateDocument } = useAction(createDocument, {
        onSuccess: (data) => {
            toast.success(`Document "${data.title}" created`);
            setIsCreateDialogOpen(false);
            setTitle("");
            queryClient.invalidateQueries({
                queryKey: ["project", project.id],
            });
            onUpdate();
            router.push(`/${currentWorkspace?.id}/documents/${data.id}`);
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const handleCreateDocument = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        executeCreateDocument({
            title,
            workspaceId: currentWorkspace?.id || "",
            projectId: project.id,
        });
    };

    const handleAssociateDocument = async (documentId: string) => {
        try {
            await addDocumentToProject({
                documentId,
                projectId: project.id,
                workspaceId: currentWorkspace?.id || "",
            });

            queryClient.invalidateQueries({
                queryKey: ["project", project.id],
            });
            onUpdate();
            toast.success("Document associated with project");
        } catch (error) {
            toast.error("Failed to associate document");
        }
    };

    const filteredDocuments = availableDocuments?.filter((doc: any) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Project Documents</h2>
                <div className="flex gap-2">
                    <Dialog open={isAssociateDialogOpen} onOpenChange={setIsAssociateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <LinkIcon className="h-4 w-4" />
                                Associate Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Associate Existing Document</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Search documents..."
                                        className="pl-9"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <ScrollArea className="h-[300px]">
                                    <div className="space-y-2">
                                        {filteredDocuments?.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center p-4">
                                                No available documents found
                                            </p>
                                        ) : (
                                            filteredDocuments?.map((doc: any) => (
                                                <div
                                                    key={doc.id}
                                                    className="flex items-center justify-between p-3 hover:bg-muted rounded-lg"
                                                >
                                                    <span className="font-medium">{doc.title}</span>
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAssociateDocument(doc.id)}
                                                    >
                                                        Associate
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </div>
                        </DialogContent>
                    </Dialog>
                    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Document
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Document</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateDocument} className="space-y-4">
                                <div>
                                    <Input
                                        placeholder="Enter document title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsCreateDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button type="submit">
                                        Create Document
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {project.documents && project.documents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {project.documents.map((document: any) => (
                        <DocumentCard
                            key={document.id}
                            document={document}
                            onClick={() => router.push(`/${currentWorkspace?.id}/documents/${document.id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10">
                    <p className="text-muted-foreground">No documents yet</p>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="mt-4"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first document
                    </Button>
                </div>
            )}
        </div>
    );
}