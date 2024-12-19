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

export function NavUser({
    user,
}: {
    user: any
}) {
    const { isMobile } = useSidebar()
    const router = useRouter() // Utilisation de useRouter

    // Fonction pour rediriger vers une page spécifique
    const handleNavigation = (url: string) => {
        router.push(url)
    }

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                        >
                            <Avatar className="h-8 w-8 rounded-lg">
                                {user?.image ? (
                                    <AvatarImage src={user.image} alt={user.name} />
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
                                        <AvatarImage src={user.image} alt={user.name} />
                                    ) : (
                                        <div className="flex items-center justify-center h-full w-full bg-gray-300 text-white rounded-lg">
                                            {user?.name.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </Avatar>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">{user.name}</span>
                                    <span className="truncate text-xs">{user.email}</span>
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
