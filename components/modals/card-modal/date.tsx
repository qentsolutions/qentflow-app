"use client";

import React, { useState } from "react";
import { CardWithList } from "@/types";
import { updateCard } from "@/actions/tasks/update-card";
import { useParams } from "next/navigation";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { RangeCalendar } from "@/components/ui/calendar-rac";
import { fromDate, getLocalTimeZone, today } from "@internationalized/date";
import type { DateRange } from "react-aria-components";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

interface DateManagerProps {
    card: CardWithList;
    readonly?: boolean;
}

const DateComponent: React.FC<DateManagerProps> = ({ card, readonly = false }) => {
    const params = useParams();
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();
    const now = today(getLocalTimeZone());

    const [dateRange, setDateRange] = useState<DateRange | null>({
        start: card.startDate ? fromDate(new Date(card.startDate), getLocalTimeZone()) : now,
        end: card.dueDate ? fromDate(new Date(card.dueDate), getLocalTimeZone()) : now,
    });

    const updateDates = async (startDate: Date | null = null, dueDate: Date | null = null) => {
        // Validation : dueDate >= startDate
        if (startDate && dueDate && dueDate < startDate) {
            toast.error("Due date cannot be earlier than the start date.");
            return;
        }

        try {
            const result = await updateCard({
                id: card.id,
                boardId: params.boardId as string,
                workspaceId: currentWorkspace?.id as string,
                ...(startDate && { startDate: startDate.toISOString() }),
                ...(dueDate && { dueDate: dueDate.toISOString() }),
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            queryClient.invalidateQueries({
                queryKey: ["card", card.id],
            });

            toast.success("Card dates updated");
        } catch (error) {
            toast.error("Failed to update dates");
        }
    };

    const handleDateChange = (newDateRange: DateRange | null) => {
        setDateRange(newDateRange);
        if (newDateRange) {
            updateDates(
                newDateRange.start ? newDateRange.start.toDate(getLocalTimeZone()) : null,
                newDateRange.end ? newDateRange.end.toDate(getLocalTimeZone()) : null
            );
        }
    };

    const formatDate = (date: Date | null | undefined) => {
        if (!date) return "";
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
    };

    return (
        <Card className="w-full shadow-none mt-4">
            <CardContent>
                <div className="space-y-2 pt-4">
                    <div className="flex items-center gap-x-2">
                        <Calendar size={20} />
                        <p className="text-lg font-semibold">Start/Due Date</p>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex w-full">
                            <Button variant={"outline"} className="w-full text-xs">
                                {formatDate(dateRange?.start?.toDate(getLocalTimeZone()) ?? null)} - {formatDate(dateRange?.end?.toDate(getLocalTimeZone()) ?? null)}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="z-50">
                            <div className="gap-4 flex flex-col">
                                <RangeCalendar
                                    className="rounded-lg border border-border p-2 bg-background"
                                    value={dateRange}
                                    onChange={handleDateChange}
                                    isDisabled={readonly}
                                />
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
};

export default DateComponent;
