"use client"

import type React from "react"
import { Columns3, List, Table } from "lucide-react"
export type ViewType = "kanban" | "table" | "list"

interface ViewSwitcherProps {
  onViewChange: (view: ViewType) => void
  selectedView: ViewType
}

export const ViewSwitcher = ({ onViewChange, selectedView }: ViewSwitcherProps) => {
  const views: { label: string; value: ViewType; icon: React.ElementType }[] = [
    { label: "Kanban", value: "kanban", icon: Columns3 },
    { label: "List", value: "list", icon: List },
    { label: "Table", value: "table", icon: Table },
  ]

  return (
    <div className="flex items-center gap-2 pl-4 rounded-lg bg-muted/60 border shadow-sm mt-2">
      <span className="text-sm font-medium text-muted-foreground px-2 mr-2">View</span>
      <div className="flex items-center gap-1 bg-background rounded-md p-1">
        {views.map((view) => {
          const Icon = view.icon
          return (
            <button
              key={view.value}
              onClick={() => onViewChange(view.value)}
              className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${selectedView === view.value
                ? "bg-blue-100 dark:bg-gray-700 dark:text-blue-500 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
                }`}
              aria-current={selectedView === view.value ? "page" : undefined}
            >
              <Icon size={16} />
              {view.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

