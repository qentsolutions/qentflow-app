import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { CalendarIcon, ClockIcon } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    title: string;
    startDate: Date | string;
    endDate: Date | string;
    color?: string;
  };
  onClick: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);

  return (
    <Card
      className="p-3 cursor-pointer hover:shadow-md transition-shadow bg-background dark:bg-gray-800"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        <div
          className="w-1 h-full rounded-full"
          style={{ backgroundColor: event.color || '#3b82f6' }}
        />
        <div className="flex-grow">
          <h4 className="font-semibold text-sm mb-1 text-gray-800 dark:text-gray-200">
            {event.title}
          </h4>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <CalendarIcon className="w-3 h-3 mr-1" />
            <span>{format(startDate, "d MMM, yyyy")}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
            <ClockIcon className="w-3 h-3 mr-1" />
            <span>
              {format(startDate, "HH:mm")} - {format(endDate, "HH:mm")}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

