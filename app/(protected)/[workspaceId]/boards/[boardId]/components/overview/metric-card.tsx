import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changeDirection: "up" | "down" | "neutral";
}

export const MetricCard = ({ title, value, change, changeDirection }: MetricCardProps) => {
  return (
    <Card className="p-4 shadow-sm">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className={`flex items-center gap-1 text-xs ${
            changeDirection === "up" ? "text-green-500" : 
            changeDirection === "down" ? "text-red-500" : 
            "text-gray-500"
          }`}>
            {changeDirection === "up" && <ArrowUp className="w-3 h-3" />}
            {changeDirection === "down" && <ArrowDown className="w-3 h-3" />}
            {changeDirection === "neutral" && <Minus className="w-3 h-3" />}
            <span>{change}</span>
          </div>
        </div>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </Card>
  );
};