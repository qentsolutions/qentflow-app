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
import { ActivityIcon, FileText, Logs, MessageSquareText } from "lucide-react";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import Details from "./details";
import { Card } from "@/components/ui/card";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);
  const { boardId } = useParams();
  const { currentWorkspace } = useCurrentWorkspace();

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
              <span className="font-bold text-lg flex items-center">
                <FileText size={12} className="mr-2" /> Linked Documents
              </span>
              <div className="space-y-3">
                {cardData?.documents && cardData.documents.length > 0 ? (
                  <>
                    {cardData?.documents.map((doc: any) => (
                      <Card
                        key={doc.id}
                        className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
                        onClick={() => handleDocumentClick(doc.id)}
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            <p className="font-medium text-sm">{doc.title}</p>

                          </div>
                        </div>
                      </Card>
                    ))}
                  </>) : (
                  <div className="text-gray-600">
                    No documents linked.
                  </div>)}


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
