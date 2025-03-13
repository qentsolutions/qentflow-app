"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { fetcher } from "@/lib/fetcher";
import { addProjectMember } from "@/actions/projects/add-member";
import { Plus, UserPlus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface ProjectMembersProps {
    project: any;
    onUpdate: () => void;
}

export const ProjectMembers = ({ project, onUpdate }: ProjectMembersProps) => {
    const { currentWorkspace } = useCurrentWorkspace();
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    const { data: workspaceMembers } = useQuery({
        queryKey: ["workspace-members", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/workspaces/${currentWorkspace?.id}/members`),
        enabled: !!currentWorkspace?.id,
    });

    const availableMembers = workspaceMembers?.filter(
        (member: any) => !project.members.some((m: any) => m.id === member.user.id)
    );

    const handleAddMember = async (userId: string) => {
        try {
            const result = await addProjectMember({
                projectId: project.id,
                userId,
                workspaceId: currentWorkspace?.id || "",
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: ["project", project.id],
            });

            onUpdate();
            toast.success("Member added to project");
            setIsOpen(false);
        } catch (error) {
            toast.error("Failed to add member");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Project Members</h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Add Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Project Members</DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="mt-4 max-h-[60vh]">
                            <div className="space-y-4">
                                {availableMembers?.map((member: any) => (
                                    <div
                                        key={member.user.id}
                                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.user.image} />
                                                <AvatarFallback>
                                                    {member.user.name?.[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-medium">{member.user.name}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {member.user.email}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => handleAddMember(member.user.id)}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid gap-4">
                {project.members?.map((member: any) => (
                    <Card key={member.id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={member.image} />
                                    <AvatarFallback>{member.name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};