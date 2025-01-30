"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { DocumentHeader } from "./document-header";
import { Editor } from "./editor";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentPage() {
    const params = useParams();
    const { currentWorkspace } = useCurrentWorkspace();
    const { setBreadcrumbs } = useBreadcrumbs();
    const documentId = params.documentId as string;
    const [isLinkCardsOpen, setIsLinkCardsOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

    
    const { data: document, isLoading } = useQuery({
        queryKey: ["document", documentId],
        queryFn: () => fetcher(`/api/documents/${documentId}`),
        enabled: !!documentId,
    });

    useEffect(() => {
        if (document) {
            setBreadcrumbs([
                { label: "Documents", href: `/${currentWorkspace?.id}/documents` },
                { label: document.title },
            ]);
        }
    }, [document, setBreadcrumbs, currentWorkspace?.id]);

    const handleAutoSave = () => {
        setIsSaving(true);
        if (autoSaveTimer) {
            clearTimeout(autoSaveTimer);
        }
        setAutoSaveTimer(
            setTimeout(() => {
                setIsSaving(false);
            }, 2000)
        );
    };

    if (isLoading) {
        return <Skeleton />;
    }

    if (!document) {
        return <div>Document not found</div>;
    }

    return (
        <div className="flex flex-col dark:bg-gray-900">
            <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <DocumentHeader document={document} />
                       

                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm h-screen">
                        <Editor
                            document={document}
                            onContentChange={handleAutoSave}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}