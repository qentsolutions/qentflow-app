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
import { OctagonAlert } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface PriorityProps {
  data: CardWithList;
  readonly?: boolean;
}

const colors: Record<string, { bg: string; text: string }> = {
  low: { bg: "bg-green-100", text: "text-green-500" },
  medium: { bg: "bg-orange-100", text: "text-orange-600" },
  high: { bg: "bg-red-100", text: "text-red-600" },
  critical: { bg: "bg-red-200", text: "text-red-600" },
};

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

    const priority = newPriority === "none" ? null : (newPriority as "low" | "medium" | "high" | "critical");

    execute({
      id: data.id,
      priority,
      boardId,
      workspaceId,
    });
  };

  const priorityOptions = [
    { value: "none", label: "None" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];

  const currentPriority = priorityOptions.find(option => option.value === (data.priority?.toLowerCase() || "none")) || priorityOptions[0];

  return (
    <Card className="shadow-none border bg-card mt-4">
      <CardContent className="p-5">
        <h3 className="text-lg font-semibold mb-2 flex items-center">
          <OctagonAlert className="h-5 w-5 mr-2" />
          Priority
        </h3>

        {readonly ? (
          <div className="flex items-center gap-2 p-2 border rounded-md">
            <Badge className={`${colors[currentPriority.value]?.bg} ${colors[currentPriority.value]?.text}`}>
              {currentPriority.label}
            </Badge>
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
                  <Badge className={`${colors[option.value]?.bg} ${colors[option.value]?.text}`}>
                    {option.label}
                  </Badge>
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
