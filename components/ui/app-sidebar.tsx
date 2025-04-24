"use client";

import * as React from "react";
import {
  CalendarDays,
  CircuitBoard,
  FileText,
  Folder,
  LayoutDashboard,
  LayoutList,
  LibraryBig,
  ListTodo,
  MessageCircle,
  Presentation,
  SquareKanban,
  StickyNote,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavTools } from "./nav-tools";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useCurrentUser();
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;

  const { data: taskCount, isLoading } = useQuery({
    queryKey: ["assigned-cards", currentWorkspace?.id],
    queryFn: () => fetcher(`/api/cards/current-user-card-nb?workspaceId=${currentWorkspace?.id}`),
    enabled: !!currentWorkspace?.id,
  });

  const data = {
    main: [
      {
        name: "Home",
        url: `/${workspaceId}/home`,
        icon: LayoutDashboard,
      },
      {
        name: "Calendar",
        url: `/${workspaceId}/calendar`,
        icon: CalendarDays,
      },
      {
        name: "Notes",
        url: `/${workspaceId}/notes`,
        icon: StickyNote,
        count: taskCount,
      },
      {
        name: "My Tasks",
        url: `/${workspaceId}/my-tasks`,
        icon: ListTodo,
        count: taskCount,
      },
    ],
    navTools: [],
  };

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="bg-background flex flex-col h-screen" // Utiliser Flexbox pour un layout en colonne
    >
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      {/* Vérification de l'existence de `currentWorkspace` */}
      {currentWorkspace ? (
        <SidebarContent className="flex-1">
          {/* `flex-1` permet d'occuper l'espace vertical restant */}
          <NavMain projects={data.main} />
          <NavTools items={data.navTools} />
        </SidebarContent>
      ) : null}
      <SidebarFooter className="mt-auto"> {/* `mt-auto` pousse le footer vers le bas */}
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
