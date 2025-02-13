import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import { Card } from "@/components/ui/card";
import { BarChart, Title } from "@tremor/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2 } from "lucide-react";

interface AutomationUsageProps {
    boardId: string;
    workspaceId: string;
}

export const AutomationUsage = ({ boardId, workspaceId }: AutomationUsageProps) => {
    const { data: usageData, isLoading } = useQuery({
        queryKey: ["automation-usage", boardId],
        queryFn: () => fetcher(`/api/boards/${workspaceId}/${boardId}/usage`),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-250px)]">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    // Regrouper les données par heure locale
    const hourlyData: { [key: string]: number } = {};
    usageData?.dailyUsage?.forEach((day: any) => {
        const localDate = new Date(day.date); // Convertir en date locale
        const hour = format(localDate, "hh:00 a", { locale: fr });
        if (hourlyData[hour]) {
            hourlyData[hour] += day.count;
        } else {
            hourlyData[hour] = day.count;
        }
    });

    const chartdata = Object.keys(hourlyData).map((hour) => ({
        hour,
        executions: hourlyData[hour],
    }));

    const totalExecutions = usageData?.totalExecutions || 0;
    const successRate = usageData?.successRate || 0;
    const mostUsedAutomation = usageData?.mostUsedAutomation;

    return (
        <ScrollArea className="h-[calc(100vh-250px)]">
            <div className="space-y-6 p-4">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-gray-500">Total Executions</h3>
                        <p className="text-3xl font-bold mt-2">{totalExecutions}</p>
                    </Card>
                    <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
                        <div className="flex items-center gap-2">
                            <p className="text-3xl font-bold mt-2">{successRate}%</p>
                            <div className={`h-2 w-2 rounded-full mt-2 ${successRate >= 90 ? 'bg-green-500' : successRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                        </div>
                    </Card>
                    <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <h3 className="text-sm font-medium text-gray-500">Most Used Automation</h3>
                        <p className="text-xl font-semibold mt-2">{mostUsedAutomation?.name || "N/A"}</p>
                        <p className="text-sm text-gray-500">{mostUsedAutomation?.executions || 0} executions</p>
                    </Card>
                </div>

                {/* Hourly Usage Chart */}
                <Card className="p-6 bg-white shadow-sm">
                    <Title>Hourly Automation Executions</Title>
                    <BarChart
                        className="mt-6 h-72"
                        data={chartdata}
                        index="hour"
                        categories={["executions"]}
                        colors={["blue"]}
                        valueFormatter={(number) => Intl.NumberFormat("us").format(number).toString()}
                        yAxisWidth={48}
                    />
                </Card>

                {/* Automation Type Distribution */}
                {usageData?.automationTypes && (
                    <Card className="p-6 bg-white shadow-sm">
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
