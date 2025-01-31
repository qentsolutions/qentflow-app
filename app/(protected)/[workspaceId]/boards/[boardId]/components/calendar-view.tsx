"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    parseISO,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { motion } from "framer-motion"
import { useCardModal } from "@/hooks/use-card-modal"

interface CalendarViewProps {
    boardId: string
    data: any[]
}

export const CalendarView = ({ data, boardId }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const cardModal = useCardModal()

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    const startDay = monthStart.getDay()
    const endDay = 6 - monthEnd.getDay()

    const prevMonthDays = eachDayOfInterval({
        start: subMonths(monthStart, 1),
        end: subMonths(monthStart, 1),
    }).slice(-startDay)

    const nextMonthDays = eachDayOfInterval({
        start: addMonths(monthEnd, 1),
        end: addMonths(monthEnd, 1),
    }).slice(0, endDay)

    const allDays = [...prevMonthDays, ...monthDays, ...nextMonthDays]

    const weeks = []
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7))
    }

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

    return (
        <Card className="p-4 m-4 bg-white dark:bg-gray-800 shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200">
                    {format(currentDate, "MMMM yyyy", { locale: enUS })}
                </h2>
                <div className="flex space-x-2">
                    <Button onClick={handlePrevMonth} variant="outline" size="icon" aria-label="Mois précédent">
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleNextMonth} variant="outline" size="icon" aria-label="Mois suivant">
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                    <div key={day} className="text-center font-medium text-gray-500 dark:text-gray-400">
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {weeks.map((week, weekIndex) =>
                    week.map((day, dayIndex) => {
                        const dayCards = data.flatMap((list) =>
                            list.cards.filter((card: any) => {
                                const cardDate = typeof card.startDate === "string" ? parseISO(card.startDate) : new Date(card.startDate);
                                return isSameDay(cardDate, day)
                            }),
                        )

                        return (
                            <div
                                key={day.toString()}
                                className={`
                  h-24 p-1 border border-gray-200 dark:border-gray-700 
                  ${!isSameMonth(day, currentDate) ? "bg-gray-100 dark:bg-gray-800" : "bg-white dark:bg-gray-900"}
                  ${isSameDay(day, new Date()) ? "ring-2 ring-blue-500" : ""}
                `}
                            >
                                <div className="text-right">
                                    <span
                                        className={`
                    text-sm ${!isSameMonth(day, currentDate) ? "text-gray-400 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}
                    ${isSameDay(day, new Date()) ? "font-bold text-blue-500" : ""}
                  `}
                                    >
                                        {format(day, "d")}
                                    </span>
                                </div>
                                <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-1.5rem)]">
                                    {dayCards.map((card: any) => (
                                        <motion.div
                                            key={card.id}
                                            className="text-xs p-1 rounded cursor-pointer truncate"
                                            style={{
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
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <span className="text-white">{card.title}</span>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    }),
                )}
            </div>
        </Card>
    )
}

