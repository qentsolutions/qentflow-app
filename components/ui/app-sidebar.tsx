"use client"

import * as React from "react"
import {
  Calendar,
  Globe,
  LayoutDashboard,
  MessageCircle,
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
import { NavIntegrations } from "./nav-integrations"



export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {

  const user = useCurrentUser();
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;

  const data = {
    main: [
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
      {
        name: "Conversations",
        url: `/${workspaceId}/conversations`,
        icon: MessageCircle
      },
    ],
    navMain: [
      {
        name: "Projects", // Changez 'title' en 'name'
        url: `/${workspaceId}/projects`,
        icon: SquareTerminal,
        isActive: false, // Cette propriété peut rester, mais elle sera ignorée par NavMain
      },
      {
        name: "Boards", // Changez 'title' en 'name'
        url: `/${workspaceId}/boards`,
        icon: SquareTerminal,
        isActive: false, // Cette propriété peut rester, mais elle sera ignorée par NavMain
      },
    ],
    integrations: [
      {
        title: "Website",
        url: "#",
        icon: Globe,
        isActive: false,
        items: [
          {
            title: "Calendar",
            url: `/${workspaceId}/calendar`,
          },
          {
            title: "CRM",
            url: `/${workspaceId}/documents`,
          }
        ],
      },
    ]
  }
  return (
    <Sidebar collapsible="icon" {...props} className="bg-background">
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavProjects projects={data.main} />
        <NavMain items={data.navMain} />
        <NavIntegrations items={data.integrations} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
