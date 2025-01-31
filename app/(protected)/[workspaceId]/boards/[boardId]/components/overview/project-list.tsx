import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ProjectsListProps {
    lists: any[];
}

export const ProjectsList = ({ lists }: ProjectsListProps) => {
    return (
        <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Projects ({lists.length})</h2>
                <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Project
                </Button>
            </div>
            <div className="space-y-2">
                {lists.map((project: any) => (
                    <div
                        key={project.id}
                        className="flex items-center gap-3 p-2 hover:bg-accent rounded-lg transition-colors"
                    >
                        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-semibold">
                            {project.title.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{project.title}</span>
                    </div>
                ))}
            </div>
        </Card>
    );
};