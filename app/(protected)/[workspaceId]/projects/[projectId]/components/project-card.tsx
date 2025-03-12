"use client";

import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Folder, LayoutGrid, FileText } from "lucide-react";
import { format } from "date-fns";

interface ProjectCardProps {
    project: any;
    onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
    return (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
        >
            <Card className="p-6 cursor-pointer hover:shadow-md transition-all duration-200">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                        <Folder className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            Created {format(new Date(project.createdAt), "MMM d, yyyy")}
                        </p>
                    </div>
                </div>

                {project.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {project.description}
                    </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <LayoutGrid className="h-4 w-4" />
                        <span>{project.boards?.length || 0} Boards</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{project.documents?.length || 0} Documents</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}