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
    getDay,
    addDays,
    subDays,
    isWithinInterval,
} from "date-fns"
import { enUS } from "date-fns/locale"
import { motion } from "framer-motion"
import { useCardModal } from "@/hooks/use-card-modal"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface CalendarViewProps {
    boardId: string
    data: any[]
}

export const CalendarView = ({ data, boardId }: CalendarViewProps) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [expandedDays, setExpandedDays] = useState<string[]>([])
    const cardModal = useCardModal()

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

    // Calculer le premier jour du mois (0 = dimanche, 1 = lundi, etc.)
    const firstDayOfMonth = getDay(monthStart)

    // Ajuster pour commencer par lundi (1) au lieu de dimanche (0)
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1

    // Calculer les jours du mois précédent
    const prevMonthDays = Array.from({ length: startDay }, (_, i) =>
        subDays(monthStart, startDay - i)
    )

    // Calculer les jours du mois suivant
    const remainingDays = (7 - ((monthDays.length + startDay) % 7)) % 7
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) =>
        addDays(monthEnd, i + 1)
    )

    const allDays = [...prevMonthDays, ...monthDays, ...nextMonthDays]

    const weeks = []
    for (let i = 0; i < allDays.length; i += 7) {
        weeks.push(allDays.slice(i, i + 7))
    }

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1))
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1))

    const toggleExpandDay = (day: string) => {
        setExpandedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        )
    }

    return (
        <Card className="p-1 m-1 bg-white dark:bg-gray-800 shadow-none border-none">
            <div className="flex justify-end gap-x-4 items-center mb-4 mr-2">
                <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    {format(currentDate, "MMMM yyyy", { locale: enUS })}
                </p>
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
            <ScrollArea className="h-[72vh]">
                <div className="grid grid-cols-7 gap-1 p-1">
                    {weeks.map((week, weekIndex) =>
                        week.map((day, dayIndex) => {
                            const dayCards = data.flatMap((list) =>
                                list.cards.filter((card: any) => {
                                    const cardStartDate = typeof card.startDate === "string" ? parseISO(card.startDate) : new Date(card.startDate);
                                    const cardDueDate = typeof card.dueDate === "string" ? parseISO(card.dueDate) : new Date(card.dueDate);
                                    return isWithinInterval(day, { start: cardStartDate, end: cardDueDate })
                                }),
                            )

                            const isExpanded = expandedDays.includes(day.toString())
                            const visibleCards = isExpanded ? dayCards : dayCards.slice(0, 2)
                            const hasMoreCards = dayCards.length > 2

                            return (
                                <div
                                    key={day.toString()}
                                    className={`
                                    min-h-36 p-1 border border-gray-200 dark:border-gray-700
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
                                    <div className="mt-1 space-y-2">
                                        {visibleCards.map((card: any) => (
                                            <motion.div
                                                key={card.id}
                                                className="text-xs rounded cursor-pointer truncate relative w-full"
                                                onClick={() => cardModal.onOpen(card.id)}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                {/* Indicator Strip (bande colorée à gauche) */}
                                                <div
                                                    className="absolute top-0 left-0 h-full w-1 rounded-l-md"
                                                    style={{
                                                        backgroundColor:
                                                            card.priority === "HIGH"
                                                                ? "#ef4444"
                                                                : card.priority === "MEDIUM"
                                                                    ? "#f59e0b"
                                                                    : card.priority === "LOW"
                                                                        ? "#10b981"
                                                                        : "",
                                                    }}
                                                ></div>

                                                {/* Contenu du card avec padding à gauche pour ne pas toucher le trait */}
                                                <div className="pl-2 truncate">
                                                    <span className="font-semibold">{card.title}</span>
                                                </div>
                                            </motion.div>
                                        ))}



                                        {hasMoreCards && !isExpanded && (
                                            <div
                                                className="text-xs text-gray-500 cursor-pointer"
                                                onClick={() => toggleExpandDay(day.toString())}
                                            >
                                                +{dayCards.length - 2} more
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        }),
                    )}
                </div>
            </ScrollArea>

        </Card >
    )
}
