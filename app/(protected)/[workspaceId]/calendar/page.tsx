"use client";

import { useEffect } from "react";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { useBreadcrumbs } from "@/hooks/use-breadcrumb";
import { useQuery } from "@tanstack/react-query";
import { fetcher } from "@/lib/fetcher";
import WeeklyCalendar from "./components/WeeklyCalendar";

const CalendarPage = () => {
  const { currentWorkspace } = useCurrentWorkspace();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    document.title = "Calendar - QentFlow";
  }, []);

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
    <div className=" mx-auto space-y-6">
      <WeeklyCalendar
        events={events || []}
      />
    </div>
  );
};

export default CalendarPage;