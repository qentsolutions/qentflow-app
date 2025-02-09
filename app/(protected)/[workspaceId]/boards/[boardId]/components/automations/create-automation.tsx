
"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Workflow, Plus, Zap, Settings2, Activity, ArrowRight, CheckSquare, FileText, Calendar, MessageSquare, Tag, Bell, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ActionType, Board, TriggerType } from "@prisma/client";
import { createAutomationRule } from "@/actions/automations/create-automation-rule";
interface AutomationCreatorProps {
    board: Board;
    onClose: () => void;
}
const triggerGroups = {
    "Tasks & Checklists": [
        { type: TriggerType.TASK_COMPLETED, icon: CheckSquare },
        { type: TriggerType.CARD_CREATED, icon: FileText },
        { type: TriggerType.CARD_MOVED, icon: ArrowRight },
    ],
    "Dates & Time": [
        { type: TriggerType.DUE_DATE_APPROACHING, icon: Calendar },
    ],
    "Communication": [
        { type: TriggerType.COMMENT_ADDED, icon: MessageSquare },
        { type: TriggerType.ATTACHMENT_ADDED, icon: FileText },
    ],
};
const actionGroups = {
    "Card Management": [
        { type: ActionType.UPDATE_CARD_STATUS, icon: Activity },
        { type: ActionType.APPLY_TAG, icon: Tag },
    ],
    "Notifications": [
        { type: ActionType.SEND_NOTIFICATION, icon: Bell },
        { type: ActionType.CREATE_CALENDAR_EVENT, icon: Calendar },
    ],
    "Team": [
        { type: ActionType.ASSIGN_CARD, icon: UserPlus },
        { type: ActionType.GENERATE_TASKS, icon: CheckSquare },
    ],
    "Storage": [
        { type: ActionType.SAVE_ATTACHMENT, icon: FileText },
    ],
};
const CreateAutomation = ({ board, onClose }: AutomationCreatorProps) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedTrigger, setSelectedTrigger] = useState<TriggerType | "">("");
    const [selectedAction, setSelectedAction] = useState<ActionType | "">("");
    const handleCreate = async () => {
        if (!name || !selectedTrigger || !selectedAction) {
            toast.error("Please fill in all required fields");
            return;
        }
        try {
            const data = {
                boardId: board.id,
                name,
                description,
                triggers: [{ type: selectedTrigger as TriggerType, configuration: {} }],
                actions: [{ type: selectedAction as ActionType, configuration: {} }],
            };
            const result = await createAutomationRule(data);
            toast.success("Automation rule created successfully");
            onClose();
        } catch (error) {
            toast.error("Failed to create automation rule");
        }
    };
    // Helper function to format the type strings
    const formatTypeString = (type: string) => {
        return type.replace(/_/g, " ").toLowerCase();
    };
    return (
        <div className="space-y-4">
            {/* Header Section */}
            <div className="overflow-y-auto max-h-[65vh]">
                <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <div className="flex justify-center">
                        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
                            <Zap className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Create New Automation</h2>
                    <p className="text-muted-foreground">
                        Automate your workflow by setting up triggers and actions. When a trigger occurs,
                        the corresponding action will be executed automatically.
                    </p>
                </div>
                {/* Overview Section - New Addition */}

                <div className="space-y-6 max-w-3xl mx-auto pb-4">
                    {/* Name Input with Icon */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-muted-foreground" />
                            Automation Name
                        </label>
                        <Input
                            placeholder="e.g., 'Notify team on task completion'"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full transition-all border-muted-foreground/20 focus:border-primary"
                        />
                    </div>
                    <div className="grid grid-cols-[1fr,auto,1fr] gap-6 items-start">
                        {/* Trigger Section */}
                        <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl p-6 border shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-purple-100 dark:bg-purple-900/50 rounded-full p-2">
                                    <Activity className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">When this happens...</h3>
                                    <p className="text-sm text-muted-foreground">Choose your trigger event</p>
                                </div>
                            </div>
                            <Select
                                value={selectedTrigger}
                                onValueChange={(value) => setSelectedTrigger(value as TriggerType)}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-black border-muted-foreground/20">
                                    <SelectValue placeholder="Select a trigger" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(triggerGroups).map(([groupName, triggers]) => (
                                        <div key={groupName} className="px-2 mb-2">
                                            <div className="text-sm font-medium text-muted-foreground mb-1 pl-2">
                                                {groupName}
                                            </div>
                                            {triggers.map(({ type, icon: Icon }) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                    className="cursor-pointer hover:bg-muted flex items-center gap-2"
                                                >
                                                    <div className="flex items-center gap-x-2">
                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                        <span className="flex items-center">{formatTypeString(type)}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Arrow */}
                        <div className="flex items-center justify-center pt-20">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full flex items-center justify-center shadow-sm">
                                <ArrowRight className="w-5 h-5 text-muted-foreground" />
                            </div>
                        </div>
                        {/* Action Section */}
                        <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="bg-blue-100 dark:bg-blue-900/50 rounded-full p-2">
                                    <Workflow className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Do this action...</h3>
                                    <p className="text-sm text-muted-foreground">Choose what happens next</p>
                                </div>
                            </div>
                            <Select
                                value={selectedAction}
                                onValueChange={(value) => setSelectedAction(value as ActionType)}
                            >
                                <SelectTrigger className="w-full bg-white dark:bg-black border-muted-foreground/20">
                                    <SelectValue placeholder="Select an action" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(actionGroups).map(([groupName, actions]) => (
                                        <div key={groupName} className="px-2 mb-2">
                                            <div className="text-sm font-medium text-muted-foreground mb-1 pl-2">
                                                {groupName}
                                            </div>
                                            {actions.map(({ type, icon: Icon }) => (
                                                <SelectItem
                                                    key={type}
                                                    value={type}
                                                    className="cursor-pointer hover:bg-muted flex items-center gap-2"
                                                >
                                                    <div className="flex items-center gap-x-2">
                                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                                        <span>{formatTypeString(type)}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {/* Description Section */}
                    <div className="max-w-3xl mx-auto bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-4 rounded-lg border shadow-sm">
                        <p className="text-center text-lg font-medium text-muted-foreground">
                            When{" "}
                            <span className="text-purple-600 dark:text-purple-400 font-semibold">
                                {selectedTrigger ? formatTypeString(selectedTrigger) : "..."}
                            </span>
                            {" "}happens,{" "}
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                {selectedAction ? formatTypeString(selectedAction) : "..."}
                            </span>
                        </p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                            <Settings2 className="h-4 w-4 text-muted-foreground" />
                            Description (Optional)
                        </label>
                        <Textarea
                            placeholder="Add notes about what this automation does..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[100px] resize-none transition-all border-muted-foreground/20 focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end items-center gap-3 pt-8 border-t">

                <Button
                    variant="outline"
                    onClick={onClose}
                    className="px-6"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleCreate}
                    disabled={!name || !selectedTrigger || !selectedAction}
                    className="px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                    Create Automation
                </Button>
            </div>
        </div>
    );
};
export default CreateAutomation;