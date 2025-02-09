"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { createAutomation } from "@/actions/automations/create-automation";
import { toast } from "sonner";
import { AutomationTriggerBuilder } from "./automation-trigger-builder";
import { AutomationActionBuilder } from "./automation-action-builder";
import { Board } from "@prisma/client";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface CreateAutomationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    board: Board & {
        lists: any[];
        User: any[];
    };
}

export const CreateAutomationDialog = ({
    isOpen,
    onClose,
    board,
}: CreateAutomationDialogProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [triggerType, setTriggerType] = useState<string>("");
    const [triggerConditions, setTriggerConditions] = useState<Record<string, any>>({});
    const [actions, setActions] = useState<any[]>([]);
    const { currentWorkspace } = useCurrentWorkspace();

    const { execute, isLoading } = useAction(createAutomation, {
        onSuccess: () => {
            toast.success("Automation created successfully");
            onClose();
            resetForm();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const resetForm = () => {
        setName("");
        setDescription("");
        setTriggerType("");
        setTriggerConditions({});
        setActions([]);
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Name is required");
            return;
        }

        if (!triggerType) {
            toast.error("Trigger type is required");
            return;
        }

        if (actions.length === 0) {
            toast.error("At least one action is required");
            return;
        }

        execute({
            name,
            description,
            workspaceId: currentWorkspace?.id || board?.workspaceId,
            boardId: board.id,
            triggerType: triggerType as any,
            triggerConditions,
            actions: actions.map((action, index) => ({
                ...action,
                order: index,
            })),
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Create New Automation</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div>
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter automation name"
                            className="mt-1"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this automation does"
                            className="mt-1"
                        />
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">When this happens...</label>
                            <AutomationTriggerBuilder
                                triggerType={triggerType}
                                onTriggerTypeChange={setTriggerType}
                                conditions={triggerConditions}
                                onConditionsChange={setTriggerConditions}
                                board={board}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-medium">Do this...</label>
                            <AutomationActionBuilder
                                actions={actions}
                                onActionsChange={setActions}
                                board={board}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            Create Automation
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};