import { type LucideIcon, ChevronRight, Folder, File, LayoutList, FileText } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetcher } from "@/lib/fetcher"
import { useCurrentWorkspace } from "@/hooks/use-current-workspace"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuAction,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
import { ProjectAvatar } from "@/app/(protected)/[workspaceId]/projects/[projectId]/components/project-avatar"

export function NavProjects({
    items,
}: {
    items: {
        name: string
        url: string
        icon: LucideIcon
        disabled?: boolean
    }[]
}) {
    const pathname = usePathname()
    const { currentWorkspace } = useCurrentWorkspace()

    const { data: projects } = useQuery({
        queryKey: ["projects", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/projects/${currentWorkspace?.id}`),
        enabled: !!currentWorkspace?.id,
    })

    const isActive = pathname === `/${currentWorkspace?.id}/projects`;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Collaboration</SidebarGroupLabel>
            <SidebarMenu>
                <Collapsible className="group/collapsible">
                    <SidebarMenuItem
                        className={`group/menu-item rounded-sm ${isActive ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"}`}
                    >
                        <SidebarMenuButton asChild isActive={pathname === `/${currentWorkspace?.id}/projects`}>
                            <Link href={`/${currentWorkspace?.id}/projects`}>
                                <Folder className="h-4 w-4" />
                                <span>Projects</span>
                            </Link>
                        </SidebarMenuButton>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuAction>
                                <ChevronRight className="h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuAction>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>

                    <CollapsibleContent>
                        <div className="ml-2 space-y-2 mt-2">
                            {!projects && (
                                <div className="py-3 px-2 flex items-center justify-center">
                                    <div className="animate-pulse flex space-x-2">
                                        <div className="h-2 w-2 bg-muted-foreground/20 rounded-full"></div>
                                        <div className="h-2 w-2 bg-muted-foreground/20 rounded-full"></div>
                                        <div className="h-2 w-2 bg-muted-foreground/20 rounded-full"></div>
                                    </div>
                                </div>
                            )}

                            {projects && projects.length === 0 && (
                                <div className="text-center py-3 px-2 text-xs text-muted-foreground">
                                    <p>No projects found</p>
                                    <Link
                                        href={`/${currentWorkspace?.id}/projects/new`}
                                        className="inline-flex items-center gap-1 mt-2 text-primary hover:underline"
                                    >
                                        <span>Create a project</span>
                                    </Link>
                                </div>
                            )}

                            {projects &&
                                projects.length > 0 &&
                                projects.map((project: any) => (
                                    <Collapsible
                                        key={project.id}
                                        className="group/project-collapsible rounded-lg overflow-hidden"
                                    >
                                        <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/80 transition-colors">
                                            <div className="flex items-center gap-2">
                                                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]/project-collapsible:rotate-90" />
                                                <ProjectAvatar
                                                    projectName={project.name}
                                                    projectLogo={project.logo}
                                                    size="sm"
                                                />
                                                <span className="font-medium truncate">{project.name}</span>
                                            </div>
                                        </CollapsibleTrigger>

                                        <CollapsibleContent>
                                            <div className="border-l border-primary/10 ml-4 pl-3 py-2 space-y-1">
                                                {!project.boards?.length && !project.documents?.length && (
                                                    <div className="text-xs text-muted-foreground italic px-2 py-1">
                                                        No content in this project
                                                    </div>
                                                )}

                                                {project.boards?.length > 0 && (
                                                    <div className="mb-2">
                                                        <div className="space-y-1">
                                                            {project.boards.map((board: any) => (
                                                                <Link
                                                                    key={board.id}
                                                                    href={`/${currentWorkspace?.id}/boards/${board.id}`}
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
                                                    </div>
                                                )}

                                                {project.documents?.length > 0 && (
                                                    <div>
                                                        <div className="space-y-1">
                                                            {project.documents.map((doc: any) => (
                                                                <Link
                                                                    key={doc.id}
                                                                    href={`/${currentWorkspace?.id}/documents/${doc.id}`}
                                                                    className={cn(
                                                                        "flex items-center gap-2 px-2 py-1.5 text-sm rounded-md w-full transition-colors",
                                                                        pathname.includes(doc.id)
                                                                            ? "bg-blue-100 text-blue-600 font-medium"
                                                                            : "hover:bg-muted text-foreground/80 hover:text-foreground",
                                                                    )}
                                                                >
                                                                    <FileText
                                                                        size={16} className={cn(
                                                                            pathname.includes(doc.id) ? "text-blue-600" : "text-primary/60",
                                                                        )} />
                                                                    <span className="truncate">{doc.title}</span>
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </CollapsibleContent>
                                    </Collapsible>
                                ))}
                        </div>
                    </CollapsibleContent>
                </Collapsible>
            </SidebarMenu>
        </SidebarGroup>
    )
}