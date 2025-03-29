"use client";

import { type LucideIcon, ChevronRight, LayoutList, Plus } from "lucide-react";
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
import { Button } from "./button";
import Image from "next/image";

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
            <div className="pl-9 pr-2 space-y-1 mt-1">
              {isLoading && (
                <div className="py-3 flex items-center">
                  <div className="space-y-1.5 w-full">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-5 bg-muted/60 rounded animate-pulse w-full" />
                    ))}
                  </div>
                </div>
              )}

              {!isLoading && boards && boards.length === 0 && (
                <div className="py-3">
                  <p className="text-xs text-muted-foreground mb-2">No boards yet</p>
                  <Button
                    asChild
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start p-0 h-auto hover:bg-transparent"
                  >
                    <Link href={`/${workspaceId}/boards/new`} className="flex items-center text-xs text-primary">
                      <Plus className="mr-1 h-3 w-3" />
                      Create board
                    </Link>
                  </Button>
                </div>
              )}

              {!isLoading && boards && boards.length > 0 && (
                <div className="space-y-1 py-1">
                  {boards.map((board: any) => {
                    const isActive = pathname.includes(`/${workspaceId}/boards/${board.id}`)

                    return (
                      <Link
                        key={board.id}
                        href={`/${workspaceId}/boards/${board.id}`}
                        className={cn(
                          "group relative flex items-center gap-2.5 py-1.5 pl-2 pr-1 rounded-md transition-all text-sm",
                          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <div
                          className={cn(
                            "absolute left-0 top-0 bottom-0 w-0.5 rounded-full transition-all",
                            isActive
                              ? "bg-primary h-full"
                              : "bg-transparent h-0 group-hover:bg-muted-foreground/20 group-hover:h-full",
                          )}
                        />

                        {board.image ? (
                          <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-sm">
                            <Image src={board.image || "/placeholder.svg"} alt="" fill className="object-cover" />
                          </div>
                        ) : (
                          <div
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm",
                              isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            <LayoutList size={14} />
                          </div>
                        )}

                        <span className={cn("truncate transition-colors", isActive ? "font-medium" : "font-normal")}>
                          {board.title}
                        </span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
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


      </SidebarMenu>
    </SidebarGroup>
  );
}
