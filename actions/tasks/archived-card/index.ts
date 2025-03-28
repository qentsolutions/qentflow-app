"use server";

import { revalidatePath } from "next/cache";
import { ACTION, ENTITY_TYPE } from "@prisma/client";

import { db } from "@/lib/db";
import { createAuditLog } from "@/lib/create-audit-log";
import { createSafeAction } from "@/lib/create-safe-action";

import { ArchiveCard } from "./schema";
import { InputType, ReturnType } from "./types";
import { currentUser } from "@/lib/auth";
import { automationEngine } from "@/lib/automation-engine";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }

  const { cardId, workspaceId, boardId } = data;
  let card;

  try {
    card = await db.card.update({
      where: {
        id: cardId,
      },
      data: {
        archived: true,
      },
    });

    await createAuditLog({
      entityId: card.id,
      entityTitle: card.title,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.ARCHIVED,
      workspaceId,
    });

    {
      /*
    await automationEngine.processAutomations(
      "CARD_ARCHIVED",
      {
        cardId: card.id,
        listId: card.listId,
        title: card.title,
      },
      workspaceId,
      boardId
    );
    */
    }
  } catch (error) {
    return {
      error: "Failed to archive card.",
    };
  }

  revalidatePath(`/${workspaceId}/board/${boardId}`);
  return { data: card };
};

export const archiveCard = createSafeAction(ArchiveCard, handler);
