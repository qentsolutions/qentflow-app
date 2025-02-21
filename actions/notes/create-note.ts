// actions/notes/create-note.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const CreateNoteSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  workspaceId: z.string(),
  cardId: z.string().optional(),
});

export const createNote = async (values: z.infer<typeof CreateNoteSchema>) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = CreateNoteSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { title, content, workspaceId, cardId } = validatedFields.data;

    const note = await db.note.create({
      data: {
        title,
        content,
        createdById: user.id,
        workspaceId,
        cardId,
      },
    });

    revalidatePath(`/${workspaceId}/notes`);
    return { success: "Note created", note };
  } catch (error: any) {
    return { error: `Failed to create note: ${error.message}` };
  }
};
