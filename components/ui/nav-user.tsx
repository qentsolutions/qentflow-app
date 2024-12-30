import { useRouter } from "next/navigation" // Import de useRouter
import {
    Bell,
    ChevronsUpDown,
    CreditCard,
    LogOut,
    Settings,
    Sparkles,
} from "lucide-react"

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { LogoutButton } from "../auth/logout-button"
import { Separator } from "./separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import Image from "next/image"

export function NavUser({
    user,
}: {
    user: any
}) {
    const { isMobile } = useSidebar()
    const router = useRouter() // Utilisation de useRouter
    const { currentWorkspace, workspaces, setCurrentWorkspace } = useCurrentWorkspace();

    // Fonction pour rediriger vers une page spécifique
    const handleNavigation = (url: string) => {
        router.push(url)
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="flex items-center gap-3 my-1 px-4 py-5 rounded-lg hover:bg-gray-100">
                            <Bell className="text-gray-500" />
                            <span className="font-medium text-base">Notifications</span>
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right">
                        <Tabs defaultValue={currentWorkspace?.id || "all"} className="px-2 pb-12 h-60 w-80">
                            <div className="flex items-center">
                                <p className="px-2 py-4 font-medium">Notifications</p>
                                <div className="text-sm flex items-center justify-center h-6 w-6 bg-blue-400 text-white rounded-sm">
                                    2
                                </div>
                            </div>
                            <TabsList>
                                <TabsTrigger value="all" className="text-base">All</TabsTrigger>

                                {/* Générer les onglets dynamiquement en fonction des workspaces */}
                                {workspaces.map((workspace) => (
                                    <TabsTrigger key={workspace.id} value={workspace.id} className="text-base">
                                        {workspace.name}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                            <Separator />

                            {/* Contenu pour l'onglet "All" */}
                            <TabsContent value="all">
                                <p>All Notifications</p>
                            </TabsContent>

                            {/* Générer dynamiquement le contenu des onglets pour chaque workspace */}
                            {workspaces.map((workspace) => (
                                <TabsContent key={workspace.id} value={workspace.id}>
                                    <div className="flex flex-col items-start space-y-2">
                                        <div className="flex items-center gap-2">
                                            No notifications.
                                        </div>
                                    </div>
                                </TabsContent>
                            ))}
                        </Tabs>

                    </DropdownMenuContent>
                </DropdownMenu>

            </SidebarMenuItem>
            <Separator />
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {user?.image ? (
                                    <AvatarImage src={user?.image} alt={user?.name} />
                                ) : (
                                    <div className="flex items-center justify-center h-full w-full bg-gray-300 text-white rounded-lg">
                                        {user?.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </Avatar>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{user?.name}</span>
                                <span className="truncate lowercase">{user?.role}</span>
                            </div>
                            <ChevronsUpDown className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="p-0 font-normal">
                            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                <Avatar className="h-8 w-8 rounded-lg">
                                    {user?.image ? (
                                        <AvatarImage src={user.image} alt={user?.name} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full bg-gray-300 text-white rounded-lg">
                                            {user?.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user?.name}</span>
                                    <span className="truncate text-xs">{user?.email}</span>
                                </div>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => handleNavigation('/settings/account')}>
                                <Settings />
                                Settings
                            </DropdownMenuItem>

                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <LogoutButton>
                            <DropdownMenuItem onClick={() => handleNavigation('/logout')}>
                                <LogOut className="text-red-500" />
                                Log out
                            </DropdownMenuItem>
                        </LogoutButton>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
