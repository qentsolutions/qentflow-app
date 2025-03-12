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
        "#FF6B6B", // Rouge vif
        "#4ECDC4", // Turquoise
        "#45B7D1", // Bleu clair
        "#96CEB4", // Vert menthe
        "#9B59B6", // Violet
        "#3498DB", // Bleu
        "#E74C3C", // Rouge
        "#2ECC71", // Vert
        "#1ABC9C", // Cyan
        "#2C3E50", // Bleu foncé
        "#8E44AD", // Violet foncé
        "#E67E22"  // Orange
    ];

    return colors[Math.abs(hash) % colors.length];
};

export const ProjectAvatar = ({ projectName, projectLogo, size = "md" }: ProjectAvatarProps) => {
    const backgroundColor = useMemo(() => getColorFromString(projectName), [projectName]);

    const sizeClasses = {
        sm: "h-6 w-6",  // Taille réduite pour "sm"
        md: "h-8 w-8",  // Taille réduite pour "md"
        lg: "h-10 w-10", // Taille réduite pour "lg"
    };

    const fontSizes = {
        sm: "text-xs",  // Taille de police réduite pour "sm"
        md: "text-sm",  // Taille de police réduite pour "md"
        lg: "text-base", // Taille de police réduite pour "lg"
    };

    return (
        <Avatar className={`${sizeClasses[size]} rounded-md border-none`}>  {/* Supprimer toute bordure arrondie */}
            {projectLogo ? (
                <AvatarImage src={projectLogo} alt={projectName} className="object-cover" />
            ) : (
                <AvatarFallback
                    className={`${fontSizes[size]} rounded-md font-semibold text-white`}
                    style={{ backgroundColor }}
                >
                    {projectName.charAt(0).toUpperCase()}
                </AvatarFallback>
            )}
        </Avatar>
    );
};
