"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { createCalendarEvent } from "@/actions/calendar/create-event";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";

const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    startDate: z.string(),
    endDate: z.string(),
    isAllDay: z.boolean().default(false),
    cardId: z.string().optional(),
    color: z.string().optional(),
});

interface CreateEventDialogProps {
    open: boolean;
    onClose: () => void;
}

const COLORS = [
    { value: "#2563eb", label: "Blue" },
    { value: "#16a34a", label: "Green" },
    { value: "#dc2626", label: "Red" },
    { value: "#ca8a04", label: "Yellow" },
    { value: "#9333ea", label: "Purple" },
];

const CreateEventDialog = ({ open, onClose }: CreateEventDialogProps) => {
    const { currentWorkspace } = useCurrentWorkspace();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            description: "",
            startDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            endDate: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
            isAllDay: false,
            color: "#2563eb",
        },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!currentWorkspace?.id) return;

        setIsSubmitting(true);
        try {
            const result = await createCalendarEvent({
                ...values,
                workspaceId: currentWorkspace.id,
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            if (result.success) {
                toast.success(result.success);
                queryClient.invalidateQueries({
                    queryKey: ["calendar-events", currentWorkspace.id],
                });
                onClose();
                form.reset();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSubmitting(false);
        }
    };

    const { data: userCards } = useQuery({
        queryKey: ["user-cards", currentWorkspace?.id],
        queryFn: () => fetcher(`/api/boards/current-user-card?workspaceId=${currentWorkspace?.id}`),
    });


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New Event</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Event title" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} placeholder="Event description" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center">
                                                <Input
                                                    {...field}
                                                    type="datetime-local"
                                                    className="w-full"
                                                />
                                                <CalendarIcon className="w-4 h-4 -ml-8 text-gray-500" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End</FormLabel>
                                        <FormControl>
                                            <div className="flex items-center">
                                                <Input
                                                    {...field}
                                                    type="datetime-local"
                                                    className="w-full"
                                                />
                                                <CalendarIcon className="w-4 h-4 -ml-8 text-gray-500" />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="isAllDay"
                            render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-3">
                                    <div className="space-y-0.5">
                                        <FormLabel>All Day</FormLabel>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cardId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Link to Card (optional)</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a card" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {userCards.map((card: any) => (
                                                <SelectItem key={card.id} value={card.id}>
                                                    <div className="flex flex-col">
                                                        <span>{card.title}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {card.list?.board?.title} - {card.list?.title}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>

                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full"
                                                            style={{ backgroundColor: field.value }}
                                                        />
                                                        <span>
                                                            {
                                                                COLORS.find((c) => c.value === field.value)
                                                                    ?.label
                                                            }
                                                        </span>
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {COLORS.map((color) => (
                                                <SelectItem key={color.value} value={color.value}>
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full"
                                                            style={{ backgroundColor: color.value }}
                                                        />
                                                        <span>{color.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                Create Event
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateEventDialog;