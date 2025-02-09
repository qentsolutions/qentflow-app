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
import { ChevronLeft, Sparkles } from "lucide-react"
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
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-6">
        <Button variant="ghost" size="sm" onClick={onClose} className="gap-2">
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        <h3 className="text-2xl font-semibold">Create New Automation</h3>
        <div className="w-[72px]" /> {/* Spacer for centering */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            Automation Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter automation name"
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-1">Description (Optional)</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this automation does"
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>When this happens...</CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>Do this...</CardTitle>
        </CardHeader>
        <CardContent>
          <AutomationActionBuilder actions={actions} onActionsChange={setActions} board={board} />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white">
          Create Automation
        </Button>
      </div>
    </motion.div>
  )
}

