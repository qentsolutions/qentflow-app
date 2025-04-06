"use client";

import { Card } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { AssignedTasksList } from "./assigned-task";
import { TeamMembers } from "./team-members";
import { useState, useEffect } from "react";
import { PriorityDistributionChart } from "./priority-distribution-chart";
import { DonutChartFillableHalf } from "@/components/ui/donut-chart-fillable-half";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

interface List {
  id: string;
  title: string;
  cards: {
    id: string;
    title: string;
    assignedUserId: string | null;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
    tags: {
      id: string;
      name: string;
      color: string | null;
    }[];
    tasks: {
      id: string;
      completed: boolean;
    }[];
    dueDate: Date | null;
    startDate: Date | null;
    archived: boolean;
  }[];
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface OverviewViewProps {
  lists: List[];
  users: User[];
}

export const OverviewView = ({ lists, users }: OverviewViewProps) => {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Calculate metrics from lists data
  const calculateMetrics = (userId: string | null) => {
    const filteredCards = lists.flatMap(list =>
      list.cards.filter(card => !userId || card.assignedUserId === userId)
    );

    const totalCards = filteredCards.length;
    const totalTasks = filteredCards.reduce((acc, card) => acc + card.tasks.length, 0);
    const completedTasks = filteredCards.reduce((acc, card) =>
      acc + card.tasks.filter(task => task.completed).length, 0
    );
    const assignedTasks = filteredCards.length;
    const overdueTasks = filteredCards.filter(card => {
      if (!card.dueDate) return false;
      const dueDate = new Date(card.dueDate);
      const isInLastList = lists[lists.length - 1].cards.some(c => c.id === card.id);
      return dueDate < new Date() && !isInLastList && !card.archived;
    }).length;

    const cardsToCome = filteredCards.filter(card => {
      if (!card.startDate) return false;
      const startDate = new Date(card.startDate);
      return startDate > new Date();
    }).length;

    const completedCards = filteredCards.filter(card => card.archived || lists[lists.length - 1].cards.some(c => c.id === card.id)).length;
    const completionRate = totalCards > 0 ? (completedCards / totalCards) * 100 : 0;

    return {
      totalCards,
      totalTasks,
      completedTasks,
      assignedTasks,
      overdueTasks,
      cardsToCome,
      completionRate
    };
  };

  // Calculate priority distribution
  const calculatePriorityDistribution = (userId: string | null) => {
    const priorityCounts = {
      CRITICAL: { count: 0, color: 'rose-500' },
      HIGH: { count: 0, color: 'orange-500' },
      MEDIUM: { count: 0, color: 'yellow-500' },
      LOW: { count: 0, color: 'emerald-500' }
    };

    lists.forEach(list => {
      list.cards.forEach(card => {
        if ((!userId || card.assignedUserId === userId) && card.priority) {
          priorityCounts[card.priority].count++;
        }
      });
    });

    return Object.entries(priorityCounts).map(([priority, { count, color }]) => ({
      name: priority,
      value: count,
      color: color
    }));
  };

  const calculateCardsByUser = () => {
    const userCounts = new Map<string, { count: number; color: string }>();

    lists.forEach(list => {
      list.cards.forEach(card => {
        if (card.assignedUserId) {
          const user = users.find(user => user.id === card.assignedUserId);
          if (user) {
            const userName = user.name || 'Unknown';
            const existingCount = userCounts.get(userName);
            if (existingCount) {
              existingCount.count++;
            } else {
              userCounts.set(userName, { count: 1, color: 'blue-500' }); // Tu peux ajuster les couleurs selon tes besoins
            }
          }
        }
      });
    });

    return Array.from(userCounts.entries()).map(([name, { count, color }]) => ({
      name,
      value: count,
      color
    }));
  };

  const getUniqueTags = (lists: List[]) => {
    const tagSet = new Set<string>();
    lists.forEach(list => {
      list.cards.forEach(card => {
        card.tags.forEach(tag => {
          tagSet.add(tag.name);
        });
      });
    });
    return Array.from(tagSet);
  };

  const calculateTagCompletion = (tagName: string) => {
    let totalCardsWithTag = 0;
    let completedCardsWithTag = 0;

    lists.forEach(list => {
      list.cards.forEach(card => {
        if (card.tags.some(tag => tag.name === tagName)) {
          totalCardsWithTag++;
          if (list.title.toLowerCase() === 'done') {
            completedCardsWithTag++;
          }
        }
      });
    });

    const completionPercentage = totalCardsWithTag > 0 ? (completedCardsWithTag / totalCardsWithTag) * 100 : 0;
    return {
      filled: completionPercentage,
      empty: 100 - completionPercentage,
    };
  };

  const uniqueTags = getUniqueTags(lists);

  useEffect(() => {
    if (uniqueTags.length > 0 && !selectedTag) {
      setSelectedTag(uniqueTags[0]);
    }
  }, [uniqueTags, selectedTag]);

  const tagCompletionData = selectedTag ? calculateTagCompletion(selectedTag) : null;
  const cardsByUserData = calculateCardsByUser();
  const metrics = calculateMetrics(selectedUserId);
  const priorityData = calculatePriorityDistribution(selectedUserId);

  return (
    <div className="py-2 px-4 space-y-4 animate-fade-in">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Completion Rate"
          value={`${metrics.completionRate.toFixed(2)}%`}
          variant={metrics.completionRate > 50 ? "success" : metrics.completionRate > 25 ? "warning" : "danger"}
          tooltipText="The completion rate represents the percentage of completed cards relative to the total number of cards."
        />
        <MetricCard
          title="Overdue Cards"
          value={metrics.overdueTasks}
          variant={metrics.overdueTasks > 0 ? "warning" : "default"}
          tooltipText="Overdue cards are those whose due date has passed and are not archived."
        />
        <MetricCard
          title="Cards to Come"
          value={metrics.cardsToCome}
          tooltipText="Cards to come are those whose start date is in the future."
        />
        <MetricCard
          title="Assigned Cards"
          value={metrics.assignedTasks}
          tooltipText="Assigned cards are those that have a user assigned to them."
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-1 h-full">
          <AssignedTasksList lists={lists} selectedUserId={selectedUserId} />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <div>
            <Card className="p-6">
              <div className="flex justify-between">
                <div>
                  Tag Progress Overview
                </div>
                <div className="mb-4 w-48">
                  <Select value={selectedTag || ""} onValueChange={setSelectedTag}>
                    <SelectTrigger id="tag-select" className="mt-1 w-full">
                      {selectedTag || "Select a tag"}
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueTags.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {tagCompletionData && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">{selectedTag}</h3>
                  <DonutChartFillableHalf data={[
                    { name: "Filled", value: tagCompletionData.filled },
                    { name: "Empty", value: tagCompletionData.empty },
                  ]} />
                </div>
              )}
            </Card>
          </div>

          <PriorityDistributionChart data={priorityData} selectedUserId={selectedUserId} />
          <TeamMembers
            users={users}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
          />
        </div>
      </div>
    </div>
  );
};
