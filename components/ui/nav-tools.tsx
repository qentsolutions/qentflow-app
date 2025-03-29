"use client";

import { type LucideIcon, ChevronRight, LayoutList } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // Assurez-vous d'importer le composant Separator
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { fetcher } from "@/lib/fetcher";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export function NavTools({
  items,
}: {
  items: {
    name: string;
    url: string;
    icon: LucideIcon;
    disabled?: boolean; // Ajout de l'attribut disabled
  }[];
}) {
  const pathname = usePathname(); // Récupérer l'URL actuelle
  const { currentWorkspace } = useCurrentWorkspace();
  const workspaceId = currentWorkspace?.id;
  const {
    data: boards,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["boards", workspaceId],
    queryFn: () => (workspaceId ? fetcher(`/api/boards?workspaceId=${workspaceId}`) : Promise.resolve([])),
    enabled: !!workspaceId,
  });

  return (
    <SidebarGroup>
      <div className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Tools</SidebarGroupLabel>
      </div>
      <div className="group-data-[collapsible=icon]:block hidden mb-2">
        <Separator />
      </div>
      <SidebarMenu>
        {items.map((item) => {
          // Vérifie si l'URL actuelle correspond exactement à l'URL de l'item
          const isActive = pathname === item.url;

          return (
            <SidebarMenuItem
              key={item.name}
              className={`rounded-sm ${isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-slate-600"
                } ${item.disabled ? "pointer-events-none opacity-50" : ""}`} // Appliquer le style actif et désactiver les boutons
            >
              <SidebarMenuButton asChild>
                <Link href={item.url} className="flex items-center gap-2 ml-2">
                  <item.icon />
                  <span className="ml-2">{item.name}</span>
                  {item.disabled && <span className="ml-auto mr-2 bg-blue-200 text-gray-700 px-2 py-1 rounded-full text-xs">incoming</span>} {/* Ajout du badge incoming */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}

        {/* Section pour les boards */}
        <Collapsible className="group/collapsible">
          <SidebarMenuItem
            className={`group/menu-item rounded-sm ${pathname.includes(`/${workspaceId}/boards`) ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100 text-slate-600"}`}
          >
            <SidebarMenuButton asChild>
              <Link href={`/${workspaceId}/boards`} className="ml-2">
                <LayoutList className="h-4 w-4" />
                <span className="ml-2">Boards</span>
              </Link>
            </SidebarMenuButton>
            <CollapsibleTrigger asChild>
              <SidebarMenuAction>
                <ChevronRight className="mr-2 h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
              </SidebarMenuAction>
            </CollapsibleTrigger>
          </SidebarMenuItem>

          <CollapsibleContent className="group-data-[collapsible=icon]:hidden">
            <div className="ml-2 space-y-2 mt-2">
              {isLoading && (
                <div className="py-3 px-2 flex items-center justify-center">
                  <div className="animate-pulse flex space-x-2">
                    <div className="h-2 w-2 bg-muted-foreground/20 rounded-full"></div>
                    <div className="h-2 w-2 bg-muted-foreground/20 rounded-full"></div>
                    <div className="h-2 w-2 bg-muted-foreground/20 rounded-full"></div>
                  </div>
                </div>
              )}

              {!isLoading && boards && boards.length === 0 && (
                <div className="text-center py-3 px-2 text-xs text-muted-foreground">
                  <p>No boards found</p>
                  <Link
                    href={`/${workspaceId}/boards/new`}
                    className="inline-flex items-center gap-1 mt-2 text-primary hover:underline"
                  >
                    <span>Create a board</span>
                  </Link>
                </div>
              )}

              {!isLoading && boards && boards.length > 0 && (
                <div className="space-y-1">
                  {boards.map((board: any) => (
                    <Link
                      key={board.id}
                      href={`/${workspaceId}/boards/${board.id}`}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md w-full transition-colors",
                        pathname.includes(board.id)
                          ? "bg-blue-100 text-blue-600 font-medium"
                          : "hover:bg-muted text-foreground/80 hover:text-foreground",
                      )}
                    >
                      <LayoutList size={16} className={cn(
                        pathname.includes(board.id) ? "text-blue-600" : "text-primary/60",
                      )} />
                      <span className="truncate">{board.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
