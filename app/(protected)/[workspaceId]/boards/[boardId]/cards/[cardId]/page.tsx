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
import { ActivityIcon, FileText, MessageSquareText, Logs, ExternalLink, Paperclip, Plus, Trash2 } from "lucide-react";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { Actions } from "@/components/modals/card-modal/actions";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUpload } from "@/components/file-upload";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BreadcrumbHeader } from "@/components/breadcrumbs";
import { ListWithCards } from "@/types";

const CardPage = ({ params, readonly }: any) => {
    const { currentWorkspace } = useCurrentWorkspace();
    const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);
    const { setBreadcrumbs } = useBreadcrumbs();
    const [visibleDocuments, setVisibleDocuments] = useState(2);

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

    const { data: attachments, refetch: refetchAttachments } = useQuery({
        queryKey: ["card-attachments", params.cardId],
        queryFn: () => fetcher(`/api/cards/${params.cardId}/attachments`),
    });

    useEffect(() => {
        if (boardData && cardData) {
            setBreadcrumbs([
                { label: "Projects", href: `/${currentWorkspace?.id}/boards` },
                { label: boardData.title || "no project", href: `/${currentWorkspace?.id}/boards/${params.boardId}` },
                { label: cardData.title }
            ]);
        }
    }, [boardData, cardData, params.boardId, setBreadcrumbs, currentWorkspace?.id]);

    if (!params.boardId) return null;

    const handleDocumentClick = (documentId: string) => {
        window.open(`/${currentWorkspace?.id}/documents/${documentId}`, '_blank');
    };

    if (!cardData || !boardData) {
        return <div></div>;
    }

    return (
        <div className="flex h-full bg-gray-50">
            <div className="flex-1 overflow-y-auto pl-2 pt-2">
                <div className="max-w-7xl mx-auto px-8 pb-8 pt-4 border space-y-6 bg-white">
                    <BreadcrumbHeader />
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
                                {readonly ? (
                                    <div>
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
                                                    <div className="space-y-3 mt-2">
                                                        {!cardData ? (
                                                            <Description.Skeleton />
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {cardData?.documents && cardData.documents.length > 0 ? (
                                                                    <>
                                                                        {cardData.documents.slice(0, visibleDocuments).map((doc: any) => (
                                                                            <Card
                                                                                key={doc.id}
                                                                                className="p-3 hover:bg-gray-100 shadow-none dark:hover:bg-gray-800 cursor-pointer transition"
                                                                                onClick={() => handleDocumentClick(doc.id)}
                                                                            >
                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <div className="flex items-center gap-x-2">
                                                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger>
                                                                                                <div className="truncate max-w-[250px]">
                                                                                                    <p className="font-medium text-sm">{doc.title}</p>
                                                                                                </div>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                <p className="font-medium text-sm">{doc.title}</p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                    <ExternalLink className="h-4 w-4 text-blue-500" />
                                                                                </div>
                                                                            </Card>
                                                                        ))}
                                                                        {cardData.documents.length > 2 && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setVisibleDocuments(prev => prev === 2 ? cardData.documents.length : 2)}
                                                                                className="w-full mt-2 text-blue-500 hover:text-blue-600"
                                                                            >
                                                                                {visibleDocuments === 2 ? `See more (${cardData.documents.length - 2})` : 'See less'}
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div className="text-gray-700 text-xs py-1">No documents linked.</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-1/2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-lg flex items-center">
                                                            <Paperclip size={12} className="mr-2" /> Attachments
                                                        </span>
                                                        {!readonly && (
                                                            <Dialog>
                                                                <DialogTrigger>
                                                                    <Button className="border-none shadow-none" variant={"outline"}>
                                                                        <Plus />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogTitle>Add Attachment to Card</DialogTitle>
                                                                    <FileUpload
                                                                        cardId={cardData?.id || ""}
                                                                        workspaceId={currentWorkspace?.id!}
                                                                        onUploadComplete={() => {
                                                                            refetchAttachments();
                                                                        }}
                                                                    />
                                                                    <p className="text-lg font-semibold">All Attachments</p>
                                                                    <ScrollArea className="h-56">
                                                                        <div className="space-y-2">
                                                                            {attachments && attachments.length > 0 ? (
                                                                                attachments.map((attachment: any) => (
                                                                                    <Card key={attachment.id} className="p-3 flex items-center justify-between">
                                                                                        <div className="flex items-center space-x-3">
                                                                                            {(attachment.type)}
                                                                                            <div>
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger>
                                                                                                        <a
                                                                                                            href={attachment.url}
                                                                                                            target="_blank"
                                                                                                            rel="noopener noreferrer"
                                                                                                            className="text-blue-500 hover:underline font-medium"
                                                                                                        >
                                                                                                            {attachment.name.length > 20 ? `${attachment.name.substring(0, 40)}...` : attachment.name}
                                                                                                        </a>
                                                                                                    </TooltipTrigger>
                                                                                                    <TooltipContent>
                                                                                                        <p>{attachment.name}</p>
                                                                                                    </TooltipContent>
                                                                                                </Tooltip>

                                                                                            </div>
                                                                                        </div>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => { }}
                                                                                        >
                                                                                            <Trash2 size={16} className="text-red-500" />
                                                                                        </Button>
                                                                                    </Card>
                                                                                ))
                                                                            ) : (
                                                                                <div className="text-gray-700 text-xs">No attachments found.</div>
                                                                            )}
                                                                        </div>
                                                                    </ScrollArea>

                                                                </DialogContent>
                                                            </Dialog>
                                                        )}

                                                    </div>

                                                    <div className="space-y-3 mt-2 mb-4">
                                                        {!cardData ? (
                                                            <Description.Skeleton />
                                                        ) : (
                                                            <AttachmentList cardId={cardData?.id || ""} readonly={readonly} />
                                                        )}
                                                    </div>
                                                </div>

                                            </div>
                                        )}
                                        {!cardData ? (
                                            <Tasks.Skeleton />
                                        ) : (
                                            <Tasks cardId={cardData.id} />
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        {!cardData ? (
                                            <Tasks.Skeleton />
                                        ) : (
                                            <Tasks cardId={cardData.id} />
                                        )}
                                        {!cardData ? (
                                            <AttachmentList.Skeleton />
                                        ) : (
                                            <div className="flex items-start space-x-8 mt-8">
                                                <div className="w-1/2 mt-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-lg flex items-center">
                                                            <FileText size={12} className="mr-2" /> Documents
                                                        </span>
                                                        <Button
                                                            className="border-none shadow-none"
                                                            variant="outline"
                                                            onClick={() => setIsDocumentSelectorOpen(true)}
                                                        >
                                                            <Plus />
                                                        </Button>
                                                    </div>
                                                    <DocumentSelector
                                                        isOpen={isDocumentSelectorOpen}
                                                        onClose={() => setIsDocumentSelectorOpen(false)}
                                                        cardId={cardData?.id || ""}
                                                        workspaceId={currentWorkspace?.id!}
                                                    />
                                                    <div className="space-y-3 mt-2">
                                                        {!cardData ? (
                                                            <Description.Skeleton />
                                                        ) : (
                                                            <div className="space-y-2">
                                                                {cardData?.documents && cardData.documents.length > 0 ? (
                                                                    <>
                                                                        {cardData.documents.slice(0, visibleDocuments).map((doc: any) => (
                                                                            <Card
                                                                                key={doc.id}
                                                                                className="p-3 hover:bg-gray-100 shadow-none dark:hover:bg-gray-800 cursor-pointer transition"
                                                                                onClick={() => handleDocumentClick(doc.id)}
                                                                            >
                                                                                <div className="flex items-center justify-between gap-2">
                                                                                    <div className="flex items-center gap-x-2">
                                                                                        <FileText className="h-4 w-4 text-blue-500" />
                                                                                        <Tooltip>
                                                                                            <TooltipTrigger>
                                                                                                <div className="truncate max-w-[250px]">
                                                                                                    <p className="font-medium text-sm">{doc.title}</p>
                                                                                                </div>
                                                                                            </TooltipTrigger>
                                                                                            <TooltipContent>
                                                                                                <p className="font-medium text-sm">{doc.title}</p>
                                                                                            </TooltipContent>
                                                                                        </Tooltip>
                                                                                    </div>
                                                                                    <ExternalLink className="h-4 w-4 text-blue-500" />
                                                                                </div>
                                                                            </Card>
                                                                        ))}
                                                                        {cardData.documents.length > 2 && (
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => setVisibleDocuments(prev => prev === 2 ? cardData.documents.length : 2)}
                                                                                className="w-full mt-2 text-blue-500 hover:text-blue-600"
                                                                            >
                                                                                {visibleDocuments === 2 ? `See more (${cardData.documents.length - 2})` : 'See less'}
                                                                            </Button>
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <div className="text-gray-700 text-xs py-1">No documents linked.</div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-1/2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-lg flex items-center">
                                                            <Paperclip size={12} className="mr-2" /> Attachments
                                                        </span>
                                                        {!readonly && (
                                                            <Dialog>
                                                                <DialogTrigger>
                                                                    <Button className="border-none shadow-none" variant={"outline"}>
                                                                        <Plus />
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent>
                                                                    <DialogTitle>Add Attachment to Card</DialogTitle>
                                                                    <FileUpload
                                                                        cardId={cardData?.id || ""}
                                                                        workspaceId={currentWorkspace?.id!}
                                                                        onUploadComplete={() => {
                                                                            refetchAttachments();
                                                                        }}
                                                                    />
                                                                    <p className="text-lg font-semibold">All Attachments</p>
                                                                    <ScrollArea className="h-56">
                                                                        <div className="space-y-2">
                                                                            {attachments && attachments.length > 0 ? (
                                                                                attachments.map((attachment: any) => (
                                                                                    <Card key={attachment.id} className="p-3 flex items-center justify-between">
                                                                                        <div className="flex items-center space-x-3">
                                                                                            {(attachment.type)}
                                                                                            <div>
                                                                                                <Tooltip>
                                                                                                    <TooltipTrigger>
                                                                                                        <a
                                                                                                            href={attachment.url}
                                                                                                            target="_blank"
                                                                                                            rel="noopener noreferrer"
                                                                                                            className="text-blue-500 hover:underline font-medium"
                                                                                                        >
                                                                                                            {attachment.name.length > 20 ? `${attachment.name.substring(0, 40)}...` : attachment.name}
                                                                                                        </a>
                                                                                                    </TooltipTrigger>
                                                                                                    <TooltipContent>
                                                                                                        <p>{attachment.name}</p>
                                                                                                    </TooltipContent>
                                                                                                </Tooltip>

                                                                                            </div>
                                                                                        </div>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => { }}
                                                                                        >
                                                                                            <Trash2 size={16} className="text-red-500" />
                                                                                        </Button>
                                                                                    </Card>
                                                                                ))
                                                                            ) : (
                                                                                <div className="text-gray-700 text-xs">No attachments found.</div>
                                                                            )}
                                                                        </div>
                                                                    </ScrollArea>

                                                                </DialogContent>
                                                            </Dialog>
                                                        )}

                                                    </div>

                                                    <div className="space-y-3 mt-2 mb-4">
                                                        {!cardData ? (
                                                            <Description.Skeleton />
                                                        ) : (
                                                            <AttachmentList cardId={cardData?.id || ""} />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {!readonly && (
                                    <div>
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
                                                        {Array.isArray(commentsData) ? (
                                                            <Comments items={commentsData} cardId={cardData?.id ?? ''} readonly={readonly} />
                                                        ) : (
                                                            <div>No comments available.</div>
                                                        )}
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
                                )}

                            </div>
                        </div>
                        {!cardData ? (
                            <Description.Skeleton />
                        ) : (
                            <div>
                                <div className="mb-2 flex items-center justify-end w-full">
                                    <Actions card={cardData} readonly={readonly} boardId={params.boardId} lists={[]} setOrderedData={function (data: ListWithCards[]): void {
                                        throw new Error("Function not implemented.");
                                    }} />
                                </div>a
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
