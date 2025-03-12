"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Plus, Search, Folder, List as ListIcon } from "lucide-react";
import { motion } from "framer-motion";

import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { fetcher } from "@/lib/fetcher";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import { ProjectCard } from "./[projectId]/components/project-card";
import { ProjectList } from "./[projectId]/components/project-list";
import { CreateProjectModal } from "./[projectId]/components/create-project-modal";

export default function ProjectsPage() {
    const { currentWorkspace } = useCurrentWorkspace();
    const { setBreadcrumbs } = useBreadcrumbs();
    const [searchTerm, setSearchTerm] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const router = useRouter();

    useEffect(() => {
        document.title = "Projects - QentFlow";
    }, []);

    useEffect(() => {
        setBreadcrumbs([{ label: "Projects" }]);
    }, [setBreadcrumbs]);

    const { data: projects = [], isLoading } = useQuery({
        queryKey: ["projects", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/projects/${currentWorkspace?.id}`),
        enabled: !!currentWorkspace?.id,
    });

    const filteredProjects = projects.filter((project: any) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <Card className="shadow-none rounded-none">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Projects</h1>
                            <p className="text-muted-foreground">
                                Organize and manage your workspace projects
                            </p>
                        </div>
                        <Button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                        </Button>
                    </div>

                    <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9 bg-background"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((n) => (
                                <Card key={n} className="h-[200px] animate-pulse" />
                            ))}
                        </div>
                    ) : filteredProjects.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                <Folder className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                            <p className="text-muted-foreground mb-4">
                                {searchTerm
                                    ? "No projects match your search"
                                    : "Get started by creating your first project"}
                            </p>
                            {!searchTerm && (
                                <Button
                                    onClick={() => setIsCreateModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Project
                                </Button>
                            )}
                        </motion.div>
                    ) : (
                        <Tabs defaultValue={viewMode} className="w-full">
                            <TabsContent value="grid" className="m-0">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredProjects.map((project: any) => (
                                        <ProjectCard
                                            key={project.id}
                                            project={project}
                                            onClick={() => router.push(`/${currentWorkspace?.id}/projects/${project.id}`)}
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                            <TabsContent value="list" className="m-0">
                                <ProjectList
                                    projects={filteredProjects}
                                    onProjectClick={(projectId) =>
                                        router.push(`/${currentWorkspace?.id}/projects/${projectId}`)
                                    }
                                />
                            </TabsContent>
                        </Tabs>
                    )}
                </div>
            </Card>

            <CreateProjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                workspaceId={currentWorkspace?.id || ""}
            />
        </div>
    );
}