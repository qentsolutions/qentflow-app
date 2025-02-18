import { Card } from "@/components/ui/card";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface AssignedTasksListProps {
  lists: any[];
  selectedUserId: string | null;
}

export const AssignedTasksList = ({ lists, selectedUserId }: AssignedTasksListProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const allTasks = lists.flatMap(list =>
    list.cards
      .filter((card: { assignedUserId: string; }) => !selectedUserId || card.assignedUserId === selectedUserId)
      .map((card: any) => ({
        ...card,
        projectName: list.title
      }))
  );

  const filteredTasks = allTasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400';
      case 'HIGH': return 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400';
      case 'LOW': return 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-950/30 dark:text-gray-400';
    }
  };

  return (
    <Card className="overflow-hidden border border-border/50 backdrop-blur-sm">
      <div className="sticky top-0 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/75 border-b border-border/50 px-6 py-4 z-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">Assigned Tasks ({filteredTasks.length})</h2>
          <Input
            type="text"
            placeholder="Search tasks..."
            className="max-w-xs"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="p-6 space-y-4 max-h-[600px] overflow-y-auto">
        {filteredTasks.map((task: any) => (
          <div
            key={task.id}
            className="p-4 rounded-lg border border-border/50 bg-card hover:shadow-md transition-all duration-200"
          >
            <div className="flex justify-between items-start gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                  <h3 className="font-medium">{task.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{task.projectName}</p>
              </div>
              <div className="text-sm text-muted-foreground">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};