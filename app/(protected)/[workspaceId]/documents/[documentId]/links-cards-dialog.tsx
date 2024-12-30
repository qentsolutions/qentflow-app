"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

interface LinkCardsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
}

interface BoardWithCards {
  id: string;
  title: string;
  cards: any[];
}

export function LinkCardsDialog({ isOpen, onClose, documentId }: LinkCardsDialogProps) {
  const { currentWorkspace } = useCurrentWorkspace();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: boards } = useQuery({
    queryKey: ["workspace-boards", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/documents/boards?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  const { data: linkedCards, refetch: refetchLinkedCards } = useQuery({
    queryKey: ["document-cards", documentId],
    queryFn: () => fetcher(`/api/documents/${documentId}/cards`),
    enabled: !!documentId,
  });

  const handleLinkCard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId }),
      });

      if (!response.ok) throw new Error();
      await refetchLinkedCards();
      toast.success("Card linked successfully");
    } catch {
      toast.error("Failed to link card");
    }
  };

  const handleUnlinkCard = async (cardId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/cards/${cardId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error();
      await refetchLinkedCards();
      toast.success("Card unlinked successfully");
    } catch {
      toast.error("Failed to unlink card");
    }
  };

  const groupCardsByBoard = (boards: any[]): BoardWithCards[] => {
    return boards.map(board => ({
      id: board.id,
      title: board.title,
      cards: board?.lists?.flatMap((list: any) => 
        list.cards.map((card: any) => ({
          ...card,
          boardTitle: board.title,
          listTitle: list.title,
        }))
      ).filter((card: any) => 
        card.title.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    })).filter(board => board?.cards?.length > 0);
  };

  const boardsWithCards = boards ? groupCardsByBoard(boards) : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Link Cards to Document</DialogTitle>
        </DialogHeader>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cards..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <ScrollArea className="h-[400px] pr-4">
          <Accordion type="multiple" className="space-y-2">
            {boardsWithCards.map((board) => (
              <AccordionItem
                key={board.id}
                value={board.id}
                className="border rounded-lg bg-gray-50/50"
              >
                <AccordionTrigger className="px-4 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{board.title}</span>
                    <Badge variant="secondary" className="ml-2">
                      {board.cards.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-2 px-4 pb-4">
                  {board.cards.map((card) => (
                    <div
                      key={card.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{card.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {card.listTitle}
                        </p>
                      </div>
                      {linkedCards?.some((lc: any) => lc.id === card.id) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnlinkCard(card.id)}
                        >
                          Unlink
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLinkCard(card.id)}
                        >
                          Link
                        </Button>
                      )}
                    </div>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}