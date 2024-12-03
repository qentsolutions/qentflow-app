"use client";

import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Filter } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "@/hooks/use-action";
import { TableViewHeader } from "./table-header";
import { TableViewRow } from "./table-row";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { updateCardOrder } from "@/actions/tasks/update-card-order";

interface List {
    id: string;
    title: string;
    cards: Card[];
}

interface Card {
    id: string;
    title: string;
    order: number;
    description: string | null;
    listId: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: {
        id: string;
        name: string;
    }[];
}

interface TableViewProps {
    boardId: string;
    data: List[];
}

type SortField = "title" | "createdAt" | "tags" | "list";
type SortOrder = "asc" | "desc";

export const TableView = ({ boardId, data = [] }: TableViewProps) => {
    const cardModal = useCardModal();
    const { currentWorkspace } = useCurrentWorkspace();
    const [lists, setLists] = useState(data);
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

    useEffect(() => {
        setLists(data);
        console.log("Updated lists:", data);
    }, [data]);

    // Action pour mettre à jour une carte sur le serveur
    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess: () => {
            toast.success("Card list updated");
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const handleListChange = async (cardId: string, newListId: string) => {
        const workspaceId = currentWorkspace?.id;
        if (!workspaceId) {
            toast.error("Workspace not found");
            return;
        }

        // Mise à jour de l'état local pour la liste des cartes
        const newLists = lists.map((list) => ({
            ...list,
            cards: list.cards.map((card) =>
                card.id === cardId ? { ...card, listId: newListId } : card
            ),
        }));
        setLists(newLists);

        // Mise à jour de l'ordre des cartes après le changement de liste
        newLists.forEach((list) => {
            list.cards.forEach((card, idx) => {
                card.order = idx; // Mise à jour de l'ordre des cartes
            });
        });

        // Appel de l'action pour mettre à jour l'ordre des cartes
        executeUpdateCardOrder({
            boardId: boardId,
            items: newLists.flatMap((list) => list.cards), // Mettre à jour toutes les cartes
            workspaceId,
        });
    };


    const flattenedCards = lists.reduce(
        (acc: (Card & { listTitle: string })[], list) => {
            const cardsWithList = list.cards.map((card) => ({
                ...card,
                listTitle: list.title,
            }));
            return [...acc, ...cardsWithList];
        },
        []
    );

    const sortedData = [...flattenedCards].sort((a, b) => {
        if (sortField === "title") {
            return sortOrder === "asc"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title);
        } else if (sortField === "createdAt") {
            return sortOrder === "asc"
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        } else if (sortField === "tags") {
            const tagsA = a.tags?.length || 0;
            const tagsB = b.tags?.length || 0;
            return sortOrder === "asc" ? tagsA - tagsB : tagsB - tagsA;
        } else if (sortField === "list") {
            return sortOrder === "asc"
                ? a.listTitle.localeCompare(b.listTitle)
                : b.listTitle.localeCompare(a.listTitle);
        }
        return 0;
    });

    return (
        <div className="space-y-4 p-4">
            <div className="rounded-xl border bg-white shadow-sm">
                <Table>
                    <TableViewHeader
                        sortField={sortField}
                        sortOrder={sortOrder}
                        onSort={handleSort}
                    />
                    <TableBody>
                        {sortedData.map((item) => (
                            <TableViewRow
                                key={item.id}
                                item={item}
                                lists={lists}
                                onListChange={handleListChange} // Pass the handleListChange function here
                                onRowClick={(id) => cardModal.onOpen(id)}
                            />
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
