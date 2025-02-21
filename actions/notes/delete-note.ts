// actions/notes/delete-note.ts
"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const DeleteNoteSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
});

export const deleteNote = async (values: z.infer<typeof DeleteNoteSchema>) => {
  try {
    const user = await currentUser();
    if (!user) {
      throw new Error("Unauthorized");
    }

    const validatedFields = DeleteNoteSchema.safeParse(values);
    if (!validatedFields.success) {
      return { error: "Invalid fields" };
    }

    const { id, workspaceId } = validatedFields.data;

    await db.note.delete({
      where: { id },
    });

    revalidatePath(`/${workspaceId}/notes`);
    return { success: "Note deleted" };
  } catch (error: any) {
    return { error: `Failed to delete note: ${error.message}` };
  }
};
