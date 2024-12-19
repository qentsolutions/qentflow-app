"use client";

import React, { useState } from 'react';
import { format, startOfWeek, addDays, addHours, isSameDay, subWeeks, addWeeks, startOfMonth, endOfMonth, eachDayOfInterval, subMonths, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Event = {
  id: number;
  title: string;
  start: Date;
  end: Date;
};

const WeeklyCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events] = useState<Event[]>([
    { id: 1, title: 'Réunion d\'équipe', start: addHours(new Date(), 2), end: addHours(new Date(), 3) },
    { id: 2, title: 'Déjeuner client', start: addHours(addDays(new Date(), 1), 4), end: addHours(addDays(new Date(), 1), 5) },
    { id: 3, title: 'Présentation projet', start: addHours(addDays(new Date(), 2), 1), end: addHours(addDays(new Date(), 2), 3) },
  ]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventForDateAndHour = (date: Date, hour: number) => {
    return events.find(event =>
      isSameDay(event.start, date) &&
      event.start.getHours() <= hour &&
      event.end.getHours() > hour
    );
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

  return (
    <div className="flex bg-white shadow-lg rounded-lg overflow-hidden">

      <div className="flex-grow">
        <div className="flex justify-between items-center p-4 bg-gray-50">
          <button onClick={() => navigateWeek('prev')} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-semibold">
            {format(weekStart, 'd MMMM', { locale: fr })} - {format(addDays(weekStart, 6), 'd MMMM yyyy', { locale: fr })}
          </h2>
          <button onClick={() => navigateWeek('next')} className="p-2 rounded-full hover:bg-gray-200">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-8 gap-px bg-gray-200">
              <div className="col-span-1 bg-white"></div>
              {weekDays.map((day, index) => (
                <div key={index} className="text-center font-semibold p-2 bg-white">
                  <div className="text-sm text-gray-600">{format(day, 'EEE', { locale: fr })}</div>
                  <div className={`text-lg ${isSameDay(day, new Date()) ? 'text-blue-600' : ''}`}>
                    {format(day, 'd', { locale: fr })}
                  </div>
                </div>
              ))}
              {hours.map((hour) => (
                <React.Fragment key={hour}>
                  <div className="text-right pr-2 py-2 text-sm text-gray-600 bg-white">
                    {hour}:00
                  </div>
                  {weekDays.map((day, dayIndex) => (
                    <div key={`${hour}-${dayIndex}`} className="border-t border-gray-100 p-1 relative h-12 bg-white">
                      {getEventForDateAndHour(day, hour) && (
                        <div className="absolute inset-0 m-1 bg-blue-100 rounded p-1 text-xs overflow-hidden">
                          <div className="font-semibold text-blue-800">
                            {getEventForDateAndHour(day, hour)?.title}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="w-64 p-4 border-r">
        <div className="flex justify-between items-center mb-4">
          <button onClick={() => navigateMonth('prev')} className="p-1 rounded-full hover:bg-gray-200">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy', { locale: fr })}
          </div>
          <button onClick={() => navigateMonth('next')} className="p-1 rounded-full hover:bg-gray-200">
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
              className={`text-center p-1 text-sm rounded-full
                ${isSameDay(day, currentDate) ? 'bg-blue-500 text-white' : ''}
                ${isSameDay(day, new Date()) ? 'font-bold' : ''}
                ${day.getMonth() !== currentMonth.getMonth() ? 'text-gray-300' : ''}
                hover:bg-gray-100`}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeeklyCalendar;