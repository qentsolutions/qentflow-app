"use client";

import { Card } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { AssignedTasksList } from "./assigned-task";
import { TeamMembers } from "./team-members";
import { useState } from "react";
import { PriorityDistributionChart } from "./priority-distribution-chart";

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
      color: string;
    }[];
    tasks: {
      id: string;
      completed: boolean;
    }[];
    dueDate: Date | null;
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
      const hasUncompletedTasks = card.tasks.some(task => !task.completed);
      return dueDate < new Date() && hasUncompletedTasks;
    }).length;

    return {
      totalCards,
      totalTasks,
      completedTasks,
      assignedTasks,
      overdueTasks
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

  const cardsByUserData = calculateCardsByUser();
  const metrics = calculateMetrics(selectedUserId);
  const priorityData = calculatePriorityDistribution(selectedUserId);

  return (
    <div className="py-2 px-4 space-y-4 animate-fade-in">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Total Cards"
          value={metrics.totalCards}
          change={2}
          changeDirection="up"
        />
        <MetricCard
          title="Overdue Cards"
          value={metrics.overdueTasks}
          change={0}
          changeDirection="neutral"
        />
        <MetricCard
          title="Assigned Cards"
          value={metrics.assignedTasks}
          change={0}
          changeDirection="neutral"
        />
        <MetricCard
          title="Total Tasks"
          value={metrics.totalTasks}
          change={0}
          changeDirection="neutral"
        />
        <MetricCard
          title="Completed Tasks"
          value={metrics.completedTasks}
          change={0}
          changeDirection="neutral"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="lg:col-span-1 h-full">
          <AssignedTasksList lists={lists} selectedUserId={selectedUserId} />
        </div>
        <div className="lg:col-span-1 space-y-4">
          <TeamMembers
            users={users}
            selectedUserId={selectedUserId}
            onUserSelect={setSelectedUserId}
          />
          <PriorityDistributionChart data={priorityData} selectedUserId={selectedUserId} />
        </div>
      </div>
    </div>
  );
};
