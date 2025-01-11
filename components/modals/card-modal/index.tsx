"use client";

import { useQuery } from "@tanstack/react-query";

import { CardWithList, Comment } from "@/types";
import { AuditLog } from "@prisma/client";
import { useCardModal } from "@/hooks/use-card-modal";

import { Header } from "./header";
import { Description } from "./description";
import { Actions } from "./actions";
import { Activity } from "./activity";
import { Comments } from "./comments"; // Nouveau composant
import { fetcher } from "@/lib/fetcher";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ActivityIcon, ExternalLink, FileText, LogInIcon as Logs, MessageSquareText, Paperclip, Plus, Trash2 } from 'lucide-react';
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import Details from "./details";
import { Card } from "@/components/ui/card";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Button } from "@/components/ui/button";
import { AttachmentList } from "./attachment-list";
import { FileUpload } from "@/components/file-upload";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { DocumentSelector } from "./document-selector";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Priority } from "./priority";
import { Tasks } from "./tasks";

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);
  const { boardId } = useParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);
  const [visibleDocuments, setVisibleDocuments] = useState(2); // Modification 1

  const { data: cardData } = useQuery<CardWithList>({
    queryKey: ["card", id],
    queryFn: () => fetcher(`/api/cards/${id}`),
  });

  const { data: commentsData } = useQuery<Comment[]>({
    queryKey: ["card-comments", id],
    queryFn: () => fetcher(`/api/cards/${id}/comments`),
  });

  const { data: auditLogsData } = useQuery<AuditLog[]>({
    queryKey: ["card-logs", id],
    queryFn: () => fetcher(`/api/cards/${id}/logs`),
  });

  const { data: availableTags } = useQuery({
    queryKey: ["available-tags", boardId],
    queryFn: () => fetcher(`/api/boards/tags?boardId=${boardId}`),
  });

  const handleDocumentClick = (documentId: string) => {
    window.open(`/${currentWorkspace?.id}/documents/${documentId}`, '_blank');
  };

  const { data: attachments, refetch: refetchAttachments } = useQuery({
    queryKey: ["card-attachments", id],
    queryFn: () => fetcher(`/api/cards/${id}/attachments`),
  });


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="overflow-y-auto" side={"rightLarge"}>
        {!cardData ? (
          <Header.Skeleton />
        ) : (
          <Header data={cardData} />
        )}
        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            <div className="w-full space-y-6">
              {!cardData ? (
                <Description.Skeleton />
              ) : (
                <Description data={cardData} />
              )}
              {!cardData ? (
                <Description.Skeleton />
              ) : (
                <Tasks cardId={cardData.id} />
              )}

              <div className="flex items-start space-x-8">
                <div className="w-1/2">
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
                            {cardData.documents.length > 2 && ( // Modification 2
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
                  </div>

                  <div className="space-y-3 mt-2">
                    {!cardData ? (
                      <Description.Skeleton />
                    ) : (
                      <AttachmentList cardId={cardData?.id || ""} />
                    )}
                  </div>
                </div>
              </div>

              <span className="font-bold text-lg  flex items-center"><ActivityIcon size={12} className="mr-2" /> Activity</span>
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
                  {!commentsData ? (
                    <Description.Skeleton />
                  ) : (
                    <Comments items={commentsData} cardId={cardData?.id ?? ''} />
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
          </div>
          {!cardData ? (
            <Actions.Skeleton />
          ) : (
            <div>
              <Details card={cardData} />
              <Priority data={cardData} />
              <Actions data={cardData} availableTags={availableTags ?? []} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

