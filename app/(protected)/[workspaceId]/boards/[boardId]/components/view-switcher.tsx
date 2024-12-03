"use client";

import { ListTodo, Columns3, Table2 } from "lucide-react"; // Importation des icônes

export type ViewType = "kanban" | "table" | "list";

interface ViewSwitcherProps {
  onViewChange: (view: ViewType) => void;
  selectedView: ViewType;
}

export const ViewSwitcher = ({ onViewChange, selectedView }: ViewSwitcherProps) => {
  const views: { label: string; value: ViewType; icon: React.ElementType }[] = [
    { label: "Kanban", value: "kanban", icon: Columns3 },
    { label: "Table", value: "table", icon: Table2 },
    { label: "List", value: "list", icon: ListTodo },
  ];

  return (
    <div className="flex items-center gap-2 p-1 rounded-lg">
      {views.map((view) => {
        const Icon = view.icon; // Assignation dynamique de l'icône
        return (
          <button
            key={view.value}
            onClick={() => onViewChange(view.value)}
            className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedView === view.value
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon size={16} className={`${selectedView === view.value ? "text-blue-700" : "text-gray-600"}`} />
            {view.label}
          </button>
        );
      })}
    </div>
  );
};
