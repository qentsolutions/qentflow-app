"use client";

import { type LucideIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator"; // Assurez-vous d'importer le composant Separator

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";

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
                <Link href={item.url} className="flex items-center gap-2">
                  <item.icon />
                  <span>{item.name}</span>
                  {item.disabled && <span className="ml-auto bg-blue-200 text-gray-700 px-2 py-1 rounded-full text-xs">incoming</span>} {/* Ajout du badge incoming */}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
