import { type LucideIcon } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation"; // Importer usePathname
import Link from "next/link";

export function NavMain({
  projects,
}: {
  projects: {
    name: string;
    url: string;
    icon: LucideIcon;
    count?: number; // Déclaration de la prop count, qui est optionnelle
  }[];
}) {
  const pathname = usePathname(); // Récupérer le chemin actuel
  return (
    <SidebarGroup>
      <SidebarMenu>
        {projects.map((item, index) => {
          // Vérifier si le chemin actuel commence par l'URL
          const isActive = pathname.startsWith(item.url);

          return (
            <SidebarMenuItem
              key={item.name}
              className={`rounded-sm w-full ${isActive ? "bg-blue-100 dark:bg-gray-800 text-blue-600" : "hover:bg-gray-100 dark:hover:bg-gray-800 text-slate-600"
                }`} // Ajouter des styles conditionnels pour l'état actif
            >
              <SidebarMenuButton asChild>
                <Link href={item.url} className="flex items-center justify-between gap-2 w-full ml-2">
                  <div className="flex items-center gap-2">
                    <item.icon size={16} />
                    <span className="group-data-[collapsible=icon]:hidden ml-2">{item.name}</span>
                  </div>
                  <span className="group-data-[collapsible=icon]:hidden">
                    {item.name === "My Tasks" && item.count !== undefined && (
                      <span className=" text-gray-500 mr-4">{item.count > 0 ? (<>{item.count}</>) : (<></>)}</span>
                    )}
                  </span>

                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
