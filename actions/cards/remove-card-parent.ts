"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const RemoveCardParentSchema = z.object({
  cardId: z.string(),
  workspaceId: z.string(),
  boardId: z.string(),
});

type InputType = z.infer<typeof RemoveCardParentSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { cardId, workspaceId, boardId } = data;

  try {
    // Update the child card to remove the parent reference
    await db.card.update({
      where: { id: cardId },
      data: { parentId: null },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: { message: "Parent relationship removed successfully" } };
  } catch (error) {
    console.error("[REMOVE_CARD_PARENT_ERROR]", error);
    return { error: "Failed to remove parent relationship" };
  }
};

export const removeCardParent = createSafeAction(
  RemoveCardParentSchema,
  handler
);
