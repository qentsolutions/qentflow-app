"use client";

import { Card } from "@/components/ui/card";
import { LayoutGrid, FileText, Clock } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface ProjectOverviewProps {
    project: any;
}

export function ProjectOverview({ project }: ProjectOverviewProps) {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();

    const stats = [
        {
            label: "Total Boards",
            value: project.boards?.length || 0,
            icon: LayoutGrid,
            onClick: () => router.push(`/${currentWorkspace?.id}/projects/${project.id}?tab=boards`),
        },
        {
            label: "Total Documents",
            value: project.documents?.length || 0,
            icon: FileText,
            onClick: () => router.push(`/${currentWorkspace?.id}/projects/${project.id}?tab=documents`),
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={stat.onClick}
                    >
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-lg bg-blue-100">
                                <stat.icon className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                                <p className="text-2xl font-bold">{stat.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-blue-100">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Created</p>
                            <p className="text-sm font-medium">
                                {format(new Date(project.createdAt), "MMM d, yyyy")}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Boards</h3>
                    {project.boards && project.boards.length > 0 ? (
                        <div className="space-y-4">
                            {project.boards.slice(0, 5).map((board: any) => (
                                <div
                                    key={board.id}
                                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                                    onClick={() => router.push(`/${currentWorkspace?.id}/boards/${board.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <LayoutGrid className="h-5 w-5 text-blue-600" />
                                        <span>{board.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground mb-4">No boards yet</p>
                            <Button
                                onClick={() => router.push(`/${currentWorkspace?.id}/projects/${project.id}?tab=boards`)}
                            >
                                Create Board
                            </Button>
                        </div>
                    )}
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Recent Documents</h3>
                    {project.documents && project.documents.length > 0 ? (
                        <div className="space-y-4">
                            {project.documents.slice(0, 5).map((document: any) => (
                                <div
                                    key={document.id}
                                    className="flex items-center justify-between hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                                    onClick={() => router.push(`/${currentWorkspace?.id}/documents/${document.id}`)}
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-5 w-5 text-blue-600" />
                                        <span>{document.title}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <p className="text-muted-foreground mb-4">No documents yet</p>
                            <Button
                                onClick={() => router.push(`/${currentWorkspace?.id}/projects/${project.id}?tab=documents`)}
                            >
                                Create Document
                            </Button>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}