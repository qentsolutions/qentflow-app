"use client";

import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card } from "@/components/ui/card";
import { BarChart, Title } from "@tremor/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AutomationUsageProps {
    boardId: string;
    workspaceId: string;
}

export const AutomationUsage = ({ boardId, workspaceId }: AutomationUsageProps) => {
    const { data: usageData, isLoading } = useQuery({
        queryKey: ["automation-usage", boardId],
        queryFn: () => fetcher(`/api/automations/${workspaceId}/${boardId}/usage`),
    });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    const chartdata = usageData?.dailyUsage?.map((day: any) => ({
        date: format(new Date(day.date), "PP", { locale: fr }),
        executions: day.count,
    })) || [];

    const totalExecutions = usageData?.totalExecutions || 0;
    const successRate = usageData?.successRate || 0;
    const mostUsedAutomation = usageData?.mostUsedAutomation;

    return (
        <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 p-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-gray-500">Total Executions</h3>
                        <p className="text-3xl font-bold mt-2">{totalExecutions}</p>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                        <p className="text-3xl font-bold mt-2">{successRate}%</p>
                    </Card>
                    <Card className="p-6">
                        <h3 className="text-sm font-medium text-gray-500">Most Used Automation</h3>
                        <p className="text-xl font-semibold mt-2">{mostUsedAutomation?.name || "N/A"}</p>
                        <p className="text-sm text-gray-500">{mostUsedAutomation?.executions || 0} executions</p>
                    </Card>
                </div>

                {/* Daily Usage Chart */}
                <Card className="p-6">
                    <Title>Daily Automation Executions</Title>
                    <BarChart
                        className="mt-6 h-72"
                        data={chartdata}
                        index="date"
                        categories={["executions"]}
                        colors={["blue"]}
                        valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
                        yAxisWidth={48}
                    />
                </Card>

                {/* Automation Type Distribution */}
                {usageData?.automationTypes && (
                    <Card className="p-6">
                        <Title>Automation Type Distribution</Title>
                        <BarChart
                            className="mt-6 h-72"
                            data={usageData.automationTypes}
                            index="type"
                            categories={["count"]}
                            colors={["blue"]}
                            valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
                            yAxisWidth={48}
                        />
                    </Card>
                )}
            </div>
        </ScrollArea>
    );
};