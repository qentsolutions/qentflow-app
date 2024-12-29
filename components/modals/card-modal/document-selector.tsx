import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { CheckIcon } from "lucide-react"; // Import de l'icône
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";

interface DocumentSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    cardId: string;
    workspaceId: string;
}

export const DocumentSelector = ({ isOpen, onClose, cardId, workspaceId }: DocumentSelectorProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const queryClient = useQueryClient();

    const { data: documents } = useQuery({
        queryKey: ["workspace-documents", workspaceId],
        queryFn: () => fetcher(`/api/documents?workspaceId=${workspaceId}`),
    });

    // Vérifier si un document est déjà lié à la carte
    const { data: cardData } = useQuery({
        queryKey: ["card", cardId],
        queryFn: () => fetcher(`/api/cards/${cardId}`),
    });

    // Vérifier si un document est déjà lié
    const isDocumentLinked = (documentId: string) => {
        return cardData?.documents.some((doc: any) => doc.id === documentId);
    };

    const handleLinkDocument = async (documentId: string) => {
        try {
            const response = await fetch(`/api/cards/${cardId}/documents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ documentId }),
            });

            if (!response.ok) throw new Error();

            await queryClient.invalidateQueries({
                queryKey: ["card", cardId]
            });

            toast.success("Document linked successfully");
            onClose();
        } catch {
            toast.error("Failed to link document");
        }
    };

    const filteredDocuments = documents?.filter((doc: any) =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Link Document to Card</DialogTitle>
                </DialogHeader>
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search documents..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <ScrollArea className="h-[400px] pr-4">
                    {filteredDocuments?.map((doc: any) => (
                        <div
                            key={doc.id}
                            className="flex items-center justify-between p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                            onClick={() => !isDocumentLinked(doc.id) && handleLinkDocument(doc.id)}
                        >
                            <div>
                                <p className="font-medium">{doc.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    Last updated: {new Date(doc.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                            {/* Afficher CheckIcon si le document est déjà lié */}
                            {isDocumentLinked(doc.id) ? (
                                <CheckIcon className="text-green-500" />
                            ) : (
                                <Button variant="ghost">Link</Button>
                            )}
                        </div>
                    ))}
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
};
