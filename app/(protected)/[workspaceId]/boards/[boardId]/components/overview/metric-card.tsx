import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  changeDirection: "up" | "down" | "neutral";
  variant?: "default" | "success" | "warning";
}

export const MetricCard = ({ 
  title, 
  value, 
  change, 
  changeDirection,
  variant = "default"
}: MetricCardProps) => {
  return (
    <Card className={cn(
      "p-6 transition-all duration-300 hover:shadow-lg",
      "bg-gradient-to-br from-background to-muted/50",
      "border border-border/50 backdrop-blur-sm",
      variant === "success" && "from-green-50 dark:from-green-950/30",
      variant === "warning" && "from-yellow-50 dark:from-yellow-950/30"
    )}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <div className={cn(
            "flex items-center gap-1 text-xs rounded-full px-2 py-1",
            changeDirection === "up" && "text-green-600 bg-green-100 dark:bg-green-950/30",
            changeDirection === "down" && "text-red-600 bg-red-100 dark:bg-red-950/30",
            changeDirection === "neutral" && "text-gray-600 bg-gray-100 dark:bg-gray-950/30"
          )}>
            {changeDirection === "up" && <ArrowUp className="w-3 h-3" />}
            {changeDirection === "down" && <ArrowDown className="w-3 h-3" />}
            {changeDirection === "neutral" && <Minus className="w-3 h-3" />}
            <span>{change}%</span>
          </div>
        </div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>
      </div>
    </Card>
  );
};