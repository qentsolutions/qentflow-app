"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { createSafeAction } from "@/lib/create-safe-action";
import { UpdateCard } from "./schema";
import { InputType, ReturnType } from "./types";
import { createAuditLog } from "@/lib/create-audit-log";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { currentUser } from "@/lib/auth";
import { automationEngine } from "@/lib/automation-engine";

const handler = async (data: InputType): Promise<ReturnType> => {
  const user = currentUser();

  if (!user) {
    throw new Error("User not found!");
  }

  const { id, boardId, workspaceId, ...values } = data;
  let card;

  try {
    card = await db.card.update({
      where: {
        id,
        list: {
          board: {
            workspaceId,
          },
        },
      },
      data: {
        ...values,
        startDate: values.startDate ? new Date(values.startDate) : undefined,
        dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
      },
      include: {
        list: true,
      },
    });

    await createAuditLog({
      entityTitle: card.title,
      entityId: card.id,
      entityType: ENTITY_TYPE.CARD,
      action: ACTION.UPDATE,
      workspaceId,
    });

    // Trigger automation for card update
    await automationEngine.processAutomations(
      "CARD_UPDATED",
      {
        cardId: card.id,
        title: card.title,
        description: card.description,
        startDate: card.startDate,
        dueDate: card.dueDate,
        listId: card.listId,
        assignedUserId: card.assignedUserId,
      },
      workspaceId,
      boardId
    );

  } catch (error) {
    return {
      error: "Failed to update.",
    };
  }

  revalidatePath(`/${workspaceId}/board/${boardId}`);
  return { data: card };
};

export const updateCard = createSafeAction(UpdateCard, handler);