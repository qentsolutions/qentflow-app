"use client"

import { Plus, Workflow, CloudLightningIcon as Lightning } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import UsageStats from "./usage"

interface List {
    id: string
    title: string
}

interface AutomationsProps {
    boardId: string
    workspaceId: string
    lists: List[]
}

export const Automations = ({ boardId, workspaceId, lists }: AutomationsProps) => {
    const [open, setOpen] = useState(false)
    const [automationName, setAutomationName] = useState("")
    const [selectedTrigger, setSelectedTrigger] = useState("")
    const [selectedAction, setSelectedAction] = useState("")
    const [description, setDescription] = useState("")

    const handleCreate = () => {
        if (!automationName || !selectedTrigger || !selectedAction) {
            toast.error("Please fill in all required fields")
            return
        }

        // Handle automation creation here
        toast.success("Automation created successfully")
        setOpen(false)
    }

    const renderEmptyState = (type: "automation" | "activity") => (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            {type === "automation" ? (
                <>
                    <div className="rounded-full bg-gray-100 p-8 mb-4">
                        <Lightning className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Let&apos;s create your first automation!</h3>
                    <p className="text-gray-500 max-w-md mb-6">
                        Use automations to streamline your workflows, automate tasks, and integrate other applications to boost your
                        productivity.{" "}
                        <a href="#" className="text-primary underline">
                            Learn more
                        </a>
                    </p>
                </>
            ) : (
                <>
                    <div className="mb-4">
                        <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Capture%20d%E2%80%99e%CC%81cran%202025-02-04%20a%CC%80%2020.52.36-2zcnmKpNeO4TM0U5JqpRQdnj9MqZru.png"
                            alt=""
                            className="w-32 h-32 opacity-50"
                        />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No activity yet</h3>
                    <p className="text-gray-500 max-w-md mb-6">
                        Once you start using automations, your activity log will appear here. Get started and experience it for
                        yourself!
                    </p>
                </>
            )}
            <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-600 text-primary-foreground">
                Add Automation
            </Button>
        </div>
    )

    return (
        <>
            <Button onClick={() => setOpen(true)} size="sm" variant="outline" className="gap-2 mb-1 shadow-none">
                <Workflow className="h-4 w-4" />
                Automations
            </Button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[1250px] h-[90vh] overflow-y-auto px-4 py-1 mt-2">
                    <Tabs defaultValue="manage" className="w-full">
                        <span className="flex items-center pt-2 gap-x-1 font-semibold text-xl"><Workflow size={14} /> Automations</span>
                        <TabsList className="border-b w-full justify-start h-auto p-0 bg-transparent mt-4">
                            <TabsTrigger
                                py="2"
                                value="browse"
                                className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none"
                            >
                                Models
                            </TabsTrigger>
                            <TabsTrigger
                                py="2"
                                value="manage"
                                className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none"
                            >
                                Recipes
                            </TabsTrigger>
                            <TabsTrigger
                                py="2"
                                value="activity"
                                className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none"
                            >
                                Activity
                            </TabsTrigger>
                            <TabsTrigger
                                py="2"
                                value="usage"
                                className="data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 border-b-2 border-transparent rounded-none"
                            >
                                Usage
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="browse" className="pt-6">
                            <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-start">
                                {/* Trigger Section */}
                                <div className="bg-card rounded-lg p-6 border shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-pink-100 rounded-full p-2">
                                            <div className="w-4 h-4 bg-purple-500 rounded-full" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">When</h3>
                                            <p className="text-sm text-muted-foreground">Execute this action</p>
                                        </div>
                                    </div>

                                    <Select value={selectedTrigger} onValueChange={setSelectedTrigger}>
                                        <SelectTrigger className="w-full mb-4">
                                            <SelectValue placeholder="Tasks or subtasks" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="task-created">A task/subtask is created</SelectItem>
                                            <SelectItem value="task-completed">A task/subtask is completed</SelectItem>
                                            <SelectItem value="task-assigned">A task/subtask is assigned</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button variant="outline" size="sm" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add condition
                                    </Button>
                                </div>

                                {/* Arrow */}
                                <div className="flex items-center justify-center pt-20">
                                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                                        <svg
                                            className="w-4 h-4 text-muted-foreground"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Action Section */}
                                <div className="bg-card rounded-lg p-6 border shadow-sm">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="bg-pink-100 rounded-full p-2">
                                            <div className="w-4 h-4 bg-pink-500 rounded-full" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">Then</h3>
                                            <p className="text-sm text-muted-foreground">Execute this action</p>
                                        </div>
                                    </div>

                                    <Select value={selectedAction} onValueChange={setSelectedAction}>
                                        <SelectTrigger className="w-full mb-4">
                                            <SelectValue placeholder="Set a custom field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="custom-field">Set a custom field</SelectItem>
                                            <SelectItem value="send-notification">Send a notification</SelectItem>
                                            <SelectItem value="change-status">Change status</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Button variant="outline" size="sm" className="w-full">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add action
                                    </Button>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Textarea
                                    placeholder="Enter description..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="min-h-[100px]"
                                />
                            </div>
                            <DialogFooter className="mt-6">
                                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-600/90 text-primary-foreground">
                                    Create
                                </Button>
                            </DialogFooter>
                        </TabsContent>
                        <TabsContent value="manage" className="pt-6">
                            <div className="flex items-center gap-4 mb-4">
                                <Button variant="outline" className="rounded-full">
                                    Active <span className="ml-2 bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs">0</span>
                                </Button>
                                <Button variant="outline" className="rounded-full">
                                    Inactive{" "}
                                    <span className="ml-2 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">0</span>
                                </Button>
                            </div>
                            {renderEmptyState("automation")}
                        </TabsContent>
                        <TabsContent value="activity" className="pt-6">
                            {renderEmptyState("activity")}
                        </TabsContent>

                        <TabsContent value="usage" className="pt-6">
                            <UsageStats />
                        </TabsContent>


                    </Tabs>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default Automations

