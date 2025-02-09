"use client"

import { Plus, Workflow, CloudLightningIcon as LightningBoltIcon, Search, PlusCircle } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useAutomation } from "@/hooks/use-automation"
import { motion, AnimatePresence } from "framer-motion"
import { AUTOMATION_CATEGORIES, AUTOMATION_TEMPLATES } from "@/constants/automation-templates"
import { CreateAutomationForm } from "./create-automation-form"

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
  const { automations, isLoading } = useAutomation({
    workspaceId: board.workspaceId,
    boardId: board.id,
  })

  const filteredTemplates =
    selectedCategory === "all"
      ? Object.values(AUTOMATION_TEMPLATES).flat()
      : AUTOMATION_TEMPLATES[selectedCategory as keyof typeof AUTOMATION_TEMPLATES] || []

  const searchedTemplates = filteredTemplates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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
      <h3 className="text-2xl font-semibold mb-2">Let's create your first automation!</h3>
      <p className="text-gray-500 max-w-md mb-6">
        Use automations to streamline your workflows, automate tasks, and boost your productivity.
        <a href="#" className="text-blue-500 hover:text-blue-600 underline ml-1">
          Learn more
        </a>
      </p>
      <Button onClick={() => setIsCreating(true)} className="bg-blue-500 hover:bg-blue-600 text-white">
        <Plus className="h-4 w-4 mr-2" />
        Add automation
      </Button>
    </motion.div>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Workflow className="h-4 w-4" />
          Automations
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[1250px] h-[90vh] overflow-hidden">
        <div className=" h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Workflow className="h-6 w-6 text-blue-500" />
              <p className="text-2xl font-semibold">Automations</p>
            </div>
          </div>
          {isCreating ? (
            <div className="w-full flex px-12  justify-center h-[72vh] overflow-y-auto">
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
                    <PlusCircle /> New Automation
                  </Button>
                </div>
              </div>


              <div className="flex-grow overflow-auto mt-4">
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
                            className="p-6 bg-white border rounded-xl hover:border-blue-200 hover:shadow-md transition-all duration-200 cursor-pointer"
                          >
                            <h4 className="font-medium text-lg mb-2">{template.name}</h4>
                            <p className="text-gray-500">{template.description}</p>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </TabsContent>

                <TabsContent value="automations" className="h-full">
                  {automations?.length === 0 ? (
                    renderEmptyState()
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {automations?.map((automation: any) => (
                        <motion.div
                          key={automation.id}
                          whileHover={{ scale: 1.01 }}
                          className="p-6 bg-white border rounded-xl hover:border-blue-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-lg">{automation.name}</h4>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                          <p className="text-gray-500 mt-2">{automation.description}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </TabsContent>

                <TabsContent value="activity" className="h-full">
                  {renderEmptyState()}
                </TabsContent>

                <TabsContent value="usage" className="h-full">
                  <div className="p-6 text-center text-gray-500">Usage statistics will appear here</div>
                </TabsContent>
              </div>



            </Tabs>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default Automations

