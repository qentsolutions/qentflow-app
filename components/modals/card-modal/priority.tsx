import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAction } from "@/hooks/use-action";
import { updatePriority } from "@/actions/tasks/update-priority";
import { CardWithList } from "@/types";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { AlertTriangle, ArrowDown, ArrowRight, ArrowUp, OctagonAlert, Radio, SignalHigh, SignalLow, SignalMedium, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface PriorityProps {
  data: CardWithList;
}

export const Priority = ({ data }: PriorityProps) => {
  const params = useParams();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useCurrentWorkspace();

  const { execute } = useAction(updatePriority, {
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({
        queryKey: ["card", updatedData.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["card-logs", updatedData.id],
      });
      toast.success(`Card priority updated`);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onPriorityChange = (newPriority: string) => {
    const boardId = params.boardId as string;
    const workspaceId = currentWorkspace?.id;

    if (!workspaceId) {
      toast.error("Workspace ID is required.");
      return;
    }

    execute({
      id: data.id,
      priority: newPriority === "none" ? null : (newPriority as "low" | "medium" | "high" | "critical"),
      boardId,
      workspaceId,
    });
  };

  const priorityOptions = [
    { value: "none", label: "None", icon: Minus, color: "text-gray-500" },
    { value: "low", label: "Low", icon: SignalLow, color: "text-green-500" },
    { value: "medium", label: "Medium", icon: SignalMedium, color: "text-yellow-500" },
    { value: "high", label: "High", icon: SignalHigh, color: "text-orange-500" },
    { value: "critical", label: "Critical", icon: AlertTriangle, color: "text-red-500" }
  ];

  return (
    <Card className="mt-4 shadow-none">
      <CardHeader className="pt-4 pb-2">
        <div className="flex items-center gap-x-2">
          <OctagonAlert size={16} />
          <CardTitle className="font-semibold text-lg">Priority</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Select defaultValue={data.priority?.toLowerCase() || "none"} onValueChange={onPriorityChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            {priorityOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className={`h-6 w-6 ${option.color}`} />
                  {option.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

Priority.Skeleton = function PrioritySkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-24" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  );
};