"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ProjectCard } from "./components/project-card";
import { CreateProjectForm } from "./components/create-project-form";
import Link from "next/link";

export default function ProjectsPage() {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const { data: projects, isLoading } = useQuery({
        queryKey: ["projects", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/projects?workspaceId=${currentWorkspace?.id}`),
        enabled: !!currentWorkspace?.id,
    });

    useEffect(() => {
        document.title = "Projects - QentFlow";
    }, []);

    return (
        <div className="p-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                    <CardTitle className="text-2xl font-bold">Projects</CardTitle>
                    <Link href={`/${currentWorkspace?.id}/projects/create`}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" />
                            Create Project
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            // Afficher des skeletons pendant le chargement
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="h-48 animate-pulse bg-gray-100" />
                            ))
                        ) : projects?.length > 0 ? (
                            projects.map((project: any) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onClick={() => router.push(`/${currentWorkspace?.id}/projects/${project.id}`)}
                                />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-10">
                                <p className="text-muted-foreground">No projects found. Create your first project!</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}