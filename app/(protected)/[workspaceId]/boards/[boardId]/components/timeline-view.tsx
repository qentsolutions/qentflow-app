"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays, subMonths } from "date-fns";
import { useCardModal } from "@/hooks/use-card-modal";
import { motion } from "framer-motion";
import { ChartGantt, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { fr } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TimelineViewProps {
  boardId: string;
  data: any[];
}

const MONTHS_TO_SHOW = 3; // Afficher 3 mois à la fois
const DAY_WIDTH = 45; // Augmenter la largeur des jours

export const TimelineView = ({ data, boardId }: TimelineViewProps) => {
  const cardModal = useCardModal();
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const months = Array.from({ length: MONTHS_TO_SHOW }, (_, i) => addMonths(currentDate, i));
  const allDays = months.flatMap(month =>
    eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  );

  const calculatePosition = (date: Date) => {
    const dayIndex = differenceInDays(date, allDays[0]);
    return dayIndex * DAY_WIDTH;
  };

  const calculateWidth = (startDate: Date, endDate: Date) => {
    const days = differenceInDays(endDate, startDate) + 1;
    return days * DAY_WIDTH;
  };

  const handleScroll = (direction: 'left' | 'right') => {
    setCurrentDate(prevDate =>
      direction === 'left' ? subMonths(prevDate, 1) : addMonths(prevDate, 1)
    );
  };

  // Scroll to current date on initial load
  useEffect(() => {
    if (scrollContainerRef.current) {
      const today = new Date();
      const scrollPosition = calculatePosition(today);
      scrollContainerRef.current.scrollLeft = scrollPosition - (scrollContainerRef.current.clientWidth / 2);
    }
  }, []);

  return (
    <div>
      <Card className="mt-4 bg-white border-none dark:bg-gray-800 shadow-none">
        <ScrollArea className="relative border rounded-lg bg-white dark:bg-gray-800">
          <div className="overflow-x-auto" ref={scrollContainerRef}>
            <div style={{ width: `${DAY_WIDTH}px`, minWidth: '100%' }}>
              {/* En-tête des mois */}
              <div className="flex border-b dark:border-gray-700">
                {months.map((month) => {
                  const daysInMonth = eachDayOfInterval({
                    start: startOfMonth(month),
                    end: endOfMonth(month)
                  });
                  return (
                    <div
                      key={month.toISOString()}
                      className="flex-none text-center font-semibold py-3 border-r dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                      style={{ width: `${daysInMonth.length * DAY_WIDTH}px` }}
                    >
                      {format(month, 'MMMM yyyy', { locale: fr })}
                    </div>
                  );
                })}
              </div>

              {/* En-tête des jours */}
              <div className="flex border-b dark:border-gray-700">
                {allDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`
                    flex-none text-center py-2 border-r dark:border-gray-700
                    ${isSameDay(day, new Date()) ?
                        'bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-600 dark:text-blue-400' :
                        'text-gray-600 dark:text-gray-400'}
                  `}
                    style={{ width: `${DAY_WIDTH}px` }}
                  >
                    <div className="text-xs mb-1">{format(day, 'EEE', { locale: fr })}</div>
                    <div className="text-sm font-medium">{format(day, 'd')}</div>
                  </div>
                ))}
              </div>

              {/* Section des cartes */}
              <div className="relative">
                {data.map((list: any, listIndex: number) => (
                  <div
                    key={list.id}
                    className={`
                    relative py-4 border-b dark:border-gray-700
                    ${listIndex % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-900/30' : ''}
                  `}
                  >
                    <div className="absolute left-4 top-4 font-medium text-gray-700 dark:text-gray-300">
                      {list.title}
                    </div>
                    <div className="relative h-12 mx-4 mt-8">
                      {list.cards
                        .filter((card: any) => card.startDate && card.dueDate)
                        .map((card: any) => {
                          const startDate = new Date(card.startDate);
                          const endDate = new Date(card.dueDate);
                          const left = calculatePosition(startDate);
                          const width = calculateWidth(startDate, endDate);

                          return (
                            <motion.div
                              key={card.id}
                              className="absolute h-8 rounded-md cursor-pointer transition-all hover:opacity-90 hover:shadow-lg"
                              style={{
                                left: `${left}px`,
                                width: `${width}px`,
                                top: '0',
                                backgroundColor: card.priority === 'HIGH' ? '#ef4444' :
                                  card.priority === 'MEDIUM' ? '#f59e0b' :
                                    card.priority === 'LOW' ? '#10b981' : '#3b82f6',
                              }}
                              onClick={() => cardModal.onOpen(card.id)}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div className="px-3 py-1 text-white text-sm truncate font-medium">
                                {card.title}
                              </div>
                            </motion.div>
                          );
                        })}
                    </div>
                  </div>
                ))}

                {/* Ligne du temps actuel */}
                {allDays.some(day => isSameDay(day, new Date())) && (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-50"
                    style={{
                      left: `${calculatePosition(new Date())}px`,
                    }}
                  >
                    <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-red-500" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </Card>
      <div className=" flex items-center justify-between mt-8 mr-4">
        <div className="flex items-center gap-4">
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => handleScroll('left')}
            variant="outline"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="text-lg font-medium px-4">
            {format(currentDate, 'MMMM yyyy', { locale: fr })}
          </span>
          <Button
            onClick={() => handleScroll('right')}
            variant="outline"
            size="icon"
            className="rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>

  );
};