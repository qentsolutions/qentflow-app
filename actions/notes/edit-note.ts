"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const EditNoteSchema = z.object({
  title: z.string().optional(), // Rendre le titre optionnel
  content: z.string().optional(),
  workspaceId: z.string(),
  cardId: z.string().optional(),
});

export const editNote = async (
  noteId: string,
  values: z.infer<typeof EditNoteSchema>
) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = EditNoteSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { title, content, workspaceId, cardId } = validatedFields.data;

    const note = await db.note.update({
      where: { id: noteId },
      data: {
        title,
        content,
        workspaceId,
        cardId,
      },
    });

    revalidatePath(`/${workspaceId}/notes`);
    return { success: "Note updated", note };
  } catch (error: any) {
    return { error: `Failed to update note: ${error.message}` };
  }
};
