"use client";

import { useEffect, useState } from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { updateWorkspace } from "@/actions/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import { CreditCard, PlusCircle, Settings, Users } from "lucide-react";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { deleteWorkspace } from "@/actions/workspace/delete-workspace";
import { set } from "date-fns";

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
            });
            setSuccess("Workspace updated successfully!");
        }
    };

    const filteredMembers = currentWorkspace?.members.filter((member) =>
        member.user.name && member.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.user.email && member.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const handleDeleteWorkspace = async () => {
        if (!currentWorkspace) return;

        const result = await deleteWorkspace({ workspaceId: currentWorkspace.id });

        if (result.error) {
            setError(result.error);
            return;
        }

        setSuccess(result.success);
        setCurrentWorkspace(null);
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Manage Workspace</CardTitle>
                        <CardDescription>
                            Configure and manage your workspace and team members
                        </CardDescription>
                    </div>
                    <Avatar className="h-16 w-16">
                        <AvatarImage src={currentWorkspace?.logo || ""} alt={`${currentWorkspace?.name} logo`} />
                        <AvatarFallback>{currentWorkspace?.name[0]}</AvatarFallback>
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
                            <div className="flex justify-between items-center">
                                <div className="space-y-1">
                                    <h2 className="text-xl font-semibold tracking-tight">
                                        Workspace Members
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Manage and invite members to your workspace
                                    </p>
                                </div>
                                <Button className="bg-blue-500 hover:bg-blue-700">
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Invite Member
                                </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Input
                                    placeholder="Search members..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <Select defaultValue="all">
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filter by role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Roles</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-4">
                                {filteredMembers?.map((member, index) => (
                                    <Card key={index}>
                                        <CardContent className="flex items-center justify-between p-4">
                                            <div className="flex items-center space-x-4">
                                                <Avatar>
                                                    <AvatarImage src={member.user.image || ""} />
                                                    <AvatarFallback>{member.user.name ? member.user.name[0] : ''}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="text-sm font-medium leading-none">{member.user.name}</p>
                                                    <p className="text-sm text-muted-foreground">{member.user.email}</p>
                                                </div>
                                            </div>
                                            <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                                                {member.role}
                                            </Badge>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
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
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Workspace Name</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        placeholder={currentWorkspace?.name}
                                                        disabled={form.formState.isSubmitting}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormError message={error} />
                                    <FormSuccess message={success} />
                                    <Button
                                        type="submit"
                                        disabled={form.formState.isSubmitting}
                                    >
                                        Save Changes
                                    </Button>
                                </form>
                            </Form>
                            <div className="space-y-4">
                                <Button
                                    className="bg-red-500 hover:bg-red-700 w-full"
                                    onClick={() => handleDeleteWorkspace()}
                                >
                                    Delete Workspace
                                </Button>

                                {error && <p className="text-red-500">{error}</p>}
                                {success && <p className="text-green-500">{success}</p>}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
};

export default ManageWorkspacesPage;
