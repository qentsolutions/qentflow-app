"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ChevronsUpDown, Plus, Settings2, Users2, Building2, ChevronRight, ChevronDown } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { useCurrentTeam } from "@/hooks/use-current-team"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useAction } from "@/hooks/use-action"
import { createTeam } from "@/actions/teams/create-team"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

export function WorkspaceTeamSwitcher() {
    const { isMobile } = useSidebar()
    const router = useRouter()

    // Workspace state
    const { currentWorkspace, workspaces, setCurrentWorkspace } = useCurrentWorkspace()

    // Team state
    const { currentTeam, teams, setCurrentTeam } = useCurrentTeam()
    const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = React.useState(false)
    const [teamName, setTeamName] = React.useState("")
    const [teamDescription, setTeamDescription] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)

    // Track expanded workspaces
    const [expandedWorkspaces, setExpandedWorkspaces] = React.useState<Record<string, boolean>>({})

    // Team creation action
    const { execute: executeCreateTeam } = useAction(createTeam, {
        onSuccess: (data: any) => {
            toast.success("Team created successfully", {
                description: `${teamName} has been created in ${currentWorkspace?.name}`,
            })
            setIsCreateTeamModalOpen(false)
            setCurrentTeam(data)
            setTeamName("")
            setTeamDescription("")
            setIsSubmitting(false)
        },
        onError: (error) => {
            toast.error("Failed to create team", {
                description: error,
            })
            setIsSubmitting(false)
        },
    })

    const handleCreateTeam = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        await executeCreateTeam({
            name: teamName,
            description: teamDescription,
            workspaceId: currentWorkspace?.id as string,
        })
    }

    const handleWorkspaceSelect = (workspace: any) => {
        setCurrentWorkspace(workspace)

        // Expand the selected workspace to show teams
        setExpandedWorkspaces((prev) => ({
            ...prev,
            [workspace.id]: true,
        }))

        router.push(`/${workspace.id}/home`)
    }

    const handleTeamSelect = (team: any) => {
        setCurrentTeam(team)
    }

    const handleNewWorkspace = () => {
        router.push("/workspace/select")
    }

    const toggleWorkspaceExpanded = (workspaceId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setExpandedWorkspaces((prev) => ({
            ...prev,
            [workspaceId]: !prev[workspaceId],
        }))
    }

    // Get display name for the dropdown button
    const getDisplayName = () => {
        if (currentTeam && currentWorkspace) {
            return (
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-medium">
                        {currentWorkspace.name} / {currentTeam.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground flex items-center gap-1">
                        <Users2 className="h-3 w-3" />
                        {currentTeam.members?.length || 0} member{(currentTeam.members?.length || 0) !== 1 ? "s" : ""}
                    </span>
                </div>
            )
        }

        if (currentWorkspace) {
            return (
                <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                    <span className="truncate font-medium">{currentWorkspace.name}</span>
                    <span className="truncate text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="h-3 w-3" /> Workspace
                    </span>
                </div>
            )
        }

        return (
            <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-medium">Select a workspace</span>
                <span className="truncate text-xs text-muted-foreground">No workspace selected</span>
            </div>
        )
    }

    // Get icon for the dropdown button
    const getDisplayIcon = () => {
        if (currentTeam && currentWorkspace) {
            return (
                <div className="flex aspect-square size-9 items-center justify-center rounded-md overflow-hidden border border-border/30 shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <Users2 className="h-5 w-5" />
                </div>
            )
        }

        if (currentWorkspace?.logo) {
            return (
                <div className="flex aspect-square size-9 items-center justify-center rounded-md overflow-hidden border border-border/30 shadow-sm">
                    <Image
                        src={currentWorkspace.logo || "/placeholder.svg"}
                        alt={currentWorkspace.name}
                        width={36}
                        height={36}
                        className="object-cover w-full h-full"
                    />
                </div>
            )
        }

        if (currentWorkspace) {
            return (
                <div className="flex aspect-square size-9 items-center justify-center rounded-md overflow-hidden border border-border/30 shadow-sm bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <span className="font-semibold text-lg">{currentWorkspace.name?.charAt(0).toUpperCase()}</span>
                </div>
            )
        }

        return (
            <div className="flex aspect-square size-9 items-center justify-center rounded-md overflow-hidden border border-border/30 shadow-sm bg-muted">
                <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
        )
    }

    // Initialize expanded state for current workspace
    React.useEffect(() => {
        if (currentWorkspace?.id && !expandedWorkspaces[currentWorkspace.id]) {
            setExpandedWorkspaces((prev) => ({
                ...prev,
                [currentWorkspace.id]: true,
            }))
        }
    }, [currentWorkspace?.id, expandedWorkspaces])

    return (
        <div className="px-2">
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <SidebarMenuButton
                                size="lg"
                                className="group transition-all duration-200 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:bg-gray-800/60 hover:bg-sidebar-accent/80"
                            >
                                {getDisplayIcon()}
                                {getDisplayName()}
                                <ChevronsUpDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-[--radix-dropdown-menu-trigger-width] ml-4 min-w-64 p-1 rounded-lg border border-border/50 shadow-lg"
                            align="start"
                            side={isMobile ? "bottom" : "right"}
                            sideOffset={8}
                        >
                            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground px-2 py-1.5">
                                Your Workspaces
                            </DropdownMenuLabel>

                            <div className="max-h-[400px] overflow-y-auto py-1">
                                {workspaces.map((workspace) => (
                                    <div key={workspace.id} className="mb-1">
                                        <div className="flex items-center w-full">
                                            <DropdownMenuItem
                                                onClick={() => handleWorkspaceSelect(workspace)}
                                                className={cn(
                                                    "flex-1 px-2 py-1.5 rounded-none hover:bg-blue-100 cursor-pointer",
                                                    currentWorkspace?.id === workspace.id
                                                        ? "bg-blue-100 hover:bg-blue-100"
                                                        : "text-foreground py-2.5 ",
                                                )}
                                            >
                                                <div className="flex items-center gap-2">
                                                    {workspace.logo ? (
                                                        <div className="w-7 h-7 bg-background flex items-center justify-center overflow-hidden border border-border/30">
                                                            <Image
                                                                src={workspace.logo || "/placeholder.svg"}
                                                                alt={workspace.name}
                                                                width={28}
                                                                height={28}
                                                                className="object-cover w-full h-full"
                                                            />
                                                        </div>
                                                    ) : (
                                                        <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center">
                                                            <span className="font-semibold">{workspace.name?.charAt(0).toUpperCase()}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{workspace?.name}</span>
                                                        {currentWorkspace?.id === workspace.id && (
                                                            <span className="text-xs text-blue-600">Current</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </DropdownMenuItem>

                                            <div className={cn(
                                                "flex bg-blue-100 items-center",
                                                "",
                                            )}>
                                                {currentWorkspace?.id === workspace.id && (
                                                    <Link
                                                        href={`/${workspace.id}/settings`}
                                                        className={cn(
                                                            "flex bg-blue-100 items-center justify-center h-9 w-9 text-primary",
                                                            "transition-colors mr-1",
                                                        )}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Settings2 size={15} />
                                                        <span className="sr-only">Workspace Settings</span>
                                                    </Link>
                                                )}

                                                <button
                                                    className={cn(
                                                        "flex items-center justify-center h-12 w-9",
                                                        expandedWorkspaces[workspace.id]
                                                            ? "bg-white"
                                                            : "text-muted-foreground bg-white",
                                                        "transition-colors",
                                                        currentWorkspace ? "bg-blue-100":"bg-white"
                                                    )}
                                                    onClick={(e) => toggleWorkspaceExpanded(workspace.id, e)}
                                                >
                                                    <ChevronDown
                                                        size={15}
                                                        className={cn(
                                                            "transition-transform duration-200",
                                                            expandedWorkspaces[workspace.id] ? "rotate-180" : "rotate-0",
                                                        )}
                                                    />
                                                    <span className="sr-only">Toggle Teams</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Teams for this workspace */}
                                        <AnimatePresence>
                                            {expandedWorkspaces[workspace.id] && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="pl-9 pr-2 py-2 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs text-muted-foreground">Teams</span>
                                                        </div>

                                                        {/* Team list */}
                                                        <div className="space-y-1 mt-1">
                                                            {teams.filter((team) => team.workspaceId === workspace.id).length > 0 ? (
                                                                teams
                                                                    .filter((team) => team.workspaceId === workspace.id)
                                                                    .map((team) => (
                                                                        <button
                                                                            key={team.id}
                                                                            className={cn(
                                                                                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                                                                                currentTeam?.id === team.id && workspace.id === currentWorkspace?.id
                                                                                    ? "bg-primary/10 text-primary"
                                                                                    : "text-foreground",
                                                                            )}
                                                                            onClick={() => handleTeamSelect(team)}
                                                                        >
                                                                            <div className="flex h-5 w-5 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                                                                                <Users2 className="h-3 w-3" />
                                                                            </div>
                                                                            <span className="truncate">{team.name}</span>
                                                                            {currentTeam?.id === team.id && workspace.id === currentWorkspace?.id && (
                                                                                <ChevronRight className="ml-auto h-3 w-3 text-primary" />
                                                                            )}
                                                                        </button>
                                                                    ))
                                                            ) : (
                                                                <div className="px-2 py-2 text-center">
                                                                    <p className="text-xs text-muted-foreground">No teams found</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>

                            <DropdownMenuSeparator className="my-1" />
                            <DropdownMenuItem
                                className="flex items-center gap-2 p-2 cursor-pointer rounded-md m-1"
                                onClick={handleNewWorkspace}
                            >
                                <div className="flex size-7 items-center justify-center rounded-md border bg-background">
                                    <Plus className="size-4 text-primary" />
                                </div>
                                <div className="font-medium">Create new workspace</div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </div>
    )
}

