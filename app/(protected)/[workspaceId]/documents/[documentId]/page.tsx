"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { DocumentHeader } from "./document-header";
import { Editor } from "./editor";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Link2, Check, RotateCw } from "lucide-react";
import { LinkCardsDialog } from "./links-cards-dialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentPage() {
    const params = useParams();
    const router = useRouter();
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
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
            <div className="border-b bg-white dark:bg-gray-800 shadow-sm">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <DocumentHeader document={document} />
                        <div className="flex items-center gap-4">
                            {isSaving ? (
                                <div className="text-sm text-muted-foreground flex items-center"><RotateCw className="h-4 w-4 mr-2" />Auto saving...</div>
                            ) : (
                              <p className="text-gray-400 flex items-center"><Check className="h-4 w-4 mr-2" />Saved</p>
                            )}
                
                            <Button
                                variant="outline"
                                onClick={() => setIsLinkCardsOpen(true)}
                            >
                                <Link2 className="h-4 w-4 mr-2" />
                                Link Cards
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Card className="bg-white dark:bg-gray-800 shadow-sm">
                        <Editor
                            document={document}
                            onContentChange={handleAutoSave}
                        />
                    </Card>
                </div>
            </div>
            <LinkCardsDialog
                isOpen={isLinkCardsOpen}
                onClose={() => setIsLinkCardsOpen(false)}
                documentId={documentId}
            />
        </div>
    );
}