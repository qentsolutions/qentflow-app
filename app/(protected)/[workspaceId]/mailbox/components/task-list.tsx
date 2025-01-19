import { Circle } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"

interface Task {
  id: string
  title: string
  date: string
}

interface TaskListProps {
  tasks: Task[]
  onTaskSelect: (taskId: string) => void
}

export function TaskList({ tasks, onTaskSelect }: TaskListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <div className="px-4 py-2">
        <div className="mb-4">
          <h2 className="text-sm font-medium">7 derniers jours</h2>
        </div>
        <div className="space-y-1">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => onTaskSelect(task.id)}
              className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-accent text-left"
            >
              <Circle className="h-4 w-4 text-muted-foreground" />
              <span className="flex-1">{task.title}</span>
              <span className="text-sm text-muted-foreground">{task.date}</span>
            </button>
          ))}
        </div>
      </div>
    </ScrollArea>
  )
}

