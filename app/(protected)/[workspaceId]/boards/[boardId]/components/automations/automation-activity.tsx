"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Zap, AlertTriangle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface AutomationActivityProps {
    boardId: string;
    workspaceId: string;
}

export const AutomationActivity = ({ boardId, workspaceId }: AutomationActivityProps) => {
    const { data: activities, isLoading } = useQuery({
        queryKey: ["automation-activities", boardId],
        queryFn: () => fetcher(`/api/automations/${workspaceId}/${boardId}/activities`),
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!activities || activities.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
                <Zap className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No automation activity yet</h3>
                <p className="text-sm text-gray-500 mt-2">
                    Automation activities will appear here once they are triggered.
                </p>
            </div>
        );
    }

    // Trier les activités par ordre croissant (les plus récentes en haut)
    const sortedActivities = activities.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return (
        <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-4 p-4">
                {sortedActivities.map((activity: any) => (
                    <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-blue-100 p-2">
                                        <Zap className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">{activity.automation.name}</h4>
                                        <p className="text-sm text-gray-500">{activity.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-gray-400">
                                                {format(new Date(activity.createdAt), "PPpp", { locale: fr })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs ${activity.status === "success"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                    }`}>
                                    {activity.status}
                                </span>
                            </div>
                            {activity.error && (
                                <div className="mt-2 p-2 bg-red-50 rounded-md flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-red-500" />
                                    <p className="text-xs text-red-600">{activity.error}</p>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                ))}
            </div>
        </ScrollArea>
    );
};
