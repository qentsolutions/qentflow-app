"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, ExternalLink } from 'lucide-react';
import { fetcher } from "@/lib/fetcher";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface AttachmentListProps {
  cardId: string;
}

export const AttachmentList = ({ cardId }: AttachmentListProps) => {
  const [showAll, setShowAll] = useState(false);
  const { data: attachments } = useQuery({
    queryKey: ["card-attachments", cardId],
    queryFn: () => fetcher(`/api/cards/${cardId}/attachments`),
  });

  const handleDelete = async (attachmentId: string) => {
    //
  };

  const displayedAttachments = showAll ? attachments : attachments?.slice(0, 2);
  const remainingCount = attachments ? attachments.length - 2 : 0;

  const renderAttachment = (attachment: any) => (
    <Card
      key={attachment.id}
      onClick={() => window.open(attachment.url, "_blank")}
      className="p-2 hover:bg-gray-100 text-xs shadow-none dark:hover:bg-gray-800 cursor-pointer transition"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-x-2">
          <Paperclip className="h-4 w-4 text-blue-500" />
          <Tooltip>
            <TooltipTrigger>
              <div className="w-full max-w-[270px] overflow-hidden">
                <p className="font-medium text-sm truncate">{attachment.name}</p>
              </div>
            </TooltipTrigger>
            <TooltipContent>
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
          {/* Show "See more" button only if there are more than 2 attachments */}
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
        <p className="text-sm text-gray-500">No attachments linked.</p>
      )}
    </div>
  );
};
