import { Card } from "@/components/ui/card";
import { useState } from "react";

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

  return (
    <Card className=" pb-4 h-[63vh] overflow-y-auto relative">
      <div className="sticky top-0  px-4 pt-4 pb-1 z-10 bg-white border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Assigned Tasks ({filteredTasks.length})</h2>
          <input
            type="text"
            placeholder="Search by title..."
            className="p-2 border rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="space-y-2">
        {filteredTasks.map((task: any) => (
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
      </div>
    </Card>
  );
};
