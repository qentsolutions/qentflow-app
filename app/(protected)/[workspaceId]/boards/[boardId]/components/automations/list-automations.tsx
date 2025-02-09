"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Plus } from "lucide-react"
import type { AutomationRule } from "@/types"

interface AutomationListProps {
    rules: AutomationRule[]
    onDelete: (id: string) => void
    onUpdate: (id: string) => void
}

const AutomationList = ({ rules, onDelete, onUpdate }: AutomationListProps) => {
    const [hoveredRule, setHoveredRule] = useState<string | null>(null)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-end w-full items-center">
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Plus className="mr-2 h-4 w-4" />
                    Add automation
                </Button>
            </div>

            {/* Automation Rules */}
            <div className="space-y-4 overflow-y-auto max-h-[65vh]">
                {rules.map((rule) => (
                    <div
                        key={rule.id}
                        className="p-6 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                        onMouseEnter={() => setHoveredRule(rule.id)}
                        onMouseLeave={() => setHoveredRule(null)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="space-y-4 flex-1">
                                <h3 className="font-medium text-gray-900">
                                    {rule.name}
                                </h3>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <span>When</span>
                                    <Badge>
                                        {rule.triggers.map((trigger, index) => (
                                            <span key={index}>
                                                {index > 0 && " et "}
                                                {trigger.type.replace(/_/g, " ").toLowerCase()}
                                            </span>
                                        ))}
                                    </Badge>
                                    <span>happens, </span>
                                    <Badge>
                                        {rule.actions.map((action, index) => (
                                            <span key={index}>
                                                {index > 0 && " et "}
                                                {action.type.replace(/_/g, " ").toLowerCase()}
                                            </span>
                                        ))}
                                    </Badge>
                                </div>
                            </div>
                            <div
                                className={`flex gap-2 transition-opacity duration-200 ${hoveredRule === rule.id ? "opacity-100" : "opacity-0"}`}
                            >
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onUpdate(rule.id)}
                                    className="hover:bg-blue-50 dark:hover:bg-blue-900 gap-2 text-blue-600 dark:text-blue-400"
                                >
                                    <Edit className="h-4 w-4" />
                                    Edit
                                </Button>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30 gap-2"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to delete this automation? This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    onDelete(rule.id)
                                                    toast.success("Automation deleted successfully")
                                                }}
                                                className="bg-red-600 hover:bg-red-700 text-white"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const Badge = ({ children }: { children: React.ReactNode }) => (
    <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">{children}</span>
)

export default AutomationList
