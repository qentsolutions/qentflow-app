"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Tag, Bell, Edit, Calendar, UserPlus, FilePlus2, ArrowRight, Mail, ListTodo, History, ClipboardList } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Textarea } from "@/components/ui/textarea";
import { Board } from "@prisma/client";
import { fetcher } from "@/lib/fetcher";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const ACTION_CATEGORIES = [
    {
        label: "Card Actions",
        actions: [
            { value: "UPDATE_CARD_STATUS", label: "Update card status", icon: Edit },
            { value: "UPDATE_CARD_PRIORITY", label: "Update card priority", icon: Edit },
            { value: "MOVE_CARD", label: "Move card to another board", icon: ArrowRight, disabled: true },
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
            { value: "CREATE_TASKS", label: "Create tasks", icon: ListTodo },
            { value: "CREATE_CALENDAR_EVENT", label: "Create calendar event", icon: Calendar },
            { value: "CREATE_AUDIT_LOG", label: "Create audit log", icon: History }
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

    const { data: tags } = useQuery({
        queryKey: ["available-tags", board.id],
        queryFn: () => fetcher(`/api/boards/tags?boardId=${board.id}`),
    });

    const { data: availableBoards } = useQuery({
        queryKey: ["available-boards", board.workspaceId],
        queryFn: () => fetcher(`/api/boards?workspaceId=${board.workspaceId}`),
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

            case "MOVE_CARD":
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium mb-2 block">Destination Board</label>
                            <Select
                                value={action.config.boardId || board.id}
                                onValueChange={(boardId) => {
                                    updateActionConfig(index, "boardId", boardId);
                                    // Reset listId when board changes
                                    updateActionConfig(index, "listId", "");
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select destination board" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableBoards?.map((availableBoard: any) => (
                                        <SelectItem key={availableBoard.id} value={availableBoard.id}>
                                            {availableBoard.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {action.config.boardId && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">Destination List</label>
                                <Select
                                    value={action.config.listId || "select_list"}
                                    onValueChange={(value) => {
                                        if (value !== "select_list") {
                                            updateActionConfig(index, "listId", value);
                                        }
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select destination list" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {action.config.boardId === board.id ? (
                                            lists?.map((list: any) => (
                                                <SelectItem key={list.id} value={list.id}>
                                                    {list.title}
                                                </SelectItem>
                                            ))
                                        ) : (
                                            <DynamicBoardLists
                                                boardId={action.config.boardId}
                                                onListSelect={(listId) => updateActionConfig(index, "listId", listId)}
                                            />
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
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

            case "CREATE_TASKS":
                return (
                    <div className="space-y-2">
                        {action.config.tasks?.map((task: any, taskIndex: number) => (
                            <div key={taskIndex} className="flex items-center gap-2">
                                <Input
                                    value={task.title || ""}
                                    onChange={(e) => {
                                        const newTasks = [...(action.config.tasks || [])];
                                        newTasks[taskIndex] = { ...task, title: e.target.value };
                                        updateActionConfig(index, "tasks", newTasks);
                                    }}
                                    placeholder={`Task ${taskIndex + 1}`}
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        const newTasks = [...(action.config.tasks || [])];
                                        newTasks.splice(taskIndex, 1);
                                        updateActionConfig(index, "tasks", newTasks);
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                const newTasks = [...(action.config.tasks || []), { title: "" }];
                                updateActionConfig(index, "tasks", newTasks);
                            }}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Task
                        </Button>
                    </div>
                );

            case "CREATE_CALENDAR_EVENT":
                return (
                    <div className="space-y-2">
                        <Input
                            value={action.config.title || ""}
                            onChange={(e) => updateActionConfig(index, "title", e.target.value)}
                            placeholder="Event title"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="text-sm text-muted-foreground">Start Date</label>
                                <Input
                                    type="datetime-local"
                                    value={action.config.startDate || ""}
                                    onChange={(e) => updateActionConfig(index, "startDate", e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-sm text-muted-foreground">End Date</label>
                                <Input
                                    type="datetime-local"
                                    value={action.config.endDate || ""}
                                    onChange={(e) => updateActionConfig(index, "endDate", e.target.value)}
                                />
                            </div>
                        </div>
                        <Select
                            value={action.config.userId || ""}
                            onValueChange={(value) => updateActionConfig(index, "userId", value)}
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

            case "CREATE_AUDIT_LOG":
                return (
                    <div className="space-y-2">
                        <Select
                            value={action.config.action || ""}
                            onValueChange={(value) => updateActionConfig(index, "action", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="CREATE">Create</SelectItem>
                                <SelectItem value="UPDATE">Update</SelectItem>
                                <SelectItem value="DELETE">Delete</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={action.config.entityType || ""}
                            onValueChange={(value) => updateActionConfig(index, "entityType", value)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select entity type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="BOARD">Board</SelectItem>
                                <SelectItem value="LIST">List</SelectItem>
                                <SelectItem value="CARD">Card</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            value={action.config.entityTitle || ""}
                            onChange={(e) => updateActionConfig(index, "entityTitle", e.target.value)}
                            placeholder="Entity title"
                        />
                    </div>
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
                                                                        <SelectItem key={type.value} value={type.value} disabled={type.disabled}>
                                                                            <div className="flex items-center gap-2 ml-2">
                                                                                <type.icon className="h-4 w-4" />
                                                                                {type.label}
                                                                                {type.disabled ? (<Badge variant={"outline"}>Disabled</Badge>) : (<></>)}
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

const DynamicBoardLists = ({ boardId, onListSelect }: { boardId: string; onListSelect: (listId: string) => void }) => {
    const { data: lists, isLoading } = useQuery({
        queryKey: ["board-lists", boardId],
        queryFn: () => fetcher(`/api/boards/lists?boardId=${boardId}`),
        enabled: !!boardId,
    });


    if (isLoading) {
        return <SelectItem value="loading">Loading lists...</SelectItem>;
    }

    if (!lists?.length) {
        return <SelectItem value="no_lists">No lists available</SelectItem>;
    }

    return lists.map((list: any) => (
        <SelectItem key={list.id} value={list.id}>
            {list.title}
        </SelectItem>
    ));
};
