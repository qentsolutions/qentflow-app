"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const RemoveCardRelationshipSchema = z.object({
  relationshipId: z.string(),
  workspaceId: z.string(),
  boardId: z.string(),
});

type InputType = z.infer<typeof RemoveCardRelationshipSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { relationshipId, workspaceId, boardId } = data;

  try {
    // Delete the relationship
    const relationship = await db.cardRelationship.delete({
      where: {
        id: relationshipId,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: relationship };
  } catch (error) {
    console.error("[REMOVE_CARD_RELATIONSHIP_ERROR]", error);
    return { error: "Failed to remove card relationship" };
  }
};

export const removeCardRelationship = createSafeAction(
  RemoveCardRelationshipSchema,
  handler
);
