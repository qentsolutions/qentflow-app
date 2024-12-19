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
import { ActivityIcon, Logs, MessageSquareText } from "lucide-react";
import { Tabs, TabsTrigger, TabsContent, TabsList } from "@/components/ui/tabs";
import { useParams } from "next/navigation";
import Details from "./details";

export const CardModal = () => {
  const id = useCardModal((state) => state.id);
  const isOpen = useCardModal((state) => state.isOpen);
  const onClose = useCardModal((state) => state.onClose);
  const { boardId } = useParams();

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
