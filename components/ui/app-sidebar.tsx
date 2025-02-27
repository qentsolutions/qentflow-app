"use client";

import * as React from "react";
import {
  CalendarDays,
  CircuitBoard,
  FileText,
  LayoutDashboard,
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
import { NavMain } from "./nav-main";
import { NavProjects } from "./nav-projects";
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
    navMain: [
      {
        name: "Boards",
        url: `/${workspaceId}/boards`,
        icon: SquareKanban,
        isActive: false,
      },
      {
        name: "Documents",
        url: `/${workspaceId}/documents`,
        icon: FileText,
        isActive: false,
      },
      {
        name: "Whiteboards",
        url: `/${workspaceId}/documents`,
        icon: Presentation,
        isActive: false,
        disabled: true, // Ajout de l'attribut disabled
      },
      {
        name: "Courses",
        url: `/${workspaceId}/documents`,
        icon: LibraryBig,
        isActive: false,
        disabled: true, // Ajout de l'attribut disabled
      },
    ],
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
          <NavProjects projects={data.main} />
          <NavMain items={data.navMain} />
        </SidebarContent>
      ) : null}
      <SidebarFooter className="mt-auto"> {/* `mt-auto` pousse le footer vers le bas */}
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
