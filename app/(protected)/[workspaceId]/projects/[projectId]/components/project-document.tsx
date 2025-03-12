"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { DocumentCard } from "../../../documents/components/document-card";

interface ProjectDocumentsProps {
    project: any;
}

export function ProjectDocuments({ project }: ProjectDocumentsProps) {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();

    const handleCreateDocument = () => {
        router.push(`/${currentWorkspace?.id}/documents`);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Project Documents</h2>
                <Button onClick={handleCreateDocument} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Document
                </Button>
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
                    <Button onClick={handleCreateDocument} className="mt-4">
                        <Plus className="h-4 w-4 mr-2" />
                        Create your first document
                    </Button>
                </div>
            )}
        </div>
    );
}