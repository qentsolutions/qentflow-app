import { Card } from "@/components/ui/card";
import { DonutChart, Title, Legend } from "@tremor/react";

interface PriorityDistribution {
  name: string;
  value: number;
  color: string;
}

interface PriorityDistributionChartProps {
  data: PriorityDistribution[];
  selectedUserId: string | null;
}

export const PriorityDistributionChart = ({ data, selectedUserId }: PriorityDistributionChartProps) => {
  return (
    <Card className="p-6">
      <Title>Cards by Priority</Title>
      <div className="flex items-center">
        <DonutChart
          className="h-[200px] mt-4"
          data={data}
          category="value"
          index="name"
          colors={["red", "orange", "yellow", "emerald"]}
          valueFormatter={(value) => `${value} tasks`}
        />
        <Legend
          className="mt-4"
          colors={["red", "orange", "yellow", "emerald"]}
          categories={data.map(item => item.name)}
        />
      </div>
    </Card>
  );
};
