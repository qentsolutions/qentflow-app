"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProjectAvatarProps {
    projectName: string;
    projectLogo?: string | null;
    size?: "sm" | "md" | "lg";
}

const getColorFromString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colors = [
        "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
        "#FFEEAD", "#D4A5A5", "#9B59B6", "#3498DB",
        "#E74C3C", "#2ECC71", "#F1C40F", "#1ABC9C"
    ];

    return colors[Math.abs(hash) % colors.length];
};

export const ProjectAvatar = ({ projectName, projectLogo, size = "md" }: ProjectAvatarProps) => {
    const backgroundColor = useMemo(() => getColorFromString(projectName), [projectName]);

    const sizeClasses = {
        sm: "h-6 w-6", // Réduit la taille pour "sm"
        md: "h-8 w-8", // Réduit la taille pour "md"
        lg: "h-10 w-10", // Réduit la taille pour "lg"
    };

    const fontSizes = {
        sm: "text-xs", // Réduit la taille de la police pour "sm"
        md: "text-sm", // Réduit la taille de la police pour "md"
        lg: "text-base", // Réduit la taille de la police pour "lg"
    };

    return (
        <Avatar className={`${sizeClasses[size]}`}>
            {projectLogo ? (
                <AvatarImage src={projectLogo} alt={projectName} className="object-cover" />
            ) : (
                <AvatarFallback
                    className={`${fontSizes[size]} font-semibold text-white`}
                    style={{ backgroundColor }}
                >
                    {projectName.charAt(0).toUpperCase()}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
