"use client"

import * as React from "react"
import { ChevronsUpDown, Plus, Settings2, } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useRouter } from "next/navigation"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import Image from "next/image"
import Link from "next/link"

export function TeamSwitcher() {
    const { isMobile } = useSidebar()
    const router = useRouter();
    const { currentWorkspace, workspaces, setCurrentWorkspace } = useCurrentWorkspace();

    const handleNewWorkspace = () => {
        router.push("/workspace/select");
    };

    const handleWorkspaceSelect = (workspace: any) => {
        setCurrentWorkspace(workspace);  
        router.push(`/${workspace.id}/home`);
    };
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="lg"
                            className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground dark:bg-gray-800 ml-2 mt-2"
                        >
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                {currentWorkspace?.logo ? (
                                    // Afficher le logo du workspace
                                    <Image
                                        src={currentWorkspace.logo}
                                        alt={currentWorkspace.name}
                                        width={30}
                                        height={30}
                                        className="object-cover rounded"
                                    />
                                ) : (
                                    // Afficher l'initiale du nom du workspace
                                    <div className="w-8 h-8 bg-blue-500 text-white flex items-center justify-center rounded">
                                        <span className="font-semibold">
                                            {currentWorkspace?.name?.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                                <span className="truncate font-semibold">{currentWorkspace?.name || "Select a workspace"}</span>
                            </div>
                            <ChevronsUpDown className="mr-2" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[--radix-dropdown-menu-trigger-width] ml-2 min-w-60 "
                        align="start"
                        side={isMobile ? "bottom" : "right"}
                        sideOffset={4}
                    >
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Workspaces
                        </DropdownMenuLabel>

                        {workspaces.map((workspace) => (
                            <div key={workspace.id} className="flex items-center w-full h-full">
                                <DropdownMenuItem
                                    onClick={() => handleWorkspaceSelect(workspace)}
                                    className={`${currentWorkspace?.id === workspace.id ? "bg-blue-50 text-black w-full rounded-none" : "text-muted-foreground w-full"
                                        }`}  
                                >
                                    {workspace.logo ? (
                                        <div className="w-6 h-6 bg-gray-100 flex items-center justify-center rounded">
                                            <Image
                                                src={workspace.logo}
                                                alt={workspace.name}
                                                width={24}
                                                height={24}
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded">
                                            <span className="font-semibold">
                                                {workspace.name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span>{workspace?.name}</span>
                                </DropdownMenuItem>
                                {currentWorkspace?.id === workspace.id && (
                                    <Link href={`/${workspace.id}/settings`}>
                                        <p className="flex items-center bg-blue-50 justify-center h-9 text-gray-800">
                                            <Settings2 size={14} className="ml-1 mr-2" />
                                        </p>
                                    </Link>
                                )}
                            </div>

                        ))}

                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 p-2" onClick={handleNewWorkspace}>
                            <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                                <Plus className="size-4" />
                            </div>
                            <div className="font-medium text-muted-foreground">New workspace</div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu >
    )
}
