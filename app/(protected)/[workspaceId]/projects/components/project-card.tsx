import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Lock, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    features: any[];
    visibility: string;
    createdBy: {
      name: string;
      image: string;
    };
    members: any[];
  };
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer hover:shadow-md transition-shadow p-6 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{project.name}</h3>
        {project.visibility === "private" ? (
          <Lock className="h-4 w-4 text-orange-500" />
        ) : (
          <Globe className="h-4 w-4 text-green-500" />
        )}
      </div>

      {project.description && (
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {project.features.map((feature) => (
          <Badge key={feature.id} variant="secondary">
            {feature.type}
          </Badge>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarImage src={project.createdBy.image} />
            <AvatarFallback>
              {project.createdBy.name?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span>{project.createdBy.name}</span>
        </div>
        <span>
          Created {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
        </span>
      </div>

      {project.members?.length > 0 && (
        <div className="flex -space-x-2">
          {project.members.slice(0, 3).map((member) => (
            <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
              <AvatarImage src={member.user.image} />
              <AvatarFallback>
                {member.user.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {project.members.length > 3 && (
            <div className="flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-medium">
              +{project.members.length - 3}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}