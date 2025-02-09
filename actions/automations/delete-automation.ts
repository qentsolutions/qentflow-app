"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const DeleteAutomationSchema = z.object({
  id: z.string(),
  workspaceId: z.string(),
  boardId: z.string().optional(),
});

const handler = async (data: z.infer<typeof DeleteAutomationSchema>) => {
  try {
    const user = await currentUser();
    if (!user) {
      return { error: "Unauthorized" };
    }

    const { id, workspaceId, boardId } = data;

    const automation = await db.automation.delete({
      where: {
        id,
        workspaceId,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: automation };
  } catch (error) {
    return { error: "Failed to delete automation." };
  }
};

export const deleteAutomation = createSafeAction(
  DeleteAutomationSchema,
  handler
);
