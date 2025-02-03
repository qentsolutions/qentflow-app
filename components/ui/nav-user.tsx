import { useRouter } from "next/navigation" // Import de useRouter
import { Bell, ChevronsUpDown, Settings, LogOut, Inbox, Users, Briefcase, CheckCircle, XCircle } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { LogoutButton } from "../auth/logout-button"
import { Separator } from "./separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/fetcher"
import { ScrollArea, ScrollBar } from "./scroll-area"
import { NotificationList } from "./notification-list"
import { Notification as PrismaNotification } from "@prisma/client"
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog"
import { useState } from "react"
import { toast } from "sonner"
import { acceptInvitation } from "@/actions/workspace/accept-invitation"
import { declineInvitation } from "@/actions/workspace/delete-invitation"
import { AnimatePresence, motion } from "framer-motion"

interface Notification extends PrismaNotification {
    workspaceName: string
}

export function NavUser({ user }: { user: any }) {
    const { isMobile } = useSidebar()
    const router = useRouter()
    const { currentWorkspace, workspaces, setCurrentWorkspace } = useCurrentWorkspace()
    const [showInvitations, setShowInvitations] = useState(false);
    const [hoveredInvitation, setHoveredInvitation] = useState<string | null>(null)

    // Use TanStack Query to fetch notifications
    const { data: notifications, isLoading, refetch } = useQuery<Notification[]>({
        queryKey: ["notifications", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/notifications?workspaceId=${currentWorkspace?.id}`),
        enabled: !!currentWorkspace?.id, // Only run the query if currentWorkspace exists
    })

    const handleNavigation = (url: string) => {
        router.push(url)
    }

    const unreadNotifications = notifications && notifications.length > 0
        ? notifications.filter(notification => !notification.read)
        : []

    const countUnreadNotifications = (workspaceId: string) => {
        // Vérifier si notifications est un tableau avant d'utiliser filter
        return Array.isArray(notifications)
            ? notifications.filter(
                (notification) => notification.workspaceId === workspaceId && !notification.read
            ).length
            : 0
    }


    const NotificationBadge = ({ count }: { count: number }) => {
        if (count === 0) return null

        return (
            <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[1rem] h-4 px-1 text-[8px] font-bold text-white bg-red-400 rounded-full">
                {count > 99 ? '99+' : count}
            </span>
        )
    }

    const { data: invitations, refetch: refetchInvitations } = useQuery({
        queryKey: ["invitations"],
        queryFn: async () => {
            const response = await fetch(`/api/workspaces/invitations`);
            if (!response.ok) throw new Error("Failed to fetch invitations");
            return response.json();
        },
    });

    const handleNewWorkspace = () => {
        router.push("/workspace/select");
    };

    const handleWorkspaceSelect = (workspace: any) => {
        setCurrentWorkspace(workspace);
        router.push(`/${workspace.id}`);
    };

    const handleAcceptInvitation = async (invitationId: string) => {
        try {
            // Supposons que AcceptInvitationParams attend un objet contenant plus d'informations que juste l'invitationId
            const params = { invitationId };

            // Appel de la fonction acceptInvitation avec les paramètres appropriés
            await acceptInvitation(params);

            toast.success("Invitation accepted successfully");
            refetchInvitations();
            router.refresh();
        } catch (error) {
            toast.error("Failed to accept invitation");
        }
    };


    const handleDeclineInvitation = async (invitationId: string) => {
        try {
            const params = { invitationId }
            await declineInvitation(params); // Appel de la Server Action
            refetchInvitations(); // Rafraîchir les invitations après le refus
        } catch (error) {
            toast.error("Failed to decline invitation");
        }
    };


    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    onClick={() => setShowInvitations(true)}
                    className="w-full justify-start py-4 hover:bg-gray-100"
                >
                    <Inbox className="mr-1 h-4 w-4" />
                    Invitations
                    {invitations?.length > 0 && (
                        <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                            {invitations?.length}
                        </span>
                    )}
                </SidebarMenuButton>

                <Dialog open={showInvitations} onOpenChange={setShowInvitations}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                                <Users className="w-6 h-6 text-primary" />
                                Invitations
                            </DialogTitle>
                        </DialogHeader>
                        <ScrollArea className="mt-6 max-h-[60vh] pr-4">
                            <AnimatePresence>
                                {invitations?.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        className="text-center py-8"
                                    >
                                        <Users className="w-12 h-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                                        <p className="text-lg font-medium text-muted-foreground">
                                            No pending invitations
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            You&apos;ll see invitations here when someone invites you.
                                        </p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-4">
                                        {invitations?.map((invitation: any) => (
                                            <motion.div
                                                key={invitation.id}
                                                layout
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                whileHover={{ scale: 1.02 }}
                                                onHoverStart={() => setHoveredInvitation(invitation.id)}
                                                onHoverEnd={() => setHoveredInvitation(null)}
                                                className="relative bg-card rounded-lg shadow-md overflow-hidden"
                                            >
                                                <div className="p-4">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="font-semibold text-lg flex items-center gap-2">
                                                                <Briefcase className="w-4 h-4 text-primary" />
                                                                {invitation?.workspace?.name}
                                                            </h3>
                                                            <p className="text-sm text-muted-foreground mt-1">
                                                                Invited by: {invitation?.inviter?.name}
                                                            </p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                onClick={() => handleAcceptInvitation(invitation.id)}
                                                                size="sm"
                                                                className="bg-green-500 hover:bg-green-600 text-white transition-colors duration-200"
                                                            >
                                                                <CheckCircle className="w-4 h-4 mr-1" />
                                                                Accept
                                                            </Button>
                                                            <Button
                                                                onClick={() => handleDeclineInvitation(invitation.id)}
                                                                variant="outline"
                                                                size="sm"
                                                                className="text-red-500 border-red-500 hover:bg-red-50 transition-colors duration-200"
                                                            >
                                                                <XCircle className="w-4 h-4 mr-1" />
                                                                Decline
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <motion.div
                                                    initial={{ scaleX: 0 }}
                                                    animate={{ scaleX: hoveredInvitation === invitation.id ? 1 : 0 }}
                                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary origin-left"
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </ScrollArea>
                    </DialogContent>
                </Dialog>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton className="flex items-center justify-between gap-3 mb-2 py-4 rounded-lg hover:bg-gray-100">
                            <div className="flex items-center gap-x-2">
                                <Bell className="mr-1 h-4 w-4" />
                                <span className="font-medium">Notifications</span>
                            </div>
                            {unreadNotifications.length > 0 && (
                                <div className="text-sm flex items-center justify-center h-6 w-6 bg-red-500 text-white rounded-sm">
                                    {unreadNotifications.length}
                                </div>
                            )}
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" className="mb-1 ml-2">
                        <Tabs defaultValue={currentWorkspace?.id || "all"} className="px-2 pb-2 w-96">
                            <ScrollArea>
                                <div className="flex items-center">
                                    <p className="px-2 py-2 font-medium">Notifications</p>
                                </div>
                                <TabsList>
                                    <TabsTrigger value="all">All</TabsTrigger>
                                    {workspaces.map((workspace) => (
                                        <TabsTrigger
                                            key={workspace.id}
                                            value={workspace.id}
                                            className="px-3  relative whitespace-nowrap"
                                        >
                                            {workspace?.name}
                                            <NotificationBadge count={countUnreadNotifications(workspace.id)} />
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>

                            <Separator />
                            <TabsContent value="all">
                                <ScrollArea className="h-[400px]">
                                    {isLoading ? (
                                        <p className="p-4 text-center text-sm text-gray-500">Loading notifications...</p>
                                    ) : (
                                        <NotificationList
                                            notifications={Array.isArray(notifications) ? notifications : []}
                                            onUpdate={refetch}
                                        />
                                    )}
                                </ScrollArea>
                            </TabsContent>


                            {workspaces.map((workspace) => (
                                <TabsContent key={workspace.id} value={workspace.id}>
                                    <ScrollArea className="h-[400px]">
                                        {isLoading ? (
                                            <p>Loading notifications...</p>
                                        ) : Array.isArray(notifications) && notifications.filter(n => n.workspaceId === workspace.id).length > 0 ? (
                                            <NotificationList
                                                notifications={notifications.filter(n => n.workspaceId === workspace.id)}
                                            />
                                        ) : (
                                            <p className="text-gray-400 text-sm text-center my-8">No notifications for this workspace</p>
                                        )}
                                    </ScrollArea>
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
