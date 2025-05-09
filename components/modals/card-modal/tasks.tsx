"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Grip, Trash, ListCheck, ListTodo, Pencil } from "lucide-react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Skeleton } from "@/components/ui/skeleton";
import { createTask } from "@/actions/tasks/create-task";
import { toggleTask } from "@/actions/tasks/toggle-task";
import { editTask } from "@/actions/tasks/edit-task"; // Import the editTask function

interface TasksProps {
    cardId: string;
}

export const Tasks = ({ cardId }: TasksProps) => {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editingTaskTitle, setEditingTaskTitle] = useState("");
    const params = useParams();
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();

    const { data: tasks = [], isLoading } = useQuery({
        queryKey: ["card-tasks", cardId],
        queryFn: () => fetcher(`/api/cards/${cardId}/tasks`),
    });

    const completedTasks = tasks.filter((task: any) => task.completed).length;
    const totalTasks = tasks.length;
    const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    const handleAddTask = async () => {
        if (!newTaskTitle.trim()) return;

        try {
            const response = await createTask(
                newTaskTitle,
                cardId,
                tasks.length,
                currentWorkspace?.id as string,
                params.boardId as string
            );

            if (response.error) {
                toast.error(response.error);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: ["card-tasks", cardId],
            });

            setNewTaskTitle("");
            setIsAddingTask(false);
            toast.success("Task added successfully");
        } catch {
            toast.error("Failed to add task");
        }
    };

    const handleToggleTask = async (taskId: string, completed: boolean) => {
        try {
            const response = await toggleTask(
                taskId,
                completed,
                cardId,
                currentWorkspace?.id as string,
                params.boardId as string
            );

            if (response.error) {
                toast.error(response.error);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: ["card-tasks", cardId],
            });

            toast.success("Task updated");
        } catch {
            toast.error("Failed to update task");
        }
    };

    const handleDeleteTask = async (taskId: string) => {
        try {
            const response = await fetch(`/api/cards/${cardId}/tasks/${taskId}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    workspaceId: currentWorkspace?.id,
                    boardId: params.boardId,
                }),
            });

            if (!response.ok) throw new Error();

            queryClient.invalidateQueries({
                queryKey: ["card-tasks", cardId],
            });

            toast.success("Task deleted");
        } catch {
            toast.error("Failed to delete task");
        }
    };

    const handleEditTask = async (taskId: string, title: string) => {
        try {
            const response = await editTask(
                taskId,
                title,
                false, // Vous pouvez ajuster cette valeur selon vos besoins
                0 // Vous pouvez ajuster cette valeur selon vos besoins
            );

            if (response.error) {
                toast.error(response.error);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: ["card-tasks", cardId],
            });

            setEditingTaskId(null);
            toast.success("Task edited successfully");
        } catch {
            toast.error("Failed to edit task");
        }
    };

    const onDragEnd = async (result: any) => {
        if (!result.destination) return;

        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        const updatedTasks = items.map((item: any, index) => ({
            ...item,
            order: index,
        }));

        try {
            await fetch(`/api/cards/${cardId}/tasks/reorder`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tasks: updatedTasks,
                    workspaceId: currentWorkspace?.id,
                    boardId: params.boardId,
                }),
            });

            queryClient.invalidateQueries({
                queryKey: ["card-tasks", cardId],
            });
        } catch {
            toast.error("Failed to reorder tasks");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <ListTodo size={18} className="mr-2" />
                            <p className="text-lg font-semibold">Checklist</p>
                            <div className="ml-2">{progress == 100 ? (<p className="text-xs text-green-600">Completed</p>) : (<></>)}</div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="shadow-none border-none py-0"
                            onClick={() => setIsAddingTask(true)}
                        >
                            <Plus className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <Progress value={progress} className="h-2" />
                        <span className="text-sm text-muted-foreground">
                            {completedTasks}/{totalTasks}
                        </span>
                    </div>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="tasks">
                    {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef}>
                            {tasks.map((task: any, index: number) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                    {(provided) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            className="flex items-center gap-2 py-2 rounded-md transition-colors duration-200 group"
                                        >
                                            <div {...provided.dragHandleProps}>
                                                <Grip className="h-4 w-4 text-muted-foreground" />
                                            </div>
                                            <Checkbox
                                                checked={task.completed}
                                                onCheckedChange={(checked) =>
                                                    handleToggleTask(task.id, checked as boolean)
                                                }
                                            />
                                            {editingTaskId === task.id ? (
                                                <Input
                                                    autoFocus
                                                    value={editingTaskTitle}
                                                    onChange={(e) => setEditingTaskTitle(e.target.value)}
                                                    onBlur={() => handleEditTask(task.id, editingTaskTitle)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            handleEditTask(task.id, editingTaskTitle);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="flex-1 flex items-center justify-between">
                                                    <span
                                                        className={`${task.completed ? "line-through text-muted-foreground" : ""}`}
                                                    >
                                                        {task.title}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="ml-2 opacity-0 hover:bg-transparent group-hover:opacity-100 transition-opacity"
                                                            onClick={() => {
                                                                setEditingTaskId(task.id);
                                                                setEditingTaskTitle(task.title);
                                                            }}
                                                        >
                                                            <Pencil className="h-4 w-4 text-muted-foreground" />
                                                        </Button>
                                                    </span>

                                                </div>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 hover:bg-transparent group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                <Trash className="h-4 w-4 text-muted-foreground" />
                                            </Button>
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>

            {isAddingTask && (
                <div className="flex items-center gap-2">
                    <Input
                        autoFocus
                        placeholder="Enter task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleAddTask();
                            }
                        }}
                    />
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAddTask}>Add</Button>
                    <Button variant="ghost" onClick={() => setIsAddingTask(false)}>
                        Cancel
                    </Button>
                </div>
            )}

        </div>
    );
};

Tasks.Skeleton = function TasksSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-x-2">
                        <Skeleton className="h-4 w-6 bg-neutral-200" />
                        <Skeleton className="h-6 w-24 bg-neutral-200" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-2 w-full bg-neutral-200" />
                        <Skeleton className="h-4 w-8 bg-neutral-200" />
                    </div>
                </div>
                <Skeleton className="h-8 w-8 rounded-full bg-neutral-200" />
            </div>

            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-x-2">
                        <Skeleton className="h-4 w-4 bg-neutral-200" />
                        <Skeleton className="h-4 w-full bg-neutral-200" />
                        <Skeleton className="h-6 w-8 bg-neutral-200" />
                    </div>
                ))}
            </div>
        </div>
    );
};
