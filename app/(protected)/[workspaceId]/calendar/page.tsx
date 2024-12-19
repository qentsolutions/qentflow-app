"use client";

import { useState, useEffect } from "react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import CreateEventDialog from "./components/create-event-dialog";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import WeeklyCalendar from "./components/WeeklyCalendar";

const CalendarPage = () => {
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const { currentWorkspace } = useCurrentWorkspace();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Calendar" }]);
  }, [setBreadcrumbs]);

  const { data: events } = useQuery({
    queryKey: ["calendar-events", currentWorkspace?.id],
    queryFn: () =>
      currentWorkspace?.id
        ? fetcher(`/api/calendar/events?workspaceId=${currentWorkspace.id}`)
        : Promise.resolve([]),
    enabled: !!currentWorkspace?.id,
  });

  const cards = ""

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-muted-foreground">
            Manage your schedule and view your tasks
          </p>
        </div>
        <Button
          onClick={() => setIsCreateEventOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Event
        </Button>
      </div>

      <Card className="p-4">
        <WeeklyCalendar
          events={events || []}
        />
      </Card>

      <CreateEventDialog
        open={isCreateEventOpen}
        onClose={() => setIsCreateEventOpen(false)}
        cards={cards || ["ok"]}
      />
    </div>
  );
};

export default CalendarPage;