"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateCardOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { currentUser } from "@/lib/auth";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }

  const { items, boardId, workspaceId } = data;
  let updatedCards;

  try {
    const transaction = items.map((card) =>
      db.card.update({
        where: {
          id: card.id,
          list: {
            board: {
              workspaceId,
            },
          },
        },
        data: {
          order: card.order,
          listId: card.listId,
        },
      })
    );

    updatedCards = await db.$transaction(transaction);

    // Ajouter un audit log pour chaque carte mise à jour
    for (const card of updatedCards) {
      // Récupérer la liste actuelle de la carte
      const list = await db.list.findUnique({
        where: { id: card.listId },
        select: { title: true },
      });

      // Créer un audit log pour la mise à jour de l'ordre de la carte
      await createAuditLog({
        entityTitle: `${list?.title || "Unknown List"}`,
        entityId: card.id,
        entityType: ENTITY_TYPE.CARD,
        action: ACTION.UPDATE,
        workspaceId,
      });
    }
  } catch (error) {
    return {
      error: "Failed to reorder.",
    };
  }

  revalidatePath(`/${workspaceId}/boards/${boardId}`);
  return { data: updatedCards };
};

export const updateCardOrder = createSafeAction(UpdateCardOrder, handler);
