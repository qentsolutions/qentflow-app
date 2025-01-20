"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, CheckCircle2, Circle, ListTodo } from "lucide-react";
import { useCardModal } from "@/hooks/use-card-modal";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

export default function MyTasksPage() {
  const { currentWorkspace } = useCurrentWorkspace();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [searchTerm, setSearchTerm] = useState("");
  const cardModal = useCardModal();

  useEffect(() => {
    document.title = "My Tasks - QentFlow";
  }, []);

  useEffect(() => {
    setBreadcrumbs([{ label: "My Tasks" }]);
  }, [setBreadcrumbs]);

  const { data: assignedCards, isLoading } = useQuery({
    queryKey: ["assigned-cards", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/cards/current-user-card?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  // Grouper les cartes par board
  const groupedCards = assignedCards?.reduce((acc: any, card: any) => {
    const boardTitle = card.list.board.title;
    if (!acc[boardTitle]) {
      acc[boardTitle] = [];
    }
    acc[boardTitle].push(card);
    return acc;
  }, {});

  const filteredGroupedCards = groupedCards
    ? Object.entries(groupedCards).reduce((acc: any, [boardTitle, cards]: [string, any]) => {
        const filteredCards = (cards as any[]).filter(
          (card) =>
            card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (filteredCards.length > 0) {
          acc[boardTitle] = filteredCards;
        }
        return acc;
      }, {})
    : {};

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-full" />
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[200px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
          <CardTitle className="text-2xl font-bold">My Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-6">
            {Object.entries(filteredGroupedCards).map(([boardTitle, cards]: [string, any]) => (
              <div key={boardTitle} className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <ListTodo className="h-5 w-5" />
                  {boardTitle}
                </h3>
                <div className="grid gap-4">
                  {cards.map((card: any) => {
                    const completedTasks = card.tasks?.filter((task: any) => task.completed).length || 0;
                    const totalTasks = card.tasks?.length || 0;
                    const progress = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

                    return (
                      <Card
                        key={card.id}
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => cardModal.onOpen(card.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{card.title}</h4>
                                {card.priority && (
                                  <Badge
                                    variant={
                                      card.priority === "HIGH"
                                        ? "destructive"
                                        : card.priority === "MEDIUM"
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {card.priority}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {card.list.title}
                              </p>
                            </div>
                            {card.tasks && card.tasks.length > 0 && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {completedTasks}/{totalTasks}
                              </div>
                            )}
                          </div>

                          {card.tasks && card.tasks.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <Progress value={progress} className="h-2" />
                              <ScrollArea className="h-[100px]">
                                {card.tasks.map((task: any) => (
                                  <div
                                    key={task.id}
                                    className="flex items-center gap-2 py-1"
                                  >
                                    {task.completed ? (
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <Circle className="h-4 w-4 text-gray-300" />
                                    )}
                                    <span
                                      className={`text-sm ${
                                        task.completed
                                          ? "line-through text-muted-foreground"
                                          : ""
                                      }`}
                                    >
                                      {task.title}
                                    </span>
                                  </div>
                                ))}
                              </ScrollArea>
                            </div>
                          )}

                          {card.dueDate && (
                            <div className="mt-4">
                              <Badge variant="secondary">
                                Due {new Date(card.dueDate).toLocaleDateString()}
                              </Badge>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}

            {Object.keys(filteredGroupedCards).length === 0 && (
              <div className="text-center py-10">
                <ListTodo className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-muted-foreground">No tasks found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}