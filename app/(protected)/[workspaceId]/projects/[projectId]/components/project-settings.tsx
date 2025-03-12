"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useAction } from "@/hooks/use-action";
import { updateProject } from "@/actions/projects/update-project";
import { deleteProject } from "@/actions/projects/delete-project";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProjectSettingsProps {
    project: any;
}

export function ProjectSettings({ project }: ProjectSettingsProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();
    const [formData, setFormData] = useState({
        name: project.name,
        description: project.description || "",
    });

    const { execute: executeUpdate } = useAction(updateProject, {
        onSuccess: () => {
            toast.success("Project updated successfully");
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeDelete } = useAction(deleteProject, {
        onSuccess: () => {
            toast.success("Project deleted successfully");
            router.push(`/${currentWorkspace?.id}/projects`);
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const handleUpdate = async () => {
        if (!currentWorkspace?.id) return;

        await executeUpdate({
            id: project.id,
            ...formData,
            workspaceId: currentWorkspace.id,
        });
    };

    const handleDelete = async () => {
        if (!currentWorkspace?.id) return;

        await executeDelete({
            id: project.id,
            workspaceId: currentWorkspace.id,
        });
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Project Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Project Name</label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1"
                            />
                        </div>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-red-600">Delete Project</h3>
                            <p className="text-sm text-muted-foreground">
                                This action cannot be undone. This will permanently delete the project and all its contents.
                            </p>
                        </div>
                        <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Project
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Project</DialogTitle>
                    </DialogHeader>
                    <p>
                        Are you sure you want to delete this project? All boards, documents, and other content will be permanently deleted.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Project
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}