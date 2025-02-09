"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAction } from "@/hooks/use-action"
import { createAutomation } from "@/actions/automations/create-automation"
import { toast } from "sonner"
import { AutomationTriggerBuilder } from "./automation-trigger-builder"
import { AutomationActionBuilder } from "./automation-action-builder"
import type { Board } from "@prisma/client"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { motion } from "framer-motion"
import { ArrowRight, ChevronLeft, Settings2, Sparkles, Zap } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CreateAutomationFormProps {
    onClose: () => void
    board: Board & {
        lists: any[]
        User: any[]
    }
}

export const CreateAutomationForm = ({ onClose, board }: CreateAutomationFormProps) => {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [triggerType, setTriggerType] = useState<string>("")
    const [triggerConditions, setTriggerConditions] = useState<Record<string, any>>({})
    const [actions, setActions] = useState<any[]>([])
    const { currentWorkspace } = useCurrentWorkspace()

    const { execute, isLoading } = useAction(createAutomation, {
        onSuccess: () => {
            toast.success("Automation created successfully")
            onClose()
            resetForm()
        },
        onError: (error) => {
            toast.error(error)
        },
    })

    const resetForm = () => {
        setName("")
        setDescription("")
        setTriggerType("")
        setTriggerConditions({})
        setActions([])
    }

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Name is required")
            return
        }

        if (!triggerType) {
            toast.error("Trigger type is required")
            return
        }

        if (actions.length === 0) {
            toast.error("At least one action is required")
            return
        }

        execute({
            name,
            description,
            workspaceId: currentWorkspace?.id || board?.workspaceId,
            boardId: board.id,
            triggerType: triggerType as any,
            triggerConditions,
            actions: actions.map((action, index) => ({
                ...action,
                order: index,
            })),
        })
    }
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-8 w-full mx-auto p-6 pb-16" // Ajout de padding-bottom pour faire de la place pour le footer
        >
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,auto,1fr] gap-6 items-start">
                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-medium">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                <Sparkles className="h-4 w-4 text-primary" />
                            </div>
                            When this happens...
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AutomationTriggerBuilder
                            triggerType={triggerType}
                            onTriggerTypeChange={setTriggerType}
                            conditions={triggerConditions}
                            onConditionsChange={setTriggerConditions}
                            board={board}
                        />
                    </CardContent>
                </Card>

                <div className="hidden lg:flex flex-col items-center justify-center mt-20">
                    <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                        <ArrowRight className="h-8 w-8 text-background" />
                    </div>
                </div>

                <Card className="h-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg font-medium">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                                <Zap className="h-4 w-4 text-primary" />
                            </div>
                            Do this...
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AutomationActionBuilder actions={actions} onActionsChange={setActions} board={board} />
                    </CardContent>
                </Card>
            </div>

            <Card className="mb-4">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-medium">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                            <Settings2 className="h-4 w-4 text-primary" />
                        </div>
                        Automation Details
                    </CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter automation name"
                            className="w-full"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm font-medium">Description (Optional)</label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what this automation does"
                            className="w-full min-h-[100px]"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Le Footer qui reste en bas */}
            <div className="fixed bottom-0 left-0 w-full bg-white py-6 z-10 border-t border-gray-200">
                <div className="flex justify-end gap-3 mr-8">
                    <Button variant="outline" onClick={onClose} disabled={isLoading} className="px-6">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="px-6 bg-blue-600 text-white hover:bg-blue-500"
                    >
                        Create Automation
                    </Button>
                </div>
            </div>
        </motion.div>
    )
}

