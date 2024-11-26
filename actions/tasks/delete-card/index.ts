"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { DeleteCard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { currentUser } from "@/lib/auth";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }

  const { id, boardId, workspaceId } = data;
  let card;

  try {
    // Supprimer les logs d'audit associés à cette carte
    await db.auditLog.deleteMany({
      where: {
        entityId: id, // Assurez-vous que la suppression des logs est basée sur l'id de la carte
        entityType: ENTITY_TYPE.CARD,
      },
    });

    // Supprimer la carte
    card = await db.card.delete({
      where: {
        id,
        list: {
          board: {
            workspaceId,
          },
        },
      },
    });
  } catch (error) {
    console.error("Error deleting card:", error);
    return {
      error: "Failed to delete.",
    };
  }

  // Réactualiser la page pour refléter les changements
  revalidatePath(`/workspace/${workspaceId}/board/${boardId}`);
  return { data: card };
};

export const deleteCard = createSafeAction(DeleteCard, handler);
