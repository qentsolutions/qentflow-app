"use client"

import { useEffect, useRef, useState } from "react"
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"
import { motion } from "framer-motion"
import { useCardModal } from "@/hooks/use-card-modal"
import { Card } from "@/components/ui/card"

interface TimelineViewProps {
  boardId: string
  data: any[]
}

const MONTHS_TO_SHOW = 12
const DAY_WIDTH = 45
const LIST_TITLE_WIDTH = 200
const CARD_HEIGHT = 40
const CARD_GAP = 8

export const TimelineView = ({ data, boardId }: TimelineViewProps) => {
  const cardModal = useCardModal()
  const [currentDate] = useState(new Date())
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const months = Array.from({ length: MONTHS_TO_SHOW }, (_, i) => addMonths(currentDate, i - 6))
  const allDays = months.flatMap((month) => eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) }))

  const calculatePosition = (date: Date) => {
    const dayIndex = differenceInDays(date, allDays[0])
    return dayIndex * DAY_WIDTH
  }

  const calculateWidth = (startDate: Date, endDate: Date) => {
    const days = differenceInDays(endDate, startDate) + 1
    return days * DAY_WIDTH
  }

  useEffect(() => {
    if (scrollContainerRef.current) {
      const today = new Date()
      const scrollPosition = calculatePosition(today)
      scrollContainerRef.current.scrollLeft =
        scrollPosition - scrollContainerRef.current.clientWidth / 2 + LIST_TITLE_WIDTH
    }
  }, [scrollContainerRef]) // Added dependencies to useEffect

  return (
    <div className="space-y-4 py-2 max-w-[calc(100vw-20vw)] mx-auto">
      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl overflow-hidden">
        <div className="relative">
          {/* Fixed column for list titles */}
          <div className="absolute left-0 top-0 bottom-0 w-[200px] bg-white dark:bg-gray-800 z-20 border-r dark:border-gray-700">
            <div className="h-[88px] bg-gray-100 dark:bg-gray-900"></div>
            {data.map((list: any, listIndex: number) => (
              <div
                key={list.id}
                className={`h-[200px] flex items-center px-4 ${listIndex % 2 === 0 ? "bg-gray-50 dark:bg-gray-900/50" : ""
                  }`}
              >
                <span className="font-medium text-gray-700 dark:text-gray-300">{list.title}</span>
              </div>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="overflow-x-auto ml-[200px]" ref={scrollContainerRef}>
            <div style={{ width: `${allDays.length * DAY_WIDTH}px`, minWidth: "calc(100% - 200px)" }}>
              {/* Month headers */}
              <div className="flex sticky top-0 z-10 bg-gray-100 dark:bg-gray-900 shadow-sm">
                {months.map((month) => {
                  const daysInMonth = eachDayOfInterval({
                    start: startOfMonth(month),
                    end: endOfMonth(month),
                  })
                  return (
                    <div
                      key={month.toISOString()}
                      className="flex-none text-center font-semibold py-3 border-b border-r dark:border-gray-700"
                      style={{ width: `${daysInMonth.length * DAY_WIDTH}px` }}
                    >
                      {format(month, "MMMM yyyy", { locale: fr })}
                    </div>
                  )
                })}
              </div>

              {/* Day headers */}
              <div className="flex sticky top-[44px] z-10 bg-white dark:bg-gray-800 shadow-sm">
                {allDays.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={`
                      flex-none text-center py-2 border-r dark:border-gray-700
                      ${isSameDay(day, new Date())
                        ? "bg-blue-50 dark:bg-blue-900/20 font-bold text-blue-600 dark:text-blue-400"
                        : "text-gray-600 dark:text-gray-400"
                      }
                    `}
                    style={{ width: `${DAY_WIDTH}px` }}
                  >
                    <div className="text-xs mb-1">{format(day, "EEE", { locale: fr })}</div>
                    <div className="text-sm font-medium">{format(day, "d")}</div>
                  </div>
                ))}
              </div>

              {/* Cards section */}
              <div className="relative">
                {data.map((list: any, listIndex: number) => (
                  <div
                    key={list.id}
                    className={`
                      relative py-4 border-b dark:border-gray-700 h-[200px]
                      ${listIndex % 2 === 0 ? "bg-gray-50/50 dark:bg-gray-900/30" : ""}
                    `}
                  >
                    <div className="relative h-full mx-4">
                      {list.cards
                        .filter((card: any) => card.startDate && card.dueDate)
                        .map((card: any, cardIndex: number) => {
                          const startDate = new Date(card.startDate)
                          const endDate = new Date(card.dueDate)
                          const left = calculatePosition(startDate)
                          const width = calculateWidth(startDate, endDate)

                          return (
                            <motion.div
                              key={card.id}
                              className="absolute rounded-lg cursor-pointer transition-all hover:opacity-90 hover:shadow-lg"
                              style={{
                                left: `${left}px`,
                                width: `${width}px`,
                                top: `${cardIndex * (CARD_HEIGHT + CARD_GAP)}px`,
                                height: `${CARD_HEIGHT}px`,
                                backgroundColor:
                                  card.priority === "HIGH"
                                    ? "#ef4444"
                                    : card.priority === "MEDIUM"
                                      ? "#f59e0b"
                                      : card.priority === "LOW"
                                        ? "#10b981"
                                        : "#3b82f6",
                              }}
                              onClick={() => cardModal.onOpen(card.id)}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: cardIndex * 0.05 }}
                            >
                              <div className="px-3 py-2 text-white text-sm truncate font-medium">{card.title}</div>
                            </motion.div>
                          )
                        })}
                    </div>
                  </div>
                ))}

                {/* Current time line */}
                {allDays.some((day) => isSameDay(day, new Date())) && (
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
        </div>
      </Card>
    </div>
  )
}

