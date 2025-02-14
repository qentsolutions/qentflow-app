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
import { motion } from "framer-motion";

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
        return (
            <div className="flex flex-col space-y-4 p-8">
                <Skeleton className="h-12 w-[300px]" />
                <Skeleton className="h-[600px] w-full" />
            </div>
        );
    }

    if (!document) {
        return (
            <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Document not found</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col dark:bg-gray-900"
        >
            <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <DocumentHeader document={document} />
                        {isSaving && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm text-muted-foreground"
                            >
                                Saving...
                            </motion.span>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-8">
                    <div className="flex gap-6">
                        <Card className="flex-1 bg-white dark:bg-gray-800 shadow-sm h-screen border-none">
                            <Editor
                                document={document}
                                onContentChange={handleAutoSave}
                            />
                        </Card>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}