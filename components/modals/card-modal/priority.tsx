"use client";

import { toast } from "sonner";
import { useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useAction } from "@/hooks/use-action";
import { updatePriority } from "@/actions/tasks/update-priority";
import { CardWithList } from "@/types";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Flag, Minus, OctagonAlert } from 'lucide-react';

interface PriorityProps {
  data: CardWithList;
  readonly?: boolean;
}

export const Priority = ({
  data,
  readonly = false,
}: PriorityProps) => {
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
    { value: "low", label: "Low", icon: Flag, color: "text-green-500" },
    { value: "medium", label: "Medium", icon: Flag, color: "text-yellow-500" },
    { value: "high", label: "High", icon: Flag, color: "text-red-500" },
    { value: "critical", label: "Critical", icon: AlertTriangle, color: "text-red-500" }
  ];

  const currentPriority = priorityOptions.find(option => option.value === data.priority?.toLowerCase()) || priorityOptions[0];
  const PriorityIcon = currentPriority.icon;

  return (
    <Card className="shadow-none border bg-card mt-4">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <OctagonAlert className="h-5 w-5 mr-2" />
          Priority
        </h3>

        {readonly ? (
          <div className="flex items-center gap-2 p-2 border rounded-md bg-background">
            <PriorityIcon className={`h-5 w-5 ${currentPriority.color}`} />
            <span className="font-medium">{currentPriority.label}</span>
          </div>
        ) : (
          <Select
            defaultValue={data.priority?.toLowerCase() || "none"}
            onValueChange={onPriorityChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              {priorityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    <option.icon className={`h-4 w-4 ${option.color}`} />
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
};

Priority.Skeleton = function PrioritySkeleton() {
  return (
    <Card className="shadow-none border">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-x-2">
          <Skeleton className="h-5 w-5 rounded bg-neutral-200 dark:bg-gray-700" />
          <Skeleton className="h-6 w-24 bg-neutral-200 dark:bg-gray-700" />
        </div>
        <Skeleton className="w-full h-10 bg-neutral-200 dark:bg-gray-700" />
      </CardContent>
    </Card>
  );
};
