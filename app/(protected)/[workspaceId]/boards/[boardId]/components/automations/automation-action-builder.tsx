"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Tag, Bell, Edit, Calendar, UserPlus, FilePlus2, ArrowRight, Mail } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Textarea } from "@/components/ui/textarea";
import { Board } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Separator } from "@/components/ui/separator";

// Grouping actions by categories
const ACTION_CATEGORIES = [
    {
        label: "Card Actions",
        actions: [
            { value: "UPDATE_CARD_STATUS", label: "Update card status", icon: Edit },
            { value: "MOVE_CARD", label: "Move card", icon: ArrowRight },
            { value: "UPDATE_CARD_PRIORITY", label: "Update card priority", icon: Edit }
        ]
    },
    {
        label: "User Actions",
        actions: [
            { value: "ASSIGN_USER", label: "Assign user", icon: UserPlus },
            { value: "SEND_NOTIFICATION", label: "Send notification", icon: Bell },
            { value: "SEND_EMAIL", label: "Send email", icon: Mail }
        ]
    },
    {
        label: "Task Actions",
        actions: [
            { value: "CREATE_TASKS", label: "Create tasks", icon: Plus },
            { value: "CREATE_CALENDAR_EVENT", label: "Create calendar event", icon: Calendar },
            { value: "CREATE_AUDIT_LOG", label: "Create audit log", icon: FilePlus2 }
        ]
    },
    {
        label: "Tag Actions",
        actions: [
            { value: "ADD_TAG", label: "Add tag", icon: Tag }
        ]
    }
];

interface AutomationActionBuilderProps {
    actions: any[];
    onActionsChange: (actions: any[]) => void;
    board: Board & {
        lists: any[];
        User: any[];
    };
}

export const AutomationActionBuilder = ({
    actions,
    onActionsChange,
    board,
}: AutomationActionBuilderProps) => {
    const lists = board.lists;
    const users = board.User;

    // Fetch tags for the board
    const { data: tags } = useQuery({
        queryKey: ["available-tags", board.id],
        queryFn: () => fetcher(`/api/boards/tags?boardId=${board.id}`),
    });

    const addAction = () => {
        onActionsChange([
            ...actions,
            {
                type: "",
                config: {},
            },
        ]);
    };

    const removeAction = (index: number) => {
        const newActions = [...actions];
        newActions.splice(index, 1);
        onActionsChange(newActions);
    };

    const updateAction = (index: number, field: string, value: any) => {
        const newActions = [...actions];
        newActions[index] = {
            ...newActions[index],
            [field]: value,
            config: {}, // Reset config when action type changes
        };
        onActionsChange(newActions);
    };

    const updateActionConfig = (index: number, field: string, value: any) => {
        const newActions = [...actions];
        newActions[index] = {
            ...newActions[index],
            config: {
                ...newActions[index].config,
                [field]: value,
            },
        };
        onActionsChange(newActions);
    };

    const onDragEnd = (result: any) => {
        if (!result.destination) return;

        const items = Array.from(actions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        onActionsChange(items);
    };

    const renderActionConfig = (action: any, index: number) => {
        switch (action.type) {
            case "UPDATE_CARD_STATUS":
            case "MOVE_CARD":
                return (
                    <Select
                        value={action.config.listId || ""}
                        onValueChange={(value) => updateActionConfig(index, "listId", value)}
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
                );

            case "ASSIGN_USER":
                return (
                    <Select
                        value={action.config.userId || ""}
                        onValueChange={(value) => updateActionConfig(index, "userId", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select user to assign" />
                        </SelectTrigger>
                        <SelectContent>
                            {users?.map((user: any) => (
                                <SelectItem key={user.id} value={user.id}>
                                    {user.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case "SEND_NOTIFICATION":
                return (
                    <div className="space-y-2">
                        <Select
                            value={action.config.userId || ""}
                            onValueChange={(value) => updateActionConfig(index, "userId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select user to notify" />
                            </SelectTrigger>
                            <SelectContent>
                                {users?.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Textarea
                            value={action.config.message || ""}
                            onChange={(e) => updateActionConfig(index, "message", e.target.value)}
                            placeholder="Enter notification message"
                        />
                    </div>
                );

            case "ADD_TAG":
                return (
                    <Select
                        value={action.config.tagId || ""}
                        onValueChange={(value) => updateActionConfig(index, "tagId", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select tag to add" />
                        </SelectTrigger>
                        <SelectContent>
                            {tags?.map((tag: any) => (
                                <SelectItem key={tag.id} value={tag.id}>
                                    {tag.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case "UPDATE_CARD_PRIORITY":
                return (
                    <Select
                        value={action.config.priority || ""}
                        onValueChange={(value) => updateActionConfig(index, "priority", value)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="CRITICAL">Critical</SelectItem>
                        </SelectContent>
                    </Select>
                );

            case "SEND_EMAIL":
                return (
                    <div className="space-y-2">
                        <Select
                            value={action.config.userId || ""}
                            onValueChange={(value) => updateActionConfig(index, "userId", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select recipient" />
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

            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="actions">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {actions.map((action, index) => (
                                <Draggable key={index} draggableId={`action-${index}`} index={index}>
                                    {(provided) => (
                                        <Card
                                            className="p-4 mb-2"
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div {...provided.dragHandleProps}>
                                                    <GripVertical className="h-5 w-5 text-gray-500" />
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <Select
                                                        value={action.type}
                                                        onValueChange={(value) => updateAction(index, "type", value)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select an action" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {ACTION_CATEGORIES.map((category) => (
                                                                <div key={category.label} className="mb-2">
                                                                    <div className="text-sm font-semibold m-1 text-gray-600 uppercase">
                                                                        {category.label}
                                                                    </div>
                                                                    {category.actions.map((type) => (
                                                                        <SelectItem key={type.value} value={type.value}>
                                                                            <div className="flex items-center gap-2 ml-2">
                                                                                <type.icon className="h-4 w-4" />
                                                                                {type.label}
                                                                            </div>
                                                                        </SelectItem>

                                                                    ))}
                                                                    {index < ACTION_CATEGORIES.length - 1 && <Separator className="m-1" />}

                                                                </div>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {action.type && renderActionConfig(action, index)}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeAction(index)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </Card>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            <Button
                variant="outline"
                onClick={addAction}
                className="w-full"
            >
                <Plus className="h-4 w-4 mr-2" />
                Add Action
            </Button>
        </div>
    );
};
