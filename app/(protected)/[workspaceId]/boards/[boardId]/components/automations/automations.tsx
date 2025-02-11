"use client"

import { Plus, Workflow, CloudLightningIcon as LightningBoltIcon, Search, PlusCircle, ZapIcon, Trash, Users } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAutomation } from "@/hooks/use-automation"
import { motion, AnimatePresence } from "framer-motion"
import { AUTOMATION_CATEGORIES, AUTOMATION_TEMPLATES } from "@/constants/automation-templates"
import { CreateAutomationForm } from "./create-automation-form"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { AutomationUsage } from "./automation-usage"
import { AutomationActivity } from "./automation-activity"
import { useParams } from "next/navigation"
import { fetcher } from "@/lib/fetcher"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface Board {
  id: string
  workspaceId: string
  title: string
  createdById: string
  image: string | null
  createdAt: Date
  updatedAt: Date
  lists: any[]
  User: any[]
}

interface AutomationsProps {
  board: Board
}

export const Automations = ({ board }: AutomationsProps) => {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedTab, setSelectedTab] = useState("automations")
  const [isCreating, setIsCreating] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all")
  const queryClient = useQueryClient()
  const params = useParams();
  const [filterCreator, setFilterCreator] = useState<string | null>(null);




  const { automations, isLoading, updateAutomation, deleteAutomation } = useAutomation({
    workspaceId: board.workspaceId,
    boardId: board.id,
  })

  const { data: availableTags } = useQuery({
    queryKey: ["available-tags", board.id],
    queryFn: () => fetcher(`/api/boards/tags?boardId=${board.id}`),
  });

  const { data: usersInBoard } = useQuery({
    queryKey: ["usersInBoard", board.id],
    queryFn: () => fetcher(`/api/boards/assigned-user?boardId=${board.id}`),
  });

  // Get lists from the board prop
  const lists = board.lists;
  const users = board.User;

  const filteredTemplates =
    selectedCategory === "all"
      ? Object.values(AUTOMATION_TEMPLATES).flat()
      : AUTOMATION_TEMPLATES[selectedCategory as keyof typeof AUTOMATION_TEMPLATES] || []

  const searchedTemplates = filteredTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredAutomations = automations?.filter((automation: any) => {
    if (filterStatus === "active") return automation.active;
    if (filterStatus === "inactive") return !automation.active;
    if (filterCreator) return automation.createdById === filterCreator;
    return true;
  });

  const handleToggleAutomation = async (automationId: string, currentStatus: boolean) => {
    try {
      console.log('Toggling automation:', automationId, 'Current status:', currentStatus);
      await updateAutomation({
        id: automationId,
        data: { active: !currentStatus }
      });
      queryClient.invalidateQueries({
        queryKey: ["automations", params.workspaceId, params.boardId],
      });
      toast.success(`Automation ${currentStatus ? 'disabled' : 'enabled'} successfully`);
    } catch (error) {
      console.error('Failed to update automation status:', error);
      toast.error("Failed to update automation status");
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    try {
      await deleteAutomation(automationId)
      toast.success("Automation deleted successfully")
    } catch (error) {
      toast.error("Failed to delete automation")
    }
  }

  const getActionDescription = (actions: any[]) => {
    if (!actions.length) return "";

    const action = actions[0];
    switch (action.type) {
      case "UPDATE_CARD_STATUS":
        const listName = lists.find(l => l.id === action.config.listId)?.title;
        return `move card to "${listName}"`;
      case "ASSIGN_USER":
        const userName = users.find(u => u.id === action.config.userId)?.name;
        return `assign to ${userName}`;
      case "SEND_NOTIFICATION":
        return `send notification "${action.config.message}"`;
      case "CREATE_TASKS":
        return `create ${action?.config?.tasks.length} tasks`;
      case "ADD_TAG":
        const tag = availableTags?.find((t: { id: any }) => t.id === action.config.tagId);
        return `add tag "${tag?.name}"`;
      case "CREATE_CALENDAR_EVENT":
        return `create calendar event "${action.config.title}"`;
      case "UPDATE_CARD_PRIORITY":
        return `set priority to "${action.config.priority.toLowerCase()}"`;
      case "SEND_EMAIL":
        const emailUser = users.find(u => u.id === action.config.userId)?.name;
        return `send email to ${emailUser}`;
      default:
        return action.type.toLowerCase().replace(/_/g, ' ');
    }
  };

  const getTriggerDescription = (trigger: any) => {
    let desc = "";
    switch (trigger.type) {
      case "CARD_CREATED":
        desc = "a card is created";
        break;
      case "CARD_MOVED":
        const sourceList = lists.find(l => l.id === trigger.conditions?.sourceListId)?.title;
        const destList = lists.find(l => l.id === trigger.conditions?.destinationListId)?.title;
        desc = sourceList && destList
          ? `a card is moved from "${sourceList}" to "${destList}"`
          : "a card is moved";
        break;
      case "CARD_UPDATED":
        desc = "a card is updated";
        break;
      case "TASK_COMPLETED":
        desc = "a task is completed";
        break;
      case "DUE_DATE_APPROACHING":
        const days = trigger.conditions?.daysBeforeDue || 1;
        desc = `due date is ${days} day${days > 1 ? 's' : ''} away`;
        break;
      default:
        desc = trigger.type.toLowerCase().replace(/_/g, ' ');
    }
    return desc;
  };

  const renderEmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="rounded-full bg-blue-50 p-8 mb-4">
        <LightningBoltIcon className="w-12 h-12 text-blue-500" />
      </div>
      <h3 className="text-2xl font-semibold mb-2">Let&apos;s create your first automation!</h3>
      <p className="text-gray-500 max-w-md mb-6">
        Use automations to streamline your workflows, automate tasks, and boost your productivity.
        <a href="#" className="text-blue-500 hover:text-blue-600 underline ml-1">
          Learn more
        </a>
      </p>
    </motion.div>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ZapIcon className="h-4 w-4" />
          Automations
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[1250px] overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <ZapIcon className="h-6 w-6 text-blue-500" />
              <p className="text-2xl font-semibold">Automations</p>
            </div>
          </div>
          {isCreating ? (
            <div className="w-full flex px-12 justify-center h-[72vh] overflow-y-auto">
              <CreateAutomationForm board={board} onClose={() => setIsCreating(false)} />
            </div>
          ) : (
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="flex-grow flex flex-col">
              <div className="flex justify-between items-center">
                <TabsList className="p-1">
                  <TabsTrigger value="templates">Templates</TabsTrigger>
                  <TabsTrigger value="automations">Automations</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                  <TabsTrigger value="usage">Usage</TabsTrigger>
                </TabsList>
                <div>
                  <Button onClick={() => setIsCreating(true)} className="bg-blue-500 hover:bg-blue-600 text-white text-xs">
                    <PlusCircle className="h-4 w-4" /> New Automation
                  </Button>
                </div>
              </div>

              <div className="flex-grow mt-4">
                <TabsContent value="templates" className="h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              placeholder="Search automations..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 w-64"
                            />
                          </div>
                        </div>
                        {AUTOMATION_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap ${selectedCategory === category.id
                              ? "bg-blue-50 text-blue-600 font-medium"
                              : "text-gray-600 hover:bg-gray-50"
                              }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      <AnimatePresence>
                        {searchedTemplates.map((template) => (
                          <motion.div
                            key={template.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileHover={{ scale: 1.02 }}
                            className="px py-4 bg-white border rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <h4 className="font-medium text-lg mb-2">{template.name}</h4>
                            <p className="text-gray-500 text-sm">{template.description}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="automations">
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    {automations?.length === 0 ? (
                      renderEmptyState()
                    ) : (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-center mb-6 ml-4">
                          <div className="flex gap-2">
                            <Button
                              variant={filterStatus === "all" ? "default" : "outline"}
                              onClick={() => setFilterStatus("all")}
                              size="sm"
                            >
                              All
                            </Button>
                            <Button
                              variant={filterStatus === "active" ? "default" : "outline"}
                              onClick={() => setFilterStatus("active")}
                              size="sm"
                            >
                              Active
                            </Button>
                            <Button
                              variant={filterStatus === "inactive" ? "default" : "outline"}
                              onClick={() => setFilterStatus("inactive")}
                              size="sm"
                            >
                              Inactive
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size={"sm"} variant={"outline"} className="ml-6">
                                  Filter by <Users size={8} />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="w-48">
                                {usersInBoard?.map((user: any) => (
                                  <DropdownMenuItem
                                    key={user.id}
                                    onClick={() => setFilterCreator(user.id)}
                                  >
                                    {user.name}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>


                        {filteredAutomations?.map((automation: any) => (
                          <motion.div
                            key={automation.id}
                            className="p-6 bg-white border rounded-xl m-4 hover:border-blue-400 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-lg mb-2">{automation.name}</p>
                                <p className="text-sm text-gray-600 mb-4">
                                  <p className="text-xl">When
                                    <span className="ml-1 text-blue-700">
                                      {getTriggerDescription(automation.trigger)}
                                    </span>
                                    ,
                                    then
                                    <span className="ml-1 text-blue-700">
                                      {getActionDescription(automation.actions)}
                                    </span>
                                  </p>
                                </p>
                                <p className="text-sm text-gray-600">{automation.description}</p>
                              </div>
                              <div className="flex flex-col items-end justify-end gap-4">
                                <div className="flex items-center gap-x-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteAutomation(automation.id)}
                                  >
                                    <Trash size={14} />
                                  </Button>
                                  <Switch
                                    checked={automation.active}
                                    onCheckedChange={() => handleToggleAutomation(automation.id, automation.active)}
                                  />
                                </div>

                                <div className="flex items-center gap-x-1 text-xs">
                                  <span className="text-gray-500">Created by :</span>
                                  <Avatar className="h-6 w-6 flex items-center justify-center">
                                    {automation.createdBy.image?.image ? (
                                      <AvatarImage src={automation.createdBy?.image} alt={automation.createdBy.name || "User"} className="w-full h-full object-cover" />
                                    ) : (
                                      <AvatarFallback className="text-xs font-medium text-gray-500 bg-gray-200 rounded-full">
                                        {automation.createdBy.name?.charAt(0).toUpperCase() || "U"}
                                      </AvatarFallback>
                                    )}
                                  </Avatar>
                                  {automation.createdBy.name}
                                </div>

                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="activity" className="h-full">
                  <AutomationActivity boardId={board.id} workspaceId={board.workspaceId} />
                </TabsContent>

                <TabsContent value="usage" className="h-full">
                  <AutomationUsage boardId={board.id} workspaceId={board.workspaceId} />
                </TabsContent>
              </div>
            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Automations;
