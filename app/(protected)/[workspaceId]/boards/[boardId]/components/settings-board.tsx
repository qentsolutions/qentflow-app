"use client";

import { Settings2, Tag, Users } from "lucide-react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { GeneralSettings } from "./general-settings";
import { TagManager } from "./tag-manager";
import { BoardMembers } from "./board-member";

interface BoardSettingsProps {
  boardId: string;
  boardTitle: string;
  users: any[];
  createdById: string;
}

const Settings = ({ boardId, boardTitle, users, createdById }: BoardSettingsProps) => {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    {
      id: "general",
      label: "General",
      icon: Settings2,
      component: <GeneralSettings boardId={boardId} boardTitle={boardTitle} createdById={createdById} />,
    },
    {
      id: "members",
      label: "Members",
      icon: Users,
      component: <BoardMembers boardId={boardId} users={users} createdById={createdById} />,
    },
    {
      id: "tags",
      label: "Tags",
      icon: Tag,
      component: <TagManager boardId={boardId} />,
    },
  ];

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-md transition-colors ${activeTab === tab.id
                      ? "bg-blue-50 dark:bg-gray-700 dark:text-blue-500 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-300"
                    }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="col-span-9">
            <Card className="shadow-sm">
              <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black px-6 py-5 rounded-t-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {tabs.find((tab) => tab.id === activeTab)?.label} Settings
                </h3>
              </div>
              {tabs.find((tab) => tab.id === activeTab)?.component}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;