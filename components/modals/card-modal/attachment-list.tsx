"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, ExternalLink, Download } from 'lucide-react';
import { fetcher } from "@/lib/fetcher";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

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

  const handleDelete = async (attachmentId: string) => {
    //
  };

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
            src={attachment.url}
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
        <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg">
          <p>Preview not available for this file type</p>
        </div>
      );
    }
  };

  const renderAttachment = (attachment: any) => (
    <Card
      key={attachment.id}
      onClick={() => setSelectedAttachment(attachment)}
      className="p-2 hover:bg-gray-100 text-xs shadow-none dark:hover:bg-gray-800 cursor-pointer transition"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-x-2">
          <Paperclip className="h-4 w-4 text-blue-500" />
          <Tooltip>
            <TooltipTrigger>
              <div className={`w-full ${readonly ? 'max-w-[200px]' : 'max-w-[270px]'} overflow-hidden`}>
                <p className="font-medium text-sm truncate">{attachment.name}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {isImage(attachment.url) && (
                <div className="relative h-[200px] mb-2">
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="h-[200px] object-contain"
                  />
                </div>
              )}
              {isPDF(attachment.url) && (
                <iframe
                  src={`${attachment.url}#view=FitH`}
                  className="w-full h-[200px] mb-2"
                  title={attachment.name}
                />
              )}
              {!isImage(attachment.url) && !isPDF(attachment.url) && (
                <div className="flex items-center justify-center p-8 bg-gray-100 rounded-lg mb-2">
                  <p>Preview not available for this file type</p>
                </div>
              )}
              <p className="font-medium text-sm">{attachment.name}</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="flex items-center gap-x-2">
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
      </div>
    </Card>
  );

  return (
    <div className="space-y-2">
      {displayedAttachments && displayedAttachments.length > 0 ? (
        <>
          {displayedAttachments.map(renderAttachment)}
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
        <p className="text-xs text-gray-700 py-1">No attachments linked.</p>
      )}

      <Dialog open={!!selectedAttachment} onOpenChange={() => setSelectedAttachment(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{selectedAttachment?.name}</span>
              <div className="flex gap-2 mr-8">
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
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>
          {selectedAttachment && renderAttachmentPreview(selectedAttachment)}
        </DialogContent>
      </Dialog>
    </div>
  );
};

AttachmentList.Skeleton = function AttachmentsSkeleton() {
  return (
    <div className="flex justify-between items-center">
      {/* Skeleton pour Documents */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-4 w-4 bg-neutral-200" />
          <Skeleton className="h-6 w-24 bg-neutral-200" />
        </div>
        <Skeleton className="h-4 w-48 bg-neutral-200" />
      </div>

      {/* Skeleton pour le bouton "+" */}
      <Skeleton className="h-6 w-6 rounded-full bg-neutral-200" />

      {/* Skeleton pour Attachments */}
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-4 w-4 bg-neutral-200" />
          <Skeleton className="h-6 w-28 bg-neutral-200" />
        </div>
        <Skeleton className="h-4 w-56 bg-neutral-200" />
      </div>

      {/* Skeleton pour le bouton "+" */}
      <Skeleton className="h-6 w-6 rounded-full bg-neutral-200" />
    </div>
  );
};
