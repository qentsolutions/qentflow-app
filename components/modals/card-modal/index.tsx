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
import { ActivityIcon, ExternalLink, FileText, Logs, MessageSquareText, Paperclip, Plus } from "lucide-react";
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

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);
  const { boardId } = useParams();
  const { currentWorkspace } = useCurrentWorkspace();
  const [isDocumentSelectorOpen, setIsDocumentSelectorOpen] = useState(false);

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
              <div className="flex items-start">
                <div className="flex-1 mr-8">
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
                            {cardData?.documents.map((doc: any) => (
                              <Card
                                key={doc.id}
                                className="p-3 hover:bg-gray-100 shadow-none dark:hover:bg-gray-800 cursor-pointer transition"
                                onClick={() => handleDocumentClick(doc.id)}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-x-2">
                                    <FileText className="h-4 w-4 text-blue-500" />
                                    <div>
                                      <p className="font-medium text-sm">{doc.title}</p>
                                    </div>
                                  </div>
                                  <ExternalLink className="h-4 w-4 text-blue-500" />
                                </div>
                              </Card>
                            ))}
                          </>) : (
                          <div className="text-gray-500 text-sm">
                            No documents linked.
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>
                <div className="flex-1 ml-8">
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
                    <div>Loading comments...</div>
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
              <Actions data={cardData} availableTags={availableTags ?? []} />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
