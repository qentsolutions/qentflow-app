"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserPlus, Trash2 } from "lucide-react";

export default function ProjectSettingsPage() {
    const params = useParams();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

    const { data: project, refetch } = useQuery({
        queryKey: ["project", params.projectId],
        queryFn: () => fetcher(`/api/projects/${params.projectId}`),
    });

    const handleUpdateProject = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name"),
            description: formData.get("description"),
            visibility: formData.get("visibility"),
        };

        try {
            const response = await fetch(`/api/projects/${params.projectId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) throw new Error();

            toast.success("Project updated successfully");
            refetch();
        } catch {
            toast.error("Failed to update project");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteProject = async () => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            const response = await fetch(`/api/projects/${params.projectId}`, {
                method: "DELETE",
            });

            if (!response.ok) throw new Error();

            toast.success("Project deleted successfully");
            router.push(`/${params.workspaceId}/projects`);
        } catch {
            toast.error("Failed to delete project");
        }
    };

    if (!project) return null;

    return (
        <div className="p-6">
            <Card>
                <CardHeader>
                    <CardTitle>Project Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="general">
                        <TabsList>
                            <TabsTrigger value="general">General</TabsTrigger>
                            <TabsTrigger value="members">Members</TabsTrigger>
                            <TabsTrigger value="features">Features</TabsTrigger>
                        </TabsList>

                        <TabsContent value="general" className="space-y-6">
                            <form onSubmit={handleUpdateProject} className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Project Name</Label>
                                    <Input
                                        name="name"
                                        defaultValue={project.name}
                                        placeholder="Enter project name"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Description</Label>
                                    <Textarea
                                        name="description"
                                        defaultValue={project.description || ""}
                                        placeholder="Enter project description"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Visibility</Label>
                                    <RadioGroup
                                        name="visibility"
                                        defaultValue={project.visibility}
                                        className="flex flex-col space-y-1"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="public" id="public" />
                                            <Label htmlFor="public">For my workspace</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="private" id="private" />
                                            <Label htmlFor="private">Confidential</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? "Saving..." : "Save Changes"}
                                </Button>
                            </form>

                            <div className="pt-6 border-t">
                                <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteProject}
                                >
                                    Delete Project
                                </Button>
                            </div>
                        </TabsContent>

                        <TabsContent value="members" className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Project Members</h3>
                                <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button>
                                            <UserPlus className="h-4 w-4 mr-2" />
                                            Invite Member
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Invite Member to Project</DialogTitle>
                                        </DialogHeader>
                                        {/* Add invite form here */}
                                    </DialogContent>
                                </Dialog>
                            </div>

                            <div className="space-y-4">
                                {project.members?.map((member: any) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={member.user.image} />
                                                <AvatarFallback>
                                                    {member.user.name?.[0]?.toUpperCase()}
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
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </TabsContent>

                        <TabsContent value="features" className="space-y-6">
                            <div className="space-y-4">
                                {project.features.map((feature: any) => (
                                    <Card key={feature.id} className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-medium capitalize">{feature.type}</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Added on {new Date(feature.createdAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-red-500 hover:text-red-600"
                                                onClick={async () => {
                                                    try {
                                                        const response = await fetch(
                                                            `/api/projects/${params.projectId}/features?featureId=${feature.id}`,
                                                            { method: "DELETE" }
                                                        );
                                                        if (!response.ok) throw new Error();
                                                        toast.success("Feature removed successfully");
                                                        refetch();
                                                    } catch {
                                                        toast.error("Failed to remove feature");
                                                    }
                                                }}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}