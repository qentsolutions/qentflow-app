"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { fetcher } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

import { Download, ExternalLink, Paperclip } from 'lucide-react';

interface AttachmentListProps {
  cardId: string;
  readonly?: boolean;
}

export const AttachmentList = ({ cardId, readonly = false }: AttachmentListProps) => {
  const [showAll, setShowAll] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<any>(null);

  const { data: attachments } = useQuery({
    queryKey: ["card-attachments", cardId],
    queryFn: () => fetcher(`/api/cards/${cardId}/attachments`),
  });

  const displayedAttachments = showAll ? attachments : attachments?.slice(0, 2);
  const remainingCount = attachments ? attachments.length - 2 : 0;

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  const isPDF = (url: string) => {
    return /\.pdf$/i.test(url);
  };

  const renderAttachmentPreview = (attachment: any) => {
    if (isImage(attachment.url)) {
      return (
        <div className="relative w-full h-[400px]">
          <img
            src={attachment.url || "/placeholder.svg"}
            alt={attachment.name}
            className="w-full h-full object-contain"
          />
        </div>
      );
    } else if (isPDF(attachment.url)) {
      return (
        <iframe
          src={`${attachment.url}#view=FitH`}
          className="w-full h-[600px]"
          title={attachment.name}
        />
      );
    } else {
      return (
        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
          <p>Preview not available for this file type</p>
        </div>
      );
    }
  };

  return (
    <TooltipProvider>
      <div className="space-y-2">
        {displayedAttachments && displayedAttachments.length > 0 ? (
          <>
            {displayedAttachments.map((attachment: any) => (
              <div
                key={attachment.id}
                onClick={() => setSelectedAttachment(attachment)}
                className="p-2 bg-white dark:bg-gray-800 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition flex items-center justify-between"
              >
                <div className="flex items-center gap-x-2">
                  <Paperclip className="h-4 w-4 text-blue-500" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-medium text-sm">
                        {attachment.name}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isImage(attachment.url) && (
                        <div className="relative h-[200px] mb-2">
                          <img
                            src={attachment.url || "/placeholder.svg"}
                            alt={attachment.name}
                            className="h-[200px] object-contain"
                          />
                        </div>
                      )}
                      <p className="font-medium text-sm">{attachment.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(attachment.url, "_blank");
                  }}
                >
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                </Button>
              </div>
            ))}

            {attachments && attachments.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className="w-full text-blue-500 hover:text-blue-600"
              >
                {showAll ? "Show less" : `See more (${remainingCount})`}
              </Button>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground py-2">No attachments linked</p>
        )}

        <Dialog open={!!selectedAttachment} onOpenChange={() => setSelectedAttachment(null)}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedAttachment?.name}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedAttachment.url;
                    link.download = selectedAttachment.name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                  className="gap-1"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </DialogTitle>
            </DialogHeader>
            {selectedAttachment && renderAttachmentPreview(selectedAttachment)}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
};

AttachmentList.Skeleton = function AttachmentsSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
          <div className="flex items-center gap-x-2">
            <Skeleton className="h-4 w-4 rounded bg-neutral-200 dark:bg-gray-700" />
            <Skeleton className="h-5 w-40 bg-neutral-200 dark:bg-gray-700" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-gray-700" />
        </div>
      ))}
    </div>
  );
};
