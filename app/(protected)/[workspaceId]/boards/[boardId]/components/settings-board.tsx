"use client";
import { Settings2, Tag, Users, Layout } from "lucide-react";
import { useState } from "react";
import TagManager from "./tag-manager";
import SettingsSection from "./settings-section";
import { toast } from "sonner";
import BoardSettings from "./board-settings";

interface BoardSettingsProps {
    boardId: string;
}


const Settings = ({ boardId }: BoardSettingsProps) => {
    const [activeTab, setActiveTab] = useState("general");

    const handleSave = () => {
        toast.success("Les paramètres ont été sauvegardés.");
    };


    return (
        <div className="min-h-screen bg-gray-50 w-full">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="col-span-3">
                        <nav className="space-y-1">
                            <button
                                onClick={() => setActiveTab("general")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${activeTab === "general"
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <Settings2 className="w-5 h-5" />
                                <span>Général</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("tags")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${activeTab === "tags"
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <Tag className="w-5 h-5" />
                                <span>Tags</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("permissions")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${activeTab === "permissions"
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <Users className="w-5 h-5" />
                                <span>Permissions</span>
                            </button>
                            <button
                                onClick={() => setActiveTab("display")}
                                className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${activeTab === "display"
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-100"
                                    }`}
                            >
                                <Layout className="w-5 h-5" />
                                <span>Affichage</span>
                            </button>
                        </nav>
                    </div>

                    {/* Main content */}
                    <div className="col-span-9">
                        <div className="bg-white rounded-lg shadow">
                            {activeTab === "general" && <BoardSettings />}
                            {activeTab === "tags" && <TagManager boardId={boardId} />}
                            {activeTab === "permissions" && (
                                <SettingsSection
                                    title="Permissions"
                                    description="Gérez qui peut voir et modifier ce board."
                                >
                                    <div className="p-6">
                                        <p className="text-gray-500">
                                            Les paramètres de permissions seront bientôt disponibles.
                                        </p>
                                    </div>
                                </SettingsSection>
                            )}
                            {activeTab === "display" && (
                                <SettingsSection
                                    title="Options d'affichage"
                                    description="Personnalisez l'apparence de votre board."
                                >
                                    <div className="p-6">
                                        <p className="text-gray-500">
                                            Les options d&apos;affichage seront bientôt disponibles.
                                        </p>
                                    </div>
                                </SettingsSection>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;