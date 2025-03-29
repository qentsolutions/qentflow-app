"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Settings, Trash, Users } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "@/hooks/use-action";
import { createTeam } from "@/actions/teams/create-team";
import { deleteTeam } from "@/actions/teams/delete-team";
import { updateTeam } from "@/actions/teams/update-team";
import { manageTeamMembers } from "@/actions/teams/manage-members";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";

export default function TeamsPage() {
    const { currentWorkspace } = useCurrentWorkspace();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

    const { data: teams, refetch } = useQuery({
        queryKey: ["teams", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/teams/${currentWorkspace?.id}`),
        enabled: !!currentWorkspace?.id,
    });

    const { data: workspaceMembers } = useQuery({
        queryKey: ["workspace-members", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/workspaces/${currentWorkspace?.id}/members`),
        enabled: !!currentWorkspace?.id,
    });

    const { execute: executeCreate } = useAction(createTeam, {
        onSuccess: () => {
            toast.success("Team created successfully");
            setIsCreateModalOpen(false);
            refetch();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeDelete } = useAction(deleteTeam, {
        onSuccess: () => {
            toast.success("Team deleted successfully");
            refetch();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeUpdate } = useAction(updateTeam, {
        onSuccess: () => {
            toast.success("Team updated successfully");
            setIsEditModalOpen(false);
            setSelectedTeam(null);
            refetch();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const { execute: executeManageMembers } = useAction(manageTeamMembers, {
        onSuccess: () => {
            toast.success("Team members updated successfully");
            setIsMembersModalOpen(false);
            refetch();
        },
        onError: (error) => {
            toast.error(error);
        },
    });

    const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        await executeCreate({
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            workspaceId: currentWorkspace?.id as string,
        });
    };

    const handleUpdateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        await executeUpdate({
            teamId: selectedTeam.id,
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            workspaceId: currentWorkspace?.id as string,
        });
    };

    const handleDeleteTeam = async (teamId: string) => {
        await executeDelete({
            teamId,
            workspaceId: currentWorkspace?.id as string,
        });
    };

    const handleManageMembers = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const selectedUsers = workspaceMembers
            .filter((_: any, index: number) => formData.get(`user-${index}`))
            .map((member: any) => member.user.id);

        await executeManageMembers({
            teamId: selectedTeam.id,
            workspaceId: currentWorkspace?.id as string,
            userIds: selectedUsers,
        });
    };

    return (
        <div className="p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl font-bold">Teams</CardTitle>
                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Create Team
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create New Team</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateTeam} className="space-y-4">
                                <div>
                                    <Input
                                        name="name"
                                        placeholder="Team name"
                                        required
                                    />
                                </div>
                                <div>
                                    <Textarea
                                        name="description"
                                        placeholder="Team description"
                                    />
                                </div>
                                <Button type="submit" className="w-full">
                                    Create Team
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {teams?.map((team: any) => (
                            <Card key={team.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold">{team.name}</h3>
                                        <p className="text-sm text-muted-foreground">{team.description}</p>
                                        <div className="flex items-center mt-2 space-x-2">
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {team.members.length} members
                                            </span>
                                            <span className="text-sm text-muted-foreground">•</span>
                                            <span className="text-sm text-muted-foreground">
                                                {team.boards.length} boards
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setIsMembersModalOpen(true);
                                            }}
                                        >
                                            <Users className="h-4 w-4 mr-2" />
                                            Manage Members
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedTeam(team);
                                                setIsEditModalOpen(true);
                                            }}
                                        >
                                            <Settings className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                        {!team.isDefault && (
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleDeleteTeam(team.id)}
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Edit Team Modal */}
            <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Team</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleUpdateTeam} className="space-y-4">
                        <div>
                            <Input
                                name="name"
                                placeholder="Team name"
                                defaultValue={selectedTeam?.name}
                                required
                            />
                        </div>
                        <div>
                            <Textarea
                                name="description"
                                placeholder="Team description"
                                defaultValue={selectedTeam?.description}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Update Team
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Manage Members Modal */}
            <Dialog open={isMembersModalOpen} onOpenChange={setIsMembersModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Manage Team Members</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleManageMembers} className="space-y-4">
                        <div className="space-y-4 max-h-[400px] overflow-y-auto">
                            {workspaceMembers?.map((member: any, index: number) => (
                                <div key={member.user.id} className="flex items-center space-x-4">
                                    <Checkbox
                                        id={`user-${index}`}
                                        name={`user-${index}`}
                                        defaultChecked={selectedTeam?.members.some(
                                            (m: any) => m.user.id === member.user.id
                                        )}
                                    />
                                    <div className="flex items-center space-x-2">
                                        <Avatar>
                                            <AvatarImage src={member.user.image} />
                                            <AvatarFallback>
                                                {member.user.name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">{member.user.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {member.user.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button type="submit" className="w-full">
                            Save Changes
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}