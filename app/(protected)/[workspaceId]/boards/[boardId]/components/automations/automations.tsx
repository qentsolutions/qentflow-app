"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Workflow } from "lucide-react";
import { toast } from "sonner";
import UsageStats from "./usage";
import ListAutomations from "./list-automations";
import CreateAutomation from "./create-automation";
import { List } from "@prisma/client";
import { JsonValue } from "aws-sdk/clients/glue";
import { deleteAutomationRule } from "@/actions/automations/delete-automation-rule";


interface Board {
  id: string;
  title: string | null;
  lists: List[];
  automationRules: {
    id: string;
    name: string;
    description: string | null;
    triggers: {
      id: string;
      type: string;
      ruleId: string;
      configuration: JsonValue;
      createdAt: Date;
      updatedAt: Date;
    }[];
    actions: {
      id: string;
      type: string;
      ruleId: string;
      configuration: JsonValue;
      createdAt: Date;
      updatedAt: Date;
    }[];
  }[];
}

interface AutomationsProps {
  board: Board;
}

export const Automations = ({ board }: AutomationsProps) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("manage");

  const handleDelete = async (id: string) => {
    try {
      await deleteAutomationRule(id);
      toast.success("Automation rule deleted successfully");
    } catch (error) {
      toast.error("Failed to delete automation rule");
    }
  };

  const handleUpdate = (id: string) => {
    // Implement update logic
    console.log("Update rule:", id);
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="bg-blue-100 rounded-full p-8 mb-4">
        <Workflow className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Create Your First Automation</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        Streamline your workflow by creating automated actions that trigger based on specific events.
      </p>
      <Button
        onClick={() => setOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Create Automation
      </Button>
    </div>
  );

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="sm"
        variant="outline"
        className="gap-2 mb-1 shadow-none hover:bg-blue-50"
      >
        <Workflow className="h-4 w-4" />
        Automations
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[1250px] h-[92vh] overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center gap-2 mb-4">
              <Workflow className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Automations</h2>
            </div>

            <TabsList className="border-b w-full justify-start h-auto p-0 bg-transparent">
              <TabsTrigger
                value="create"
                className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-4 py-2"
              >
                Create rule
              </TabsTrigger>
              <TabsTrigger
                value="manage"
                className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-4 py-2"
              >
                Manage rules
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-4 py-2"
              >
                Activity
              </TabsTrigger>
              <TabsTrigger
                value="usage"
                className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none px-4 py-2"
              >
                Usage
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manage" className="pt-6">
              {board?.automationRules.length === 0 ? (
                renderEmptyState()
              ) : (
                <ListAutomations
                  rules={board?.automationRules}
                  onDelete={handleDelete}
                  onUpdate={handleUpdate}
                />
              )}
            </TabsContent>

            <TabsContent value="create" className="pt-6">
              <CreateAutomation board={board} onClose={() => setActiveTab("manage")} />
            </TabsContent>

            <TabsContent value="usage" className="pt-6">
              <UsageStats />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Automations;