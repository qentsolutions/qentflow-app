import { Card } from "@/components/ui/card";
import { DonutChartCenterText } from "@/components/ui/donut-chart-center-text";
import { Title } from "@tremor/react";

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
  // Calculer le total des cartes pour l'affichage central
  const totalCards = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="p-6">
      <Title>Cards by Priority</Title>
      <div className="flex items-center justify-center h-full">
        <DonutChartCenterText
          data={data.map(item => ({ name: item.name, value: item.value }))}
          total={totalCards}
        />
      </div>
    </Card>
  );
};
