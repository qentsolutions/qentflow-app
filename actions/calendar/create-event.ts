"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string(),
  isAllDay: z.boolean().default(false),
  cardId: z.string().optional(),
  color: z.string().optional(),
  workspaceId: z.string()
});

export const createCalendarEvent = async (values: z.infer<typeof CreateEventSchema>) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = CreateEventSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { title, description, startDate, endDate, isAllDay, cardId, color, workspaceId } = validatedFields.data;

    const event = await db.calendarEvent.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        isAllDay,
        color,
        cardId: "51ba059b-3ca4-4138-a85a-ee1662fd87ee",
        userId: user.id,
        workspaceId
      }
    });

    revalidatePath(`/${workspaceId}/calendar`);
    return { success: "Event created", event };
  } catch (error) {
    return { error: `Failed to create event ${error}` };
  }
};