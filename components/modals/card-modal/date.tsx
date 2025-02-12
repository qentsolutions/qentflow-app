"use client";

import React from "react";
import { CardWithList } from "@/types";
import { CalendarDays, Clock } from "lucide-react";
import { updateCard } from "@/actions/tasks/update-card";
import { useParams } from "next/navigation";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface DateManagerProps {
    card: CardWithList;
    readonly?: boolean;
}

const DateComponent: React.FC<DateManagerProps> = ({ card, readonly = false }) => {
    const params = useParams();
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();

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

    return (
        <Card className="w-full shadow-none mt-4">
            <CardContent>
                <div className="space-y-2 pt-4">
                    <p className="text-lg font-semibold">Dates</p>
                    <div className="gap-4 flex flex-col">
                        <div className="flex justify-between flex-col">
                            <div className="flex items-center">
                                <CalendarDays size={14} />
                                <span className="ml-1 text-sm text-muted-foreground">Start Date</span>
                            </div>
                            <input
                                type="date"
                                className="flex h-10 mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                disabled={readonly}
                                value={card.startDate ? new Date(card.startDate).toISOString().split("T")[0] : ""}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : null;
                                    updateDates(date, card.dueDate ? new Date(card.dueDate) : null);
                                }}
                            />
                        </div>

                        <div className="flex justify-between flex-col">
                            <div className="flex items-center">
                                <Clock size={14} />
                                <span className="ml-1 text-sm text-muted-foreground">Due Date</span>
                            </div>
                            <input
                                type="date"
                                className="flex mt-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={card.dueDate ? new Date(card.dueDate).toISOString().split("T")[0] : ""}
                                disabled={readonly}
                                onChange={(e) => {
                                    const date = e.target.value ? new Date(e.target.value) : null;
                                    updateDates(card.startDate ? new Date(card.startDate) : null, date);
                                }}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

    );
};

export default DateComponent;
