"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const RemoveChildCardsSchema = z.object({
  parentCardId: z.string(),
  workspaceId: z.string(),
  boardId: z.string(),
});

type InputType = z.infer<typeof RemoveChildCardsSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { parentCardId, workspaceId, boardId } = data;

  try {
    // Update all child cards to remove the parent reference
    await db.card.updateMany({
      where: { parentId: parentCardId },
      data: { parentId: null },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: { message: "Child relationships removed successfully" } };
  } catch (error) {
    console.error("[REMOVE_CHILD_CARDS_ERROR]", error);
    return { error: "Failed to remove child relationships" };
  }
};

export const removeChildCards = createSafeAction(
  RemoveChildCardsSchema,
  handler
);
