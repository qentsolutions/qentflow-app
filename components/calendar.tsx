"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from "@/lib/utils"

export interface CalendarProps {
    mode?: "single" | "range";
    selected?: Date;
    onSelect?: (date: Date | undefined) => void;
    initialFocus?: boolean;
}

function Calendar({
    mode = "single",
    selected,
    onSelect,
    initialFocus,
}: CalendarProps) {
    const [currentMonth, setCurrentMonth] = React.useState(new Date())
    const [currentDate, setCurrentDate] = React.useState(selected || new Date())

    const monthDays = React.useMemo(() => {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        return eachDayOfInterval({ start, end })
    }, [currentMonth])

    const navigateMonth = (direction: 'prev' | 'next') => {
        setCurrentMonth(direction === 'prev' ? subMonths(currentMonth, 1) : addMonths(currentMonth, 1))
    }

    const selectDate = (date: Date) => {
        setCurrentDate(date)
        onSelect?.(date)
    }

    return (
        <div className="p-3">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                    <button 
                        onClick={() => navigateMonth('prev')} 
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <div className="text-lg font-semibold">
                        {format(currentMonth, 'MMMM yyyy', { locale: fr })}
                    </div>
                    <button 
                        onClick={() => navigateMonth('next')} 
                        className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
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
            </div>
        </div>
    )
}

Calendar.displayName = "Calendar"

export { Calendar }