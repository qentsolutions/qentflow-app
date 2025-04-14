"use server";

import { z } from "zod";
import { createSafeAction } from "@/lib/create-safe-action";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { RelationshipType } from "@prisma/client";

const AddCardRelationshipSchema = z.object({
  sourceCardId: z.string(),
  destCardId: z.string(),
  relationshipType: z.nativeEnum(RelationshipType),
  workspaceId: z.string(),
  boardId: z.string(),
});

type InputType = z.infer<typeof AddCardRelationshipSchema>;

const handler = async (data: InputType) => {
  const user = await currentUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { sourceCardId, destCardId, relationshipType, workspaceId, boardId } =
    data;

  try {
    // Check if the relationship already exists
    const existingRelationship = await db.cardRelationship.findFirst({
      where: {
        sourceCardId,
        destCardId,
        relationshipType,
      },
    });

    if (existingRelationship) {
      return { error: "Relationship already exists" };
    }

    // Create the relationship
    const relationship = await db.cardRelationship.create({
      data: {
        sourceCardId,
        destCardId,
        relationshipType,
      },
    });

    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: relationship };
  } catch (error) {
    console.error("[ADD_CARD_RELATIONSHIP_ERROR]", error);
    return { error: "Failed to add card relationship" };
  }
};

export const addCardRelationship = createSafeAction(
  AddCardRelationshipSchema,
  handler
);
