"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
    return (
      <div className="flex items-center justify-center h-[calc(100vh-250px)]">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-250px)] text-center p-6">
        <Zap className="h-16 w-16 text-gray-300 mb-4" />
        <h3 className="text-xl font-semibold text-gray-800">No automation activity yet</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-md">
          Automation activities will appear here once they are triggered. Set up your first automation to get started!
        </p>
      </div>
    );
  }

  const sortedActivities = activities.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <ScrollArea className="h-[calc(100vh-250px)]">
      <div className="space-y-4 p-4">
        <AnimatePresence>
          {sortedActivities.map((activity: any) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="rounded-full bg-blue-100 p-2 mt-1">
                      <Zap className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{activity.automation.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <p className="text-xs text-gray-400">
                          {format(new Date(activity.createdAt), "PPpp", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Badge variant={activity.status === "success" ? "success" : "destructive"}>
                    {activity.status}
                  </Badge>
                </div>
                {activity.error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-3 p-3 bg-red-50 rounded-md flex items-start gap-2"
                  >
                    <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-600">{activity.error}</p>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ScrollArea>
  );
};