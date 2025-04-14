"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const SetCardParentSchema = z.object({
  cardId: z.string(),
  parentId: z.string().nullable(),
  workspaceId: z.string(),
  boardId: z.string(),
});

type InputType = z.infer<typeof SetCardParentSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { cardId, parentId, workspaceId, boardId } = data;

  try {
    // Check if setting parent would create a circular reference
    if (parentId) {
      let currentParent = await db.card.findUnique({
        where: { id: parentId },
        select: { parentId: true },
      });

      // Check if the card we're trying to set as parent is actually a child of the current card
      while (currentParent && currentParent.parentId) {
        if (currentParent.parentId === cardId) {
          return {
            error: "Cannot set a child card as parent (circular reference)",
          };
        }

        currentParent = await db.card.findUnique({
          where: { id: currentParent.parentId },
          select: { parentId: true },
        });
      }
    }

    // Update the card with the new parent
    const card = await db.card.update({
      where: { id: cardId },
      data: { parentId },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: card };
  } catch (error) {
    console.error("[SET_CARD_PARENT_ERROR]", error);
    return { error: "Failed to update card parent" };
  }
};

export const setCardParent = createSafeAction(SetCardParentSchema, handler);
