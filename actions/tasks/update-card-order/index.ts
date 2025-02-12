"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateCardOrder } from "./schema";
import { InputType, ReturnType } from "./types";
import { currentUser } from "@/lib/auth";
import { automationEngine } from "@/lib/automation-engine";

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
        include: {
          list: true,
        },
      })
    );

    updatedCards = await db.$transaction(transaction);

    // Pour chaque carte qui a changé de liste
    for (const card of updatedCards) {
      const originalCard = items.find((item) => item.id === card.id);
      if (originalCard && originalCard.listId !== card.listId) {
        // Déclencher l'automatisation CARD_MOVED
        await automationEngine.processAutomations(
          "CARD_MOVED",
          {
            cardId: card.id,
            sourceListId: originalCard.listId,
            destinationListId: card.listId,
            title: card.title,
            listTitle: card.list.title,
          },
          workspaceId,
          boardId
        );
      }
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
