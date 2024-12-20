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

  return (
    <div className=" mx-auto pt-1 space-y-6">
        <WeeklyCalendar
          events={events || []}
        />
    </div>
  );
};

export default CalendarPage;