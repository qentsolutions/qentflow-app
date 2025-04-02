import { Archive, ArchiveRestore, Copy, MoreVertical, SquareDashedMousePointer, Trash2, ArrowRightToLine } from "lucide-react";
import { useCardModal } from "@/hooks/use-card-modal";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useAction } from "@/hooks/use-action";
import { deleteCard } from "@/actions/tasks/delete-card";
import { copyCard } from "@/actions/tasks/copy-card";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { archiveCard } from "@/actions/tasks/archived-card";
import { unarchiveCard } from "@/actions/tasks/unarchived-card";
import { updateCardOrder } from "@/actions/tasks/update-card-order";
import { ListWithCards } from "@/types";
import { Separator } from "@/components/ui/separator";

interface CardActionsProps {
    data: {
        id: string;
        title: string;
        listId: string;
        archived?: boolean;
    };
    lists: ListWithCards[];
    setOrderedData: (data: ListWithCards[]) => void;
    hideOptions?: boolean; // Nouvelle prop pour masquer les options "Open" et "Move to ..."
}

export default function CardActions({ data, lists, setOrderedData, hideOptions = false }: CardActionsProps) {
    const cardModal = useCardModal();
    const params = useParams();
    const { currentWorkspace } = useCurrentWorkspace();

    const { execute: executeDeleteCard } = useAction(deleteCard, {
        onSuccess: (data) => {
            toast.success(`Card "${data.title}" deleted`);
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeArchiveCard } = useAction(archiveCard, {
        onSuccess: (data) => {
            toast.success(`Card "${data.title}" archived`);
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeUnarchiveCard } = useAction(unarchiveCard, {
        onSuccess: (data) => {
            toast.success(`Card "${data.title}" unarchived`);
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeUpdateCardOrder } = useAction(updateCardOrder, {
        onSuccess: (data) => {
            toast.success(`Card moved to next list`);
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onArchive = (cardId: string) => {
        const boardId = params.boardId as string;
        const workspaceId = params.workspaceId as string;

        if (!workspaceId) {
            toast.error("Workspace ID is required.");
            return;
        }

        executeArchiveCard({
            cardId: cardId,
            boardId,
            workspaceId,
        });
    };

    const onUnarchive = (cardId: string) => {
        const boardId = params.boardId as string;
        const workspaceId = params.workspaceId as string;

        if (!workspaceId) {
            toast.error("Workspace ID is required.");
            return;
        }

        executeUnarchiveCard({
            cardId: cardId,
            boardId,
            workspaceId,
        });
    };

    const onDelete = (cardId: string) => {
        const boardId = params.boardId as string;
        const workspaceId = params.workspaceId as string;

        if (!workspaceId) {
            toast.error("Workspace ID is required.");
            return;
        }

        executeDeleteCard({
            id: cardId,
            boardId,
            workspaceId,
        });
    };

    const {
        execute: executeCopyCard,
        isLoading: isLoadingCopy,
    } = useAction(copyCard, {
        onSuccess: (data) => {
            toast.success(`Card "${data.title}" copied`);
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onCopy = (cardId: string) => {
        const boardId = params.boardId as string;
        const workspaceId = currentWorkspace?.id;
        if (!workspaceId) {
            toast.error("Workspace ID is required.");
            return;
        }
        executeCopyCard({
            id: cardId,
            boardId,
            workspaceId,
        });
    };

    const onMoveToNextList = (cardId: string) => {
        const boardId = params.boardId as string;
        const workspaceId = currentWorkspace?.id;
        if (!workspaceId) {
            toast.error("Workspace ID is required.");
            return;
        }

        const currentListIndex = lists.findIndex(list => list.id === data.listId);
        const nextListId = lists[currentListIndex + 1]?.id;

        if (!nextListId) {
            toast.error("No next list available.");
            return;
        }

        const sourceList = lists[currentListIndex];
        const destList = lists[currentListIndex + 1];

        if (!sourceList || !destList) return;

        if (!sourceList.cards) {
            sourceList.cards = [];
        }

        if (!destList.cards) {
            destList.cards = [];
        }

        const [movedCard] = sourceList.cards.splice(sourceList.cards.findIndex(card => card.id === cardId), 1);

        movedCard.listId = nextListId;

        destList.cards.push(movedCard);

        sourceList.cards.forEach((card, idx) => {
            card.order = idx;
        });

        destList.cards.forEach((card, idx) => {
            card.order = idx;
        });

        const updatedLists = lists.map(list => {
            if (list.id === sourceList.id) {
                return sourceList;
            }
            if (list.id === destList.id) {
                return destList;
            }
            return list;
        });

        setOrderedData(updatedLists);

        executeUpdateCardOrder({
            boardId: boardId,
            items: destList.cards,
            workspaceId
        });
    };

    const nextListName = lists[lists.findIndex(list => list.id === data.listId) + 1]?.title || "Next List";

    return (
        <>
            {!hideOptions && (
                <button
                    onClick={(e) => {
                        onMoveToNextList(data.id);
                        e.stopPropagation();
                    }}
                    className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
                >
                    <ArrowRightToLine size={14} className="text-blue-600" />
                    <span className="text-sm">Move to &apos;{nextListName}&apos;</span>
                </button>
            )}
            {!hideOptions && (
                <button
                    onClick={() => cardModal.onOpen(data.id)}
                    className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
                >
                    <SquareDashedMousePointer size={14} className="text-gray-700" />
                    <span className="text-sm">Open</span>
                </button>
            )}
            <button
                onClick={(e) => {
                    onCopy(data.id);
                    e.stopPropagation();
                }}
                className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
            >
                <Copy size={14} className="text-gray-700" />
                <span className="text-sm">Duplicate</span>
            </button>
            <Separator />
            <button
                onClick={(e) => {
                    if (data.archived) {
                        onUnarchive(data.id);
                    } else {
                        onArchive(data.id);
                    }
                    e.stopPropagation();
                }}
                className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
            >
                {data.archived ? <ArchiveRestore size={14} className="text-gray-700" /> : <Archive size={14} className="text-gray-700" />}
                <span className="text-sm">{data.archived ? "Unarchive" : "Archive"}</span>
            </button>
            <button
                onClick={(e) => {
                    onDelete(data.id);
                    e.stopPropagation();
                }}
                className="w-full flex items-center gap-x-2 hover:bg-muted p-2 rounded-md transition text-left"
            >
                <Trash2 size={14} className="text-red-500" />
                <span className="text-sm">Delete</span>
            </button>
        </>
    );
}