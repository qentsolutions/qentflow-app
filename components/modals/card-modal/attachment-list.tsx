// components/modals/card-modal/attachment-list.tsx
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Paperclip, ExternalLink, X } from "lucide-react";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";

interface AttachmentListProps {
  cardId: string;
}

export const AttachmentList = ({ cardId }: AttachmentListProps) => {
  const { data: attachments } = useQuery({
    queryKey: ["card-attachments", cardId],
    queryFn: () => fetcher(`/api/cards/${cardId}/attachments`),
  });

  const handleDelete = async (attachmentId: string) => {
    try {
      await fetch(`/api/cards/${cardId}/attachments/${attachmentId}`, {
        method: "DELETE",
      });
      toast.success("Attachment deleted");
    } catch (error) {
      toast.error("Failed to delete attachment");
    }
  };

  return (
    <div className="space-y-2">
      {attachments && attachments.length > 0 ? (
        attachments.map((attachment: any) => (
          <Card
            key={attachment.id}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-x-2">
                <Paperclip className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="font-medium text-sm">{attachment.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 text-blue-500" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(attachment.id)}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))
      ) : (
        <p className="text-sm text-gray-500">No attachments linked.</p>
      )}
    </div>
  );
};
