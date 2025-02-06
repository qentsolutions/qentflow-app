"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Grip, Trash, ListCheck, ListTodo } from "lucide-react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Skeleton } from "@/components/ui/skeleton";

interface TasksProps {
    cardId: string;
}

export const Tasks = ({ cardId }: TasksProps) => {
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [isAddingTask, setIsAddingTask] = useState(false);
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
            const response = await fetch(`/api/cards/${cardId}/tasks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: newTaskTitle,
                    order: tasks.length,
                    workspaceId: currentWorkspace?.id,
                    boardId: params.boardId,
                }),
            });

            if (!response.ok) throw new Error();

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
            const response = await fetch(`/api/cards/${cardId}/tasks/${taskId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    completed,
                    workspaceId: currentWorkspace?.id,
                    boardId: params.boardId,
                }),
            });

            if (!response.ok) throw new Error();

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
                        <div className="flex items-center gap-x-1">
                            <ListTodo size={14} />
                            <p className="text-lg font-semibold">Tasks</p>
                            <div className="ml-2">{progress == 100 ? (<p className="text-xs text-green-600">Completed</p>) : (<></>)}</div>
                        </div>

                        <Button
                            variant="outline"
                            className="shadow-none border-none"
                            onClick={() => setIsAddingTask(true)}
                        >
                            <Plus className="h-4 w-4" />
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
                                            className="flex items-center gap-2 py-2"
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
                                            <span
                                                className={`flex-1 ${task.completed ? "line-through text-muted-foreground" : ""
                                                    }`}
                                            >
                                                {task.title}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
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
