"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProject } from "@/actions/projects/update-project";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface ProjectHeaderProps {
    project: any;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(project.name);
    const queryClient = useQueryClient();
    const { currentWorkspace } = useCurrentWorkspace();

    const handleUpdate = async () => {
        try {
            const result = await updateProject({
                id: project.id,
                name: title,
                workspaceId: currentWorkspace?.id || "",
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: ["project", project.id],
            });
            setIsEditing(false);
            toast.success("Project updated successfully");
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="p-6 border-b">
            <div className="flex items-center justify-between">
                {isEditing ? (
                    <div className="flex items-center gap-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="text-xl font-bold"
                        />
                        <Button onClick={handleUpdate}>Save</Button>
                        <Button variant="ghost" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsEditing(true)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            {project.description && (
                <p className="text-muted-foreground mt-2">{project.description}</p>
            )}
        </div>
    );
}