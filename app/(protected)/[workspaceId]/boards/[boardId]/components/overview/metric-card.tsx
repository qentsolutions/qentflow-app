import { Card } from "@/components/ui/card";
import { ArrowDown, ArrowUp, InfoIcon, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress"; // Assurez-vous que ce composant existe
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"; // Importez les composants Tooltip

interface MetricCardProps {
  title: string;
  value: number | string;
  variant?: "default" | "success" | "warning" | "danger";
  progress?: number; // Ajout de la progress bar
  helperText?: string; // Texte facultatif sous la barre
  tooltipText?: string; // Texte du tooltip
}

export const MetricCard = ({
  title,
  value,
  variant = "default",
  progress,
  helperText,
  tooltipText
}: MetricCardProps) => {
  return (
    <Card className={cn(
      "p-6 transition-all duration-300",
      "bg-gradient-to-br from-background to-muted/50",
      "border border-border/50 backdrop-blur-sm",
      variant === "success" && "from-green-50 dark:from-green-950/30",
      variant === "warning" && "from-yellow-50 dark:from-yellow-950/30",
      variant === "danger" && "from-red-50 dark:from-red-950/30"
    )}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <p className="text-sm text-muted-foreground font-medium">{title}</p>
            {tooltipText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="ml-1" asChild>
                    <InfoIcon size={12} className="text-gray-500 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{tooltipText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <p className="text-3xl font-semibold tracking-tight">{value}</p>

        {typeof progress === "number" && (
          <>
            <Progress value={progress} className="mt-2" />
            {helperText && (
              <p className="text-xs text-muted-foreground mt-2">{helperText}</p>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
