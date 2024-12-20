"use client";

import React, { useEffect, useRef, useState } from 'react';
import { format, startOfWeek, addDays, isSameDay, subWeeks, addWeeks, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths, isWithinInterval, parseISO, setMilliseconds, setSeconds, setMinutes, setHours } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { useCurrentWorkspace } from '@/hooks/use-current-workspace';
import { fetcher } from '@/lib/fetcher';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { CalendarEvent } from '@prisma/client';
import { Button } from '@/components/ui/button';
import CreateEventDialog from './create-event-dialog';
import { EventDetails } from './event-details';
import { useCurrentUser } from '@/hooks/use-current-user';

interface Event {
  id: string;
  title: string;
  startDate: Date | string;
  endDate: Date | string;
  description?: string;
  color?: string;
  isAllDay?: boolean;
}

interface WeeklyCalendarProps {
  events: Event[];
  onEventClick?: (event: Event) => void;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { currentWorkspace } = useCurrentWorkspace();
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const [isCreateEventOpen, setIsCreateEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const user = useCurrentUser();

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
  };


  // Update the useQuery hook to include the user filter
  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events", currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      // Add userId to the query params
      const data = await fetcher(`/api/calendar/events?workspaceId=${currentWorkspace.id}&userId=${user?.id}`);
      return data.map((event: CalendarEvent) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
      }));
    },
    enabled: !!currentWorkspace?.id,
  });

  useEffect(() => {
    if (events.length > 0) {
      const processedEvents: Event[] = events.map((event: { startDate: string | number | Date; endDate: string | number | Date; }) => ({
        ...event,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
      }));
      console.log("Événements transformés :", processedEvents);
    }
  }, [events]);


  const normalizeDate = (date: Date | string): Date => {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return parsedDate;
  };

  const getEventsForDateAndHour = (date: Date, hour: number, events: Event[]) => {
    if (!events?.length) return [];

    // Create a date object for the specific hour
    const timeSlotStart = setMilliseconds(setSeconds(setMinutes(setHours(date, hour), 0), 0), 0);
    const timeSlotEnd = setMilliseconds(setSeconds(setMinutes(setHours(date, hour + 1), 0), 0), 0);

    return events.filter((event: Event) => {
      const eventStart = normalizeDate(event.startDate);
      const eventEnd = normalizeDate(event.endDate);

      // Check if the event overlaps with the time slot
      return eventStart <= timeSlotEnd && eventEnd > timeSlotStart;
    });
  };


  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate =>
      direction === 'prev' ? subWeeks(prevDate, 1) : addWeeks(prevDate, 1)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth =>
      direction === 'prev' ? subMonths(prevMonth, 1) : addMonths(prevMonth, 1)
    );
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const selectDate = (date: Date) => {
    setCurrentDate(date);
    setCurrentMonth(date);
  };

  const getEventHeight = (event: Event) => {
    const start = normalizeDate(event.startDate);
    const end = normalizeDate(event.endDate);
    const durationInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // Durée en heures
    return `${durationInHours * 4}rem`; // On suppose qu'une heure équivaut à 4rem de hauteur
  };

  const renderEvents = (day: Date, hour: number, events: Event[]) => {
    const eventsForTimeSlot = getEventsForDateAndHour(day, hour, events);
    return eventsForTimeSlot.map((event: Event) => {
      const eventStart = normalizeDate(event.startDate);
      const eventEnd = normalizeDate(event.endDate);

      const eventHeight = getEventHeight(event);

      const topPosition = ((eventStart.getHours() - hour) + (eventStart.getMinutes() / 60)) * 4; // Calcul de la position verticale

      return (
        <Tooltip key={event.id}>
          <TooltipTrigger asChild>
            <div
              onClick={() => handleEventClick(event)}
              className={cn(
                "absolute inset-x-0 mx-1 rounded p-1 text-xs cursor-pointer truncate",
                "hover:opacity-90 transition-opacity",
                event.isAllDay ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
              )}
              style={{
                backgroundColor: event.color ? `${event.color}20` : undefined,
                color: event.color,
                borderLeft: `3px solid ${event.color}`,
                top: `${topPosition}rem`, // Position en fonction de l'heure de début
                height: eventHeight, // Hauteur basée sur la durée de l'événement
              }}
            >
              {event.title}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="p-2">
              <p className="font-bold">{event.title}</p>
              {event.description && (
                <p className="text-sm text-gray-500">{event.description}</p>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {format(new Date(event.startDate), "HH:mm")} - {format(new Date(event.endDate), "HH:mm")}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      );
    });
  };

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      // Scroll to 30 minutes before current time for better context
      const scrollPosition = (currentHour - 0.5) * 4 * 16; // 4rem * 16px per rem
      scrollContainerRef.current.scrollTop = scrollPosition;
    }
  }, []);



  return (
    <div className="flex bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mt-4 pb-12">
      <div className="flex-grow">
        <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900">
          <button onClick={() => navigateWeek('prev')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(weekStart, 'd MMMM', { locale: fr })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: fr })}
          </h2>
          <button onClick={() => navigateWeek('next')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <div ref={scrollContainerRef} className="overflow-auto max-h-[calc(100vh-12rem)]">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 border-b">
              <div className="sticky top-0 bg-white dark:bg-gray-800 z-10"></div>
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={cn(
                    "sticky top-0 bg-white dark:bg-gray-800 z-10 text-center p-2 border-l",
                    isSameDay(day, new Date()) && "bg-blue-50 dark:bg-blue-900/20"
                  )}
                >
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {format(day, 'EEE', { locale: fr })}
                  </div>
                  <div className={cn(
                    "text-lg",
                    isSameDay(day, new Date()) && "text-blue-600 dark:text-blue-400 font-bold"
                  )}>
                    {format(day, 'd', { locale: fr })}
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-8">
              {hours.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="text-right pr-2 py-4 text-sm text-gray-600 dark:text-gray-400 border-r">
                    {hour}:00
                  </div>
                  {weekDays.map((day, dayIndex) => (
                    <div
                      key={`${hour}-${dayIndex}`}
                      className={cn(
                        "border-l border-t relative min-h-[4rem]",
                        isSameDay(day, new Date()) && hour === new Date().getHours() && "bg-blue-50/50 dark:bg-blue-900/10"
                      )}
                    >
                      {renderEvents(day, hour, events)}

                      {isSameDay(day, new Date()) && hour === new Date().getHours() && (
                        <div
                          className="absolute top-0 left-0 w-full h-[2px] bg-blue-500 z-20"
                          style={{
                            top: `${(new Date().getMinutes() / 60) * 100}%`, // Position verticale en fonction de la minute actuelle
                            position: 'absolute',
                          }}
                        />
                      )}

                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-64 p-4 border-l hidden lg:block">
        <div className="text-center">
          <Button
            onClick={() => setIsCreateEventOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 mb-8"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        <CreateEventDialog
          open={isCreateEventOpen}
          onClose={() => setIsCreateEventOpen(false)}
        />
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigateMonth('prev')} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </div>
          <button onClick={() => navigateMonth('next')} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
          {monthDays.map((day, index) => (
            <button
              key={index}
              onClick={() => selectDate(day)}
              className={cn(
                "text-center p-1 text-sm rounded-full hover:bg-gray-100 dark:hover:bg-gray-700",
                isSameDay(day, currentDate) && "bg-blue-500 text-white hover:bg-blue-600",
                isSameDay(day, new Date()) && "font-bold",
                day.getMonth() !== currentMonth.getMonth() && "text-gray-300 dark:text-gray-600"
              )}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-2">Upcoming Events</h3>
          <div className="space-y-2">
            {events
              .map((event: Event) => (
                <Card
                  key={event.id}
                  className="p-2 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleEventClick(event)}
                >
                  <p className="font-medium text-sm">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(event.startDate), "d MMM, HH:mm")}
                  </p>
                </Card>
              ))}
          </div>
        </div>
      </div>
      <EventDetails
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};

export default WeeklyCalendar;