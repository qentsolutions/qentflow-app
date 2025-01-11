"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWithinInterval, differenceInDays } from "date-fns";
import { useCardModal } from "@/hooks/use-card-modal";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TimelineViewProps {
  boardId: string;
  data: any[];
}

const MONTHS_TO_SHOW = 6;
const DAY_WIDTH = 40; // Width of each day column in pixels

export const TimelineView = ({ data, boardId }: TimelineViewProps) => {
  const cardModal = useCardModal();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const cardsWithDates = data.flatMap(list => 
    list.cards.filter((card: any) => card.startDate && card.dueDate)
  );

  const months = Array.from({ length: MONTHS_TO_SHOW }, (_, i) => addMonths(currentDate, i));
  const allDays = months.flatMap(month => 
    eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  );

  const timelineWidth = allDays.length * DAY_WIDTH;

  const calculatePosition = (date: Date) => {
    const dayIndex = differenceInDays(date, allDays[0]);
    return dayIndex * DAY_WIDTH;
  };

  const calculateWidth = (startDate: Date, endDate: Date) => {
    const days = differenceInDays(endDate, startDate) + 1;
    return days * DAY_WIDTH;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    setCurrentDate(prevDate => addMonths(prevDate, direction === 'left' ? -1 : 1));
  };

  return (
    <Card className="p-6 overflow-hidden">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Timeline View</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => handleScroll('left')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="relative overflow-x-auto" ref={containerRef}>
        <div style={{ width: `50px` }}>
          {/* Months header */}
          <div className="flex border-b mb-4">
            {months.map((month, index) => (
              <div
                key={month.toISOString()}
                className="flex-none text-center font-semibold py-2"
                style={{ width: `${DAY_WIDTH * eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }).length}px` }}
              >
                {format(month, "MMMM yyyy")}
              </div>
            ))}
          </div>

          {/* Days header */}
          <div className="flex border-b mb-4">
            {allDays.map((day, index) => (
              <div
                key={day.toISOString()}
                className={`flex-none text-center text-sm py-2 ${
                  isSameDay(day, new Date()) ? "bg-blue-50 font-bold" : ""
                }`}
                style={{ width: `${DAY_WIDTH}px` }}
              >
                {format(day, "d")}
              </div>
            ))}
          </div>

          {/* Timeline bars */}
          <div className="space-y-4">
            {cardsWithDates.map((card: any) => {
              const startDate = new Date(card.startDate);
              const endDate = new Date(card.dueDate);
              
              const left = calculatePosition(startDate);
              const width = calculateWidth(startDate, endDate);

              return (
                <motion.div 
                  key={card.id} 
                  className="relative h-12"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="absolute h-8 rounded-full cursor-pointer transition-all hover:opacity-90 hover:shadow-lg"
                    style={{
                      left: `${left}px`,
                      width: `${width}px`,
                      backgroundColor: card.color || "#3b82f6",
                    }}
                    onClick={() => cardModal.onOpen(card.id)}
                  >
                    <div className="px-3 py-1 text-white text-sm truncate font-medium">
                      {card.title}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

