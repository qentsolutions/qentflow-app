"use client";
import { MetricCard } from "./metric-card";
import { AssignedTasksList } from "./assigned-task";
import { TeamMembers } from "./team-members";
import { useState } from "react";

interface List {
    id: string;
    title: string;
    cards: {
        id: string;
        title: string;
        assignedUserId: string | null;
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

        const totalCards = lists.reduce((acc, list) => acc + list.cards.length, 0);
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

    const metrics = calculateMetrics(selectedUserId);

    return (
        <div className="p-6 space-y-6">
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

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <AssignedTasksList lists={lists} selectedUserId={selectedUserId} />
                </div>
                <div className="space-y-6">
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
