"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateProject } from "@/actions/projects/update-project";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { ProjectAvatar } from "./project-avatar";

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

            toast.success("Project updated successfully");
            setIsEditing(false);
        } catch (error) {
            toast.error("Something went wrong");
        }
    };

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b">
            <div className="flex items-center gap-4">
                <ProjectAvatar
                    projectName={project.name}
                    projectLogo={project.logo}
                    size="lg"
                />
                <div>
                    {isEditing ? (
                        <div className="flex items-center gap-2">
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-7 w-[200px]"
                            />
                            <Button onClick={handleUpdate} size="sm">
                                Save
                            </Button>
                            <Button
                                onClick={() => setIsEditing(false)}
                                variant="ghost"
                                size="sm"
                            >
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <h1
                            className="text-2xl font-bold cursor-pointer hover:underline"
                            onClick={() => setIsEditing(true)}
                        >
                            {project.name}
                        </h1>
                    )}
                   
                </div>
            </div>
        </div>
    );
}