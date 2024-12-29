"use client"

import * as React from "react"
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Calendar,
  Command,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react"


import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { TeamSwitcher } from "./team-switcher"
import { NavMain } from "./nav-main"
import { NavProjects } from "./nav-projects"
import { NavUser } from "./nav-user"
import { useCurrentUser } from "@/hooks/use-current-user"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import Link from "next/link"

// This is sample data.


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const user = useCurrentUser();
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;

  const data = {

    calendar: [
      {
        name: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard
      },
      {
        name: "Calendar",
        url: `/${workspaceId}/calendar`,
        icon: Calendar
      },
    ],
    navMain: [
      {
        title: "Projects",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Boards",
            url: `/${workspaceId}/boards`,
          },
          {
            title: "Documents",
            url: `/${workspaceId}/documents`,
          }
        ],
      },
    ],

  }
  return (
    <Sidebar collapsible="icon" {...props} className="bg-background">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.calendar} />
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
