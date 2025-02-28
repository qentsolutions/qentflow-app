"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import {
  format,
  addMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  differenceInDays,
  isWeekend,
} from "date-fns"
import { fr } from "date-fns/locale"
import { motion } from "framer-motion"
import { useCardModal } from "@/hooks/use-card-modal"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface TimelineViewProps {
  boardId: string
  data: any[]
}

const MONTHS_TO_SHOW = 6
const DAY_WIDTH = 30 // Reduced from 45px to make it thinner
const LIST_TITLE_WIDTH = 180
const CARD_HEIGHT = 32 // Reduced from 40px
const CARD_GAP = 6 // Reduced from 8px

export const TimelineView = ({ data, boardId }: TimelineViewProps) => {
  const cardModal = useCardModal()
  const [currentDate] = useState(new Date())
  const [viewStartMonth, setViewStartMonth] = useState(-2) // Start 2 months before current
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const months = Array.from({ length: MONTHS_TO_SHOW }, (_, i) => addMonths(currentDate, i + viewStartMonth))
  const allDays = months.flatMap((month) => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }))

  const calculatePosition = (date: Date) => {
    const dayIndex = differenceInDays(date, allDays[0])
    return dayIndex * DAY_WIDTH
  }

  const calculateWidth = (startDate: Date, endDate: Date) => {
    const days = differenceInDays(endDate, startDate) + 1
    return days * DAY_WIDTH
  }

  const scrollToToday = useCallback(() => {
    if (scrollContainerRef.current) {
      const today = new Date()
      const scrollPosition = calculatePosition(today)
      scrollContainerRef.current.scrollLeft =
        scrollPosition - scrollContainerRef.current.clientWidth / 2 + LIST_TITLE_WIDTH
    }
  }, [calculatePosition, LIST_TITLE_WIDTH])

  useEffect(() => {
    scrollToToday()
  }, [scrollToToday])

  const navigateTimeline = (direction: "left" | "right") => {
    setViewStartMonth((prev) => prev + (direction === "left" ? -1 : 1))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "from-rose-500 to-rose-600"
      case "MEDIUM":
        return "from-amber-500 to-amber-600"
      case "LOW":
        return "from-emerald-500 to-emerald-600"
      default:
        return "from-blue-500 to-blue-600"
    }
  }

  return (
    <div className="space-y-4 py-2 max-w-[calc(100vw-16vw)] mx-auto">
      <Card className="bg-white dark:bg-gray-900 shadow-md rounded-xl overflow-hidden border-0">
        {/* Timeline controls */}
        <div className="flex items-center justify-between px-4 py-2 border-b dark:border-gray-800">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTimeline("left")}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => navigateTimeline("right")}
              className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronRightIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={scrollToToday}
              className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              Today
            </button>
          </div>
          <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {format(months[0], "MMMM yyyy", { locale: fr })} -{" "}
            {format(months[months.length - 1], "MMMM yyyy", { locale: fr })}
          </div>
        </div>

        <div className="relative">
          {/* Fixed column for list titles */}
          <div className="absolute left-0 top-0 bottom-0 w-[180px] bg-white dark:bg-gray-900 z-20 border-r dark:border-gray-800 shadow-sm">
            <div className="h-[72px] bg-gray-50 dark:bg-gray-800/50 flex items-end border-b dark:border-gray-800">
              <div className="px-4 pb-2 font-medium text-sm text-gray-500 dark:text-gray-400">Projets</div>
            </div>
            {data.map((list: any, listIndex: number) => (
              <div
                key={list.id}
                className={`h-[160px] flex items-center px-4 ${listIndex % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""
                  }`}
              >
                <span className="font-medium text-sm text-gray-700 dark:text-gray-300">{list.title}</span>
              </div>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="overflow-x-auto ml-[180px] scrollbar-thin" ref={scrollContainerRef}>
            <div style={{ width: `${allDays.length * DAY_WIDTH}px`, minWidth: "calc(100% - 180px)" }}>
              {/* Month headers */}
              <div className="flex sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/50 border-b dark:border-gray-800">
                {months.map((month) => {
                  const daysInMonth = eachDayOfInterval({
                    start: startOfMonth(month),
                    end: endOfMonth(month),
                  })
                  return (
                    <div
                      key={month.toISOString()}
                      className="flex-none text-center font-medium text-sm py-2.5 border-r dark:border-gray-800 text-gray-600 dark:text-gray-400"
                      style={{ width: `${daysInMonth.length * DAY_WIDTH}px` }}
                    >
                      {format(month, "MMMM yyyy", { locale: fr })}
                    </div>
                  )
                })}
              </div>

              {/* Day headers */}
              <div className="flex sticky top-[44px] z-10 bg-white dark:bg-gray-900 border-b dark:border-gray-800">
                {allDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`
                      flex-none text-center py-1.5 border-r dark:border-gray-800
                      ${isWeekend(day) ? "bg-gray-50/70 dark:bg-gray-800/30" : ""}
                      ${isSameDay(day, new Date())
                        ? "bg-blue-50/50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-500"
                      }
                    `}
                    style={{ width: `${DAY_WIDTH}px` }}
                  >
                    <div className="text-[10px] mb-0.5 uppercase">{format(day, "EEE", { locale: fr })}</div>
                    <div className="text-xs font-medium">{format(day, "d")}</div>
                  </div>
                ))}
              </div>

              {/* Cards section */}
              <div className="relative">
                {data.map((list: any, listIndex: number) => (
                  <div
                    key={list.id}
                    className={`
                      relative py-3 border-b dark:border-gray-800 h-[160px]
                      ${listIndex % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-800/30" : ""}
                    `}
                  >
                    <div className="relative h-full mx-2">
                      <TooltipProvider>
                        {list.cards
                          .filter((card: any) => card.startDate && card.dueDate)
                          .map((card: any, cardIndex: number) => {
                            const startDate = new Date(card.startDate)
                            const endDate = new Date(card.dueDate)
                            const left = calculatePosition(startDate)
                            const width = calculateWidth(startDate, endDate)
                            const priorityColor = getPriorityColor(card.priority)

                            return (
                              <Tooltip key={card.id}>
                                <TooltipTrigger asChild>
                                  <motion.div
                                    className={`absolute rounded-md cursor-pointer transition-all hover:shadow-md hover:translate-y-[-1px] bg-gradient-to-r ${priorityColor}`}
                                    style={{
                                      left: `${left}px`,
                                      width: `${Math.max(width, 30)}px`, // Minimum width for very short tasks
                                      top: `${cardIndex * (CARD_HEIGHT + CARD_GAP)}px`,
                                      height: `${CARD_HEIGHT}px`,
                                    }}
                                    onClick={() => cardModal.onOpen(card.id)}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: cardIndex * 0.03 }}
                                  >
                                    <div className="px-2.5 py-1.5 text-white text-xs truncate font-medium h-full flex items-center">
                                      {card.title}
                                    </div>
                                  </motion.div>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="text-xs">
                                  <div className="font-medium">{card.title}</div>
                                  <div className="text-gray-400 mt-1">
                                    {format(startDate, "d MMM", { locale: fr })} -{" "}
                                    {format(endDate, "d MMM", { locale: fr })}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            )
                          })}
                      </TooltipProvider>
                    </div>
                  </div>
                ))}

                {/* Current time line */}
                {allDays.some((day) => isSameDay(day, new Date())) && (
                  <div
                    className="absolute top-0 bottom-0 w-[2px] bg-blue-500 z-30"
                    style={{
                      left: `${calculatePosition(new Date()) + DAY_WIDTH / 2}px`,
                    }}
                  >
                    <div className="absolute -top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 shadow-md" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

