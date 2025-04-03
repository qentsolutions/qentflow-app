"use client"

import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttToday,
  GanttCreateMarkerTrigger,
} from "@/components/ui/gantt"
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, ContextMenuItem } from "@/components/ui/context-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, EyeIcon, LinkIcon, TrashIcon, User, X } from "lucide-react"
import { updateCard } from "@/actions/tasks/update-card"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useCardModal } from "@/hooks/use-card-modal"
import { useRef, useState, useEffect } from "react"

interface GanttClientComponentProps {
  features: any
  currentUser?: { id: string; name: string }
}

const TimelineView = ({ features, currentUser }: GanttClientComponentProps) => {
  const queryClient = useQueryClient()
  const params = useParams()
  const cardModal = useCardModal()
  const ganttRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<"all" | "mine" | string>("all")
  const [isMyTasks, setIsMyTasks] = useState(false)

  // Filter features based on the selected filter
  const filteredFeatures = features.filter((feature: any) => {
    // First apply the "Mine" filter if active
    if (isMyTasks && currentUser) {
      if (!feature.assignedTo?.some((user: any) => user.id === currentUser.id)) {
        return false
      }
    }

    // Then apply the status filter if not "all"
    if (filter !== "all") {
      return feature.status.name === filter
    }

    return true
  })

  const groupedFeatures = filteredFeatures.reduce((groups: any, feature: any) => {
    const groupName = feature.status.name
    return {
      ...groups,
      [groupName]: [...(groups[groupName] || []), feature],
    }
  }, {})

  const sortedGroupedFeatures = Object.fromEntries(
    Object.entries(groupedFeatures).map(([groupName, features]: any) => [
      groupName,
      features.sort((a: any, b: any) => a.id - b.id), // Tri par ID
    ]),
  )

  const handleViewFeature = (id: any) => cardModal.onOpen(id)
  const handleCopyLink = (id: any) => {
    const url = `${window.location.origin}/${params.workspaceId}/${params.boardId}?card=${id}`
    navigator.clipboard.writeText(url)
    toast.success("Link copied to clipboard")
  }

  const handleRemoveFeature = (id: any) => console.log(`Remove feature: ${id}`)
  const handleRemoveMarker = (id: any) => console.log(`Remove marker: ${id}`)
  const handleCreateMarker = (date: any) => console.log(`Create marker: ${date.toISOString()}`)

  const handleMoveFeature = async (id: any, startAt: any, endAt: any) => {
    if (!endAt) return

    // Validation : endAt >= startAt
    if (startAt && endAt && endAt < startAt) {
      toast.error("Due date cannot be earlier than the start date.")
      return
    }

    try {
      const result = await updateCard({
        id,
        startDate: startAt.toISOString(),
        dueDate: endAt.toISOString(),
        boardId: params.boardId as string,
        workspaceId: params.workspaceId as string,
      })

      if (result.error) {
        toast.error(result.error)
        return
      }

      queryClient.invalidateQueries({
        queryKey: ["card", id],
      })

      toast.success("Card dates updated")
    } catch (error) {
      toast.error("Failed to update dates")
    }
  }

  const handleAddFeature = (date: any) => console.log(`Add feature: ${date.toISOString()}`)

  // Function to scroll to today
  const scrollToToday = () => {
    const todayElement = ganttRef.current?.querySelector('[data-today="true"]')
    if (todayElement) {
      todayElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    }
  }

  // Reset all filters
  const resetFilters = () => {
    setFilter("all")
    setIsMyTasks(false)
  }

  // Automatically scroll to today on initial render
  useEffect(() => {
    // Small delay to ensure the Gantt chart is fully rendered
    const timer = setTimeout(() => {
      scrollToToday()
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  // Get all status colors for the filter buttons
  const getStatusColor = (groupName: any) => "#007bff"; // Always return blue color


  return (
    <div className="flex flex-col h-full">
      <div className="w-full px-3 pt-2 pb-4 border-b bg-white flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 mr-2">
          <Button variant="ghost" size="sm" onClick={scrollToToday} className="flex items-center gap-1 h-8">
            <CalendarDays size={16} />
            <span>Today</span>
          </Button>

          <Button
            variant={isMyTasks ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsMyTasks(!isMyTasks)}
            className="flex items-center gap-1 h-8"
          >
            <User size={14} />
            <span>My Cards</span>
            {isMyTasks && currentUser && (
              <span className="ml-1 px-1.5 py-0.5 bg-white bg-opacity-20 text-xs rounded-full">
                {features.filter((f: any) => f.assignedTo?.some((u: any) => u.id === currentUser.id)).length}
              </span>
            )}
          </Button>
        </div>

        <div className="h-6 border-r"></div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status</span>

          <Button
            variant={filter === "all" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFilter("all")}
            className="flex items-center gap-1 h-8"
          >
            <span>All</span>
          </Button>

          {Object.entries(groupedFeatures).map(([groupName, groupFeatures]: any) => {
            const statusColor = getStatusColor(groupName)
            return (
              <Button
                key={groupName}
                variant={filter === groupName ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(groupName)}
                className={`flex items-center border-gray-200 gap-1 h-8 ${filter === groupName ? "text-white" : ""}`}
                style={{
                  backgroundColor: filter === groupName ? statusColor : "transparent",
                }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }}></span>
                <span>{groupName}</span>
                <span
                  className={`ml-1 px-1.5 py-0.5 text-xs rounded-full ${filter === groupName ? "bg-white bg-opacity-20" : "bg-slate-100"}`}
                >
                  {groupFeatures.length}
                </span>
              </Button>
            )
          })}
        </div>

        {/* Active filters display */}
        {(filter !== "all" || isMyTasks) && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>

            {isMyTasks && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <User size={12} />
                <span>My Tasks</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setIsMyTasks(false)}>
                  <X size={12} />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            )}

            {filter !== "all" && (
              <Badge
                variant="secondary"
                className="flex items-center gap-1"
                style={{ backgroundColor: `${getStatusColor(filter)}20` }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getStatusColor(filter) }}></span>
                <span>{filter}</span>
                <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setFilter("all")}>
                  <X size={12} />
                  <span className="sr-only">Remove filter</span>
                </Button>
              </Badge>
            )}

            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-7">
              Clear all
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1" ref={ganttRef}>
        <GanttProvider onAddItem={handleAddFeature} range="monthly" zoom={100} className="h-full">
          <GanttSidebar>
            {Object.entries(sortedGroupedFeatures).map(([group, features]: any) => (
              <GanttSidebarGroup key={group} name={group}>
                {features.map((feature: any) => (
                  <GanttSidebarItem key={feature.id} feature={feature} onSelectItem={handleViewFeature} />
                ))}
              </GanttSidebarGroup>
            ))}
          </GanttSidebar>
          <GanttTimeline>
            <GanttHeader />
            <GanttFeatureList>
              {Object.entries(sortedGroupedFeatures).map(([group, features]: any) => (
                <GanttFeatureListGroup key={group}>
                  {features.map((feature: any) => (
                    <div className="flex" key={feature.id}>
                      <ContextMenu>
                        <ContextMenuTrigger asChild>
                          <button type="button" onClick={() => handleViewFeature(feature.id)}>
                            <GanttFeatureItem onMove={handleMoveFeature} {...feature} />
                          </button>
                        </ContextMenuTrigger>
                        <ContextMenuContent>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleViewFeature(feature.id)}
                          >
                            <EyeIcon size={16} className="text-muted-foreground" />
                            View feature
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2"
                            onClick={() => handleCopyLink(feature.id)}
                          >
                            <LinkIcon size={16} className="text-muted-foreground" />
                            Copy link
                          </ContextMenuItem>
                          <ContextMenuItem
                            className="flex items-center gap-2 text-destructive"
                            onClick={() => handleRemoveFeature(feature.id)}
                          >
                            <TrashIcon size={16} />
                            Remove from roadmap
                          </ContextMenuItem>
                        </ContextMenuContent>
                      </ContextMenu>
                    </div>
                  ))}
                </GanttFeatureListGroup>
              ))}
            </GanttFeatureList>
            <GanttToday data-today="true" />
            <GanttCreateMarkerTrigger onCreateMarker={handleCreateMarker} />
          </GanttTimeline>
        </GanttProvider>
      </div>
    </div>
  )
}

export default TimelineView

