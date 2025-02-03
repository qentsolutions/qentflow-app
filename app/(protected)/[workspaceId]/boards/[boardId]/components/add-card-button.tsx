"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { createCard } from "@/actions/tasks/create-card";
import { toast } from "sonner";
import { useCardModal } from "@/hooks/use-card-modal";
import { useAction } from "@/hooks/use-action";

interface List {
    id: string;
    title: string;
}

interface AddCardButtonProps {
    boardId: string;
    workspaceId: string;
    lists: List[];
}

export const AddCardButton = ({ boardId, workspaceId, lists }: AddCardButtonProps) => {
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [selectedListId, setSelectedListId] = useState(lists[0]?.id || "");
    const cardModal = useCardModal()

    const { execute, fieldErrors } = useAction(createCard, {
        onSuccess: (data) => {
            toast.success(`Card "${data.title}" created`);
            cardModal.onOpen(data?.id);
            setOpen(false);
            setTitle("");
            setSelectedListId("");
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onSubmit = async () => {
        if (!title.trim()) {
            toast.error("Enter a card title")
        }
        if (!selectedListId) {
            toast.error("Select a list")
        }
        execute({ title, listId: selectedListId, boardId, workspaceId });
    };

    return (
        <>
            <Button
                onClick={() => setOpen(true)}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 gap-2 mb-1"
            >
                <Plus className="h-4 w-4" />
                Add card
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            Ajouter une nouvelle carte
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="space-y-2">
                            <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Titre
                            </label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Entrez le titre de la carte"
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="list" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Liste
                            </label>
                            <Select value={selectedListId} onValueChange={setSelectedListId}>
                                <SelectTrigger id="list" className="w-full">
                                    <SelectValue placeholder="Sélectionnez une liste" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lists.map((list) => (
                                        <SelectItem key={list.id} value={list.id}>
                                            {list.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Annuler
                        </Button>
                        <Button onClick={onSubmit} className="bg-primary hover:bg-primary/90">
                            Créer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};