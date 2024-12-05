"use client";

import { useState, useTransition } from "react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoreVertical, UserMinus, LogOut, UserCog } from "lucide-react";
import { toast } from "sonner";
import { useCurrentUser } from "@/hooks/use-current-user";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InviteMemberDialog } from "./invite-member";
import { excludeMember } from "@/actions/workspace/exclude-member";
import { leaveWorkspace } from "@/actions/workspace/leave-workspace";

export default function Members() {
    const { currentWorkspace } = useCurrentWorkspace();
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [isPending, startTransition] = useTransition();
    const currentUser = useCurrentUser();
    const [members, setMembers] = useState(currentWorkspace?.members || []); // État local pour les membres

    const filteredMembers = members.filter((member) => {
        const matchesSearch =
            (member.user.name && member.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (member.user.email && member.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === "all" || member.role.toLowerCase() === roleFilter.toLowerCase();
        return matchesSearch && matchesRole;
    });

    const isCurrentUserAdmin =
        currentWorkspace?.members.find(
            (member) => member.user.id === currentUser?.id
        )?.role === "ADMIN";

    const handleExcludeMember = async (memberId: string) => {
        startTransition(async () => {
            const response = await excludeMember({
                workspaceId: currentWorkspace?.id ?? "",
                memberId,
            });

            if (response.error) {
                toast.error(response.error);
            } else {
                toast.success(response.success);
                // Mettez à jour l'état local après exclusion
                setMembers((prevMembers) => prevMembers.filter((member) => member.user.id !== memberId));
            }
        });
    };

    const handleLeaveWorkspace = async () => {
        if (!currentWorkspace?.id || !currentUser?.id) return;

        startTransition(async () => {
            try {
                const response = await leaveWorkspace({
                    workspaceId: currentWorkspace.id,
                });

            } catch (error) {
                toast.error("An error occurred while leaving the workspace");
            }
        });
    };

    const handleChangeRole = (memberId: string, newRole: string) => {
        // Ajoutez la logique pour changer le rôle d'un membre ici.
        toast.success(`Role changed to ${newRole}`);
    };

    return (
        <div>
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight">
                        Workspace Members
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Manage and invite members to your workspace
                    </p>
                </div>
                {isCurrentUserAdmin && <InviteMemberDialog />}
            </div>
            <div className="flex items-center space-x-2 py-4">
                <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Select defaultValue="all" onValueChange={(value) => setRoleFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Roles</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-4">
                {filteredMembers?.map((member) => (
                    <Card key={member.user.id}>
                        <CardContent className="flex items-center justify-between p-4">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarImage src={member.user.image || ""} />
                                    <AvatarFallback>
                                        {member.user.name ? member.user.name[0] : ""}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">
                                        {member.user.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {member.user.email}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <Badge
                                    variant={member.role === "ADMIN" ? "default" : "secondary"}
                                >
                                    {member.role}
                                </Badge>
                                {(isCurrentUserAdmin || member.user.id === currentUser?.id) && (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            {isCurrentUserAdmin &&
                                                member.user.id !== currentUser?.id && (
                                                    <>
                                                        <DropdownMenuItem
                                                            onClick={() => handleExcludeMember(member.user.id)}
                                                            className="text-destructive"
                                                        >
                                                            <UserMinus className="mr-2 h-4 w-4" />
                                                            Remove Member
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                handleChangeRole(
                                                                    member.user.id,
                                                                    member.role === "ADMIN" ? "USER" : "ADMIN"
                                                                )
                                                            }
                                                        >
                                                            <UserCog className="mr-2 h-4 w-4" />
                                                            Change to{" "}
                                                            {member.role === "ADMIN" ? "USER" : "Admin"}
                                                        </DropdownMenuItem>
                                                    </>
                                                )}
                                            {member.user.id === currentUser?.id && (
                                                <DropdownMenuItem
                                                    onClick={handleLeaveWorkspace}
                                                    className="text-destructive"
                                                >
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Leave Workspace
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
