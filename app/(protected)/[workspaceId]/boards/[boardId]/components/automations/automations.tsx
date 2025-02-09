"use client";

import { Plus, Workflow, ChevronDown, CloudLightningIcon as LightningBoltIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import UsageStats from "./usage";
import { useAutomation } from "@/hooks/use-automation";
import { CreateAutomationDialog } from "./create-automation-dialog";
import { Board } from "@prisma/client";

interface AutomationsProps {
  board: Board & {
    lists: any[];
    User: any[];
  };
}

// Catégories d'automatisation
const AUTOMATION_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "cards", label: "Cards" },
  { id: "tasks", label: "Tasks" },
  { id: "notifications", label: "Notifications" },
  { id: "calendar", label: "Calendar" },
  { id: "users", label: "Users" },
];

// Templates d'automatisation par catégorie
const AUTOMATION_TEMPLATES = {
  cards: [
    {
      id: "auto-assign",
      name: "Auto Assign Cards",
      description: "Automatically assign cards to team members based on list",
      category: "cards",
    },
    {
      id: "due-date-reminder",
      name: "Due Date Reminder",
      description: "Send notifications when cards are approaching due date",
      category: "cards",
    },
  ],
  tasks: [
    {
      id: "task-complete-notification",
      name: "Task Complete Notification",
      description: "Send notification when all tasks in a card are completed",
      category: "tasks",
    },
  ],
  notifications: [
    {
      id: "mention-notification",
      name: "Mention Notifications",
      description: "Send notifications when users are mentioned in comments",
      category: "notifications",
    },
  ],
  calendar: [
    {
      id: "auto-schedule",
      name: "Auto Schedule Events",
      description: "Create calendar events from card due dates",
      category: "calendar",
    },
  ],
  users: [
    {
      id: "workload-balance",
      name: "Workload Balance",
      description: "Automatically balance work across team members",
      category: "users",
    },
  ],
};

export const Automations = ({ board }: AutomationsProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { automations, isLoading } = useAutomation({ workspaceId: board.workspaceId, boardId: board.id });

  const filteredTemplates = selectedCategory === "all"
    ? Object.values(AUTOMATION_TEMPLATES).flat()
    : AUTOMATION_TEMPLATES[selectedCategory as keyof typeof AUTOMATION_TEMPLATES] || [];

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="rounded-full bg-gray-100 p-8 mb-4">
        <LightningBoltIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Let's create your first automation!</h3>
      <p className="text-gray-500 max-w-md mb-6">
        Use automations to streamline your workflows, automate tasks, and boost your productivity.
        <a href="#" className="text-primary underline ml-1">Learn more</a>
      </p>
      <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        Create Automation
      </Button>
    </div>
  );

  return (
    <>
      <Button onClick={() => setIsCreateDialogOpen(true)} size="sm" variant="outline" className="gap-2 mb-1 shadow-none">
        <Workflow className="h-4 w-4" />
        Automations
      </Button>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[1250px] h-[90vh] overflow-y-auto px-4 py-4">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className="w-64 border-r pr-4">
              <div className="mb-6">
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Rule
                </Button>
              </div>

              <h3 className="font-medium mb-2">Categories</h3>
              <div className="space-y-1">
                {AUTOMATION_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 pl-6">
              <Tabs defaultValue="models">
                <TabsList>
                  <TabsTrigger value="models">Models</TabsTrigger>
                  <TabsTrigger value="recipes">Recipes</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                </TabsList>

                <TabsContent value="models" className="mt-6">
                  <div className="grid grid-cols-2 gap-4">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-all duration-200"
                      >
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="recipes">
                  {automations?.length === 0 ? renderEmptyState() : (
                    <div className="space-y-4">
                      {automations?.map((automation: any) => (
                        <div
                          key={automation.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{automation.name}</h4>
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{automation.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity">
                  {renderEmptyState()}
                </TabsContent>

                <TabsContent value="usage">
                  <UsageStats />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CreateAutomationDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        board={board}
      />
    </>
  );
};

export default Automations;