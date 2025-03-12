"use client";

import { format } from "date-fns";
import { LayoutGrid, FileText, MoreHorizontal, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

interface ProjectListProps {
    projects: any[];
    onProjectClick: (projectId: string) => void;
}

export function ProjectList({ projects, onProjectClick }: ProjectListProps) {
    const router = useRouter();
    const { currentWorkspace } = useCurrentWorkspace();

    return (
        <div className="divide-y">
            {projects.map((project) => (
                <div
                    key={project.id}
                    className="flex items-center justify-between py-4 hover:bg-gray-50 px-4 cursor-pointer"
                    onClick={() => onProjectClick(project.id)}
                >
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-blue-100">
                            <Folder className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-medium">{project.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                Created {format(new Date(project.createdAt), "MMM d, yyyy")}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <LayoutGrid className="h-4 w-4" />
                                <span>{project.boards?.length || 0} Boards</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <FileText className="h-4 w-4" />
                                <span>{project.documents?.length || 0} Documents</span>
                            </div>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(
                                            `/${currentWorkspace?.id}/projects/${project.id}?tab=settings`
                                        );
                                    }}
                                >
                                    Settings
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            ))}
        </div>
    );
}