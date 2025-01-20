"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAction } from "@/hooks/use-action";
import { createBoardFromTemplate } from "@/actions/tasks/create-board-from-template";
import { boardTemplates } from "@/constants/board-templates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CreateBoardModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    templateId: string;
}

export const CreateBoardModal = ({ isOpen, onClose, workspaceId, templateId }: CreateBoardModalProps) => {
    const router = useRouter();
    const [title, setTitle] = useState("");

    const template = boardTemplates.find(t => t.id === templateId);

    const { execute, isLoading } = useAction(createBoardFromTemplate, {
        onSuccess: (data) => {
            toast.success("Board created!");
            router.push(`/${workspaceId}/boards/${data.id}`);
            onClose();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        execute({
            title,
            workspaceId,
            templateId,
        });
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setTitle("");
        }
    }, [isOpen]);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Board from Template: {template?.title}</DialogTitle>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <Input
                            id="title"
                            placeholder="Enter board title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex justify-end gap-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            Create
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};