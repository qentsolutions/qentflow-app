import { useState } from "react";
import { Tag as TagIcon, X } from "lucide-react";
import SettingsSection from "./settings-section";
import CreateTagForm from "./create-tag-form";
import { fetcher } from "@/lib/fetcher";
import { useQuery } from "@tanstack/react-query";

interface Tag {
    id: string;
    name: string;
    color: string;
}

interface BoardSettingsProps {
    boardId: string;
}

const TagManager = ({ boardId }: BoardSettingsProps) => {

    const { data: availableTags } = useQuery({
        queryKey: ["available-tags", boardId],
        queryFn: () => fetcher(`/api/boards/tags?boardId=${boardId}`),
    });

    return (
        <SettingsSection title="Gestion des tags" description="Créez et gérez les tags de votre board.">
            <div className="p-6">
                <div className="mb-6">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <CreateTagForm boardId={boardId} />
                        </div>          
                    </div>
                </div>

                <div className="space-y-3">
                    {availableTags?.map((tag: any) => (
                        <div
                            key={tag.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                        >
                            <div className="flex items-center space-x-3">
                                <TagIcon className="w-5 h-5" style={{ color: tag.color }} />
                                <span className="font-medium">{tag.name}</span>
                            </div>
                            <button
                                className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    ))
                    }

                </div>
            </div>
        </SettingsSection>
    );
};

export default TagManager;