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
import { CalendarDays, ChevronDown, EyeIcon, Filter, LinkIcon, TrashIcon, User, X } from "lucide-react"
import { updateCard } from "@/actions/tasks/update-card"
import { toast } from "sonner"
import { useQueryClient } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { useCardModal } from "@/hooks/use-card-modal"
import { useRef, useState, useEffect } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

enum Range {
  Daily = "daily",
  Monthly = "monthly",
  Quarterly = "quarterly",
}

interface GanttClientComponentProps {
  features: any
  currentUser?: { id: string; name: string }
}

const TimelineView = ({ features, currentUser }: GanttClientComponentProps) => {
  const queryClient = useQueryClient()
  const params = useParams()
  const cardModal = useCardModal()
  const ganttRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState<"all" | string>("all")
  const [isMyTasks, setIsMyTasks] = useState(false)
  const [viewType, setViewType] = useState<Range>(Range.Daily)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const viewSettings = [
    { type: Range.Daily, range: Range.Daily, zoom: 200 },
    { type: Range.Monthly, range: Range.Monthly, zoom: 100 },
    { type: Range.Quarterly, range: Range.Quarterly, zoom: 50 },
  ]

  const getViewSettings = () => {
    const setting = viewSettings.find((setting) => setting.type === viewType)
    return setting ? { range: setting.range, zoom: setting.zoom } : { range: Range.Monthly, zoom: 100 }
  }

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
    setIsFilterOpen(false)
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
  const getStatusColor = (groupName: any) => "#007bff" // Always return blue color

  // Count active filters
  const activeFiltersCount = (filter !== "all" ? 1 : 0) + (isMyTasks ? 1 : 0)

  return (
    <div className="flex flex-col h-full">
      <div className="w-full px-3 pb-2 border-b bg-white flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 relative">
                <Filter size={16} />
                <span className="text-xs">Filters</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="start">
              <div className="p-4 border-b">
                <h3 className="font-medium text-sm">Filter Cards</h3>
                <p className="text-xs text-muted-foreground mt-1">Select a status to filter cards</p>
              </div>

              <div className="p-4 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Button
                      variant={filter === "all" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setFilter("all")}
                      className="w-full justify-start"
                    >
                      <span>All</span>
                    </Button>
                  </div>

                  {Object.entries(groupedFeatures).map(([groupName, groupFeatures]: any) => {
                    const statusColor = getStatusColor(groupName)
                    return (
                      <Button
                        key={groupName}
                        variant={filter === groupName ? "default" : "outline"}
                        onClick={() => setFilter(groupName)}
                        className={`w-full justify-start ${filter === groupName ? "text-white" : ""}`}
                        style={{
                          backgroundColor: filter === groupName ? statusColor : "transparent",
                        }}
                      >
                        <span className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: statusColor }}></span>
                        <span>{groupName}</span>
                        <span
                          className={`ml-auto px-1.5 py-0.5 text-xs rounded-full ${filter === groupName ? "bg-white bg-opacity-20" : "bg-slate-100"}`}
                        >
                          {groupFeatures.length}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 border-t bg-muted/30">
                <Button variant="ghost" size="sm" onClick={() => setFilter("all")} className="w-full text-xs h-8">
                  Clear filters
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant={isMyTasks ? "default" : "outline"}
            size="sm"
            onClick={() => setIsMyTasks(!isMyTasks)}
            className="flex items-center gap-1 h-8 relative"
          >
            <User size={14} />
            <span>Assigned to me</span>
          </Button>

          {/* Active filters display */}
          {(filter !== "all" || isMyTasks) && (
            <div className="flex items-center gap-2 ml-2">
              {isMyTasks && (
                <Badge variant="secondary" className="flex items-center gap-1 py-2">
                  <User size={12} />
                  <span>Assigned to Me</span>
                  <Button variant="ghost" size="icon" className="h-4 w-4 ml-1 p-0" onClick={() => setIsMyTasks(false)}>
                    <X size={12} />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </Badge>
              )}

              {filter !== "all" && (
                <Badge
                  variant="secondary"
                  className="flex items-center gap-1 py-2"
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
            </div>
          )}
        </div>

        <div className="flex items-center gap-x-2">
          <div className="flex items-center gap-2 pl-4 rounded-lg bg-muted/60 border shadow-sm">
            <span className="text-sm font-medium text-muted-foreground px-2 mr-2">View</span>

            <div className="flex items-center gap-1 bg-background rounded-md p-1">
              {viewSettings.map(({ type }) => (
                <button
                  key={type}
                  onClick={() => setViewType(type)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewType === type ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={scrollToToday} className="flex items-center gap-1 h-8">
            <CalendarDays size={16} />
            <span>Today</span>
          </Button>
        </div>
      </div>

      <div className="flex-1" ref={ganttRef}>
        <GanttProvider
          onAddItem={handleAddFeature}
          range={getViewSettings().range}
          zoom={getViewSettings().zoom}
          className="h-[78vh]"
        >
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

