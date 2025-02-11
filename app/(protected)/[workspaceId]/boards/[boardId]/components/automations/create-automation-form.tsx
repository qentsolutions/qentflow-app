"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAction } from "@/hooks/use-action"
import { createAutomation } from "@/actions/automations/create-automation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Layout, Loader2, ArrowRight, ChevronLeft, Settings2, Sparkles, Zap } from "lucide-react"
import { AutomationTriggerBuilder } from "./automation-trigger-builder"
import { AutomationActionBuilder } from "./automation-action-builder"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"

interface CreateAutomationFormProps {
  onClose: () => void
  board: any
  template?: any
}

export const CreateAutomationForm = ({ onClose, board, template }: CreateAutomationFormProps) => {
  const [title, setTitle] = useState(template?.name || "")
  const [description, setDescription] = useState(template?.description || "")
  const [triggerType, setTriggerType] = useState(template?.trigger?.type || "")
  const [triggerConditions, setTriggerConditions] = useState(template?.trigger?.conditions || {})
  const [actions, setActions] = useState(template?.actions || [])

  useEffect(() => {
    if (template) {
      setTitle(template.name || "")
      setDescription(template.description || "")
      setTriggerType(template.trigger?.type || "")
      setTriggerConditions(template.trigger?.conditions || {})
      setActions(template.actions || [])
    }
  }, [template])

  const { execute, isLoading } = useAction(createAutomation, {
    onSuccess: () => {
      toast.success("Automation created successfully!")
      onClose()
    },
    onError: (error) => {
      toast.error(error)
    },
  })

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("Automation title is required")
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
      name: title,
      description,
      workspaceId: board.workspaceId,
      boardId: board.id,
      triggerType,
      triggerConditions,
      actions: actions.map((action: any, index: number) => ({
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
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-8 w-full mx-auto p-6 pb-16"
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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

      <div className="fixed bottom-0 left-0 w-full bg-white py-6 z-10 border-t border-gray-200">
        <div className="flex justify-end gap-3 mr-8">
          <Button variant="outline" onClick={onClose} disabled={isLoading} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={onSubmit}
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