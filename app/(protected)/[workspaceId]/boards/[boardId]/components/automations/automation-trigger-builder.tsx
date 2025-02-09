"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Board } from "@prisma/client";

const TRIGGER_TYPES = [
    { value: "CARD_CREATED", label: "When a card is created" },
    { value: "CARD_MOVED", label: "When a card is moved between lists" },
    { value: "CARD_UPDATED", label: "When a card is updated" },
    { value: "TASK_COMPLETED", label: "When a task is completed" },
    { value: "COMMENT_ADDED", label: "When a comment is added" },
    { value: "ATTACHMENT_ADDED", label: "When an attachment is added" },
    { value: "DUE_DATE_APPROACHING", label: "When due date is approaching" },
    { value: "ALL_TASKS_COMPLETED", label: "When all tasks are completed" },
    { value: "USER_MENTIONED", label: "When a user is mentioned" },
    { value: "CARD_ASSIGNED", label: "When a card is assigned" },
];

interface AutomationTriggerBuilderProps {
    triggerType: string;
    onTriggerTypeChange: (type: string) => void;
    conditions: Record<string, any>;
    onConditionsChange: (conditions: Record<string, any>) => void;
    board: Board & {
        lists: any[];
        User: any[];
    };
}

export const AutomationTriggerBuilder = ({
    triggerType,
    onTriggerTypeChange,
    conditions,
    onConditionsChange,
    board,
}: AutomationTriggerBuilderProps) => {
    const lists = board.lists;
    const users = board.User;

    const handleConditionChange = (key: string, value: any) => {
        onConditionsChange({
            ...conditions,
            [key]: value,
        });
    };

    const renderConditionFields = () => {
        switch (triggerType) {
            case "CARD_MOVED":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Source List</label>
                            <Select
                                value={conditions.sourceListId || ""}
                                onValueChange={(value) => handleConditionChange("sourceListId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source list" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lists?.map((list: any) => (
                                        <SelectItem key={list.id} value={list.id}>
                                            {list.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <label className="text-sm font-medium">Destination List</label>
                            <Select
                                value={conditions.destinationListId || ""}
                                onValueChange={(value) => handleConditionChange("destinationListId", value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select destination list" />
                                </SelectTrigger>
                                <SelectContent>
                                    {lists?.map((list: any) => (
                                        <SelectItem key={list.id} value={list.id}>
                                            {list.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                );

            case "CARD_ASSIGNED":
                return (
                    <div>
                        <label className="text-sm font-medium">Assigned To</label>
                        <Select
                            value={conditions.assignedUserId || ""}
                            onValueChange={(value) => handleConditionChange("assignedUserId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select user" />
                            </SelectTrigger>
                            <SelectContent>
                                {users?.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );

            case "DUE_DATE_APPROACHING":
                return (
                    <div>
                        <label className="text-sm font-medium">Days Before Due Date</label>
                        <Input
                            type="number"
                            value={conditions.daysBeforeDue || ""}
                            onChange={(e) => handleConditionChange("daysBeforeDue", parseInt(e.target.value))}
                            placeholder="Number of days"
                            className="mt-1"
                        />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Card className="p-4">
            <Select value={triggerType} onValueChange={onTriggerTypeChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a trigger" />
                </SelectTrigger>
                <SelectContent>
                    {TRIGGER_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                            {type.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {triggerType && (
                <div className="mt-4">
                    {renderConditionFields()}
                </div>
            )}
        </Card>
    );
};