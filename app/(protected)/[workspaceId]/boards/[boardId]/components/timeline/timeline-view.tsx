'use client';

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
} from '@/components/ui/gantt';
import { ContextMenu, ContextMenuContent, ContextMenuTrigger, ContextMenuItem } from '@/components/ui/context-menu';
import { EyeIcon, LinkIcon, TrashIcon } from 'lucide-react';
import { updateCard } from "@/actions/tasks/update-card";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from 'next/navigation';
import { useCardModal } from '@/hooks/use-card-modal';

interface GanttClientComponentProps {
  features: any;
}

const TimelineView = ({ features }: GanttClientComponentProps) => {
  const queryClient = useQueryClient();
  const params = useParams();
  const cardModal = useCardModal();

  const groupedFeatures = features.reduce((groups: any, feature: any) => {
    const groupName = feature.status.name;
    return {
      ...groups,
      [groupName]: [...(groups[groupName] || []), feature],
    };
  }, {});

  const sortedGroupedFeatures = Object.fromEntries(
    Object.entries(groupedFeatures).sort(([nameA], [nameB]) =>
      nameA.localeCompare(nameB)
    )
  );

  const handleViewFeature = (id: any) => cardModal.onOpen(id);
  const handleCopyLink = (id: any) => console.log(`Copy link: ${id}`);
  const handleRemoveFeature = (id: any) => console.log(`Remove feature: ${id}`);
  const handleRemoveMarker = (id: any) => console.log(`Remove marker: ${id}`);
  const handleCreateMarker = (date: any) => console.log(`Create marker: ${date.toISOString()}`);

  const handleMoveFeature = async (id: any, startAt: any, endAt: any) => {
    if (!endAt) return;

    // Validation : endAt >= startAt
    if (startAt && endAt && endAt < startAt) {
      toast.error("Due date cannot be earlier than the start date.");
      return;
    }

    try {
      const result = await updateCard({
        id,
        startDate: startAt.toISOString(),
        dueDate: endAt.toISOString(),
        boardId: params.boardId as string,
        workspaceId: params.workspaceId as string
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["card", id],
      });

      toast.success("Card dates updated");
    } catch (error) {
      toast.error("Failed to update dates");
    }
  };

  const handleAddFeature = (date: any) => console.log(`Add feature: ${date.toISOString()}`);

  return (
    <GanttProvider onAddItem={handleAddFeature} range="monthly" zoom={100} className="h-full">
      <GanttSidebar>
        {Object.entries(sortedGroupedFeatures).map(([group, features]: any) => (
          <GanttSidebarGroup key={group} name={group}>
            {features.map((feature: any) => (
              <GanttSidebarItem
                key={feature.id}
                feature={feature}
                onSelectItem={handleViewFeature}
              />
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
                      <button
                        type="button"
                        onClick={() => handleViewFeature(feature.id)}
                      >
                        <GanttFeatureItem
                          onMove={handleMoveFeature}
                          {...feature}
                        />
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
        <GanttToday />
        <GanttCreateMarkerTrigger onCreateMarker={handleCreateMarker} />
      </GanttTimeline>
    </GanttProvider>
  );
};

export default TimelineView;
