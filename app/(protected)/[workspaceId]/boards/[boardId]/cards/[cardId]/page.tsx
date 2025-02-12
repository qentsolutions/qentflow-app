"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Header } from "@/components/modals/card-modal/header";
import { Description } from "@/components/modals/card-modal/description";
import { Activity } from "@/components/modals/card-modal/activity";
import { Comments } from "@/components/modals/card-modal/comments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Details from "@/components/modals/card-modal/details";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { AttachmentList } from "@/components/modals/card-modal/attachment-list";
import { useEffect, useState } from "react";
import { DocumentSelector } from "@/components/modals/card-modal/document-selector";
import { Priority } from "@/components/modals/card-modal/priority";
import { Tasks } from "@/components/modals/card-modal/tasks";
import { TagsComponent } from "@/components/modals/card-modal/tags";
import DateComponent from "@/components/modals/card-modal/date";
import { ActivityIcon, FileText, MessageSquareText, Logs } from "lucide-react";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { Actions } from "@/components/modals/card-modal/actions";

{/* 
interface CardPageProps {
    params: {
        cardId: string;
        workspaceId: string;
        boardId: string;
    };
    readonly: boolean;
}
*/}

const CardPage = ({ params, readonly }: any) => {
    const { currentWorkspace } = useCurrentWorkspace();
    const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);
    const { setBreadcrumbs } = useBreadcrumbs();

    const { data: cardData } = useQuery({
        queryKey: ["card", params.cardId],
        queryFn: () => fetcher(`/api/cards/${params.cardId}`),
    });

    const { data: boardData } = useQuery({
        queryKey: ["board", params.boardId],
        queryFn: () => fetcher(`/api/boards/title?boardId=${params.boardId}`),
    });

    const { data: commentsData } = useQuery({
        queryKey: ["card-comments", params.cardId],
        queryFn: () => fetcher(`/api/cards/${params.cardId}/comments`),
    });

    const { data: auditLogsData } = useQuery({
        queryKey: ["card-logs", params.cardId],
        queryFn: () => fetcher(`/api/cards/${params.cardId}/logs`),
    });

    const { data: availableTags } = useQuery({
        queryKey: ["available-tags", params.boardId],
        queryFn: () => fetcher(`/api/boards/tags?boardId=${params.boardId}`),
    });

    useEffect(() => {
        if (boardData && cardData) {
            setBreadcrumbs([
                { label: "Boards", href: `/${currentWorkspace?.id}/boards` },
                { label: boardData.title || "no board", href: `/${currentWorkspace?.id}/boards/${params.boardId}` },
                { label: cardData.title }
            ]);
        }
    }, [boardData, cardData, params.boardId, setBreadcrumbs, currentWorkspace?.id]);

    if (!params.boardId) return null;

    if (!cardData || !boardData) {
        return <div></div>;
    }

    return (
        <div className="flex h-full bg-gray-50">
            <div className="flex-1 overflow-y-auto p-2">
                <div className="max-w-7xl mx-auto p-8 border space-y-6 bg-white">
                    {!cardData ? (
                        <Header.Skeleton />
                    ) : (
                        <Header data={cardData} readonly={readonly} />
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
                        <div className="col-span-3">
                            <div className="w-full space-y-6">
                                {!cardData ? (
                                    <Description.Skeleton />
                                ) : (
                                    <Description data={cardData} readonly={readonly} />
                                )}
                                {!cardData ? (
                                    <Tasks.Skeleton />
                                ) : (
                                    <Tasks cardId={cardData.id} />
                                )}
                                {!cardData ? (
                                    <AttachmentList.Skeleton />
                                ) : (
                                    <div className="flex items-start space-x-8">
                                        <div className="w-1/2">
                                            <div className="flex items-center justify-between">
                                                <span className="font-bold text-lg flex items-center">
                                                    <FileText size={12} className="mr-2" /> Documents
                                                </span>
                                            </div>
                                            <DocumentSelector
                                                isOpen={isDocumentSelectorOpen}
                                                onClose={() => setIsDocumentSelectorOpen(false)}
                                                cardId={cardData?.id || ""}
                                                workspaceId={currentWorkspace?.id!}
                                            />
                                        </div>
                                    </div>
                                )}
                                {!commentsData ? (
                                    <Comments.Skeleton />
                                ) : (
                                    <div>
                                        <span className="font-bold text-lg flex items-center">
                                            <ActivityIcon size={12} className="mr-2" /> Activity
                                        </span>
                                        <Tabs defaultValue="comments">
                                            <TabsList>
                                                <TabsTrigger value="comments">
                                                    <MessageSquareText size={12} className="mr-1" /> Comments
                                                </TabsTrigger>
                                                <TabsTrigger value="logs">
                                                    <Logs size={12} className="mr-1" /> Logs
                                                </TabsTrigger>
                                            </TabsList>
                                            <TabsContent value="comments">
                                                <Comments items={commentsData} cardId={cardData?.id ?? ''} readonly={readonly} />
                                            </TabsContent>
                                            <TabsContent value="logs">
                                                {!auditLogsData ? (
                                                    <Activity.Skeleton />
                                                ) : (
                                                    <Activity items={auditLogsData} />
                                                )}
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                )}
                            </div>
                        </div>
                        {!cardData ? (
                            <Description.Skeleton />
                        ) : (
                            <div>
                                <div className="mb-2 flex items-center justify-end w-full">
                                    <Actions card={cardData} readonly={readonly} boardId={params.boardId} />
                                </div>
                                <Details card={cardData} />
                                <TagsComponent data={cardData} availableTags={availableTags ?? []} readonly={readonly} />
                                <Priority data={cardData} readonly={readonly} />
                                <DateComponent card={cardData} readonly={readonly} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardPage;
