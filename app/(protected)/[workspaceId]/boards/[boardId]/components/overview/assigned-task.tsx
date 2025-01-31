import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AssignedTasksListProps {
  lists: any[];
  selectedUserId: string | null;
}

export const AssignedTasksList = ({ lists, selectedUserId }: AssignedTasksListProps) => {
  const allTasks = lists.flatMap(list => 
    list.cards
      .filter((card: { assignedUserId: string; }) => !selectedUserId || card.assignedUserId === selectedUserId)
      .map((card: any) => ({
        ...card,
        projectName: list.title
      }))
  );

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Assigned Tasks ({allTasks.length})</h2>
        <Button variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>
      <div className="space-y-2">
        {allTasks.slice(0, 5).map((task: any) => (
          <div
            key={task.id}
            className="p-3 hover:bg-accent rounded-lg transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-sm text-muted-foreground">{task.projectName}</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </span>
            </div>
          </div>
        ))}
        {allTasks.length > 5 && (
          <Button variant="ghost" className="w-full mt-2">
            Show All
          </Button>
        )}
      </div>
    </Card>
  );
};