"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";

import { RemoveTagFromCard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("Unauthorized: User not found!");
  }

  const { cardId, workspaceId, tagId, boardId } = data;

  try {
    // Mise à jour de la carte pour détacher le tag
    const updatedCard = await db.card.update({
      where: {
        id: cardId,
        list: {
          board: {
            workspaceId,
          },
        },
      },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });

    // Créer un audit log pour la suppression du tag
    await createAuditLog({
      entityTitle: updatedCard.title,
      entityId: updatedCard.id,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
      workspaceId,
    });

    // Réactualiser la page pour refléter les changements
    revalidatePath(`/${workspaceId}/boards/${boardId}`);
    return { data: updatedCard };
  } catch (error) {
    console.error("Error removing tag from card:", error);
    return {
      error: "Failed to remove tag from card.",
    };
  }
};

export const removeTagFromCard = createSafeAction(RemoveTagFromCard, handler);
