"use client";

import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { format } from "date-fns";
import {
  Activity,
  Calendar,
  CheckSquare,
  Clock,
  FileText,
  KanbanSquare,
  LayoutDashboard,
  ListTodo,
  Plus,
  Users,
} from "lucide-react";

export default function Home() {
  const user = useCurrentUser();
  const { currentWorkspace } = useCurrentWorkspace();
  const { setBreadcrumbs } = useBreadcrumbs();
  const router = useRouter();
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    setBreadcrumbs([{ label: "Home" }]);
  }, [setBreadcrumbs]);

  // Fetch user's assigned cards
  const { data: assignedCards } = useQuery({
    queryKey: ["assigned-cards", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/cards/current-user-card?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  // Fetch recent documents
  const { data: documents } = useQuery({
    queryKey: ["documents", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/documents?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  // Fetch calendar events
  const { data: events } = useQuery({
    queryKey: ["calendar-events", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/calendar/events?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  const upcomingEvents = events?.filter((event: any) => new Date(event.startDate) > new Date())
    .sort((a: any, b: any) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 3);

  const recentDocuments = documents?.slice(0, 3);

  const getTasksProgress = (card: any) => {
    if (!card.tasks || card.tasks.length === 0) return 0;
    const completedTasks = card.tasks.filter((task: any) => task.completed).length;
    return (completedTasks / card.tasks.length) * 100;
  };

  return (
    <div className="p-6 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold">
            {greeting}, {user?.name}
          </h1>
          <p className="text-muted-foreground">Here&apos;s what&apos;s happening in your workspace</p>
        </div>
        <Avatar className="h-12 w-12">
          <AvatarImage src={user?.image || ""} />
          <AvatarFallback>{user?.name?.[0]}</AvatarFallback>
        </Avatar>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          icon={KanbanSquare}
          title="Boards"
          description="Manage your projects"
          onClick={() => router.push(`/${currentWorkspace?.id}/boards`)}
        />
        <QuickActionCard
          icon={FileText}
          title="Documents"
          description="Access your documents"
          onClick={() => router.push(`/${currentWorkspace?.id}/documents`)}
        />
        <QuickActionCard
          icon={Calendar}
          title="Calendar"
          description="View your schedule"
          onClick={() => router.push(`/${currentWorkspace?.id}/calendar`)}
        />
        <QuickActionCard
          icon={ListTodo}
          title="My Tasks"
          description="Track your assignments"
          onClick={() => router.push(`/${currentWorkspace?.id}/my-tasks`)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Tasks Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-500" />
              My Tasks
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500"
              onClick={() => router.push(`/${currentWorkspace?.id}/my-tasks`)}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {assignedCards?.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ListTodo className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No tasks assigned to you</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedCards?.map((card: any) => (
                    <motion.div
                      key={card.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                      onClick={() => router.push(`/${currentWorkspace?.id}/boards/${card.list.board.id}/cards/${card.id}`)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{card.title}</h3>
                        <span className="text-xs text-gray-500">
                          {card.dueDate && format(new Date(card.dueDate), "MMM d")}
                        </span>
                      </div>
                      {card.tasks && card.tasks.length > 0 && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Progress</span>
                            <span>
                              {card.tasks.filter((t: any) => t.completed).length}/{card.tasks.length}
                            </span>
                          </div>
                          <Progress value={getTasksProgress(card)} className="h-1" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Recent Documents Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Recent Documents
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-500"
              onClick={() => router.push(`/${currentWorkspace?.id}/documents`)}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              {!recentDocuments || recentDocuments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <FileText className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No documents yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => router.push(`/${currentWorkspace?.id}/documents`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentDocuments?.map((doc: any) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                      onClick={() => router.push(`/${currentWorkspace?.id}/documents/${doc.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-4 w-4 text-blue-500" />
                          <div>
                            <h3 className="font-medium">{doc.title}</h3>
                            <p className="text-xs text-gray-500">
                              Updated {format(new Date(doc.updatedAt), "MMM d, yyyy")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            Upcoming Events
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-500"
            onClick={() => router.push(`/${currentWorkspace?.id}/calendar`)}
          >
            View Calendar
          </Button>
        </CardHeader>
        <CardContent>
          {!upcomingEvents || upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <Calendar className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">No upcoming events</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {upcomingEvents?.map((event: any) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-lg border hover:shadow-md transition-all cursor-pointer"
                  style={{ backgroundColor: `${event.color}10` }}
                  onClick={() => router.push(`/${currentWorkspace?.id}/calendar`)}
                >
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <h3 className="font-medium truncate">{event.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.startDate), "MMM d, h:mm a")}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickActionCard({
  icon: Icon,
  title,
  description,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className="cursor-pointer hover:shadow-md transition-all"
        onClick={onClick}
      >
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-lg bg-blue-50">
              <Icon className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}