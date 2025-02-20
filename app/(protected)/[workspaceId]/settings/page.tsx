"use client";

import { useEffect, useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { updateWorkspace } from "@/actions/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CreditCard, Settings, Users } from "lucide-react";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";

import Members from "./components/members";
import SettingsWorkspace from "./components/settings";

const UpdateWorkspaceSchema = z.object({
    name: z.string().min(1, "Workspace name is required"),
});

const ManageWorkspacesPage = () => {
    const { currentWorkspace, setCurrentWorkspace } = useCurrentWorkspace();
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState<string | undefined>();
    const [success, setSuccess] = useState<string | undefined>();
    const { setBreadcrumbs } = useBreadcrumbs();

    useEffect(() => {
        setBreadcrumbs([
            { label: `${currentWorkspace?.name}` },
            { label: "Manage Workspace" },
        ]);
    }, [setBreadcrumbs, currentWorkspace]);


    const form = useForm<z.infer<typeof UpdateWorkspaceSchema>>({
        resolver: zodResolver(UpdateWorkspaceSchema),
        defaultValues: {
            name: currentWorkspace?.name || "",
        },
    });

    const onSubmit = async (values: z.infer<typeof UpdateWorkspaceSchema>) => {
        setError(undefined);
        setSuccess(undefined);

        if (!currentWorkspace) return;

        const result = await updateWorkspace({
            ...values,
            workspaceId: currentWorkspace.id,
        });

        if (result.error) {
            setError(result.error);
            return;
        }

        if (result.workspace) {
            setCurrentWorkspace({
                ...result.workspace,
                members: currentWorkspace.members,
                createdAt: result.workspace.createdAt.toISOString(),
            });http://localhost:3000/home
            setSuccess("Workspace updated successfully!");
        }
    };

    const filteredMembers = currentWorkspace?.members.filter((member) =>
        member.user.name && member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email && member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


   
    return (
        <div className="p-2">
            <Card className="rounded-none shadow-none">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Manage Workspace</CardTitle>
                        <CardDescription>
                            Configure and manage your workspace and team members
                        </CardDescription>
                    </div>
                    <Avatar className="h-12 w-12 bg-blue-500 rounded-lg">
                        <AvatarImage src={currentWorkspace?.logo || ""} alt={`${currentWorkspace?.name} logo`} />
                        <AvatarFallback className="bg-blue-500 text-white text-xl">{currentWorkspace?.name[0]}</AvatarFallback>
                    </Avatar>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="members" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="members">
                                <Users className="mr-2 h-4 w-4" />
                                Members
                            </TabsTrigger>
                            <TabsTrigger value="billing">
                                <CreditCard className="mr-2 h-4 w-4" />
                                Billing
                            </TabsTrigger>
                            <TabsTrigger value="settings">
                                <Settings className="mr-2 h-4 w-4" />
                                Settings
                            </TabsTrigger>
                        </TabsList>
                        <TabsContent value="members" className="space-y-4">
                            <Members />
                        </TabsContent>
                        <TabsContent value="billing" className="space-y-4">
                            <h2 className="text-xl font-semibold tracking-tight">
                                Billing Information
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Manage your billing information and subscription
                            </p>
                        </TabsContent>
                        <TabsContent value="settings" className="space-y-4">
                            <SettingsWorkspace />
                            
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageWorkspacesPage;
