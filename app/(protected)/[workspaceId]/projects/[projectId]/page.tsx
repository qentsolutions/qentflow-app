"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { fetcher } from "@/lib/fetcher";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectHeader } from "./components/project-header";
import { ProjectSettings } from "./components/project-settings";
import { ProjectOverview } from "./components/project-overview";
import { ProjectResources } from "./components/project-resource";
import { ProjectBoards } from "./components/project-board";
import { ProjectDocuments } from "./components/project-document";

import { KanbanSquare, FileText, Settings2, LayoutDashboard, FolderKanban } from "lucide-react";

export default function ProjectPage() {
    const params = useParams();
    const { currentWorkspace } = useCurrentWorkspace();
    const { setBreadcrumbs } = useBreadcrumbs();
    const [activeTab, setActiveTab] = useState("overview");

    const { data: project, isLoading } = useQuery({
        queryKey: ["project", params.projectId],
        queryFn: () =>
            fetcher(`/api/projects/${currentWorkspace?.id}/${params.projectId}`),
        enabled: !!currentWorkspace?.id && !!params.projectId,
    });

    useEffect(() => {
        if (project) {
            document.title = `${project.name} - QentFlow`;
            setBreadcrumbs([
                { label: "Projects", href: `/${currentWorkspace?.id}/projects` },
                { label: project.name },
            ]);
        }
    }, [project, currentWorkspace?.id, setBreadcrumbs]);

    if (isLoading) {
        return (
            <div className="p-6">
                <Card className="w-full h-[200px] animate-pulse" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="p-6">
                <Card className="p-6">
                    <h1 className="text-2xl font-bold">Project not found</h1>
                </Card>
            </div>
        );
    }

    return (
        <div className="pl-2 pt-2">
            <Card className="shadow-none rounded-none h-screen">
                <ProjectHeader project={project} />
                <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full px-6"
                >
                    <TabsList>
                        <TabsTrigger value="overview">
                            <LayoutDashboard className="h-4 w-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="resources">
                            <FolderKanban className="h-4 w-4 mr-2" />
                            Resources
                        </TabsTrigger>
                        <TabsTrigger value="boards">
                            <KanbanSquare className="h-4 w-4 mr-2" />
                            Boards
                        </TabsTrigger>
                        <TabsTrigger value="documents">
                            <FileText className="h-4 w-4 mr-2" />
                            Documents
                        </TabsTrigger>
                        <TabsTrigger value="settings">
                            <Settings2 className="h-4 w-4 mr-2" />
                            Settings
                        </TabsTrigger>
                    </TabsList>

                    <div className="mt-6">
                        <TabsContent value="overview">
                            <ProjectOverview project={project} />
                        </TabsContent>
                        <TabsContent value="resources">
                            <ProjectResources project={project} />
                        </TabsContent>
                        <TabsContent value="boards">
                            <ProjectBoards project={project} />
                        </TabsContent>
                        <TabsContent value="documents">
                            <ProjectDocuments project={project} />
                        </TabsContent>
                        <TabsContent value="settings">
                            <ProjectSettings project={project} />
                        </TabsContent>
                    </div>
                </Tabs>
            </Card>
        </div>
    );
}